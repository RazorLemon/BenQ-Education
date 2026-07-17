import prisma from "../prismaClient.js";

export const DEFAULT_SCHOOLS = [
  {
    code:"school-1",
    name:"School 1"
  },
  {
    code:"school-2",
    name:"School 2"
  },
  {
    code:"school-3",
    name:"School 3"
  }
];

export const ensureDefaultSchools = async () => {
  const schools =
    await Promise.all(
      DEFAULT_SCHOOLS.map((school)=>
        prisma.school.upsert({
          where:{
            code:school.code
          },
          update:{
            name:school.name
          },
          create:school
        })
      )
    );

  const primarySchool =
    schools[0];

  await prisma.user.updateMany({
    where:{
      schoolId:null
    },
    data:{
      schoolId:primarySchool.id
    }
  });

  await prisma.teacher.updateMany({
    where:{
      schoolId:null
    },
    data:{
      schoolId:primarySchool.id
    }
  });

  await prisma.student.updateMany({
    where:{
      schoolId:null
    },
    data:{
      schoolId:primarySchool.id
    }
  });

  await prisma.class.updateMany({
    where:{
      schoolId:null
    },
    data:{
      schoolId:primarySchool.id
    }
  });

  return schools;
};

export const getSchoolByCode = async (code) =>
  prisma.school.findUnique({
    where:{
      code
    }
  });
