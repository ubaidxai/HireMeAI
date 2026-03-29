import asyncio
from langchain_openai import ChatOpenAI
from src.config import settings
from src.agents.state import State
from src.retrieval.retriever import retrieve_chunks_sync  
from src.services.llms.prompts import SYSTEM_PROMPT

llm = ChatOpenAI(model_name=settings.openai_model, openai_api_key=settings.openai_api_key)


def retriever_node(old_state: State) -> State:
    user_query = old_state.messages[-1].content
    chunks = retrieve_chunks_sync(user_query)
    context = "\n\n".join([c["text"] for c in chunks])
    system_message = {"role": "system", "content": SYSTEM_PROMPT.format(
        name=settings.user_name,
        context=context,
    )}
    return State(messages=[system_message])


def llm_node(old_state: State) -> State:
    response = llm.invoke(old_state.messages)
    return State(messages=[response])