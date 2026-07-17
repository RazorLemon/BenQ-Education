export const notFoundHandler = (
 req,
 res
) => {

 res.status(404).json({
  message:"Route not found",
  path:req.originalUrl
 });

};

export const errorHandler = (
 error,
 req,
 res,
 next
) => {

 if(res.headersSent){
  return next(error);
 }

 const statusCode =
  error.statusCode ||
  error.status ||
  500;

 const response = {
  message:
   statusCode >= 500
   ? "Server Error"
   : error.message
 };

 if(
  process.env.NODE_ENV !==
  "production"
 ){
  response.error =
   error.message;
 }

 console.error(error);

 res.status(statusCode).json(
  response
 );

};
