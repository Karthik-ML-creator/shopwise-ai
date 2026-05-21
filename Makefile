.PHONY: build up down restart logs seed train evaluate clean test

# Build all Docker containers
build:
	docker-compose build

# Run application stack in background
up:
	docker-compose up -d

# Stop application stack
down:
	docker-compose down

# Restart application stack
restart:
	docker-compose down && docker-compose up -d

# Show docker application logs
logs:
	docker-compose logs -f

# Run local database seeding (with SQLite fallback)
seed:
	python backend/app/seed.py

# Train local ML matrix factorization & Content matching models
train:
	python ml/train.py

# Run evaluation suite on trained models
evaluate:
	python ml/evaluate.py

# Destroy and clean all volume storages
clean:
	docker-compose down -v

# Run FastAPI backend testing
test:
	pytest
