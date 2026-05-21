from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


# ==========================================
# AUTHENTICATION SCHEMAS
# ==========================================
class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, examples=["John Doe"])
    email: str = Field(..., min_length=5, max_length=100, examples=["john.doe@example.com"])
    password: str = Field(..., min_length=6, max_length=100, examples=["strongpassword123"])

class UserLogin(BaseModel):
    email: str = Field(..., examples=["john.doe@example.com"])
    password: str = Field(..., examples=["strongpassword123"])

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    created_at: datetime

    class Config:
        from_attributes = True


# ==========================================
# PRODUCT SCHEMAS
# ==========================================
class ProductResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    category: str
    price: float
    image_url: Optional[str] = None
    stock: int

    class Config:
        from_attributes = True

class PaginatedProductResponse(BaseModel):
    items: List[ProductResponse]
    total: int
    page: int
    limit: int


# ==========================================
# USER BEHAVIOR TRACKING SCHEMAS
# ==========================================
class BehaviorTrack(BaseModel):
    product_id: int
    action_type: str = Field(..., description="view / click / cart / purchase / rating")
    rating: Optional[int] = Field(default=None, ge=1, le=5)

class BehaviorResponse(BaseModel):
    id: int
    user_id: int
    product_id: int
    action_type: str
    timestamp: datetime
    rating: Optional[int] = None

    class Config:
        from_attributes = True


# ==========================================
# RECOMMENDATION SCHEMAS
# ==========================================
class RecommendationResponse(BaseModel):
    product: ProductResponse
    score: float
    algorithm: str

    class Config:
        from_attributes = True
