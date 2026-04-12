# src/metrics/ragas_eval.py
from ragas import evaluate
from ragas.metrics import Faithfulness, AnswerRelevancy, ContextRecall
from ragas.llms import LangchainLLMWrapper
from ragas.embeddings import LangchainEmbeddingsWrapper
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from datasets import Dataset
from src.retrieval.retriever import retrieve_chunks_sync
from src.agents.runner import run_agent
from src.metrics.store import save_metrics
from src.settings import settings

evaluator_llm = LangchainLLMWrapper(ChatOpenAI(model=settings.openai_model))
evaluator_embeddings = LangchainEmbeddingsWrapper(OpenAIEmbeddings(model=settings.openai_embedding_model))

metrics = [
    Faithfulness(llm=evaluator_llm),
    AnswerRelevancy(llm=evaluator_llm, embeddings=evaluator_embeddings),
    ContextRecall(llm=evaluator_llm),
]

async def evaluate_query(question: str, ground_truth: str) -> dict:
    chunks = retrieve_chunks_sync(question)
    contexts = [c["text"] for c in chunks]
    answer = run_agent(question)

    dataset = Dataset.from_dict({
        "question": [question],
        "answer": [answer],
        "contexts": [contexts],
        "ground_truth": [ground_truth],
    })

    results = evaluate(
        dataset,
        metrics=metrics,
        llm=evaluator_llm,
        embeddings=evaluator_embeddings,
    )
    # print("######################################################:")
    # print(type(results))
    # print(results)
    # print(results.to_pandas())

    scores = {
        "question": question,
        "answer": answer,
        "faithfulness": round(float(results["faithfulness"][0]), 3),
        "answer_relevancy": round(float(results["answer_relevancy"][0]), 3),
        "context_recall": round(float(results["context_recall"][0]), 3),
    }
    save_metrics(scores)
    return scores


def run_eval(question: str, ground_truth: str) -> dict:
    import asyncio
    return asyncio.run(evaluate_query(question, ground_truth))