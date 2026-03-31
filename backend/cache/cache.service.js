const redis = require("../configs/redis");

/**
 *
 * @param {string} key
 * @returns redis key object
 * @returns null
 */
const getCache = async (key) => {
  if (!key || typeof key != "string") return null;
  try {
    const cached = await redis.get(key);
    if (!cached) throw new Error(`key does not exist`);
    return cached;
  } catch (err) {
    console.error(`[Redis]: [${key}]`, err);
    return null;
  }
};

/**
 *
 * @param {string} key
 * @param {number} ttl
 * @param {object} value
 * @returns boolean
 */

const setCache = async (key, ttl, value) => {
  if (!key || typeof key != "string" || !value) return null;

  try {
    const isSet = await redis.setEx(
      key,
      Number(ttl || process.env.TTL),
      JSON.stringify(value),
    );
    return isSet === "OK";
  } catch (err) {
    console.error(`[Redis]: ${err}`);
    return null;
  }
};

/**
 *
 * @param {String} key
 * @returns boolean
 */

const deleteCached = async (key) => {
  if (!key || typeof key != "string") throw new Error(`${key} is invalid`);

  try {
    const isDeleted = await redis.del(key);
    if (isDeleted < 1) throw new Error("Failed to delete the stored cache");

    return true;
  } catch (err) {
    console.error(`[Redis]: ${err}`);
    return null;
  }
};
