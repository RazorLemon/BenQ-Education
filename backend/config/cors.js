import { env } from "./env.js";

export const corsOptions = {
 origin(origin, callback){
  const allowedOrigins =
   env.CLIENT_ORIGINS;

  if(
   !origin ||
   allowedOrigins.includes(origin)
  ){
   return callback(null, true);
  }

  const error =
   new Error(
    "Not allowed by CORS"
   );

  error.statusCode = 403;

  callback(error);
 }
};
