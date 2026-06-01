"""
Working With Sergio — AI Analytics Microservice
Analyzes CSV/XLSX/GA4 exports and generates insights via OpenAI.
"""

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import io
import json
import os
from openai import OpenAI
from typing import Optional
import numpy as np

app = FastAPI(title="WWS AI Insights", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def load_dataframe(file: UploadFile) -> pd.DataFrame:
    content = file.file.read()
    filename = file.filename or "data.csv"

    if filename.endswith((".xlsx", ".xls")):
        return pd.read_excel(io.BytesIO(content))
    return pd.read_csv(io.BytesIO(content))


def compute_stats(df: pd.DataFrame) -> dict:
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    stats = {
        "rows": len(df),
        "columns": len(df.columns),
        "column_names": df.columns.tolist(),
        "numeric_columns": numeric_cols,
        "missing_values": df.isnull().sum().to_dict(),
    }

    if numeric_cols:
        desc = df[numeric_cols].describe()
        stats["numeric_summary"] = desc.to_dict()

        for col in numeric_cols[:5]:
            q1 = df[col].quantile(0.25)
            q3 = df[col].quantile(0.75)
            iqr = q3 - q1
            outliers = df[(df[col] < q1 - 1.5 * iqr) | (df[col] > q3 + 1.5 * iqr)]
            if len(outliers) > 0:
                stats.setdefault("outliers", {})[col] = len(outliers)

    date_cols = df.select_dtypes(include=["datetime64"]).columns.tolist()
    for col in df.columns:
        if "date" in col.lower() or "time" in col.lower():
            try:
                df[col] = pd.to_datetime(df[col], errors="coerce")
                date_cols.append(col)
            except Exception:
                pass

    if date_cols:
        stats["date_range"] = {
            col: {"min": str(df[col].min()), "max": str(df[col].max())}
            for col in date_cols[:3]
            if df[col].notna().any()
        }

    return stats


def detect_anomalies(stats: dict) -> list:
    anomalies = []
    for col, count in stats.get("outliers", {}).items():
        anomalies.append({
            "metric": col,
            "description": f"{count} outliers detectados usando método IQR",
            "severity": "high" if count > stats["rows"] * 0.05 else "medium",
        })

    missing = stats.get("missing_values", {})
    for col, count in missing.items():
        if count > 0 and count / stats["rows"] > 0.1:
            anomalies.append({
                "metric": col,
                "description": f"{count} valores missing ({count/stats['rows']*100:.1f}% del total)",
                "severity": "medium",
            })

    return anomalies


def detect_trends(stats: dict) -> list:
    trends = []
    summary = stats.get("numeric_summary", {})
    for col in stats.get("numeric_columns", [])[:5]:
        if col in summary:
            mean_val = summary[col].get("mean", 0)
            std_val = summary[col].get("std", 0)
            cv = (std_val / mean_val * 100) if mean_val else 0
            direction = "stable" if cv < 20 else ("up" if mean_val > 0 else "down")
            trends.append({
                "metric": col,
                "direction": direction,
                "change": f"CV: {cv:.1f}% — media: {mean_val:.2f}",
            })
    return trends


async def generate_ai_analysis(stats: dict, filename: str) -> dict:
    if not os.getenv("OPENAI_API_KEY"):
        return generate_rule_based_analysis(stats, filename)

    prompt = f"""Eres un Senior Analytics Consultant. Analiza estos datos y genera un reporte ejecutivo.

Archivo: {filename}
Estadísticas: {json.dumps(stats, default=str)[:4000]}

Responde SOLO en JSON con esta estructura:
{{
  "executive_summary": "2-3 párrafos en español",
  "insights": ["insight 1", "insight 2", ...],
  "recommendations": ["recomendación 1", ...]
}}"""

    try:
        response = client.chat.completions.create(
            model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            temperature=0.3,
        )
        ai_result = json.loads(response.choices[0].message.content)
        return ai_result
    except Exception:
        return generate_rule_based_analysis(stats, filename)


def generate_rule_based_analysis(stats: dict, filename: str) -> dict:
    return {
        "executive_summary": (
            f"Análisis del dataset '{filename}' con {stats['rows']} filas y "
            f"{stats['columns']} columnas. Se identificaron {len(stats.get('numeric_columns', []))} "
            f"columnas numéricas para análisis estadístico."
        ),
        "insights": [
            f"Dataset con {stats['rows']} registros y {stats['columns']} dimensiones.",
            f"Columnas numéricas: {', '.join(stats.get('numeric_columns', [])[:5]) or 'ninguna'}.",
            "Se recomienda validar completitud de datos antes de reporting ejecutivo.",
        ],
        "recommendations": [
            "Implementar data quality checks automatizados.",
            "Documentar definiciones de métricas en el event catalog.",
            "Considerar pipeline a BigQuery para análisis avanzado.",
        ],
    }


@app.get("/health")
async def health():
    return {"status": "ok", "service": "wws-ai-insights"}


@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")

    allowed = (".csv", ".xlsx", ".xls")
    if not any(file.filename.endswith(ext) for ext in allowed):
        raise HTTPException(status_code=400, detail="Format not supported. Use CSV or XLSX.")

    try:
        df = load_dataframe(file)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse file: {str(e)}")

    stats = compute_stats(df)
    ai_result = await generate_ai_analysis(stats, file.filename)
    anomalies = detect_anomalies(stats)
    trends = detect_trends(stats)

    return {
        "executive_summary": ai_result.get("executive_summary", ""),
        "insights": ai_result.get("insights", []),
        "anomalies": anomalies,
        "trends": trends,
        "recommendations": ai_result.get("recommendations", []),
        "metadata": {
            "filename": file.filename,
            "rows": stats["rows"],
            "columns": stats["columns"],
        },
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", "8000")))
