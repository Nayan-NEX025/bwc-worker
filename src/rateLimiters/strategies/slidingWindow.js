import { RateLimiterRedis } from "rate-limiter-flexible";

// Sliding-window-like (evenly distributed)
export const slidingWindowLimiter = (redis, config) =>
  new RateLimiterRedis({
    storeClient: redis,
    keyPrefix: config.keyPrefix,
    points: config.points,
    duration: config.duration,
    execEvenly: true, // Does not reject req , it delays them evenly || minDelayBetweenRequests = duration / points
  });

// 60 seconds / 5000 requests
// = 0.012 seconds
// = 12 milliseconds Each client is allowed ~1 request every 12 ms
