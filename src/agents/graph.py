from dotenv import load_dotenv
from langgraph.graph import StateGraph
from langgraph.graph import START, END
from src.agents.nodes import retriever_node, llm_node
from src.agents.state import State

load_dotenv()


def build_graph():
    builder = StateGraph(State)

    builder.add_node("retriever_node", retriever_node)
    builder.add_node("llm_node", llm_node)

    builder.add_edge(START, "retriever_node")
    builder.add_edge("retriever_node", "llm_node")
    builder.add_edge("llm_node", END)
    return builder.compile()