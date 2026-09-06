from sqlmodel import Session

from src.services import stock_context_service
from src.services.lm_broker import broker_for

_SYSTEM_PROMPT = (
    "You are the AI Analyst inside an investment prediction tracking system. "
    "Answer clearly and concisely. When forecast data for a ticker is included "
    "below the user's message, use it as the source of truth for who made which "
    "forecast, price targets, and ratings — don't guess at figures it already gives you."
)

_STOCK_CONTEXT_TOKEN_BUDGET = 6000


class AIAnalystService:
    """
    Thin wrapper around the LLM broker for the AI Analyst chat endpoint.

    Kept isolated from the route so later phases (more tools, portfolio
    context, RAG) can extend `chat` without reworking the endpoint.
    """

    def __init__(self) -> None:
        self._broker = broker_for("ai_analyst")

    def chat(self, message: str, session: Session) -> str:
        user_prompt = message

        tickers = stock_context_service.extract_tickers(session, message)
        context = stock_context_service.build_stock_context(
            session, tickers, max_tokens=_STOCK_CONTEXT_TOKEN_BUDGET
        )
        if context:
            user_prompt = f"{context}\n\nUser question: {message}"

        reply = self._broker.ask(
            system_prompt=_SYSTEM_PROMPT,
            user_prompt=user_prompt,
            temperature=1,
            calling_module="ai_analyst",
        )
        if reply.startswith("Error: "):
            raise RuntimeError(reply.removeprefix("Error: "))
        return reply


ai_analyst_service = AIAnalystService()
