import Redis from "ioredis";
import { REDIS_URL, NODE_ENV } from "./env.js";

const isProd = NODE_ENV === "production";

const redis = new Redis(REDIS_URL, {
  ...(isProd && {
    tls: {}, // ONLY for Upstash / prod
  }),
  maxRetriesPerRequest: null,
});

redis.on("connect", () => {
  console.log("✅ Redis connected");
});

redis.on("error", (err) => {
  console.error("❌ Redis error:", err);
});

redis.on("reconnecting", () => {
  console.warn("🔄 Redis reconnecting...");
});

export default redis;
