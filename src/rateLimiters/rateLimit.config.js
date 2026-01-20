export const RATE_LIMIT_STRATEGIES = {
  FIXED_WINDOW: "fixed_window",
  SLIDING_WINDOW: "sliding_window",
  TOKEN_BUCKET: "token_bucket",
};

export const rateLimitConfig = {
  strategy: RATE_LIMIT_STRATEGIES.SLIDING_WINDOW,

  global: {
    keyPrefix: "api_global", // <keyPrefix>:<consume-key>
    points: 5000, // number of requests
    duration: 60, // seconds
  },
};
