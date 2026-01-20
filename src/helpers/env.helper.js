export const requiredEnv = (key) => {
  if (!process.env[key]) {
    throw new Error(`❌ Missing required environment variable: ${key}`);
  }
  return process.env[key];
};
