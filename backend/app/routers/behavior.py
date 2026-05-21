from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models import UserBehavior, Product, User
from backend.app.schemas import BehaviorTrack, BehaviorResponse
from backend.app.security import get_optional_current_user
from backend.app.redis_client import invalidate_user_cache

router = APIRouter(prefix="/api/behavior", tags=["User Behavior Telemetry"])

@router.post("/track", response_model=BehaviorResponse, status_code=status.HTTP_201_CREATED)
def track_behavior(
    behavior_data: BehaviorTrack,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Log a real-time behavior telemetry event (view, click, cart, purchase, rating).
    If user is authenticated, associates it with their user_id. If anonymous, logs it with a mock user id or saves it generically.
    """
    # Verify product exists
    product = db.query(Product).filter(Product.id == behavior_data.product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID {behavior_data.product_id} not found"
        )
    
    # Assign User ID (use user_id = 1 as system default guest profile if anonymous, to prevent database orphan interactions)
    user_id = current_user.id if current_user else 1
    
    # Ensure rating is provided only if action is rating, or purchase/cart optionally
    rating_val = behavior_data.rating
    if behavior_data.action_type == "rating" and rating_val is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Rating value (1-5) is required when action_type is 'rating'"
        )

    # Save to Database
    new_behavior = UserBehavior(
        user_id=user_id,
        product_id=behavior_data.product_id,
        action_type=behavior_data.action_type,
        rating=rating_val
    )
    db.add(new_behavior)
    db.commit()
    db.refresh(new_behavior)
    
    # Invalidate recommendation cache so new recommendations compute next time they are requested
    if current_user:
        invalidate_user_cache(user_id)
        
    return new_behavior


@router.get("/{user_id}", response_model=List[BehaviorResponse])
def get_user_behavior_history(user_id: int, db: Session = Depends(get_db)):
    """Retrieve full chronological action telemetry history for a specific user."""
    history = db.query(UserBehavior).filter(
        UserBehavior.user_id == user_id
    ).order_by(UserBehavior.timestamp.desc()).all()
    return history
