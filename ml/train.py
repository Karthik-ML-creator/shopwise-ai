"""
ML Training Pipeline — Phase 4
================================
Trains two models:
  A) Content-Based Filtering: TF-IDF on product name + description + category → Cosine Similarity matrix
  B) Collaborative Filtering: Custom SGD-based SVD (Matrix Factorization) on user-item interaction matrix

Both models are saved as .pkl files into ml/models/ directory.
"""

import os
import sys
import pickle
import logging
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sqlalchemy.orm import Session

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app.database import engine, SessionLocal
from backend.app.models import Product, UserBehavior, User
from ml.algorithms import CustomSVD

logging.basicConfig(level=logging.INFO, format="[%(levelname)s] %(message)s")
logger = logging.getLogger("ml_trainer")

# Action weights: how much each action contributes to implied rating
ACTION_WEIGHTS = {
    "view":     1.0,
    "click":    2.0,
    "cart":     3.0,
    "purchase": 5.0,
    "rating":   0.0,  # ratings are used directly as explicit signal
}

MODEL_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models")
os.makedirs(MODEL_DIR, exist_ok=True)


# ─────────────────────────────────────────────────────────────
# 1. Load Data
# ─────────────────────────────────────────────────────────────
def load_data(db: Session):
    logger.info("Loading products from database...")
    products = db.query(Product).all()
    product_df = pd.DataFrame([{
        "id": p.id,
        "name": p.name,
        "description": p.description or "",
        "category": p.category,
        "price": p.price,
    } for p in products])

    logger.info("Loading user behaviors from database...")
    behaviors = db.query(UserBehavior).all()
    behavior_df = pd.DataFrame([{
        "user_id": b.user_id,
        "product_id": b.product_id,
        "action_type": b.action_type,
        "rating": b.rating,
    } for b in behaviors])

    logger.info(f"Loaded {len(product_df)} products and {len(behavior_df)} interactions.")
    return product_df, behavior_df


# ─────────────────────────────────────────────────────────────
# 2. Content-Based Filtering (TF-IDF + Cosine Similarity)
# ─────────────────────────────────────────────────────────────
def train_content_model(product_df: pd.DataFrame):
    logger.info("Training Content-Based Filtering model (TF-IDF)...")

    # Build rich text corpus: name + category + description
    product_df["corpus"] = (
        product_df["name"] + " " +
        product_df["category"] + " " +
        product_df["description"].fillna("")
    )

    tfidf = TfidfVectorizer(
        stop_words="english",
        ngram_range=(1, 2),
        max_features=5000,
        sublinear_tf=True,
    )
    tfidf_matrix = tfidf.fit_transform(product_df["corpus"])
    cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)

    # Map product id → matrix index
    product_id_to_idx = {pid: i for i, pid in enumerate(product_df["id"].tolist())}
    product_ids = product_df["id"].tolist()

    # Save model artifacts
    with open(os.path.join(MODEL_DIR, "tfidf_vectorizer.pkl"), "wb") as f:
        pickle.dump(tfidf, f)
    with open(os.path.join(MODEL_DIR, "cosine_sim_matrix.pkl"), "wb") as f:
        pickle.dump(cosine_sim, f)
    with open(os.path.join(MODEL_DIR, "product_id_to_idx.pkl"), "wb") as f:
        pickle.dump(product_id_to_idx, f)
    with open(os.path.join(MODEL_DIR, "product_ids_list.pkl"), "wb") as f:
        pickle.dump(product_ids, f)

    logger.info(f"Content model saved. TF-IDF matrix: {tfidf_matrix.shape}")
    return cosine_sim, product_id_to_idx, product_ids


# ─────────────────────────────────────────────────────────────
# 3. Collaborative Filtering (Custom SGD-based SVD)
# ─────────────────────────────────────────────────────────────
def build_ratings_matrix(behavior_df: pd.DataFrame) -> pd.DataFrame:
    """
    Convert raw behavior events into a consolidated ratings matrix.
    Explicit ratings override implicit signals.
    Implicit score = weighted sum of action types (view=1, click=2, cart=3, purchase=5).
    Final score is clipped to [1, 5] to match a 5-star scale.
    """
    # Explicit ratings
    explicit = behavior_df[behavior_df["action_type"] == "rating"][["user_id", "product_id", "rating"]].copy()
    explicit = explicit.rename(columns={"rating": "score"})

    # Implicit signals
    implicit = behavior_df[behavior_df["action_type"] != "rating"].copy()
    implicit["score"] = implicit["action_type"].map(ACTION_WEIGHTS)
    implicit_agg = (
        implicit.groupby(["user_id", "product_id"])["score"]
        .sum()
        .reset_index()
    )
    # Clip implicit scores to [1, 5]
    implicit_agg["score"] = implicit_agg["score"].clip(1, 5)

    # Merge: explicit ratings take priority
    combined = implicit_agg.rename(columns={"score": "implicit_score"})
    combined = combined.merge(
        explicit.rename(columns={"score": "explicit_score"}),
        on=["user_id", "product_id"],
        how="left"
    )
    combined["rating"] = combined["explicit_score"].combine_first(combined["implicit_score"])
    return combined[["user_id", "product_id", "rating"]]


def train_collaborative_model(behavior_df: pd.DataFrame) -> CustomSVD:
    logger.info("Building ratings matrix for Collaborative Filtering...")
    ratings_df = build_ratings_matrix(behavior_df)
    logger.info(f"Ratings matrix: {len(ratings_df)} rows")

    svd = CustomSVD(n_factors=30, n_epochs=20, lr=0.005, reg=0.02)
    svd.fit(ratings_df)

    # Save model
    with open(os.path.join(MODEL_DIR, "svd_model.pkl"), "wb") as f:
        pickle.dump(svd, f)
    with open(os.path.join(MODEL_DIR, "ratings_df.pkl"), "wb") as f:
        pickle.dump(ratings_df, f)

    logger.info("Collaborative Filtering (SVD) model saved.")
    return svd


# ─────────────────────────────────────────────────────────────
# 4. Main Entry Point
# ─────────────────────────────────────────────────────────────
if __name__ == "__main__":
    db = SessionLocal()
    try:
        product_df, behavior_df = load_data(db)
        train_content_model(product_df)
        train_collaborative_model(behavior_df)
        logger.info("[SUCCESS] All ML models trained and saved to ml/models/")
    finally:
        db.close()
