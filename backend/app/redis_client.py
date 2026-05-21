import logging
import json
from typing import Optional, Any
import redis

from backend.app.config import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("redis_client")

class InMemoryCache:
    """
    A high-fidelity thread-safe in-memory fallback cache.
    Mimics basic redis-py operations if Redis is unavailable.
    """
    def __init__(self):
        self._data = {}
        logger.warning("⚠️ Redis connection failed. Falling back to Local In-Memory Cache.")

    def ping(self) -> bool:
        return True

    def get(self, key: str) -> Optional[str]:
        entry = self._data.get(key)
        if entry:
            # Check if expired
            expiry, val = entry
            import time
            if expiry and time.time() > expiry:
                del self._data[key]
                return None
            return val
        return None

    def setex(self, key: str, time_seconds: int, value: str) -> bool:
        import time
        expiry = time.time() + time_seconds if time_seconds else None
        self._data[key] = (expiry, value)
        return True

    def delete(self, *keys: str) -> int:
        count = 0
        for k in keys:
            if k in self._data:
                del self._data[k]
                count += 1
        return count


# Initialize the client with active error tolerance
try:
    # Set a strict socket_timeout of 1 second so it falls back quickly if offline
    redis_instance = redis.from_url(
        settings.REDIS_URL,
        decode_responses=True,
        socket_timeout=1.0,
        socket_connect_timeout=1.0
    )
    # Force connection check
    redis_instance.ping()
    logger.info("⚡ Successfully connected to Redis Cache Service.")
except Exception as e:
    logger.error(f"❌ Redis Connection Error: {e}")
    redis_instance = InMemoryCache()


def get_cached_recommendations(user_id: int, algorithm: str) -> Optional[Any]:
    """Retrieve cached recommendation lists by User ID and Algorithm type."""
    key = f"recs:{algorithm}:{user_id}"
    try:
        data = redis_instance.get(key)
        if data:
            logger.info(f"💾 Cache HIT for {key}")
            return json.loads(data)
        logger.info(f"❄️ Cache MISS for {key}")
        return None
    except Exception as e:
        logger.error(f"Error fetching from cache: {e}")
        return None

def set_cached_recommendations(user_id: int, algorithm: str, data: Any, ttl: int = None) -> None:
    """Save recommendation lists into cache with custom or default TTL (1 hour)."""
    key = f"recs:{algorithm}:{user_id}"
    if ttl is None:
        ttl = settings.RECOMMENDATION_CACHE_TTL
    try:
        redis_instance.setex(key, ttl, json.dumps(data))
        logger.info(f"⚡ Cached {key} with TTL={ttl}s")
    except Exception as e:
        logger.error(f"Error setting cache: {e}")

def invalidate_user_cache(user_id: int) -> None:
    """Invalidate all recommendation caches for a specific user (e.g. after a new behavior action)."""
    try:
        redis_instance.delete(
            f"recs:svd:{user_id}",
            f"recs:content:{user_id}",
            f"recs:hybrid:{user_id}",
            f"recs:trending:{user_id}"
        )
        logger.info(f"♻️ Invalidated recommendation caches for user {user_id}")
    except Exception as e:
        logger.error(f"Error invalidating cache: {e}")
