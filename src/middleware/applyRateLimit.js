// Each IP can call forgot-password max 5 times in 15 minutes
export const applyRateLimit = (limiter) => async (req, res, next) => {
  try {
    await limiter.consume(req.ip);
    next();
  } catch {
    return res.status(429).json({
      success: false,
      message: "Too many attempts. Try later.",
    });
  }
};
