import {
  getCacheValue,
  setCacheValue
} from "../services/cache.service.js";
import {
  getDefaultSettings,
  getSchoolSettings
} from "../services/settings.service.js";

const createCacheKey = (
  req,
  namespace
) => [
  "cache",
  req.user?.schoolId || "global",
  req.user?.role || "public",
  req.user?.id || "anonymous",
  namespace,
  req.originalUrl
].join(":");

export const cacheResponse = ({
  namespace = "api",
  ttl
} = {}) => async (
  req,
  res,
  next
) => {
  if(req.method !== "GET") {
    return next();
  }

  let settings =
    getDefaultSettings();

  if(req.user?.schoolId) {
    try {
      settings =
        await getSchoolSettings(
          req.user.schoolId
        );
    } catch(error) {
      console.warn(
        "School cache settings unavailable:",
        error.message
      );
    }
  }

  if(!settings.cacheEnabled) {
    return next();
  }

  const ttlSeconds =
    ttl || settings.cacheTtlSeconds;

  const cacheKey =
    createCacheKey(
      req,
      namespace
    );

  try {
    const cached =
      await getCacheValue(cacheKey);

    if(cached.hit) {
      res.set(
        "X-Cache",
        "HIT"
      );

      return res.status(200).json(
        cached.value
      );
    }
  } catch(error) {
    console.warn(
      "Redis cache read skipped:",
      error.message
    );
  }

  const originalJson =
    res.json.bind(res);

  res.json = (body) => {
    if(
      res.statusCode >= 200 &&
      res.statusCode < 300
    ) {
      res.set(
        "X-Cache",
        "MISS"
      );

      setCacheValue(
        cacheKey,
        body,
        ttlSeconds
      ).catch((error) => {
        console.warn(
          "Redis cache write skipped:",
          error.message
        );
      });
    }

    return originalJson(body);
  };

  return next();
};
