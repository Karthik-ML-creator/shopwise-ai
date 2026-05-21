import os
import sys
import random
from datetime import datetime, timedelta
from faker import Faker
from sqlalchemy.orm import Session

# Add project root to path to prevent import issues
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from backend.app.database import engine, SessionLocal
from backend.app.models import Base, User, Product, UserBehavior
from backend.app.security import get_password_hash

fake = Faker()
Faker.seed(42)
random.seed(42)

# Unsplash category templates for high-fidelity premium mock images
CATEGORY_IMAGES = {
    "Electronics": [
        "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&auto=format&fit=crop", # Laptop
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop", # Headphones
        "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop", # Monitor
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop", # Smartwatch
        "https://images.unsplash.com/photo-1527698266440-12104e498b76?w=600&auto=format&fit=crop", # Speaker
        "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop", # Wearables
    ],
    "Fashion": [
        "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&auto=format&fit=crop", # Handbag
        "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&auto=format&fit=crop", # Jacket
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop", # Red shoes
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop", # Yellow dress
        "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&auto=format&fit=crop", # Pattern dress
        "https://images.unsplash.com/photo-1509319117193-57bab727e09d?w=600&auto=format&fit=crop", # Shirt
    ],
    "Home & Kitchen": [
        "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop", # Kitchen pan
        "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop", # Bedding
        "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=600&auto=format&fit=crop", # Lamp
        "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&auto=format&fit=crop", # Stool
        "https://images.unsplash.com/photo-1581608729074-738fd95475e5?w=600&auto=format&fit=crop", # Blender
        "https://images.unsplash.com/photo-1517705008128-361805f42e86?w=600&auto=format&fit=crop", # Rug
    ],
    "Books": [
        "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&auto=format&fit=crop", # Book stack
        "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600&auto=format&fit=crop", # Book pages
        "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop", # Open book
        "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop", # Shelf
        "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&auto=format&fit=crop", # Old book
    ],
    "Beauty": [
        "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop", # Cosmetics
        "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=600&auto=format&fit=crop", # Perfume
        "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=600&auto=format&fit=crop", # Skin serum
        "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&auto=format&fit=crop", # Face cream
        "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop", # Lotion
    ]
}

PRODUCT_TEMPLATES = {
    "Electronics": ["Pro Laptop", "Noise-Cancelling Headphones", "4K Ultra Monitor", "Smart Fitness Watch", "Wireless Bluetooth Speaker", "Mechanical Gaming Keyboard", "Ergonomic Gaming Mouse", "Portable SSD 1TB", "True Wireless Earbuds", "Fast Wireless Charger", "VR Headset Pro", "Dual Band Router"],
    "Fashion": ["Classic Leather Jacket", "Slim Fit Denim Jeans", "Breathable Running Shoes", "Vintage Cotton T-Shirt", "Polarized Sunglasses", "Comfortable Wool Sweater", "Canvas Shoulder Bag", "Warm Winter Coat", "Formal Dress Shirt", "Flexible Training Shorts", "Elegant Pearl Necklace", "Waterproof Sports Watch"],
    "Home & Kitchen": ["Multi-Function Air Fryer", "Espresso Coffee Maker", "Professional Chef Knife Set", "Stainless Steel Blender", "Memory Foam Cushion Set", "Smart Ultrasonic Humidifier", "Robotic Vacuum Cleaner", "Non-Stick Cookware Set", "Electric Tea Kettle", "Adjustable Desk Lamp", "Aromatic Candle Gift Set", "Comfortable Cotton Rug"],
    "Books": ["Python Programming Masterclass", "The Art of Machine Learning", "Chronicles of the Cosmos", "Secrets of Modern Economics", "Healthy Habits Cookbook", "A Biography of Great Innovators", "Journey through Ancient Civilizations", "Mindfulness and Meditation Guide", "Financial Freedom Blueprint", "The AI Revolution", "Mastering Cognitive Psychology", "Creative Writing Handbook"],
    "Beauty": ["Hydrating Face Moisturizer", "Broad-Spectrum Sunscreen SPF 50", "Anti-Aging Retinol Serum", "Electric Cordless Shaver", "Nourishing Argan Oil Shampoo", "Organic Beard Grooming Oil", "Brightening Eye Cream", "Exfoliating Face Scrub", "Hydrating Lip Balm Set", "Natural Clay Face Mask", "Luxury Eau de Parfum", "Gentle Cleansing Water"]
}

def seed_db():
    print("[INIT] Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    
    # 1. Seed Users
    print("[SEED] Seeding Users...")
    users = []
    
    # Verify guest account (id=1) doesn't exist
    guest_user = db.query(User).filter(User.id == 1).first()
    if not guest_user:
        guest_user = User(
            id=1,
            name="Guest Account",
            email="guest@aurora.com",
            password_hash=get_password_hash("guestpwd123")
        )
        db.add(guest_user)
        db.commit()
    users.append(guest_user)
    
    # Standard users
    mock_user_emails = [
        ("Alice Peterson", "alice@aurora.com"),
        ("Bob Miller", "bob@aurora.com"),
        ("Charlie Brown", "charlie@aurora.com"),
        ("Diana Prince", "diana@aurora.com"),
        ("Evan Wright", "evan@aurora.com"),
        ("Fiona Gallagher", "fiona@aurora.com"),
        ("George Costanza", "george@aurora.com"),
        ("Helen Shaw", "helen@aurora.com"),
        ("Ian Malcolm", "ian@aurora.com"),
        ("Julia Roberts", "julia@aurora.com")
    ]
    
    for name, email in mock_user_emails:
        u = db.query(User).filter(User.email == email).first()
        if not u:
            u = User(
                name=name,
                email=email,
                password_hash=get_password_hash("password123")
            )
            db.add(u)
            db.commit()
            db.refresh(u)
        users.append(u)
        
    print(f"[OK] Total users in DB: {db.query(User).count()}")

    # 2. Seed Products (500+ records)
    print("[SEED] Seeding 500+ Products...")
    existing_products_count = db.query(Product).count()
    
    if existing_products_count < 500:
        products_to_add = []
        categories = list(PRODUCT_TEMPLATES.keys())
        
        # We need to reach 500+ products
        total_products_needed = 510 - existing_products_count
        
        for idx in range(total_products_needed):
            category = random.choice(categories)
            base_names = PRODUCT_TEMPLATES[category]
            base_name = random.choice(base_names)
            
            # Use Faker or indexing to make the product name completely unique
            product_name = f"{base_name} ({fake.word().capitalize()} Series)"
            
            # Select random premium picture from matching category
            img = random.choice(CATEGORY_IMAGES[category])
            
            # Add randomized dimensions to Unsplash url to ensure slight variation in image loads
            img_url = f"{img}&sig={idx}"
            
            price = round(random.uniform(9.99, 1499.99), 2)
            stock = random.randint(10, 150)
            desc = f"{fake.paragraph(nb_sentences=3)} Premium product specifically designed to deliver elite quality in the {category} division."
            
            p = Product(
                name=product_name,
                description=desc,
                category=category,
                price=price,
                image_url=img_url,
                stock=stock
            )
            products_to_add.append(p)
            
        db.add_all(products_to_add)
        db.commit()
        
    all_products = db.query(Product).all()
    print(f"[OK] Total products in DB: {len(all_products)}")

    # 3. Seed User Behavior Interactions (1500+ records for SVD model)
    print("[SEED] Seeding 1500+ Behavioral Interactions...")
    existing_behavior_count = db.query(UserBehavior).count()
    
    if existing_behavior_count < 1500:
        behaviors_to_add = []
        action_types = ["view", "click", "cart", "purchase", "rating"]
        weights = [0.45, 0.25, 0.15, 0.10, 0.05] # realistic frequency of events
        
        total_behaviors_needed = 1600 - existing_behavior_count
        
        # To make recommendations realistic:
        # We assign positive biases to specific users for specific categories!
        # E.g., User 2 (Alice) likes Electronics, User 3 (Bob) likes Fashion & Beauty
        user_preferences = {
            2: ["Electronics", "Books"],      # Alice
            3: ["Fashion", "Beauty"],          # Bob
            4: ["Home & Kitchen", "Books"],    # Charlie
            5: ["Beauty", "Fashion"],          # Diana
            6: ["Electronics", "Home & Kitchen"] # Evan
        }
        
        for idx in range(total_behaviors_needed):
            # Select random user
            user = random.choice(users)
            
            # Choose product based on user preferences to create realistic training signals
            if user.id in user_preferences and random.random() < 0.7:
                preferred_cats = user_preferences[user.id]
                filtered_products = [p for p in all_products if p.category in preferred_cats]
                product = random.choice(filtered_products) if filtered_products else random.choice(all_products)
            else:
                product = random.choice(all_products)
                
            action = random.choices(action_types, weights=weights, k=1)[0]
            
            # Rating setup: if action is rating, supply 3-5 stars (biased towards liking their preferred category)
            rating = None
            if action == "rating":
                if user.id in user_preferences and product.category in user_preferences[user.id]:
                    rating = random.choices([3, 4, 5], weights=[0.2, 0.3, 0.5], k=1)[0]
                else:
                    rating = random.choices([1, 2, 3, 4, 5], weights=[0.1, 0.1, 0.3, 0.3, 0.2], k=1)[0]
            
            # Adjust timestamp over the last 30 days
            days_ago = random.randint(0, 30)
            hours_ago = random.randint(0, 23)
            timestamp = datetime.utcnow() - timedelta(days=days_ago, hours=hours_ago)
            
            b = UserBehavior(
                user_id=user.id,
                product_id=product.id,
                action_type=action,
                rating=rating,
                timestamp=timestamp
            )
            behaviors_to_add.append(b)
            
        db.add_all(behaviors_to_add)
        db.commit()
        
    print(f"[OK] Total user interaction behaviors in DB: {db.query(UserBehavior).count()}")
    db.close()
    print("[SUCCESS] Database seeding successfully completed!")

if __name__ == "__main__":
    seed_db()
