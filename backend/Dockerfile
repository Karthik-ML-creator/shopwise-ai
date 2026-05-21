# Stage 1: Build virtual environment and install dependencies
FROM python:3.12-slim AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Also install scientific packages required for ML training/evaluation
RUN pip install --no-cache-dir numpy pandas scikit-learn

# Stage 2: Runtime image
FROM python:3.12-slim AS runner

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy python backend code & ML pipeline
COPY backend /app/backend
COPY ml /app/ml

# Environment variables configuration defaults
ENV PORT=8000
ENV JWT_SECRET="super-secret-jwt-key-for-college-major-project-2026"
ENV DATABASE_URL="sqlite:////app/recommender.db"
ENV REDIS_HOST=""
ENV PYTHONUNBUFFERED=1

EXPOSE 8000

# Run FastAPI backend
CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
