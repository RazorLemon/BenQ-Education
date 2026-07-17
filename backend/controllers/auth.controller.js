import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import prisma from "../prismaClient.js";
import {
  ensureDefaultSchools,
  getSchoolByCode
} from "../utils/schools.js";

const toSafeUser = (user) => ({
 id:user.id,
 name:user.name,
 email:user.email,
 role:user.role,
 school:user.school
  ? {
    id:user.school.id,
    code:user.school.code,
    name:user.school.name
   }
  : null,
 createdAt:user.createdAt
});

export const listSchools =
async (req,res)=>{

 try{

  await ensureDefaultSchools();

  const schools =
   await prisma.school.findMany({
    orderBy:{
     createdAt:"asc"
    }
   });

  res.json(
   schools.map((school)=>({
    id:school.id,
    code:school.code,
    name:school.name
   }))
  );

 }catch(error){

  console.error(error);

  res.status(500).json({
   message:"Server Error"
  });

 }

};

export const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      schoolCode = "school-1"
    } = req.body;

    if(!name || !email || !password){

      return res.status(400).json({
        message: "Name, email, and password are required"
      });

    }

    const schools =
      await ensureDefaultSchools();

    const school =
      await getSchoolByCode(schoolCode) ||
      schools[0];

    const userCount =
      await prisma.user.count({
        where:{
          schoolId:school.id
        }
      });

    const isBootstrap =
      userCount === 0;

    if(
      isBootstrap &&
      env.NODE_ENV === "production"
    ){

      return res.status(403).json({
        message:
          "Use the school setup page to create the first admin"
      });

    }

    if(
      !isBootstrap &&
      req.user?.role !== "ADMIN"
    ){

      return res.status(403).json({
        message: "Admin only"
      });

    }

    const requestedRole =
      role || "ADMIN";

    if(requestedRole !== "ADMIN"){

      return res.status(400).json({
        message:
          "Use admin teacher/student endpoints for classroom users"
      });

    }

    const existingUser =
      await prisma.user.findFirst({
        where: {
          email,
          schoolId:school.id
        }
      });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists"
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const user =
      await prisma.user.create({
        data: {
          name,
          email,
          passwordHash: hashedPassword,
          role: "ADMIN",
          schoolId:school.id
        },
        include:{
          school:true
        }
      });

    res.status(201).json({
      message:
        isBootstrap
        ? "Admin account created"
        : "Admin user created",
      user:
        toSafeUser(user)
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error"
    });
  }
};

export const login = async (req, res) => {
  try {

    const {
      email,
      password,
      schoolCode
    } = req.body;

    await ensureDefaultSchools();

    const school =
      await getSchoolByCode(schoolCode);

    if(!school){
      return res.status(400).json({
        message:"Select a valid school"
      });
    }

    const user =
      await prisma.user.findFirst({
        where: {
          email,
          schoolId:school.id
        },
        include:{
          school:true
        }
      });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const validPassword =
      await bcrypt.compare(
        password,
        user.passwordHash
      );

    if (!validPassword) {
      return res.status(401).json({
        message: "Invalid credentials"
      });
    }

    const token =
      jwt.sign(
        {
          id: user.id,
          role: user.role,
          schoolId: user.schoolId,
          schoolCode: user.school?.code
        },
        env.JWT_SECRET,
        {
          expiresIn: "1d"
        }
      );

    res.json({
      token,
      user:
        toSafeUser(user)
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server Error"
    });
  }
};

export const changePassword =
async (req,res)=>{

 try{

  const userId =
   req.user.id;

  const {
   currentPassword,
   newPassword
  } = req.body;

  const user =
   await prisma.user.findUnique({

    where:{
     id:userId
    }

   });

  const validPassword =
   await bcrypt.compare(

    currentPassword,

    user.passwordHash

   );

  if(!validPassword){

   return res.status(400).json({

    message:
     "Current password is incorrect"

   });

  }

  const hashedPassword =
   await bcrypt.hash(
    newPassword,
    10
   );

  await prisma.user.update({

   where:{
    id:userId
   },

   data:{
    passwordHash:
     hashedPassword
   }

  });

  res.json({

   message:
    "Password updated successfully"

  });

 }catch(error){

  console.error(error);

  res.status(500).json({

   message:
    "Server Error"

  });

 }

};
