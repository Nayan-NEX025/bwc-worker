import redis from "../configs/redis.js";
import { RATE_LIMIT_STRATEGIES, rateLimitConfig } from "./rateLimit.config.js";
import { slidingWindowLimiter } from "./strategies/slidingWindow.js";

export const createGlobalRateLimiter = () => {
  const { strategy, global } = rateLimitConfig;

  switch (strategy) {
    // case RATE_LIMIT_STRATEGIES.FIXED_WINDOW:
    //   return fixedWindowLimiter(redis, global);

    case RATE_LIMIT_STRATEGIES.SLIDING_WINDOW:
      return slidingWindowLimiter(redis, global);

    // case RATE_LIMIT_STRATEGIES.TOKEN_BUCKET:
    //   return tokenBucketLimiter(redis, global);

    default:
      throw new Error(`Unknown rate limit strategy: ${strategy}`);
  }
};
