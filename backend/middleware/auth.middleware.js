import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import {
  invalidateSchoolCache
} from "../services/cache.service.js";

const verifyToken = (token) =>
 jwt.verify(
  token,
  env.JWT_SECRET
 );

export const requireAuth = (
  req,
  res,
  next
) => {

  const authHeader =
    req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "Token missing"
    });
  }

  const token =
    authHeader.split(" ")[1];

  try {

    const decoded =
      verifyToken(token);

    if(!decoded.schoolId){
      return res.status(401).json({
        message:"Please log in again and select your school"
      });
    }

    req.user = decoded;

    if(req.method !== "GET") {
      res.on(
        "finish",
        () => {
          if(
            res.statusCode >= 200 &&
            res.statusCode < 400
          ) {
            invalidateSchoolCache(
              decoded.schoolId
            ).catch((error) => {
              console.warn(
                "Redis cache invalidation skipped:",
                error.message
              );
            });
          }
        }
      );
    }

    next();

  } catch {

    return res.status(401).json({
      message: "Invalid token"
    });
  }
};

export const optionalAuth = (
 req,
 res,
 next
) => {

 const authHeader =
  req.headers.authorization;

 if(!authHeader){
  return next();
 }

 const token =
  authHeader.split(" ")[1];

 try{

  req.user =
   verifyToken(token);

  if(!req.user.schoolId){
   return res.status(401).json({
    message:"Please log in again and select your school"
   });
  }

  next();

 }catch{

  return res.status(401).json({
   message:"Invalid token"
  });

 }

};
