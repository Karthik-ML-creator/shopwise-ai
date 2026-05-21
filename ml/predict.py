"""
ML Prediction Module — Phase 4
================================
Loads trained .pkl model artifacts and serves:
  - get_personalized_recs(user_id) → Hybrid (SVD + Content) top-N
  - get_similar_recs(product_id)   → Content-based similar products
  - get_trending_recs()            → Popularity-based fallback
"""

import os
import sys
import pickle
import logging
from typing import List

import numpy as np

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ml.algorithms import CustomSVD

logger = logging.getLogger("ml_predict")
MODEL_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models")

# ─────────────────────────────────────────────────────────────
# Load artifacts (lazy — cached at module level)
# ─────────────────────────────────────────────────────────────
_svd_model = None
_cosine_sim = None
_product_id_to_idx = None
_product_ids_list = None
_ratings_df = None


def _load_artifacts():
    global _svd_model, _cosine_sim, _product_id_to_idx, _product_ids_list, _ratings_df
    if _svd_model is None:
        with open(os.path.join(MODEL_DIR, "svd_model.pkl"), "rb") as f:
            _svd_model = pickle.load(f)
        with open(os.path.join(MODEL_DIR, "cosine_sim_matrix.pkl"), "rb") as f:
            _cosine_sim = pickle.load(f)
        with open(os.path.join(MODEL_DIR, "product_id_to_idx.pkl"), "rb") as f:
            _product_id_to_idx = pickle.load(f)
        with open(os.path.join(MODEL_DIR, "product_ids_list.pkl"), "rb") as f:
            _product_ids_list = pickle.load(f)
        with open(os.path.join(MODEL_DIR, "ratings_df.pkl"), "rb") as f:
            _ratings_df = pickle.load(f)
        logger.info("ML artifacts loaded successfully.")


# ─────────────────────────────────────────────────────────────
# Hybrid weight config (60% CF + 40% Content)
# ─────────────────────────────────────────────────────────────
CF_WEIGHT = 0.60
CBF_WEIGHT = 0.40


def get_personalized_recs(db, user_id: int, top_n: int = 10) -> List:
    """
    Hybrid personalized recommendations for a user.
      - SVD Collaborative Filtering score (60%)
      - Content-Based score from user's interaction history (40%)
    Falls back to trending if user has no interactions.
    """
    from backend.app.models import Product, UserBehavior
    from backend.app.schemas import ProductResponse, RecommendationResponse

    _load_artifacts()

    # Get products the user has already interacted with
    user_behaviors = db.query(UserBehavior).filter(UserBehavior.user_id == user_id).all()
    seen_ids = {b.product_id for b in user_behaviors}

    if not seen_ids:
        return []  # Triggers cold-start fallback in router

    # 1. SVD scores for unseen products
    svd_scores = dict(_svd_model.predict_top_n(user_id, seen_ids, top_n=50))

    # 2. Content-based scores: average cosine sim between unseen items and user's liked items
    # "Liked" = purchased or rated >= 4
    liked_ids = {
        b.product_id for b in user_behaviors
        if b.action_type in ("purchase", "cart") or
        (b.action_type == "rating" and b.rating and b.rating >= 4)
    } or seen_ids  # fallback to all seen if no liked

    cbf_scores = {}
    for pid in _product_ids_list:
        if pid in seen_ids:
            continue
        if pid not in _product_id_to_idx:
            continue
        p_idx = _product_id_to_idx[pid]
        sims = []
        for liked_pid in liked_ids:
            if liked_pid in _product_id_to_idx:
                l_idx = _product_id_to_idx[liked_pid]
                sims.append(_cosine_sim[p_idx][l_idx])
        cbf_scores[pid] = float(np.mean(sims)) if sims else 0.0

    # 3. Combine: hybrid score
    all_pids = set(svd_scores.keys()) | set(cbf_scores.keys())
    hybrid_scores = {}
    max_svd = max(svd_scores.values(), default=1.0) or 1.0
    for pid in all_pids:
        svd = svd_scores.get(pid, 0.0) / max_svd  # normalize to [0,1]
        cbf = cbf_scores.get(pid, 0.0)             # already [0,1]
        hybrid_scores[pid] = CF_WEIGHT * svd + CBF_WEIGHT * cbf

    ranked = sorted(hybrid_scores.items(), key=lambda x: x[1], reverse=True)[:top_n]

    # Fetch product objects
    result_ids = [pid for pid, _ in ranked]
    products = {p.id: p for p in db.query(Product).filter(Product.id.in_(result_ids)).all()}

    results = []
    for pid, score in ranked:
        if pid in products:
            results.append(RecommendationResponse(
                product=ProductResponse.model_validate(products[pid]),
                score=round(score, 4),
                algorithm="hybrid"
            ))
    return results


def get_similar_recs(db, product_id: int, top_n: int = 6) -> List:
    """Content-based item-to-item similarity recommendations."""
    from backend.app.models import Product
    from backend.app.schemas import ProductResponse, RecommendationResponse

    _load_artifacts()

    if product_id not in _product_id_to_idx:
        return []

    p_idx = _product_id_to_idx[product_id]
    sim_scores = list(enumerate(_cosine_sim[p_idx]))
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    # Exclude the product itself
    sim_scores = [(i, s) for i, s in sim_scores if _product_ids_list[i] != product_id][:top_n]

    similar_product_ids = [_product_ids_list[i] for i, _ in sim_scores]
    scores_map = {_product_ids_list[i]: s for i, s in sim_scores}

    products = {p.id: p for p in db.query(Product).filter(Product.id.in_(similar_product_ids)).all()}

    results = []
    for pid in similar_product_ids:
        if pid in products:
            results.append(RecommendationResponse(
                product=ProductResponse.model_validate(products[pid]),
                score=round(scores_map[pid], 4),
                algorithm="content"
            ))
    return results


def get_trending_recs(db, top_n: int = 10) -> List:
    """Popularity-based trending items (for cold-start / guest users)."""
    from sqlalchemy import func
    from backend.app.models import Product, UserBehavior

    trending = (
        db.query(UserBehavior.product_id, func.count(UserBehavior.id).label("cnt"))
        .group_by(UserBehavior.product_id)
        .order_by(func.count(UserBehavior.id).desc())
        .limit(top_n)
        .all()
    )
    if not trending:
        return db.query(Product).limit(top_n).all()

    pids = [t[0] for t in trending]
    products = {p.id: p for p in db.query(Product).filter(Product.id.in_(pids)).all()}
    return [products[pid] for pid in pids if pid in products]
