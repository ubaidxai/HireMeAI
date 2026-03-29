# apps/webapp/main.py
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parents[2]))

import json
import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from src.agents.runner import run_agent
from src.metrics.langsmith_metrics import get_langsmith_metrics
from src.metrics.ragas_eval import run_eval
from src.metrics.store import load_metrics

st.set_page_config(page_title="HireMeAI", layout="wide")

# ── Sidebar nav ───────────────────────────────────────────────────────────────
page = st.sidebar.radio("Navigate", ["Chat", "Dashboard", "Run Evals"])
st.sidebar.divider()
st.sidebar.caption("HireMeAI · Phase 1")

# ══════════════════════════════════════════════════════════════════════════════
# CHAT PAGE
# ══════════════════════════════════════════════════════════════════════════════
if page == "Chat":
    st.title("Chat with Ubaid's AI")

    if "messages" not in st.session_state:
        st.session_state.messages = []

    for msg in st.session_state.messages:
        st.chat_message(msg["role"]).write(msg["content"])

    if prompt := st.chat_input("Ask me anything about Ubaid..."):
        st.session_state.messages.append({"role": "user", "content": prompt})
        st.chat_message("user").write(prompt)

        with st.spinner("Thinking..."):
            response = run_agent(prompt)

        st.session_state.messages.append({"role": "assistant", "content": response})
        st.chat_message("assistant").write(response)

# ══════════════════════════════════════════════════════════════════════════════
# DASHBOARD PAGE
# ══════════════════════════════════════════════════════════════════════════════
elif page == "Dashboard":
    st.title("Metrics Dashboard")

    # ── LangSmith metrics ─────────────────────────────────────────────────────
    st.subheader("Operational metrics  (LangSmith)")

    with st.spinner("Fetching LangSmith data..."):
        ls_data = get_langsmith_metrics(limit=20)

    if ls_data:
        df_ls = pd.DataFrame(ls_data)
        df_ls["timestamp"] = pd.to_datetime(df_ls["timestamp"])

        # KPI cards
        col1, col2, col3 = st.columns(3)
        col1.metric("Avg latency", f"{df_ls['latency_sec'].mean():.2f}s")
        col2.metric("Avg tokens / query", f"{df_ls['total_tokens'].mean():.0f}")
        col3.metric("Total cost", f"${df_ls['cost_usd'].sum():.4f}")

        c1, c2 = st.columns(2)

        with c1:
            fig = px.line(df_ls, x="timestamp", y="latency_sec",
                          title="Latency over time (s)", markers=True)
            st.plotly_chart(fig, use_container_width=True)

        with c2:
            fig = px.bar(df_ls, x="timestamp", y="total_tokens",
                         title="Token usage per query")
            st.plotly_chart(fig, use_container_width=True)

        c3, c4 = st.columns(2)

        with c3:
            fig = px.line(df_ls, x="timestamp", y="cost_usd",
                          title="Cost per query (USD)", markers=True)
            st.plotly_chart(fig, use_container_width=True)

        with c4:
            fig = go.Figure(go.Indicator(
                mode="gauge+number",
                value=df_ls["latency_sec"].mean(),
                title={"text": "Avg latency (s)"},
                gauge={"axis": {"range": [0, 10]},
                       "bar": {"color": "#4f8ef7"},
                       "steps": [
                           {"range": [0, 3], "color": "#d4edda"},
                           {"range": [3, 6], "color": "#fff3cd"},
                           {"range": [6, 10], "color": "#f8d7da"},
                       ]}
            ))
            st.plotly_chart(fig, use_container_width=True)

    else:
        st.info("No LangSmith runs yet. Ask a question in the Chat tab first.")

    st.divider()

    # ── RAGAS metrics ─────────────────────────────────────────────────────────
    st.subheader("RAG quality metrics  (RAGAS)")

    ragas_data = load_metrics()

    if ragas_data:
        df_ragas = pd.DataFrame(ragas_data)
        df_ragas["timestamp"] = pd.to_datetime(df_ragas["timestamp"])

        col1, col2, col3 = st.columns(3)
        col1.metric("Avg faithfulness",      f"{df_ragas['faithfulness'].mean():.2f}")
        col2.metric("Avg answer relevancy",  f"{df_ragas['answer_relevancy'].mean():.2f}")
        col3.metric("Avg context recall",    f"{df_ragas['context_recall'].mean():.2f}")

        fig = px.line(
            df_ragas, x="timestamp",
            y=["faithfulness", "answer_relevancy", "context_recall"],
            title="RAG quality scores over time",
            markers=True,
        )
        st.plotly_chart(fig, use_container_width=True)

        st.dataframe(
            df_ragas[["timestamp", "question", "faithfulness",
                       "answer_relevancy", "context_recall"]],
            use_container_width=True,
        )
    else:
        st.info("No RAGAS evals yet. Run some from the 'Run Evals' tab.")

# ══════════════════════════════════════════════════════════════════════════════
# RUN EVALS PAGE
# ══════════════════════════════════════════════════════════════════════════════
elif page == "Run Evals":
    st.title("Run RAGAS Evals")

    golden_path = Path("data/golden_set.json")
    golden_set = json.loads(golden_path.read_text()) if golden_path.exists() else []

    st.write(f"**{len(golden_set)} questions** in golden set")
    st.dataframe(pd.DataFrame(golden_set), use_container_width=True)

    if st.button("Run full eval suite", type="primary"):
        results = []
        progress = st.progress(0)
        for i, item in enumerate(golden_set):
            with st.spinner(f"Evaluating: {item['question']}"):
                scores = run_eval(item["question"], item["ground_truth"])
                results.append(scores)
            progress.progress((i + 1) / len(golden_set))

        st.success("Eval complete!")
        st.dataframe(pd.DataFrame(results), use_container_width=True)

    st.divider()
    st.subheader("Run a single eval")
    custom_q = st.text_input("Question")
    custom_gt = st.text_area("Ground truth answer")
    if st.button("Evaluate") and custom_q and custom_gt:
        with st.spinner("Running..."):
            scores = run_eval(custom_q, custom_gt)
        st.json(scores)