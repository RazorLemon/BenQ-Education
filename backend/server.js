import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import {
  requireAuth
} from "./middleware/auth.middleware.js";
import teacherRoutes from "./routes/teacher.routes.js";
import studentRoutes from "./routes/student.routes.js";
import setupRoutes from "./routes/setup.routes.js";
import prisma from "./prismaClient.js";
import {
  corsOptions
} from "./config/cors.js";
import {
  errorHandler,
  notFoundHandler
} from "./middleware/error.middleware.js";
const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use((req,res,next)=>{
  res.set({
    "X-Content-Type-Options":"nosniff",
    "X-Frame-Options":"DENY",
    "Referrer-Policy":"no-referrer",
    "Permissions-Policy":"camera=(), microphone=(), geolocation=()"
  });

  next();
});

app.use(
 cors(corsOptions)
);
app.use(
 express.json({
  limit:"1mb"
 })
);
app.get(
  "/api/profile",
  requireAuth,
  (req, res) => {

    res.json({
      user: req.user
    });

  }
);
app.use("/api/auth", authRoutes);
app.use("/api/admin",adminRoutes);
app.use("/api/teacher",teacherRoutes);
app.use("/api/student",studentRoutes);
app.use("/api/setup",setupRoutes);

app.get("/", (req,res)=>{
   res.send("Smart Classroom API Running");
});

app.get("/api/health", (req,res)=>{
 res.json({
  status:"ok",
  uptime:process.uptime()
 });
});

app.get("/api/ready", async (req,res,next)=>{
 try{
  await prisma.$queryRaw`SELECT 1`;

  res.json({
   status:"ready"
  });
 }catch(error){
  error.statusCode = 503;
  next(error);
 }
});

app.use(notFoundHandler);
app.use(errorHandler);

const server =
 app.listen(env.PORT, ()=>{
   console.log(`Server running on ${env.PORT}`);
 });

const shutdown = async (signal)=>{
 console.log(`${signal} received. Shutting down gracefully.`);

 server.close(async ()=>{
  await prisma.$disconnect();
  process.exit(0);
 });
};

process.on("SIGTERM", ()=>shutdown("SIGTERM"));
process.on("SIGINT", ()=>shutdown("SIGINT"));
