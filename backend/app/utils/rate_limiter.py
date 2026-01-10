import time
from cachetools import TTLCache
from typing import Optional, Dict

class TOTPRateLimiter:
   
    def __init__(self, max_attempts: int = 5, lock_duration_seconds: int = 300):
       
        self.max_attempts = max_attempts
        self.lock_duration_seconds = lock_duration_seconds

        # failure_counts: Stores how many times a key has failed.
        # Maxsize limits memory usage, TTL ensures cache doesn't grow indefinitely.
        self.failure_counts: TTLCache = TTLCache(
            maxsize = 1000,
            ttl = lock_duration_seconds
        )

        # blocks: Stores the timestamp when a block will expire for a key.
        self.blocks: TTLCache = TTLCache(
            maxsize = 1000,
            ttl = lock_duration_seconds
        )

    def _get_key(self, ip: str, slug: str) -> str:
        
        return f"{ip}:{slug}"

    def is_blocked(self, ip: str, slug: str) -> Optional[int]:
        
        key = self._get_key(ip, slug)
        block_expiry = self.blocks.get(key)
        
        if block_expiry:
            remaining = int(block_expiry - time.time())

            if remaining > 0:
                # Still blocked, return the countdown
                return remaining
            else:
                # Block has expired naturally but exists in cache, clean it up
                self.blocks.pop(key, None)
                self.failure_counts.pop(key, None)
                return None
        
        return None

    def record_failure(self, ip: str, slug: str):
       
        key = self._get_key(ip, slug)
        count = self.failure_counts.get(key, 0) + 1
        self.failure_counts[key] = count
        
        # If we reached the limit, set the block expiry timestamp
        if count >= self.max_attempts:
            self.blocks[key] = time.time() + self.lock_duration_seconds

    def reset_attempts(self, ip: str, slug: str):
        
        key = self._get_key(ip, slug)
        self.failure_counts.pop(key, None)
        self.blocks.pop(key, None)

# Global instance of the rate limiter
totp_rate_limiter = TOTPRateLimiter()