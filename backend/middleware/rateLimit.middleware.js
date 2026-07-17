const buckets =
 new Map();

const getClientKey = (req) =>
 req.ip ||
 req.headers["x-forwarded-for"] ||
 req.socket?.remoteAddress ||
 "unknown";

const cleanupBucket = (
 key,
 now
) => {
 const bucket =
  buckets.get(key);

 if(
  bucket &&
  bucket.resetAt <= now
 ){
  buckets.delete(key);
 }
};

export const createRateLimiter = ({
 windowMs,
 maxRequests,
 message
}) => {

 return (req,res,next) => {

  const now =
   Date.now();

  const key =
   `${req.originalUrl}:${getClientKey(req)}`;

  cleanupBucket(
   key,
   now
  );

  const existing =
   buckets.get(key);

  if(!existing){

   buckets.set(key,{
    count:1,
    resetAt:
     now + windowMs
   });

   return next();

  }

  if(
   existing.count >= maxRequests
  ){

   const retryAfterSeconds =
    Math.ceil(
     (
      existing.resetAt -
      now
     ) / 1000
    );

   res.set(
    "Retry-After",
    String(
     retryAfterSeconds
    )
   );

   return res.status(429).json({
    message,
    retryAfterSeconds
   });

  }

  existing.count += 1;

  next();

 };

};

export const loginRateLimiter =
 createRateLimiter({
  windowMs:
   15 * 60 * 1000,
  maxRequests:5,
  message:
   "Too many login attempts. Please try again later."
 });

export const passwordChangeRateLimiter =
 createRateLimiter({
  windowMs:
   15 * 60 * 1000,
  maxRequests:5,
  message:
   "Too many password change attempts. Please try again later."
 });
