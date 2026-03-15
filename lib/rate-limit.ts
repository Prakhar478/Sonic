/**
 * Token-bucket rate limiter for API routes.
 * Prevents abuse of our Piped API proxy.
 */

interface RateLimitEntry {
  tokens: number;
  lastRefill: number;
}

class RateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private readonly maxTokens: number;
  private readonly refillRate: number; // tokens per second
  private readonly windowMs: number;

  constructor(maxTokens = 30, refillRate = 2, windowMs = 60_000) {
    this.maxTokens = maxTokens;
    this.refillRate = refillRate;
    this.windowMs = windowMs;

    // Clean up stale entries every minute
    if (typeof setInterval !== 'undefined') {
      setInterval(() => this.prune(), this.windowMs);
    }
  }

  /**
   * Check if a request is allowed for the given identifier (e.g., IP).
   * Returns { allowed: boolean, retryAfter?: number }
   */
  check(identifier: string): { allowed: boolean; retryAfter?: number } {
    const now = Date.now();
    let entry = this.store.get(identifier);

    if (!entry) {
      entry = { tokens: this.maxTokens - 1, lastRefill: now };
      this.store.set(identifier, entry);
      return { allowed: true };
    }

    // Refill tokens based on elapsed time
    const elapsed = (now - entry.lastRefill) / 1000;
    entry.tokens = Math.min(this.maxTokens, entry.tokens + elapsed * this.refillRate);
    entry.lastRefill = now;

    if (entry.tokens >= 1) {
      entry.tokens -= 1;
      return { allowed: true };
    }

    const retryAfter = Math.ceil((1 - entry.tokens) / this.refillRate);
    return { allowed: false, retryAfter };
  }

  private prune(): void {
    const staleThreshold = Date.now() - this.windowMs * 2;
    for (const [key, entry] of this.store) {
      if (entry.lastRefill < staleThreshold) {
        this.store.delete(key);
      }
    }
  }
}

// Default rate limiter for API routes: 30 requests per minute
export const apiRateLimiter = new RateLimiter(30, 2, 60_000);

/**
 * Helper to get client IP from request headers (works behind Vercel proxy).
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return '127.0.0.1';
}
