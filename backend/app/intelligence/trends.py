from datetime import datetime, timedelta
from typing import List, Dict, Any
from collections import defaultdict

def calculate_time_series_trends(tickets: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Groups tickets by date (YYYY-MM-DD) and computes daily volume, positive, neutral, negative counts.
    """
    if not tickets:
        return []

    daily_data = defaultdict(lambda: {"count": 0, "positive": 0, "neutral": 0, "negative": 0})

    for t in tickets:
        dt = t.get("created_at")
        if isinstance(dt, str):
            try:
                date_str = dt[:10]
            except Exception:
                date_str = "Recent"
        elif isinstance(dt, datetime):
            date_str = dt.strftime("%Y-%m-%d")
        else:
            date_str = "Recent"

        sent = (t.get("sentiment") or "Negative").capitalize()
        daily_data[date_str]["count"] += 1
        if sent == "Positive":
            daily_data[date_str]["positive"] += 1
        elif sent == "Neutral":
            daily_data[date_str]["neutral"] += 1
        else:
            daily_data[date_str]["negative"] += 1

    sorted_dates = sorted(daily_data.keys())
    return [
        {
            "date": d,
            "count": daily_data[d]["count"],
            "positive": daily_data[d]["positive"],
            "neutral": daily_data[d]["neutral"],
            "negative": daily_data[d]["negative"]
        }
        for d in sorted_dates
    ]

def calculate_period_over_period(tickets: List[Dict[str, Any]], days_window: int = 14) -> Dict[str, Any]:
    """
    Compares recent period (last `days_window` days) against prior period (`days_window` days before that).
    Returns real, calculated percentage changes.
    """
    if not tickets:
        return {"current_period_count": 0, "previous_period_count": 0, "change_pct": 0.0}

    dates = []
    for t in tickets:
        dt = t.get("created_at")
        if isinstance(dt, str):
            try:
                dates.append(datetime.fromisoformat(dt.replace("Z", "")))
            except Exception:
                pass
        elif isinstance(dt, datetime):
            dates.append(dt)

    if not dates:
        return {"current_period_count": len(tickets), "previous_period_count": 0, "change_pct": 0.0}

    max_date = max(dates)
    cutoff_mid = max_date - timedelta(days=days_window)
    cutoff_start = cutoff_mid - timedelta(days=days_window)

    current_count = sum(1 for d in dates if d >= cutoff_mid)
    prev_count = sum(1 for d in dates if cutoff_start <= d < cutoff_mid)

    if prev_count > 0:
        change_pct = round(((current_count - prev_count) / prev_count) * 100, 1)
    else:
        change_pct = 100.0 if current_count > 0 else 0.0

    return {
        "current_period_count": current_count,
        "previous_period_count": prev_count,
        "change_pct": change_pct
    }
