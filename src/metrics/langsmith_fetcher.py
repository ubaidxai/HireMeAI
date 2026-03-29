from langsmith import Client
from src.config import settings

client = Client(api_key=settings.langchain_api_key)

def get_langsmith_metrics(limit: int = 20) -> list[dict]:
    runs = client.list_runs(project=settings.langchain_project, run_type="chain", limit=limit)
    results = []
    for run in runs:
        if not run.end_time or not run.start_time:
            continue
        latency = (run.end_time - run.start_time).total_seconds()
        usage = run.total_tokens or 0
        prompt_tokens = run.prompt_tokens or 0
        completion_tokens = run.completion_tokens or 0
        # gpt-4o-mini pricing
        cost = (prompt_tokens * 0.00000015) + (completion_tokens * 0.0000006)
        results.append({
            "run_id": str(run.id),
            "timestamp": run.start_time.isoformat(),
            "name": run.name,
            "latency_sec": round(latency, 2),
            "total_tokens": usage,
            "prompt_tokens": prompt_tokens,
            "completion_tokens": completion_tokens,
            "cost": round(cost, 6),
            "input": run.inputs.get("input", ""),
        })
    return results