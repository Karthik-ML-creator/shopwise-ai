import sys
import os
import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

# Dynamically link the parent folder so ml.predict can be imported easily
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from backend.app.database import get_db
from backend.app.models import Product, UserBehavior, User
from backend.app.schemas import RecommendationResponse, ProductResponse
from backend.app.redis_client import get_cached_recommendations, set_cached_recommendations

logger = logging.getLogger("recommendations_router")

router = APIRouter(prefix="/api/recommendations", tags=["ML Recommendations"])

# =======================================================
# FALLBACK ALGORITHMS (If ML models are not trained yet)
# =======================================================
def get_db_trending_products(db: Session, limit: int = 10) -> List[Product]:
    """Retrieve highly active products based on interaction counts (views, purchases, cart additions)."""
    trending_ids = (
        db.query(
            UserBehavior.product_id,
            func.count(UserBehavior.id).label("interaction_count")
        )
        .group_by(UserBehavior.product_id)
        .order_by(func.count(UserBehavior.id).desc())
        .limit(limit)
        .all()
    )
    
    if not trending_ids:
        # Fallback to random products in DB if there is no behavior log yet
        return db.query(Product).limit(limit).all()
        
    product_ids = [tid[0] for tid in trending_ids]
    products = db.query(Product).filter(Product.id.in_(product_ids)).all()
    # Sort them by their position in product_ids
    products.sort(key=lambda p: product_ids.index(p.id))
    return products


# Attempt to import production model prediction functions
try:
    from ml.predict import (
        get_personalized_recs,
        get_similar_recs,
        get_trending_recs
    )
    ML_AVAILABLE = True
    logger.info("🤖 Machine Learning Prediction pipeline imported successfully.")
except ImportError as e:
    ML_AVAILABLE = False
    logger.warning(f"⚠️ ML Modules offline or models (.pkl) not trained yet. Falling back to DB queries. Error: {e}")


# ==========================================
# ENDPOINTS
# ==========================================
@router.get("/trending", response_model=List[ProductResponse])
def get_trending(limit: int = 10, db: Session = Depends(get_db)):
    """
    Fetch trending/popular products. Useful for cold-start (new users)
    and landing carousel sections.
    """
    if ML_AVAILABLE:
        try:
            products = get_trending_recs(db=db, top_n=limit)
            return products
        except Exception as e:
            logger.error(f"Error in ML trending recs: {e}. Falling back to DB.")
            
    # Database analytics fallback
    return get_db_trending_products(db, limit)


@router.get("/similar/{product_id}", response_model=List[RecommendationResponse])
def get_similar(product_id: int, limit: int = 6, db: Session = Depends(get_db)):
    """
    Retrieve content-based similar products for item-to-item recommendation grids.
    """
    # Verify product exists
    prod = db.query(Product).filter(Product.id == product_id).first()
    if not prod:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID {product_id} does not exist"
        )
        
    if ML_AVAILABLE:
        try:
            recommendations = get_similar_recs(db=db, product_id=product_id, top_n=limit)
            return recommendations
        except Exception as e:
            logger.error(f"Error in ML similar recs: {e}. Falling back to DB category similarity.")
            
    # Category-based database fallback if ML models are not compiled yet
    similar_prods = (
        db.query(Product)
        .filter(Product.category == prod.category, Product.id != product_id)
        .limit(limit)
        .all()
    )
    
    return [
        RecommendationResponse(product=ProductResponse.model_validate(p), score=0.5, algorithm="db_category_fallback")
        for p in similar_prods
    ]


@router.get("/{user_id}", response_model=List[RecommendationResponse])
def get_personalized(user_id: int, limit: int = 10, db: Session = Depends(get_db)):
    """
    Fetch highly tailored product recommendations for a specific user.
    Leverages Redis caching for high response speeds (TTL 1 hour).
    Fires collaborative filtering predictions combined with content preferences.
    """
    # Verify user exists
    user_exists = db.query(User).filter(User.id == user_id).first()
    if not user_exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {user_id} does not exist"
        )
        
    # Check cache first
    cached_recs = get_cached_recommendations(user_id, "hybrid")
    if cached_recs:
        # Convert dictionary formats back to models response
        return [RecommendationResponse(**r) for r in cached_recs]
        
    # Execute ML pipeline
    recommendations = []
    if ML_AVAILABLE:
        try:
            recommendations = get_personalized_recs(db=db, user_id=user_id, top_n=limit)
        except Exception as e:
            logger.error(f"Error in ML personalized recs: {e}. Falling back to DB popularity.")

    # Cold-Start fallback: if user has no interactions or ML failed, return trending products
    if not recommendations:
        trending = get_db_trending_products(db, limit)
        recommendations = [
            RecommendationResponse(product=ProductResponse.model_validate(p), score=0.0, algorithm="cold_start_trending")
            for p in trending
        ]
        
    # Cache the computed recommendations list
    serializable_recs = [
        {
            "product": ProductResponse.model_validate(r.product).model_dump(),
            "score": r.score,
            "algorithm": r.algorithm
        }
        for r in recommendations
    ]
    set_cached_recommendations(user_id, "hybrid", serializable_recs)
    
    return recommendations
