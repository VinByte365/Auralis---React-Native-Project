const { createClient } = require("redis");

async function initRedis() {
  const redisClient = createClient({
    url: `redis://localhost:6379`,
  });

  redisClient.on("error", (err) => {
    console.error("Redis error:", err);
  });

  await redisClient.connect();
  console.log("[Redis] connected successfully!");
}

module.exports = initRedis