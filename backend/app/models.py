from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, UniqueConstraint
from sqlalchemy.orm import relationship, declarative_base
from sqlalchemy.sql import func

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    behaviors = relationship("UserBehavior", back_populates="user", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User id={self.id} email='{self.email}'>"


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    category = Column(String(100), nullable=False, index=True)
    price = Column(Float, nullable=False)
    image_url = Column(String(500), nullable=True)
    stock = Column(Integer, nullable=False, default=0)

    # Relationships
    behaviors = relationship("UserBehavior", back_populates="product", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="product", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Product id={self.id} name='{self.name}' price={self.price}>"


class UserBehavior(Base):
    __tablename__ = "user_behavior"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    action_type = Column(String(50), nullable=False, index=True) # view, click, cart, purchase, rating
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    rating = Column(Integer, nullable=True) # 1 to 5 rating, only populated when action_type is 'rating' or during purchase/review

    # Relationships
    user = relationship("User", back_populates="behaviors")
    product = relationship("Product", back_populates="behaviors")

    def __repr__(self):
        return f"<UserBehavior id={self.id} user_id={self.user_id} product_id={self.product_id} action='{self.action_type}'>"


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    score = Column(Float, nullable=False) # prediction score/similarity score
    algorithm = Column(String(100), nullable=False, index=True) # svd, content, hybrid, trending
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    # Relationships
    user = relationship("User", back_populates="recommendations")
    product = relationship("Product", back_populates="recommendations")

    # Prevent duplicating recommendations for same user/product from same algorithm
    __table_args__ = (
        UniqueConstraint('user_id', 'product_id', 'algorithm', name='_user_product_algo_uc'),
    )

    def __repr__(self):
        return f"<Recommendation user_id={self.user_id} product_id={self.product_id} score={self.score:.4f}>"
