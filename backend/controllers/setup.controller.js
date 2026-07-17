import bcrypt from "bcrypt";
import {
  timingSafeEqual
} from "crypto";
import { env } from "../config/env.js";
import prisma from "../prismaClient.js";
import {
  ensureDefaultSchools
} from "../utils/schools.js";

const getSetupSecret = (req) =>
  req.headers["x-setup-secret"] ||
  req.body?.setupSecret ||
  "";

const secretMatches = (
  provided,
  expected
) => {
  const providedBuffer =
    Buffer.from(String(provided));

  const expectedBuffer =
    Buffer.from(String(expected));

  if(
    providedBuffer.length !==
    expectedBuffer.length
  ){
    return false;
  }

  return timingSafeEqual(
    providedBuffer,
    expectedBuffer
  );
};

const toSetupResponse = (
  school,
  admin
) => ({
  school:{
    id:school.id,
    code:school.code,
    name:school.name
  },
  admin:{
    id:admin.id,
    name:admin.name,
    email:admin.email,
    role:admin.role
  }
});

export const createSchoolAdmin =
async (req,res)=> {

  try{

    if(!env.SCHOOL_SETUP_SECRET){
      return res.status(503).json({
        message:"School setup is not configured"
      });
    }

    if(
      !secretMatches(
        getSetupSecret(req),
        env.SCHOOL_SETUP_SECRET
      )
    ){
      return res.status(401).json({
        message:"Invalid setup password"
      });
    }

    const {
      schoolName,
      schoolCode,
      adminName,
      adminEmail,
      adminPassword
    } = req.body;

    await ensureDefaultSchools();

    const school =
      await prisma.school.upsert({
        where:{
          code:schoolCode
        },
        update:{
          name:schoolName
        },
        create:{
          code:schoolCode,
          name:schoolName
        }
      });

    const passwordHash =
      await bcrypt.hash(
        adminPassword,
        10
      );

    const existingAdmin =
      await prisma.user.findFirst({
        where:{
          schoolId:school.id,
          email:adminEmail
        }
      });

    const admin =
      existingAdmin
        ? await prisma.user.update({
          where:{
            id:existingAdmin.id
          },
          data:{
            name:adminName,
            passwordHash,
            role:"ADMIN",
            schoolId:school.id
          }
        })
        : await prisma.user.create({
          data:{
            name:adminName,
            email:adminEmail,
            passwordHash,
            role:"ADMIN",
            schoolId:school.id
          }
        });

    res.status(
      existingAdmin ? 200 : 201
    ).json(
      toSetupResponse(
        school,
        admin
      )
    );

  }catch(error){

    console.error(error);

    if(error.code === "P2002"){
      return res.status(409).json({
        message:"A school or admin with these details already exists"
      });
    }

    res.status(500).json({
      message:"School setup failed"
    });

  }

};
