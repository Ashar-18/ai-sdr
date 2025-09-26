#
# Copyright (c) 2025, Daily
#
# SPDX-License-Identifier: BSD 2-Clause License
#
import asyncio
import os
from contextlib import asynccontextmanager
from typing import Any, Dict

import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

# Load environment variables (for local development)
# On Heroku, environment variables are set directly via config vars.
load_dotenv(override=True)

from bot_fast_api import run_bot

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handles FastAPI startup and shutdown."""
    print("FastAPI app starting up...")
    yield  # Application runs here
    print("FastAPI app shutting down...")


# Initialize FastAPI app with lifespan manager
app = FastAPI(lifespan=lifespan)

# Configure CORS to allow requests from any origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# New: Add a simple root route to check if the backend is working
@app.get("/")
async def read_root():
    """
    Root endpoint to confirm the backend is running.
    """
    return {"message": "Welcome to Pipecat enhanced! The API is running."}


@app.websocket("/wss")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("WebSocket connection accepted")
    try:
        await run_bot(websocket)
    except Exception as e:
        print(f"Exception in run_bot: {e}")


@app.post("/connect")
async def bot_connect(request: Request) -> Dict[Any, Any]:
    # ws_url = "ws://localhost:7860/ws"
    # return {"ws_url": ws_url}

    x_forwarded_proto = request.headers.get("x-forwarded-proto")
    ws_protocol = "wss" if x_forwarded_proto == "https" else "ws"
    current_host = request.url.hostname

    ws_url = f"{ws_protocol}://{current_host}/ws"
    print(f"Returning WebSocket URL: {ws_url}")
    return {"ws_url": ws_url}