import redis from "../../configs/redis.js";

const getOTPKey = (email) => `otp:${email}`;

export const saveOTP = async (type, email, otp, ttlSeconds = 600) => {
  const key = getOTPKey(email);
  const value = JSON.stringify({ otp, type });
  await redis.set(key, value, "EX", ttlSeconds);
};

export const verifyOTP = async (email, otp) => {
  const key = getOTPKey(email);
  const rawData = await redis.get(key);
  if (!rawData) return null;

  let parsed;
  try {
    parsed = JSON.parse(rawData);
  } catch {
    return null;
  }

  if (parsed.otp !== Number(otp)) {
    return null;
  }

  return parsed; // { otp, type }
};

export const deleteOTP = async (email) => {
  const key = getOTPKey(email);
  await redis.del(key);
};
