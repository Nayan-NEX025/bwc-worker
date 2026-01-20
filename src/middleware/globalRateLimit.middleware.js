import { createGlobalRateLimiter } from "../rateLimiters/index.js";

const globalApiLimiter = createGlobalRateLimiter();

export const globalRateLimitMiddleware = async (req, res, next) => {
  try {
    const rateLimitRes = await globalApiLimiter.consume("all"); // fixed key
    res.set({
      "X-RateLimit-Limit": globalApiLimiter.points, // TOTAL
      "X-RateLimit-Remaining": rateLimitRes.remainingPoints, // LEFT
      "X-RateLimit-Reset": Math.ceil(
        (Date.now() + rateLimitRes.msBeforeNext) / 1000 // Requests will be allowed again at this time.
      ),
    });
    next();
  } catch (rateLimitRes) {
    res.set({
      "Retry-After": Math.ceil(rateLimitRes.msBeforeNext / 1000), // Retry after seconds
      "X-RateLimit-Limit": globalApiLimiter.points,
      "X-RateLimit-Remaining": 0,
    });
    return res.status(429).json({
      success: false,
      message: "Too many requests. Please try again later.",
    });
  }
};

// {
//   remainingPoints: 0,
//   msBeforeNext: 51129,
//   consumedPoints: 2,
//   isFirstInDuration: false
// }
