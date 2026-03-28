# apps/webapp/main.py
import streamlit as st
from src.agents.runner import run_agent

st.title("HireMeAI")

if prompt := st.chat_input("Ask me anything..."):
    response = run_agent(prompt)
    st.chat_message("assistant").write(response)