# src/metrics/ragas_eval.py
import asyncio
from ragas import evaluate
from ragas.metrics.collections import faithfulness, answer_relevancy, context_recall
from ragas.llms import LangchainLLMWrapper
from ragas.embeddings import LangchainEmbeddingsWrapper
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from datasets import Dataset
from src.retrieval.retriever import retrieve_chunks
from src.agents.runner import run_agent
from src.metrics.store import save_metrics
from src.config import settings


evaluator_llm = LangchainLLMWrapper(ChatOpenAI(model=settings.eval_model, temperature=0))
evaluator_embeddings = LangchainEmbeddingsWrapper(OpenAIEmbeddings(model=settings.openai_embedding_model))


async def evaluate_query(question: str, ground_truth: str) -> dict:
    # get retrieved chunks
    chunks = await retrieve_chunks(question)
    contexts = [c["text"] for c in chunks]

    # get LLM answer
    answer = run_agent(question)

    dataset = Dataset.from_dict({
        "question": [question],
        "answer": [answer],
        "contexts": [contexts],
        "ground_truth": [ground_truth],
    })

    results = evaluate(
        dataset,
        metrics=[faithfulness, answer_relevancy, context_recall],
        llm=evaluator_llm,
        embeddings=evaluator_embeddings,
    )

    scores = {
        "question": question,
        "answer": answer,
        "faithfulness": round(results["faithfulness"], 3),
        "answer_relevancy": round(results["answer_relevancy"], 3),
        "context_recall": round(results["context_recall"], 3),
    }
    save_metrics(scores)
    return scores


def run_eval(question: str, ground_truth: str) -> dict:
    return asyncio.run(evaluate_query(question, ground_truth))