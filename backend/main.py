import asyncio
import glob
import logging
import os
import threading
import time
from typing import AsyncGenerator

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse, StreamingResponse
from pydantic import BaseModel

# Import project modules
try:
    # Ensure project root on sys.path if needed
    import sys

    ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    if ROOT not in sys.path:
        sys.path.insert(0, ROOT)
    import global_state
    from main_ai_researcher import main_ai_researcher
except Exception as e:  # pragma: no cover - runtime import guard
    print(f"[backend] Warning: failed to import project modules: {e}")

# Minimal FastAPI app for the new React/Vite frontend
# Port recommendation: 8001 (configured when launching with uvicorn)

app = FastAPI(title="AI-Researcher Backend", version="0.1.0")

origins = [
    "http://127.0.0.1:5173",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health() -> dict:
    return {"status": "ok"}


# ===== Environment Variables =====
class EnvPayload(BaseModel):
    values: dict[str, str]


def _read_env_file(path: str = ".env") -> dict[str, str]:
    data: dict[str, str] = {}
    if not os.path.exists(path):
        return data
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if "=" in line:
                k, v = line.split("=", 1)
                data[k.strip()] = v.strip().strip("\"'")
    return data


@app.get("/api/env")
async def get_env() -> dict:
    # Filter API-related and task config keys; align with current GUI
    keys = {
        "OPENROUTER_API_KEY",
        "GITHUB_AI_TOKEN",
        "CATEGORY",
        "INSTANCE_ID",
        "TASK_LEVEL",
        "MAX_ITER_TIMES",
        "CONTAINER_NAME",
        "WORKPLACE_NAME",
        "CACHE_PATH",
        "PORT",
    }
    env = _read_env_file()
    result = {k: env.get(k, os.environ.get(k, "")) for k in keys}
    return {"env": result}


@app.put("/api/env")
async def put_env(payload: EnvPayload) -> dict:
    # Merge with existing .env and overwrite provided keys
    path = ".env"
    current = _read_env_file(path)
    current.update(payload.values or {})
    lines = [f"{k}={v}" for k, v in current.items()]
    with open(path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")
    # Also export into process env for immediate effect
    for k, v in payload.values.items():
        os.environ[k] = v
    # Reload dotenv
    try:
        load_dotenv(override=True)
    except Exception:
        pass
    return {"ok": True}


# ===== Run control (stub) =====
class RunPayload(BaseModel):
    question: str
    reference: str | None = None
    mode: str


# Simple in-memory job registry
JOBS: dict[str, dict] = {}


def _ensure_logging() -> str:
    os.makedirs("logs", exist_ok=True)
    timestamp = time.strftime("%Y-%m-%d_%H-%M-%S")
    log_path = os.path.join("logs", f"backend_run_{timestamp}.log")
    # Configure root logger to file
    root = logging.getLogger()
    for h in root.handlers[:]:
        root.removeHandler(h)
    root.setLevel(logging.INFO)
    fh = logging.FileHandler(log_path, encoding="utf-8")
    fmt = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
    fh.setFormatter(fmt)
    root.addHandler(fh)
    # Quiet noisy libs
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("LiteLLM").setLevel(logging.WARNING)
    # Expose to global_state for UI consumers
    try:
        global_state.LOG_PATH = log_path
    except Exception:
        pass
    return log_path


def _run_job(job_id: str, body: RunPayload, log_path: str):
    try:
        load_dotenv(override=True)
        logging.info(f"Starting job {job_id}: mode={body.mode}")
        # Call into existing orchestrator
        main_ai_researcher(body.question, body.reference or "", body.mode)
        JOBS[job_id]["status"] = "done"
        logging.info(f"Job {job_id} completed")
    except Exception as e:
        JOBS[job_id]["status"] = "error"
        JOBS[job_id]["error"] = str(e)
        logging.exception(f"Job {job_id} failed: {e}")


@app.post("/api/run")
async def start_run(body: RunPayload) -> dict:
    log_path = _ensure_logging()
    job_id = f"job-{int(time.time()*1000)}"
    JOBS[job_id] = {"status": "running", "log_path": log_path}
    t = threading.Thread(target=_run_job, args=(job_id, body, log_path), daemon=True)
    t.start()
    return {"job_id": job_id, "accepted": True}


@app.get("/api/run/{job_id}/status")
async def get_status(job_id: str) -> JSONResponse:
    data = JOBS.get(job_id, {"status": "unknown"})
    return JSONResponse(data)


# ===== Log streaming (SSE-like via text/event-stream) =====
async def _tail_log(path: str) -> AsyncGenerator[bytes, None]:
    # Pick the most recent log if not provided
    if path == "":
        matches = sorted(glob.glob("logs/log_*.log"))
        if matches:
            path = matches[-1]
    # If still empty or not exists, yield heartbeat messages
    if not path or not os.path.exists(path):
        for _ in range(10):
            yield b"event: ping\n\n"
            await asyncio.sleep(1.0)
        return

    with open(path, "r", encoding="utf-8") as f:
        f.seek(0, os.SEEK_END)
        while True:
            line = f.readline()
            if line:
                msg = f"data: {line.rstrip()}\n\n".encode("utf-8")
                yield msg
            else:
                await asyncio.sleep(0.5)


@app.get("/api/logs/stream")
async def stream_logs(request: Request, path: str = ""):
    async def event_generator():
        async for chunk in _tail_log(path):
            # Client disconnect handling
            if await request.is_disconnected():
                break
            yield chunk

    return StreamingResponse(event_generator(), media_type="text/event-stream")


# ===== Log utilities: list & download =====
@app.get("/api/logs/list")
async def list_logs() -> dict:
    os.makedirs("logs", exist_ok=True)
    files = []
    for p in glob.glob("logs/*.log"):
        try:
            stat = os.stat(p)
            files.append(
                {
                    "path": p,
                    "name": os.path.basename(p),
                    "size": stat.st_size,
                    "mtime": stat.st_mtime,
                }
            )
        except Exception:
            continue
    files.sort(key=lambda x: x["mtime"], reverse=True)
    return {"files": files}


@app.get("/api/logs/download")
async def download_log(path: str) -> FileResponse:
    # Security: restrict to logs directory
    abs_logs = os.path.abspath("logs")
    abs_path = os.path.abspath(path)
    if not abs_path.startswith(abs_logs) or not os.path.exists(abs_path):
        return JSONResponse({"error": "Invalid path"}, status_code=400)
    filename = os.path.basename(abs_path)
    return FileResponse(abs_path, filename=filename, media_type="text/plain")
