import os
import sys
import asyncio
from dotenv import load_dotenv
from loguru import logger
from pipecat.services.llm_service import FunctionCallParams
from pipecat.audio.vad.silero import SileroVADAnalyzer, VADParams
from pipecat.pipeline.pipeline import Pipeline
from pipecat.pipeline.runner import PipelineRunner
from pipecat.pipeline.task import PipelineParams, PipelineTask
from pipecat.processors.aggregators.openai_llm_context import OpenAILLMContext
from pipecat.processors.frameworks.rtvi import RTVIConfig, RTVIObserver, RTVIProcessor
from pipecat.serializers.protobuf import ProtobufFrameSerializer
from pipecat.services.gemini_multimodal_live.gemini import (
    GeminiMultimodalLiveLLMService,
    InputParams,
    GeminiMultimodalModalities,
)
from pipecat.transports.websocket.fastapi import (
    FastAPIWebsocketParams,
    FastAPIWebsocketTransport,
)
from pipecat.services.elevenlabs.tts import ElevenLabsTTSService
from pipecat.services.deepgram.stt import DeepgramSTTService
from pipecat.services.openai.llm import OpenAILLMService
from pipecat.audio.turn.smart_turn.local_smart_turn_v3 import LocalSmartTurnAnalyzerV3
from pipecat.audio.interruptions.min_words_interruption_strategy import MinWordsInterruptionStrategy
from pipecat.frames.frames import InterruptionTaskFrame, TextFrame, TTSSpeakFrame
from pipecat.audio.interruptions.base_interruption_strategy import BaseInterruptionStrategy

import nltk
try:
    nltk.data.find("tokenizers/punkt_tab")
except LookupError:
    nltk.download("punkt_tab")

load_dotenv()

logger.remove(0)
logger.add(sys.stderr, level="DEBUG")

SYSTEM_INSTRUCTION = """
{
  "UseCase": {
    "UseCaseName": "FakGlobals AI Demo",
    "Company": {
      "CompanyName": "FakGlobals",
      "ProductName": "Dynamic Staging AI",
      "ProductDescription": "FakGlobals builds intelligent AI-driven solutions that adapt to context. Their demo shows how responses can shift dynamically depending on user reactions."
    },
    "Assistant": {
      "Role": "You are a demo AI guiding the user through staged interactions. If the user is positive, you share meaningful details about FakGlobals and their work. If negative, you show empathy and offer to pause or retry.",
      "CommunicationStyle": "Clear, concise, adaptive. Informative but still short. Friendly and professional tone.",
      "Personality": "Supportive, flexible, engaging. Positive when users agree, empathetic and respectful when they decline.",
      "Techniques": [
        "Start with a direct question to confirm readiness.",
        "If user agrees, explain FakGlobals’ vision, services, and methods step by step.",
        "If user declines, acknowledge and offer a graceful exit or retry.",
        "Keep responses short (2–3 sentences) but meaningful.",
        "Use affirmations like 'Perfect,' 'Got it,' 'I see' to smooth transitions."
      ],
      "Goal": "Demonstrate FakGlobals’ mission and approach while showcasing adaptive branching logic.",
      "UseVocalInflections": "Friendly affirmations like 'Great,' 'Alright,' 'Makes sense.'",
      "NoYapping": "Keep replies to-the-point and professional.",
      "RespondToExpressions": "Positive → informative and encouraging. Negative → empathetic and redirective.",
      "WellnessCoachMode": "Disabled. Focus on FakGlobals’ demo context."
    },
    "Stages": [
      {
        "StageName": "Greeting",
        "StageInstructions": "Welcome the user and ask if they’re ready to see the demo.",
        "Objectives": [
          "Confirm readiness.",
          "Branch to positive or negative path."
        ],
        "ExamplePhrases": [
          "Welcome! Are you ready to try the demo?",
          "Shall we begin the test?"
        ],
        "StageCompletionCriteria": {
          "If": "User says yes → load 'Positive Path'.",
          "ElseIf": "User says no → load 'Negative Path'."
        },
        "DataPoints": [
          {
            "DatapointName": "UserReady",
            "DatapointType": "boolean",
            "DatapointDescription": "True if user is ready, False otherwise."
          }
        ]
      },
      {
        "StageName": "Positive Path",
        "StageInstructions": "Since the user agreed, explain what FakGlobals does and how.",
        "Objectives": [
          "Provide meaningful context about FakGlobals.",
          "Engage the user with short but informative steps.",
          "Transition smoothly to closure."
        ],
        "ExamplePhrases": [
          "Perfect! FakGlobals is all about creating adaptive AI solutions that help businesses handle complex interactions more smoothly.",
          "They focus on staging logic — meaning responses adjust dynamically depending on user behavior, much like what you’re experiencing now.",
          "From customer engagement to workflow automation, FakGlobals designs systems that are flexible, efficient, and built for real-world use."
        ],
        "StageCompletionCriteria": {
          "If": "User continues → load 'Closure'.",
          "ElseIf": "User changes mind → load 'Negative Path'."
        },
        "DataPoints": [
          {
            "DatapointName": "PositiveFlow",
            "DatapointType": "boolean",
            "DatapointDescription": "True if user continues positively."
          }
        ]
      },
      {
        "StageName": "Negative Path",
        "StageInstructions": "If user says no, respond with empathy and either pause or offer retry.",
        "Objectives": [
          "Show empathy.",
          "Give option to end or try again."
        ],
        "ExamplePhrases": [
          "No worries, we can stop here if you’d like.",
          "That’s okay — would you like to try again later?"
        ],
        "StageCompletionCriteria": {
          "If": "User confirms stop → end with [hang_up].",
          "ElseIf": "User reconsiders → load 'Positive Path'."
        },
        "DataPoints": [
          {
            "DatapointName": "NegativeFlow",
            "DatapointType": "boolean",
            "DatapointDescription": "True if user chooses to stop."
          }
        ]
      },
      {
        "StageName": "Closure",
        "StageInstructions": "Wrap up with thanks and reinforce FakGlobals’ mission.",
        "Objectives": [
          "Acknowledge completion.",
          "Leave user with a positive impression of FakGlobals."
        ],
        "ExamplePhrases": [
          "That’s it for the demo—thanks for joining in! FakGlobals is all about building AI that adapts to you.",
          "Demo complete! Appreciate your time. FakGlobals is here to make interactions smarter, smoother, and more dynamic."
        ],
        "StageCompletionCriteria": {
          "If": "User says they are done → end with [hang_up]."
        },
        "DataPoints": [
          {
            "DatapointName": "DemoComplete",
            "DatapointType": "boolean",
            "DatapointDescription": "True if demo is finished."
          }
        ]
      }
    ]
  }
}

"""

async def run_bot(websocket_client):

    async def hangup_call(params: FunctionCallParams):
        logger.info(" Hangup tool called — ending the session.")
        try:
            await websocket_client.close()
            logger.success(" Session closed successfully via hangup_call.")
            await params.result_callback({})
        except Exception as e:
            logger.exception(f" Exception in hangup_call: {e}")

    TOOLS = [
        {
            "function_declarations": [
                {
                    "name": "hangup_call",
                    "description": "Politely end the current call when conversation has ended.",
                },  
            ]
        }
    ]

    # WebSocket transport
    ws_transport = FastAPIWebsocketTransport(
      websocket=websocket_client,
      params=FastAPIWebsocketParams(
          audio_in_enabled=True,
          audio_out_enabled=True,
          add_wav_header=False,
          vad_analyzer=SileroVADAnalyzer(params=VADParams(stop_secs=0.2)),
          serializer=ProtobufFrameSerializer(),
      ),
    )

    # Deepgram STT for transcription
    deepgram_stt = DeepgramSTTService(
        
    )

    llm = OpenAILLMService(
        system_instruction=SYSTEM_INSTRUCTION,
        tools=TOOLS,
        temperature=0.7,
    )

    llm.register_function("hangup_call", hangup_call)

    # ElevenLabs TTS for voice output
    eleven_tts = ElevenLabsTTSService(
        voice_id="J5iaaqzR5zn6HFG4jV3b",
        model="eleven_turbo_v2",
    )

    # Conversation context
    context = OpenAILLMContext(
        [
            {
                "role": "user",
                "content": "Begin the interaction by welcoming the user and asking if they are ready to see the demo.",
            }
        ],
    )
    context_aggregator = llm.create_context_aggregator(context)

    rtvi = RTVIProcessor(config=RTVIConfig(config=[]))

    # Pipeline order: input -> Deepgram (STT) -> context -> Gemini -> ElevenLabs (TTS) -> output
    pipeline = Pipeline(
        [
            ws_transport.input(),
            deepgram_stt,          # 🎙 User speech → text
            context_aggregator.user(),
            rtvi,
            llm,                   # 🤖 Reasoning
            eleven_tts,            # 🔊 Text → speech
            ws_transport.output(),
            context_aggregator.assistant(),
        ]
    )

    task = PipelineTask(
        pipeline,
        params=PipelineParams(
            enable_metrics=True,
            enable_usage_metrics=True,
            allow_interruptions=True,
            interruption_strategies=[MinWordsInterruptionStrategy(min_words=2)]  # temporarily empty
        ),
        observers=[RTVIObserver(rtvi)],
    )

    @rtvi.event_handler("on_client_ready")
    async def on_client_ready(rtvi):
        logger.info("Pipecat client ready.")
        await rtvi.set_bot_ready()
        await task.queue_frames([context_aggregator.user().get_context_frame()])

    @ws_transport.event_handler("on_client_connected")
    async def on_client_connected(transport, client):
        logger.info("Pipecat Client connected")

    @ws_transport.event_handler("on_client_disconnected")
    async def on_client_disconnected(transport, client):
        logger.info("Conversation ended. Full history:")
        for msg in context.messages:
            role = msg.get("role", "UNKNOWN").upper()
            content = msg.get("content", "<No content>")
            logger.info(f"  {role}: {content!r}")
        await task.cancel()
