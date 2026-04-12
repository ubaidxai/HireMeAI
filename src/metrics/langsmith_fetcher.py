# src/metrics/langsmith_fetcher.py
import requests
from src.settings import settings

BASE_URL = "https://api.smith.langchain.com/api/v1"

def get_langsmith_metrics(limit: int = 20) -> list[dict]:
    try:
        headers = {"x-api-key": settings.langsmith_api_key}

        # get project id
        projects_resp = requests.get(
            f"{BASE_URL}/sessions",
            headers=headers,
            params={"name": settings.langsmith_project},
        )
        projects_resp.raise_for_status()
        projects = projects_resp.json()

        if not projects:
            print(f"Project '{settings.langsmith_project}' not found.")
            return []

        project_id = projects[0]["id"]

        # POST to query runs
        runs_resp = requests.post(
            f"{BASE_URL}/runs/query",
            headers=headers,
            json={
                "session": [project_id],
                "is_root": True,
                "limit": limit,
            },
        )
        runs_resp.raise_for_status()
        runs = runs_resp.json().get("runs", [])

        results = []
        for run in runs:
            start = run.get("start_time")
            end = run.get("end_time")
            if not start or not end:
                continue

            from datetime import datetime
            start_dt = datetime.fromisoformat(start.replace("Z", "+00:00"))
            end_dt = datetime.fromisoformat(end.replace("Z", "+00:00"))
            latency = (end_dt - start_dt).total_seconds()

            prompt_tokens = run.get("prompt_tokens") or 0
            completion_tokens = run.get("completion_tokens") or 0
            cost = (prompt_tokens * 0.00000015) + (completion_tokens * 0.0000006)

            results.append({
                "run_id": run.get("id", ""),
                "timestamp": start,
                "latency_sec": round(latency, 2),
                "total_tokens": (prompt_tokens + completion_tokens),
                "prompt_tokens": prompt_tokens,
                "completion_tokens": completion_tokens,
                "cost_usd": round(cost, 6),
            })

        return results

    except Exception as e:
        print(f"LangSmith fetch error: {e}")
        return []