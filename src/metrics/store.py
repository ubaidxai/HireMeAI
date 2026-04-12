from src.settings import settings
from pathlib import Path
import json 
from datetime import datetime


METRICS_FILE = Path(settings.metrics_file)


def load_metrics() -> list[dict]:
    if not METRICS_FILE.exists():
        return []
    return json.loads(METRICS_FILE.read_text())

def save_metrics(entry: dict):
    metrics = load_metrics()
    metrics.append({
        "timestamp": datetime.utcnow().isoformat(),
        **entry
    })
    METRICS_FILE.parent.mkdir(exist_ok=True)
    METRICS_FILE.write_text(json.dumps(metrics, indent=2))