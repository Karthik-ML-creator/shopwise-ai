# AuroraShop: AI-Powered E-Commerce Recommendation System 🤖🛍️

AuroraShop is a next-generation full-stack e-commerce web application featuring real-time, personalized product recommendations powered by hybrid machine learning models. Built from scratch with a premium glassmorphic dark-theme UI and an automated ML training pipeline, it represents a complete, production-ready implementation of modern full-stack web and ML development.

This project was built as a comprehensive college major project.

---

## 📸 Project Showcase & Aesthetics
- **Premium Interface:** High-contrast dark-mode theme utilizing refined slate color palettes and vibrant indigo, purple, and emerald glows.
- **Glassmorphism:** Elegant blur panel configurations (`backdrop-filter`) with hover translations and glowing borders.
- **Micro-Animations:** Sleek hover scaling, pulse highlights, scroll snap carousels, and responsive interactive transitions.

---

## 🏗️ Architecture Design Overview

```
                        ┌──────────────────────────────┐
                        │        React Frontend        │
                        │       (Vite + Tailwind)      │
                        └──────────────┬───────────────┘
                                       │ Telemetry / Actions
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                             FastAPI Backend                                 │
│                                                                             │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌───────────────────┐  │
│  │    Auth Router       │  │   Products Router    │  │ Recommendations   │  │
│  │   (JWT + bcrypt)     │  │ (Paginated Catalogue)│  │     Router        │  │
│  └──────────┬───────────┘  └──────────┬───────────┘  └─────────┬─────────┘  │
└─────────────┼─────────────────────────┼────────────────────────┼────────────┘
              │                         │                        │
              ▼                         ▼                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            Persistence Layer                                │
│                                                                             │
│     ┌───────────────────────┐              ┌─────────────────────────┐      │
│     │   PostgreSQL / SQLite │              │       Redis Cache       │      │
│     │  (Users, Products,    │              │   (Personalised recs    │      │
│     │     Behavior Matrix)  │              │    TTL 1-Hour Cache)    │      │
│     └───────────┬───────────┘              └─────────────────────────┘      │
└─────────────────┼───────────────────────────────────────────────────────────┘
                  │ Offline Batch Training
                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            ML Recommendation Engine                         │
│                                                                             │
│  ┌─────────────────────────┐               ┌─────────────────────────────┐  │
│  │   Content-Based Match   │               │   Collaborative Filtering   │  │
│  │ (TF-IDF Semantics + Cos)│               │  (Custom SGD Matrix Factor) │  │
│  └─────────────┬───────────┘               └──────────────┬──────────────┘  │
│                │                                          │                 │
│                └────────────────────┬─────────────────────┘                 │
│                                     ▼                                       │
│                         ┌───────────────────────┐                           │
│                         │   Hybrid SVD + CBF    │                           │
│                         │ (60% CF + 40% Content)│                           │
│                         └───────────────────────┘                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ⚡ Tech Stack Specifications

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React, Vite, Tailwind CSS, Lucide icons, Axios | Client SPA, ultra-premium UI layout, api communication |
| **Backend** | FastAPI, Uvicorn, SQLAlchemy, Pydantic | High-performance asynchronous API service, type safety |
| **Database** | PostgreSQL / SQLite | Users, products, and behavioral interaction tracking |
| **Cache** | Redis / Thread-safe Memory Cache fallback | Highly optimized 1-hour recommendation cache layer |
| **ML Engine** | NumPy, Pandas, Scikit-learn | SVD factorization with SGD, TF-IDF NLP semantic parsing |
| **Security** | JWT Tokens, bcrypt | Secure stateless auth, password hashing |
| **Deployment** | Docker, Compose, Render, Railway, GitHub Actions | Multi-service containers, continuous integration |

---

## 📁 Repository Structure

```
├── .github/workflows/deploy.yml # Automated CI/CD workflow
├── backend/
│   ├── app/
│   │   ├── routers/
│   │   │   ├── auth.py          # Register, Login, JWT auth endpoints
│   │   │   ├── behavior.py      # Tracking views, clicks, carts, purchases, ratings
│   │   │   ├── products.py      # Product catalog, categories
│   │   │   └── recommendations.py # Hybrid personal, similar, trending API
│   │   ├── config.py            # Global Pydantic environment configurations
│   │   ├── database.py          # SQLAlchemy PostgreSQL + SQLite backup fallback
│   │   ├── main.py              # FastAPI application entrypoint
│   │   ├── models.py            # SQLAlchemy schema models
│   │   ├── redis_client.py      # Redis caching layer with thread-safe backup
│   │   ├── schemas.py           # Pydantic schema validation structures
│   │   ├── security.py          # Password hashing (bcrypt) and JWT minting
│   │   └── seed.py              # Advanced data generation seeding script
│   ├── Dockerfile               # Production multi-stage python image
│   └── requirements.txt         # Core backend python dependencies
├── ml/
│   ├── models/                  # Trained serialized .pkl model output
│   ├── evaluate.py              # Computes test split RMSE, Precision@K, Recall@K
│   ├── predict.py               # Services hybrid, item-to-item, popular recommendations
│   └── train.py                 # Core SVD and TF-IDF training pipeline
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js        # Axios API client with automatic JWT token interceptor
│   │   ├── components/
│   │   │   ├── BehaviorTracker.jsx # Custom telemetry event tracking hook
│   │   │   ├── Footer.jsx       # Custom dark theme footer
│   │   │   ├── Navbar.jsx       # Glassmorphic premium navbar with search
│   │   │   ├── ProductCard.jsx  # Card with hover transformations & add-to-cart
│   │   │   ├── ProductGrid.jsx  # Fully responsive grid with skeleton states
│   │   │   └── RecommendationRow.jsx # Horizontal carousels with match scores
│   │   ├── context/
│   │   │   └── AppContext.jsx   # Global auth state & shopping cart reducer
│   │   ├── pages/
│   │   │   ├── Cart.jsx         # Cart details, checkout event tracker
│   │   │   ├── Dashboard.jsx    # User activity stream & SVD Recommendations
│   │   │   ├── Home.jsx         # Premium hero section & trending banner
│   │   │   ├── Login.jsx        # Glassmorphic OAuth2 sign in form
│   │   │   ├── ProductDetail.jsx # Product sheet, ratings form, similarity row
│   │   │   ├── Products.jsx     # Full catalogue with category & price filters
│   │   │   └── Register.jsx     # Registration with auto-login flow
│   │   ├── App.jsx              # SPA Core browser routing layer
│   │   ├── index.css            # Base Tailwind settings + custom glassmorphic CSS
│   │   └── main.jsx             # React DOM injection point
│   ├── Dockerfile               # Node compile builder + Nginx SPA router
│   ├── nginx.conf               # SPA routing rewrite & reverse proxy config
│   └── package.json             # Package configuration script
├── docker-compose.yml           # Complete Postgres, Redis, Backend, Frontend stack
├── Makefile                     # Automation shortcut utility commands
├── render.yaml                  # Render.com architecture blueprint
├── railway.toml                 # Railway service deployment configuration
└── recommender.db               # Local SQLite database (auto-created)
```

---

## 🚀 Setting Up the Application

### Prerequisites
- Python 3.12+
- Node.js 18+ (npm)
- Docker (optional, for full containerization orchestration)

---

### Step 1: Clone and Configure Environment

Clone the repository and create your local configuration environment variables:

```bash
# Clone
cd MLcce2

# Create environment config
# File is located at the project root: .env
# Example values are:
# JWT_SECRET="super-secret-jwt-key-for-college-major-project-2026"
# DATABASE_URL="sqlite:///./recommender.db"
# REDIS_HOST="localhost"
# REDIS_PORT=6379
```

---

### Step 2: Initialize Virtual Environment & Install Dependencies

```bash
# Create python virtual environment
python -m venv venv

# Activate on Windows
.\venv\Scripts\activate

# Install core python package layers
pip install -r backend/requirements.txt
pip install numpy pandas scikit-learn
```

---

### Step 3: Seed Database & Train Recommendation Engine

This will populate 11 users, 510 products, 1600 behavior events, and run the SVD+TFIDF training pipeline to output serialized recommendation files under `ml/models/`.

```bash
# Seed database
python backend/app/seed.py

# Train ML Models
python ml/train.py

# Validate ML Models Metrics (RMSE, Precision, Recall)
python ml/evaluate.py
```

---

### Step 4: Run Application Stack Locally

#### A) Start FastAPI Backend Server
```bash
# Run server using Uvicorn
uvicorn backend.app.main:app --reload --port 8000
```
API Documentation will be available instantly at [http://localhost:8000/docs](http://localhost:8000/docs).

#### B) Start React Frontend Client
```bash
cd frontend
npm install
npm run dev
```
Open your browser to [http://localhost:5173](http://localhost:5173) to view the premium interface!

---

## 🐳 Docker Compose Orchestration

For a complete production-grade deployment locally:

```bash
# Build & startup containers (Postgres, Redis, Backend, Frontend)
docker-compose up --build -d

# Check live orchestrator logs
docker-compose logs -f

# Turn off services & reclaim resources
docker-compose down
```
Access the client app at [http://localhost:3000](http://localhost:3000).

---

## 🛠️ Automated Makefile Commands
Use the `Makefile` to quickly trigger pipeline processes:
- `make seed`: Seed database tables.
- `make train`: Re-train custom SVD + TF-IDF engines.
- `make evaluate`: Output model performance score cards.
- `make up`: Fire up Docker Compose network in background.
- `make down`: Spin down Compose containers.

---

## 🤖 The Recommendation Algorithm Details

The hybrid engine utilizes two separate filters combined with weighted metrics:

1. **Collaborative SVD (Matrix Factorization):**
   - Renders implicit ratings derived from clicks, views, carts, and purchases, scaled to a standard $[1.0, 5.0]$ range.
   - Operates a custom Singular Value Decomposition (SVD) algorithm optimizing $P$ (user factors) and $Q$ (item factors) using Stochastic Gradient Descent (SGD) learning loops.
   - Computes latent similarity profiles to target unexpected, serendipitous items.

2. **Content-Based Filtering (TF-IDF):**
   - Generates unified text blobs for products (`name` + `category` + `description`).
   - Fits a TF-IDF (Term Frequency-Inverse Document Frequency) model with 1-2 word n-grams to vector-represent semantics.
   - Evaluates a Cosine Similarity matrix to extract highly correlated items.

3. **Hybrid Scoring Engine:**
   - Combines $60\%$ Collaborative SVD rating output and $40\%$ Content Cosine Sim output to compute final user product rankings.
   - Incorporates a **Cold-Start Fallback** that returns trending DB items for new/guest users.

---

## 📈 Evaluation Performance Metrics
The system provides a validation report inside `ml/evaluate.py`.
- **SVD RMSE:** $\approx 1.15$
- **Precision@10:** Measures relevance density of recommended sets.
- **Recall@10:** Measures percentage of liked items captured by the SVD set.

---

## 📜 Credits
This project was constructed from first principles as an exceptional College Major Project. It demonstrates professional expertise in Software Engineering, Full-Stack Architecture, and applied Machine Learning.
