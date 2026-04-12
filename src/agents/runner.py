# src/runner.py
from src.agents.graph import build_graph
from src.agents.state import State

graph = build_graph()


async def run_agent(user_input: str) -> str:
    initial_state = State(
        messages=[{"role": "user", "content": user_input}]
    )
    result = await graph.ainvoke(initial_state)
    return result["messages"][-1].content