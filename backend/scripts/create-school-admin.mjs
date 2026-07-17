import bcrypt from "bcrypt";
import prisma from "../prismaClient.js";
import {
  ensureDefaultSchools
} from "../utils/schools.js";

const [
  schoolCode,
  schoolName,
  adminEmail,
  adminPassword,
  adminName = "School Admin"
] = process.argv.slice(2);

if(
  !schoolCode ||
  !schoolName ||
  !adminEmail ||
  !adminPassword
) {
  console.error(
    "Usage: node scripts/create-school-admin.mjs <school-code> <school-name> <admin-email> <admin-password> [admin-name]"
  );

  process.exit(1);
}

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

console.log(
  JSON.stringify(
    {
      school:{
        code:school.code,
        name:school.name
      },
      admin:{
        email:admin.email,
        name:admin.name,
        role:admin.role
      }
    },
    null,
    2
  )
);

await prisma.$disconnect();
