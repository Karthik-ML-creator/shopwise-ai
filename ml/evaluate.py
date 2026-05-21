"""
ML Evaluation — Phase 4
Computes RMSE, Precision@K, and Recall@K on a held-out test split.
"""
import os
import sys
import pickle
import logging
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ml.algorithms import CustomSVD

logging.basicConfig(level=logging.INFO, format="[%(levelname)s] %(message)s")
logger = logging.getLogger("ml_evaluate")

MODEL_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models")


def load_model_and_data():
    with open(os.path.join(MODEL_DIR, "svd_model.pkl"), "rb") as f:
        svd = pickle.load(f)
    with open(os.path.join(MODEL_DIR, "ratings_df.pkl"), "rb") as f:
        ratings_df = pickle.load(f)
    return svd, ratings_df


def compute_rmse(svd, test_df: pd.DataFrame) -> float:
    errors = []
    for _, row in test_df.iterrows():
        pred = svd.predict(int(row["user_id"]), int(row["product_id"]))
        errors.append((row["rating"] - pred) ** 2)
    return float(np.sqrt(np.mean(errors)))


def compute_precision_recall_at_k(svd, ratings_df: pd.DataFrame, k: int = 10) -> tuple:
    """
    For each user, recommend top-K items and check how many
    are in the user's actual liked set (rating >= 3.5).
    """
    precisions, recalls = [], []

    for user_id in ratings_df["user_id"].unique():
        user_data = ratings_df[ratings_df["user_id"] == user_id]
        liked = set(user_data[user_data["rating"] >= 3.5]["product_id"].tolist())
        if not liked:
            continue

        seen = set(user_data["product_id"].tolist())
        top_k = svd.predict_top_n(user_id, seen_item_ids=set(), top_n=k)
        recommended = {pid for pid, _ in top_k}

        hits = len(recommended & liked)
        precisions.append(hits / k)
        recalls.append(hits / len(liked) if liked else 0)

    precision = float(np.mean(precisions)) if precisions else 0.0
    recall = float(np.mean(recalls)) if recalls else 0.0
    return precision, recall


if __name__ == "__main__":
    logger.info("Loading model and ratings data...")
    svd, ratings_df = load_model_and_data()

    train_df, test_df = train_test_split(ratings_df, test_size=0.2, random_state=42)

    logger.info("Computing RMSE on test split...")
    rmse = compute_rmse(svd, test_df)
    logger.info(f"  RMSE        : {rmse:.4f}")

    logger.info("Computing Precision@10 and Recall@10...")
    p_at_k, r_at_k = compute_precision_recall_at_k(svd, ratings_df, k=10)
    logger.info(f"  Precision@10: {p_at_k:.4f}")
    logger.info(f"  Recall@10   : {r_at_k:.4f}")

    f1 = (2 * p_at_k * r_at_k / (p_at_k + r_at_k)) if (p_at_k + r_at_k) > 0 else 0
    logger.info(f"  F1@10       : {f1:.4f}")
    logger.info("[SUCCESS] Evaluation complete.")
