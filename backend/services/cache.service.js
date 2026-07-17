import { createClient } from "redis";
import { env } from "../config/env.js";

const CACHE_RETRY_DELAY_MS = 30000;

let redisClient = null;
let connectPromise = null;
let unavailableUntil = 0;

const isCacheEnabled = () =>
  env.CACHE_ENABLED !== false;

const getRedisClient = async () => {
  if(!isCacheEnabled()) {
    return null;
  }

  if(redisClient?.isOpen) {
    return redisClient;
  }

  if(Date.now() < unavailableUntil) {
    return null;
  }

  if(!redisClient) {
    redisClient = createClient({
      url: env.REDIS_URL,
      socket: {
        connectTimeout: 1000
      }
    });

    redisClient.on(
      "error",
      (error) => {
        unavailableUntil =
          Date.now() + CACHE_RETRY_DELAY_MS;

        console.warn(
          "Redis cache unavailable:",
          error.message
        );
      }
    );
  }

  if(!connectPromise) {
    connectPromise =
      redisClient
        .connect()
        .catch((error) => {
          unavailableUntil =
            Date.now() + CACHE_RETRY_DELAY_MS;

          console.warn(
            "Redis cache connection failed:",
            error.message
          );

          redisClient = null;

          return null;
        })
        .finally(() => {
          connectPromise = null;
        });
  }

  await connectPromise;

  return redisClient?.isOpen
    ? redisClient
    : null;
};

export const getCacheValue = async (key) => {
  const client =
    await getRedisClient();

  if(!client) {
    return {
      hit: false
    };
  }

  const cachedValue =
    await client.get(key);

  if(cachedValue === null) {
    return {
      hit: false
    };
  }

  return {
    hit: true,
    value: JSON.parse(cachedValue)
  };
};

export const setCacheValue = async (
  key,
  value,
  ttlSeconds
) => {
  const client =
    await getRedisClient();

  if(!client) {
    return;
  }

  await client.set(
    key,
    JSON.stringify(value),
    {
      EX: ttlSeconds
    }
  );
};

export const deleteCachePattern = async (pattern) => {
  const client =
    await getRedisClient();

  if(!client) {
    return;
  }

  const keys = [];

  for await (const scanResult of client.scanIterator({
    MATCH: pattern,
    COUNT: 100
  })) {
    const foundKeys =
      Array.isArray(scanResult)
        ? scanResult
        : [scanResult];

    keys.push(
      ...foundKeys
    );

    if(keys.length >= 100) {
      await client.del(keys.splice(0));
    }
  }

  if(keys.length > 0) {
    await client.del(keys);
  }
};

export const invalidateSchoolCache = async (schoolId) => {
  if(!schoolId) {
    return;
  }

  await deleteCachePattern(
    `cache:${schoolId}:*`
  );
};
