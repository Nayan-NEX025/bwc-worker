import { RateLimiterRedis } from "rate-limiter-flexible";
import redis from "../configs/redis.js";

// Note: Rate limiting can be change later on based on number of users and traffic
export const globalApiLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: "api_global",
  points: 5000, // allow 5000 requests
  duration: 60, // per 60 seconds (1 minute)
});

export const forgotPasswordLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: "forgot_password",
  points: 5, // 5 requests
  duration: 60 * 15, // per 15 min
});

export const loginLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: "login",
  points: 10, // 10 requests
  duration: 60 * 5, // per 5 min
  blockDuration: 60 * 15, // block for 15 min
});

export const verifyOtpLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: "verify_otp",
  points: 5,
  duration: 60 * 10, // 10 minutes
});

export const testRateLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: "test_rate_limiter",
  points: 2,
  duration: 10,
});

// Login email limiter
// Ip + email -> attacker_ip:abc@a.com
// IP
// global login limiter
