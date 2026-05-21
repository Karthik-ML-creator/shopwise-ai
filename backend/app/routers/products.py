from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, func

from backend.app.database import get_db
from backend.app.models import Product
from backend.app.schemas import ProductResponse, PaginatedProductResponse

router = APIRouter(prefix="/api/products", tags=["Products"])

@router.get("", response_model=PaginatedProductResponse)
def get_products(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=12, ge=1, le=100),
    search: Optional[str] = Query(default=None),
    category: Optional[str] = Query(default=None),
    min_price: Optional[float] = Query(default=None, ge=0.0),
    max_price: Optional[float] = Query(default=None, ge=0.0),
    db: Session = Depends(get_db)
):
    """
    Retrieve all products with advanced filtering, case-insensitive title search, price limits, and pagination.
    """
    query = db.query(Product)
    
    # 1. Search filter
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            or_(
                Product.name.ilike(search_filter),
                Product.description.ilike(search_filter)
            )
        )
        
    # 2. Category filter
    if category:
        query = query.filter(Product.category == category)
        
    # 3. Price filters
    if min_price is not None:
        query = query.filter(Product.price >= min_price)
    if max_price is not None:
        query = query.filter(Product.price <= max_price)
        
    # Count total matching products for pagination response
    total = query.count()
    
    # Apply offset and limit
    offset = (page - 1) * limit
    items = query.order_by(Product.id.asc()).offset(offset).limit(limit).all()
    
    return PaginatedProductResponse(
        items=items,
        total=total,
        page=page,
        limit=limit
    )


@router.get("/categories", response_model=List[str])
def get_categories(db: Session = Depends(get_db)):
    """Fetch distinct product categories available in the system."""
    categories = db.query(Product.category).distinct().all()
    return [cat[0] for cat in categories if cat[0]]


@router.get("/category/{cat}", response_model=List[ProductResponse])
def get_products_by_category(cat: str, db: Session = Depends(get_db)):
    """Get all products belonging to a specific category."""
    products = db.query(Product).filter(Product.category == cat).all()
    return products


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    """Retrieve a single product details by its unique identifier."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID {product_id} not found."
        )
    return product
