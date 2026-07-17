import bcrypt from "bcrypt";
import prisma from "../prismaClient.js";
import {
 sendAccountCredentialsEmail
} from "../utils/email.js";

const getSchoolId = (req) =>
 req.user.schoolId;

const getMonthLabel = (date) =>
 new Intl.DateTimeFormat(
  "en",
  {
   month:"short"
  }
 ).format(date);

const getLogTime = (value) =>
 value
 ? new Date(value)
 : new Date(0);

const buildLogSearchText = (log) =>
 [
  log.type,
  log.action,
  log.title,
  log.text,
  log.studentName,
  log.rollNumber,
  log.classSection,
  log.subject,
  log.assignmentTitle,
  log.actorName
 ]
 .filter(Boolean)
 .join(" ")
 .toLowerCase();

const deleteClassesByIds = async ({
 tx,
 classIds,
 schoolId
}) => {
 if(classIds.length === 0){
  return 0;
 }

 const assignments =
  await tx.assignment.findMany({
   where:{
    classId:{
     in:classIds
    },
    class:{
     schoolId
    }
   },
   select:{
    id:true
   }
  });

 const assignmentIds =
  assignments.map(
   assignment=>assignment.id
  );

 if(assignmentIds.length > 0){
  await tx.submission.deleteMany({
   where:{
    assignmentId:{
     in:assignmentIds
    }
   }
  });
 }

 await tx.activityLog.deleteMany({
  where:{
   classId:{
    in:classIds
   },
   schoolId
  }
 });

 await tx.assignment.deleteMany({
  where:{
   classId:{
    in:classIds
   }
  }
 });

 await tx.announcement.deleteMany({
  where:{
   classId:{
    in:classIds
   }
  }
 });

 await tx.enrollment.deleteMany({
  where:{
   classId:{
    in:classIds
   }
  }
 });

 const deleted =
  await tx.class.deleteMany({
   where:{
    id:{
     in:classIds
    },
    schoolId
   }
  });

 return deleted.count;
};

const buildRecentActivity = ({
 users,
 assignments,
 submissions,
 announcements
}) => {
 const activities = [];

 users.forEach((user)=>{
  activities.push({
   id:`user-${user.id}`,
   text:
    user.role === "TEACHER"
    ? `Teacher created: ${user.name}`
    : user.role === "STUDENT"
    ? `Student created: ${user.name}`
    : `Admin created: ${user.name}`,
   createdAt:user.createdAt
  });
 });

 assignments.forEach((assignment)=>{
  activities.push({
   id:`assignment-${assignment.id}`,
   text:`Assignment created: ${assignment.title}`,
   createdAt:assignment.createdAt
  });
 });

 submissions.forEach((submission)=>{
  activities.push({
   id:`submission-${submission.id}`,
   text:
    `${submission.student?.user?.name || "Student"} submitted ${submission.assignment.title}`,
   createdAt:
    submission.submittedAt ||
    submission.createdAt
  });
 });

 announcements.forEach((announcement)=>{
  activities.push({
   id:`announcement-${announcement.id}`,
   text:`Announcement posted: ${announcement.title}`,
   createdAt:announcement.createdAt
  });
 });

 return activities
  .sort(
   (a,b)=>
    new Date(b.createdAt) -
    new Date(a.createdAt)
  )
  .slice(0, 6);
};

const buildActivityLogs = ({
 users = [],
 assignments = [],
 submissions = [],
 announcements = [],
 permissions = [],
 activityLogs = []
}) => {
 const logs = [];
 const auditedSubmissions =
  new Set();

 activityLogs.forEach((activityLog)=>{
  const isSubmitted =
   activityLog.action ===
   "ASSIGNMENT_SUBMITTED";

  const isDeleted =
   activityLog.action ===
   "ASSIGNMENT_DELETED";

  if(
   isSubmitted &&
   activityLog.studentId &&
   activityLog.assignmentId
  ){
   auditedSubmissions.add(
    `${activityLog.studentId}-${activityLog.assignmentId}`
   );
  }

  logs.push({
   id:`activity-${activityLog.id}`,
   type:"submission",
   action:activityLog.action,
   title:
    isDeleted
    ? "Assignment submission deleted"
    : isSubmitted
    ? "Assignment submitted"
    : "Activity recorded",
   text:
    activityLog.message,
   createdAt:
    activityLog.createdAt,
   studentName:
    activityLog.studentName,
   rollNumber:
    activityLog.rollNumber,
   classSection:
    activityLog.classSection,
   subject:
    activityLog.subject,
   assignmentTitle:
    activityLog.assignmentTitle
  });
 });

 users.forEach((user)=>{
  const student =
   user.student;

  const teacher =
   user.teacher;

  logs.push({
   id:`user-${user.id}`,
   type:"account",
   title:
    user.role === "TEACHER"
    ? "Teacher account created"
    : user.role === "STUDENT"
    ? "Student account created"
    : "Admin account created",
   text:
    user.role === "STUDENT"
    ? `${user.name} (${student?.rollNumber || "no roll number"}) was added as a student`
    : user.role === "TEACHER"
    ? `${user.name} (${teacher?.employeeId || "no employee ID"}) was added as a teacher`
    : `${user.name} was added as an admin`,
   createdAt:user.createdAt,
   actorName:user.name,
   studentName:
    user.role === "STUDENT"
    ? user.name
    : undefined,
   rollNumber:
    student?.rollNumber,
   classSection:
    student?.classSection
  });
 });

 assignments.forEach((assignment)=>{
  logs.push({
   id:`assignment-${assignment.id}`,
   type:"assignment",
   title:"Assignment created",
   text:
    `${assignment.title} was created for ${assignment.class?.subject || "Subject"} (${assignment.class?.name || "Class"})`,
   createdAt:assignment.createdAt,
   assignmentTitle:assignment.title,
   subject:
    assignment.class?.subject,
   classSection:
    assignment.class?.name
  });
 });

 submissions.forEach((submission)=>{
  if(
   auditedSubmissions.has(
    `${submission.studentId}-${submission.assignmentId}`
   )
  ){
   return;
  }

  const student =
   submission.student;

  const assignment =
   submission.assignment;

  const classItem =
   assignment?.class;

  logs.push({
   id:`submission-${submission.id}`,
   type:"submission",
   title:"Assignment submitted",
   text:
    `${student?.user?.name || "Student"} submitted ${assignment?.title || "an assignment"} for ${classItem?.subject || "Subject"} (${classItem?.name || "Class"})`,
   createdAt:
    submission.submittedAt ||
    submission.createdAt,
   studentName:
    student?.user?.name,
   rollNumber:
    student?.rollNumber,
   classSection:
    classItem?.name ||
    student?.classSection,
   subject:
    classItem?.subject,
   assignmentTitle:
    assignment?.title
  });
 });

 announcements.forEach((announcement)=>{
  logs.push({
   id:`announcement-${announcement.id}`,
   type:"announcement",
   title:"Announcement posted",
   text:
    `${announcement.title} was posted for ${announcement.class?.subject || "Subject"} (${announcement.class?.name || "Class"})`,
   createdAt:announcement.createdAt,
   subject:
    announcement.class?.subject,
   classSection:
    announcement.class?.name
  });
 });

 permissions.forEach((permission)=>{
  if(
   getLogTime(permission.updatedAt).getTime() ===
   getLogTime(permission.createdAt).getTime()
  ){
   return;
  }

  logs.push({
   id:`permission-${permission.id}`,
   type:"permission",
   title:"Teacher permissions updated",
   text:
    `${permission.teacher?.user?.name || "Teacher"} permissions were updated`,
   createdAt:permission.updatedAt,
   actorName:
    permission.teacher?.user?.name
  });
 });

 return logs.sort(
  (a,b)=>
   getLogTime(b.createdAt) -
   getLogTime(a.createdAt)
 );
};


export const createTeacher =
async (req,res)=>{

 try{

  const {
   name,
   email,
   password,
   employeeId
  } = req.body;

 const existingUser =
   await prisma.user.findFirst({
    where:{
     email,
     schoolId:getSchoolId(req)
    }
   });

  if(existingUser){

   return res.status(400).json({
    message:"Email already exists"
   });

  }

  const hashedPassword =
   await bcrypt.hash(password,10);

  const user =
   await prisma.user.create({

    data:{
      name,
      email,
      passwordHash:hashedPassword,
      role:"TEACHER",
      schoolId:getSchoolId(req)
    }

   });

  const teacher =
   await prisma.teacher.create({

    data:{
      employeeId,
      userId:user.id,
      schoolId:getSchoolId(req)
    }

   });

  const school =
   await prisma.school.findUnique({
    where:{
     id:getSchoolId(req)
    }
   });

  const emailResult =
   await sendAccountCredentialsEmail({
    to:email,
    name,
    role:"TEACHER",
    email,
    password,
    schoolName:school?.name,
    schoolCode:school?.code
   });

  res.status(201).json({
    user,
    teacher,
    emailSent:
     !emailResult.skipped
  });

 }catch(error){

  console.error(error);

  res.status(500).json({
   message:"Server Error"
  });

 }

};

export const createStudent =
async (req,res)=>{

 try{

  const {
   name,
   email,
   password,
   rollNumber,
   classSection
  } = req.body;

 const existingUser =
   await prisma.user.findFirst({
    where:{
     email,
     schoolId:getSchoolId(req)
    }
   });

  if(existingUser){

   return res.status(400).json({
    message:"Email already exists"
   });

  }

  const hashedPassword =
   await bcrypt.hash(password,10);

  const user =
   await prisma.user.create({

    data:{
      name,
      email,
      passwordHash:hashedPassword,
      role:"STUDENT",
      schoolId:getSchoolId(req)
    }

   });

  const student =
   await prisma.student.create({

    data:{
      rollNumber,
      classSection,
      userId:user.id,
      schoolId:getSchoolId(req)
    }

   });

  const school =
   await prisma.school.findUnique({
    where:{
     id:getSchoolId(req)
    }
   });

  const emailResult =
   await sendAccountCredentialsEmail({
    to:email,
    name,
    role:"STUDENT",
    email,
    password,
    schoolName:school?.name,
    schoolCode:school?.code
   });

  res.status(201).json({
    user,
    student,
    emailSent:
     !emailResult.skipped
  });

 }catch(error){

  console.error(error);

  res.status(500).json({
   message:"Server Error"
  });

 }

};


export const createClass = async (req, res) => {

  try {

    const {
      name,
      code,
      subject,
      year,
      teacherId
    } = req.body;

    const existingClass =
      await prisma.class.findFirst({
        where: {
          code,
          schoolId:getSchoolId(req)
        }
      });

    if (existingClass) {

      return res.status(400).json({
        message: "Subject code already exists"
      });

    }

    const teacher =
      await prisma.teacher.findUnique({
        where: {
          id: teacherId,
          schoolId:getSchoolId(req)
        }
      });

    if (!teacher) {

      return res.status(404).json({
        message: "Teacher not found"
      });

    }

    const newClass =
      await prisma.class.create({

        data: {
          name,
          code,
          subject,
          year,
          teacherId,
          schoolId:getSchoolId(req)
        }

      });

    res.status(201).json(newClass);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server Error"
    });

  }

};


export const getClasses = async (req, res) => {

  try {

    const classes =
      await prisma.class.findMany({

        where:{
          schoolId:getSchoolId(req)
        },

        include: {
          teacher: {
            include: {
              user: true
            }
          },
          enrollments: true,
          assignments: true
        }

      });

    res.json(classes);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server Error"
    });

  }

};

export const getDashboard =
async (req,res)=>{

 try{

  const teachers =
   await prisma.teacher.count({
    where:{
     schoolId:getSchoolId(req)
    }
   });

  const students =
   await prisma.student.count({
    where:{
     schoolId:getSchoolId(req)
    }
   });

  const classes =
   await prisma.class.count({
    where:{
     schoolId:getSchoolId(req)
    }
   });

  const assignments =
   await prisma.assignment.count({
    where:{
     class:{
      schoolId:getSchoolId(req)
     }
    }
   });

  const submissions =
   await prisma.submission.count({
    where:{
     assignment:{
      class:{
       schoolId:getSchoolId(req)
      }
     }
    }
   });

  const gradedSubmissions =
   await prisma.submission.findMany({
    where:{
     grade:{
      not:null
     },
     assignment:{
      class:{
       schoolId:getSchoolId(req)
      }
     }
    },
    include:{
     assignment:true
    },
    orderBy:{
     createdAt:"asc"
    }
   });

  const trendMap = {};

  gradedSubmissions.forEach((submission)=>{
   const label =
    getMonthLabel(
     submission.createdAt
    );

   if(!trendMap[label]){
    trendMap[label] = {
     total:0,
     count:0
    };
   }

   trendMap[label].total +=
    submission.grade;

   trendMap[label].count +=
    1;
  });

  const performanceTrend =
   Object.entries(trendMap).map(
    ([month,value])=>({
     month,
     score:Number(
      (
       value.total /
       value.count
      ).toFixed(1)
     )
    })
   );

  const recentUsers =
   await prisma.user.findMany({
    where:{
     schoolId:getSchoolId(req)
    },
    orderBy:{
     createdAt:"desc"
    },
    take:6
   });

  const recentAssignments =
   await prisma.assignment.findMany({
    where:{
     class:{
      schoolId:getSchoolId(req)
     }
    },
    orderBy:{
     createdAt:"desc"
    },
    take:6
   });

  const recentSubmissions =
   await prisma.submission.findMany({
    where:{
     assignment:{
      class:{
       schoolId:getSchoolId(req)
      }
     }
    },
    include:{
     assignment:true,
     student:{
      include:{
       user:true
      }
     }
    },
    orderBy:{
     createdAt:"desc"
    },
    take:6
   });

  const recentAnnouncements =
   await prisma.announcement.findMany({
    where:{
     class:{
      schoolId:getSchoolId(req)
     }
    },
    orderBy:{
     createdAt:"desc"
    },
    take:6
   });

  res.json({
   teachers,
   students,
   classes,
   assignments,
   submissions,
   performanceTrend,
   recentAnnouncements,
   activities:
    buildRecentActivity({
     users:recentUsers,
     assignments:recentAssignments,
     submissions:recentSubmissions,
     announcements:recentAnnouncements
    })
  });

 }catch(error){

  console.error(error);

  res.status(500).json({
   message:"Server Error"
  });

 }

};

export const getStudents =
async (req,res)=>{

 try{

  const students =
   await prisma.student.findMany({

    where:{
     schoolId:getSchoolId(req)
    },

    include:{
      user:true,
      enrollments:{
        include:{
          class:true
        }
      }
    }

   });

  res.json(students);

 }catch(error){

  console.error(error);

  res.status(500).json({
   message:"Server Error"
  });

 }

};

export const getTeachers =
async (req,res)=>{

 try{

  const teachers =
   await prisma.teacher.findMany({

    where:{
     schoolId:getSchoolId(req)
    },

    include:{
      user:true,
      classes:true,
      permissions:true
    }

   });

  res.json(teachers);

 }catch(error){

  console.error(error);

  res.status(500).json({
   message:"Server Error"
  });

 }

};

export const updateTeacher =
async (req,res)=>{

 try{

  const { id } = req.params;

  const {
   name,
   email,
   employeeId
  } = req.body;

  const teacher =
   await prisma.teacher.findUnique({

    where:{
     id,
     schoolId:getSchoolId(req)
    }

   });

  if(!teacher){

   return res.status(404).json({
    message:"Teacher not found"
   });

  }

  await prisma.user.update({

   where:{
    id:teacher.userId
   },

   data:{
    name,
    email
   }

  });

  await prisma.teacher.update({

   where:{ id },

   data:{
    employeeId
   }

  });

  res.json({
   message:"Teacher updated"
  });

 }catch(error){

  console.error(error);

  res.status(500).json({
   message:"Server Error"
  });

 }

};

export const getLogs =
async (req,res)=>{

 try{

  const {
   query = "",
   type = "all"
  } = req.query;

  const schoolId =
   getSchoolId(req);

  const [
   users,
   assignments,
   submissions,
   announcements,
   permissions,
   activityLogs
  ] = await Promise.all([
   prisma.user.findMany({
    where:{
     schoolId
    },
    include:{
     student:true,
     teacher:true
    },
    orderBy:{
     createdAt:"desc"
    },
    take:200
   }),
   prisma.assignment.findMany({
    where:{
     class:{
      schoolId
     }
    },
    include:{
     class:true
    },
    orderBy:{
     createdAt:"desc"
    },
    take:200
   }),
   prisma.submission.findMany({
    where:{
     assignment:{
      class:{
       schoolId
      }
     }
    },
    include:{
     student:{
      include:{
       user:true
      }
     },
     assignment:{
      include:{
       class:true
      }
     }
    },
    orderBy:{
     createdAt:"desc"
    },
    take:200
   }),
   prisma.announcement.findMany({
    where:{
     class:{
      schoolId
     }
    },
    include:{
     class:true
    },
    orderBy:{
     createdAt:"desc"
    },
    take:200
   }),
   prisma.teacherPermission.findMany({
    where:{
     teacher:{
      schoolId
     }
    },
    include:{
     teacher:{
      include:{
       user:true
      }
     }
    },
    orderBy:{
     updatedAt:"desc"
    },
    take:200
   }),
   prisma.activityLog.findMany({
    where:{
     schoolId,
     action:{
      in:[
       "ASSIGNMENT_SUBMITTED",
       "ASSIGNMENT_DELETED"
      ]
     }
    },
    orderBy:{
     createdAt:"desc"
    },
    take:300
   })
  ]);

  const normalizedQuery =
   String(query)
    .trim()
    .toLowerCase();

  const normalizedType =
   String(type)
    .trim()
    .toLowerCase();

  let logs =
   buildActivityLogs({
    users,
    assignments,
    submissions,
    announcements,
    permissions,
    activityLogs
   });

  if(
   normalizedType &&
   normalizedType !== "all"
  ){
   logs =
    logs.filter(
     log=>
      log.type ===
      normalizedType
    );
  }

  if(normalizedQuery){
   logs =
    logs.filter(
     log=>
      buildLogSearchText(log)
       .includes(normalizedQuery)
    );
  }

  res.json(
   logs.slice(0, 150)
  );

 }catch(error){

  console.error(error);

  res.status(500).json({
   message:"Server Error"
  });

 }

};

export const deleteTeacher =
async (req,res)=>{

 try{

  const { id } = req.params;

  const teacher =
   await prisma.teacher.findUnique({

    where:{
     id,
     schoolId:getSchoolId(req)
    },

    include:{
     classes:true
    }

   });

  if(!teacher){

   return res.status(404).json({
    message:"Teacher not found"
   });

  }

  if(teacher.classes.length > 0){

   return res.status(400).json({
    message:
     "Teacher has assigned classes. Reassign or delete classes first."
   });

  }

  await prisma.teacher.delete({

   where:{ id }

  });

  await prisma.user.delete({

   where:{
    id:teacher.userId
   }

  });

  res.json({
   message:"Teacher deleted"
  });

 }catch(error){

  console.error(error);

  res.status(500).json({
   message:"Server Error"
  });

 }

};

export const getAssignments =
async (req,res)=>{

 try{

  const assignments =
   await prisma.assignment.findMany({

    where:{
     class:{
      schoolId:getSchoolId(req)
     }
    },

    include:{
      class:true,
      submissions:true
    }

   });

  res.json(assignments);

 }catch(error){

  console.error(error);

  res.status(500).json({
   message:"Server Error"
  });

 }

};

export const getSubmissionsAdmin =
async (req,res)=>{

 try{

  const submissions =
   await prisma.submission.findMany({

    where:{
     assignment:{
      class:{
       schoolId:getSchoolId(req)
      }
     }
    },

    include:{
      assignment:true,

      student:{
       include:{
        user:true
       }
      }
    }

   });

  res.json(submissions);

 }catch(error){

  console.error(error);

  res.status(500).json({
   message:"Server Error"
  });

 }

};

export const updateClass =
async (req,res)=>{

 try{

  const { id } = req.params;

  const updated =
   await prisma.class.update({

    where:{
     id,
     schoolId:getSchoolId(req)
    },

    data:req.body

   });

  res.json(updated);

 }catch(error){

  console.error(error);

  res.status(500).json({
   message:"Server Error"
  });

 }

};

export const deleteClass =
async (req,res)=>{

 try{

  const { id } = req.params;

  const deletedCount =
   await prisma.$transaction(
    async (tx)=>
     deleteClassesByIds({
      tx,
      classIds:[id],
      schoolId:getSchoolId(req)
     })
   );

  if(deletedCount === 0){
   return res.status(404).json({
    message:"Class not found"
   });
  }

  res.json({
   message:
   "Class deleted"
  });

 }catch(error){

  console.error(error);

  res.status(500).json({
   message:"Server Error"
  });

 }

};

export const getAdminAnalytics =
async (req,res)=>{

 try{

  const {
   teacherId = "all",
   classId = "all",
   subject = "all",
   year = "all",
   studentId = "all"
  } = req.query;

  const schoolId =
   getSchoolId(req);

  const classWhere = {
   schoolId
  };

  if(teacherId !== "all"){
   classWhere.teacherId =
    String(teacherId);
  }

  if(classId !== "all"){
   classWhere.id =
    String(classId);
  }

  if(subject !== "all"){
   classWhere.subject =
    String(subject);
  }

  if(year !== "all"){
   classWhere.year =
    Number(year);
  }

  const selectedClasses =
   await prisma.class.findMany({
    where:classWhere,
    include:{
     teacher:{
      include:{
       user:true
      }
     },
     enrollments:true
    }
   });

  const selectedClassIds =
   selectedClasses.map(
    classItem=>classItem.id
   );

  const submissionWhere = {
   assignment:{
    classId:{
     in:selectedClassIds
    }
   },
   grade:{
    not:null
   }
  };

  if(studentId !== "all"){
   submissionWhere.studentId =
    String(studentId);
  }

  const submissions =
   await prisma.submission.findMany({

    where:submissionWhere,

    include:{
      assignment:{
       include:{
        class:{
         include:{
          teacher:{
           include:{
            user:true
           }
          }
         }
        }
       }
      },
      student:{
       include:{
        user:true
       }
      }
    }

   });

  const [
   allClasses,
   allTeachers,
   allStudents
  ] = await Promise.all([
   prisma.class.findMany({
    where:{
     schoolId
    },
    include:{
     teacher:{
      include:{
       user:true
      }
     }
    }
   }),
   prisma.teacher.findMany({
    where:{
     schoolId
    },
    include:{
     user:true
    }
   }),
   prisma.student.findMany({
    where:{
     schoolId
    },
    include:{
     user:true,
     enrollments:{
      select:{
       classId:true
      }
     }
    }
   })
  ]);

  const overallAverage =

   submissions.length

   ? submissions.reduce(
      (sum,s)=>sum+s.grade,
      0
     ) /
     submissions.length

   : 0;

  const highestGrade =

   submissions.length

   ? Math.max(
      ...submissions.map(
       s=>s.grade
      )
     )

   : 0;

  const lowestGrade =

   submissions.length

   ? Math.min(
      ...submissions.map(
       s=>s.grade
      )
     )

   : 0;

  const classMap = {};

  submissions.forEach(
   submission=>{

    const className =
     `${submission.assignment.class.subject} (${submission.assignment.class.name})`;

    if(!classMap[className]){

     classMap[className]=[];

    }

    classMap[className]
     .push(
      submission.grade
     );

   }
  );

  const classPerformance =

   Object.entries(
    classMap
   ).map(

    ([name,grades])=>({

     className:name,

     average:Number(

      (
       grades.reduce(
        (a,b)=>a+b,
        0
       ) /
       grades.length

      ).toFixed(2)

     )

    })

   );

  const studentMap = {};

  submissions.forEach(
   submission=>{

    const studentName =
     submission.student.user.name;

    if(!studentMap[studentName]){

     studentMap[
      studentName
     ]=[];

    }

    studentMap[
     studentName
    ].push(
     submission.grade
    );

   }
  );

  const studentPerformance =

   Object.entries(
    studentMap
   ).map(

    ([name,grades])=>({

     studentName:name,

     average:Number(

      (
       grades.reduce(
        (a,b)=>a+b,
        0
       ) /
       grades.length

      ).toFixed(2)

     )

    })

   );

  const teacherMap = {};

  submissions.forEach(
   submission=>{
    const teacher =
     submission.assignment
      .class
      .teacher;

    const id =
     teacher?.id ||
     "unassigned";

    if(!teacherMap[id]){
     teacherMap[id] = {
      teacherName:
       teacher?.user?.name ||
       "Unassigned",
      grades:[],
      subjects:new Set()
     };
    }

    teacherMap[id].grades.push(
     submission.grade
    );

    teacherMap[id].subjects.add(
     submission.assignment.classId
    );
   }
  );

  const teacherPerformance =
   Object.entries(teacherMap)
    .map(([id,value])=>({
     id,
     teacherName:value.teacherName,
     average:Number(
      (
       value.grades.reduce(
        (a,b)=>a+b,
        0
       ) / value.grades.length
      ).toFixed(2)
     ),
     submissions:value.grades.length,
     subjects:value.subjects.size
    }))
    .sort(
     (a,b)=>b.average - a.average
    );

  const subjectMap = {};

  submissions.forEach(
   submission=>{
    const key =
     submission.assignment.class.subject;

    if(!subjectMap[key]){
     subjectMap[key] = [];
    }

    subjectMap[key].push(
     submission.grade
    );
   }
  );

  const subjectPerformance =
   Object.entries(subjectMap)
    .map(([name,grades])=>({
     subject:name,
     average:Number(
      (
       grades.reduce(
        (a,b)=>a+b,
        0
       ) / grades.length
      ).toFixed(2)
     ),
     submissions:grades.length
    }))
    .sort(
     (a,b)=>b.average - a.average
    );

  const assignmentMap = {};

  submissions.forEach(
   submission=>{
    const assignment =
     submission.assignment;

    if(!assignmentMap[assignment.id]){
     assignmentMap[assignment.id] = {
      assignment:assignment.title,
      subject:assignment.class.subject,
      classSection:assignment.class.name,
      grades:[]
     };
    }

    assignmentMap[assignment.id].grades.push(
     submission.grade
    );
   }
  );

  const assignmentPerformance =
   Object.values(assignmentMap)
    .map((assignment)=>({
     assignment:assignment.assignment,
     subject:assignment.subject,
     classSection:assignment.classSection,
     average:Number(
      (
       assignment.grades.reduce(
        (a,b)=>a+b,
        0
       ) / assignment.grades.length
      ).toFixed(2)
     ),
     highest:Math.max(...assignment.grades),
     lowest:Math.min(...assignment.grades),
     submissions:assignment.grades.length
    }));

  const filterOptions = {
   sessions:[
    ...new Set(
     allClasses.map(
      classItem=>classItem.year
     )
    )
   ].sort((a,b)=>a-b),
   teachers:
    allTeachers
     .map((teacher)=>({
      id:teacher.id,
      name:teacher.user?.name || "Teacher"
     }))
     .sort(
      (a,b)=>a.name.localeCompare(b.name)
     ),
   classes:
    allClasses
     .map((classItem)=>({
      id:classItem.id,
      label:
       `${classItem.subject} (${classItem.name})`,
      teacherId:classItem.teacherId,
      subject:classItem.subject,
      classSection:classItem.name,
      year:classItem.year
     }))
     .sort(
      (a,b)=>
       a.label.localeCompare(b.label)
     ),
   subjects:[
    ...new Set(
     allClasses.map(
      classItem=>classItem.subject
     )
    )
   ].sort(),
   students:
    allStudents
     .map((student)=>({
      id:student.id,
      name:student.user?.name || "Student",
      rollNumber:student.rollNumber,
      classSection:student.classSection,
      classIds:
       student.enrollments.map(
        enrollment=>enrollment.classId
       )
     }))
     .sort(
      (a,b)=>a.name.localeCompare(b.name)
     )
  };

  res.json({

   overallAverage:
    Number(
     overallAverage.toFixed(2)
    ),

   highestGrade,

   lowestGrade,

   totalSubmissions:
    submissions.length,

   selectedClasses:
    selectedClasses.length,

   filterOptions,

   teacherPerformance,

   subjectPerformance,

   assignmentPerformance,

   classPerformance,

   studentPerformance

  });

 }catch(error){

  console.error(error);

  res.status(500).json({
   message:"Server Error"
  });

 }

};

export const getAdminTrends =
async (req,res)=>{

 try{

  const assignments =
   await prisma.assignment.findMany({

    where:{
     class:{
      schoolId:getSchoolId(req)
     }
    },

    include:{
      submissions:true
    },

    orderBy:{
      createdAt:"asc"
    }

   });

  const trends =

   assignments.map(
    assignment=>{

     const graded =

      assignment.submissions.filter(
       s=>s.grade !== null
      );

     const average =

      graded.length

      ? graded.reduce(
         (sum,s)=>
          sum+s.grade,
         0
        ) /
        graded.length

      : 0;

     return{

      assignment:
       assignment.title,

      average:Number(
       average.toFixed(2)
      )

     };

    }
   );

  res.json(
   trends
  );

 }catch(error){

  console.error(error);

  res.status(500).json({
   message:"Server Error"
  });

 }

};

export const getAnnouncements =
async (req,res)=>{

 try{

  const announcements =
   await prisma.announcement.findMany({

  where:{
    class:{
     schoolId:getSchoolId(req)
    }
  },

  include:{
    class:true
  },

  orderBy:{
    createdAt:"desc"
  }

});

  res.json(
   announcements
  );

 }catch(error){

  console.error(error);

  res.status(500).json({
   message:"Server Error"
  });

 }

};

export const createAnnouncement =
async (req,res)=>{

 try{

  const {
   title,
   content,
   classIds
  } = req.body;

  const announcements =

   await prisma.class.count({

    where:{
     id:{
      in:classIds
     },
     schoolId:getSchoolId(req)
    }

   });

  if(announcements !== classIds.length){

   return res.status(400).json({
    message:"One or more classes are not available for this school"
   });

  }

  const createdAnnouncements =

   await Promise.all(

    classIds.map(
     classId=>

      prisma.announcement.create({

       data:{
        title,
        content,
        classId
       }

      })

    )

   );

  res.status(201).json(
   createdAnnouncements
  );

 }catch(error){

  console.error(error);

  res.status(500).json({
   message:"Server Error"
  });

 }

};

export const getAdminClassDetails =
async (req,res)=>{

 try{

  const { id } = req.params;

  const selectedClass =
   await prisma.class.findUnique({

    where:{
      id,
      schoolId:getSchoolId(req)
    },

    include:{

      teacher:{
       include:{
        user:true
       }
      },

      enrollments:{
       include:{
        student:{
         include:{
          user:true
         }
        }
       }
      },

      assignments:{
       include:{
        submissions:true
       }
      },

      comments:{
       select:{
        id:true
       }
      }

    }

   });

  if(!selectedClass){

   return res.status(404).json({
    message:"Class not found"
   });

  }

  let totalGrades = 0;
  let gradeCount = 0;

  selectedClass.assignments.forEach(
   assignment=>{

    assignment.submissions.forEach(
     submission=>{

      if(
       submission.grade !== null
      ){

       totalGrades +=
        submission.grade;

       gradeCount++;

      }

     }
    );

   }
  );

  const averageGrade =

   gradeCount > 0

   ? (
      totalGrades /
      gradeCount
     ).toFixed(1)

   : 0;

  res.json({

   class:selectedClass,

   studentCount:
    selectedClass
    .enrollments.length,

   assignmentCount:
    selectedClass
    .assignments.length,

   averageGrade

  });

 }catch(error){

  console.error(error);

  res.status(500).json({
   message:"Server Error"
  });

 }

};

  

  

export const getStudentDetails =
async (req,res)=>{

 try{

  const { id } = req.params;

  const student =
   await prisma.student.findUnique({

    where:{
     id,
     schoolId:getSchoolId(req)
    },

    include:{

      user:true,

      enrollments:{
        include:{
          class:true
        }
      }

    }

   });

  if(!student){

   return res.status(404).json({
    message:"Student not found"
   });

  }

  res.json(student);

 }catch(error){

  console.error(error);

  res.status(500).json({
   message:"Server Error"
  });

 }

};

export const updateStudent =
async (req,res)=>{

 try{

  const { id } = req.params;

  const {
   name,
   email,
   rollNumber,
   classSection
  } = req.body;

  const student =
   await prisma.student.findUnique({

    where:{
     id,
     schoolId:getSchoolId(req)
    }

   });

  await prisma.user.update({

    where:{
      id:student.userId
    },

    data:{
      name,
      email
    }

  });

  await prisma.student.update({

    where:{ id },

   data:{
      rollNumber,
      classSection
    }

  });

  res.json({
   message:"Student updated"
  });

 }catch(error){

  console.error(error);

  res.status(500).json({
   message:"Server Error"
  });

 }

};

export const deleteStudent =
async (req,res)=>{

 try{

  const { id } = req.params;

  const student =
   await prisma.student.findUnique({

    where:{
     id,
     schoolId:getSchoolId(req)
    }

   });

  if(!student){

   return res.status(404).json({
    message:"Student not found"
   });

  }

  await prisma.$transaction(async (tx)=>{

   await tx.submission.deleteMany({

    where:{
     studentId:id
    }

   });

   await tx.enrollment.deleteMany({

    where:{
     studentId:id
    }

   });

   await tx.student.delete({

    where:{ id }

   });

   await tx.user.delete({

    where:{
     id:student.userId
    }

   });

  });

  res.json({
   message:"Student deleted"
  });

 }catch(error){

  console.error(error);

  res.status(500).json({
   message:"Server Error"
  });

 }

};

export const enrollStudent =
async (req,res)=>{

 try{

  const { id } = req.params;

  const {
   classId
  } = req.body;

  const existing =
   await prisma.enrollment.findFirst({

    where:{
      studentId:id,
      classId,
      student:{
       schoolId:getSchoolId(req)
      },
      class:{
       schoolId:getSchoolId(req)
      }
    }

   });

  if(existing){

   return res.status(400).json({
    message:"Already enrolled"
   });

  }

  const student =
   await prisma.student.findFirst({
    where:{
     id,
     schoolId:getSchoolId(req)
    }
   });

  const selectedClass =
   await prisma.class.findFirst({
    where:{
     id:classId,
     schoolId:getSchoolId(req)
    }
   });

  if(!student || !selectedClass){

   return res.status(400).json({
    message:"Student or subject is not available for this school"
   });

  }

  await prisma.enrollment.create({

    data:{
      studentId:id,
      classId
    }

  });

  res.json({
   message:"Student enrolled"
  });

 }catch(error){

  console.error(error);

  res.status(500).json({
   message:"Server Error"
  });

 }

};

export const getAvailableStudentsForClass =
async (req,res)=>{

 try{

  const { id } = req.params;

  const enrollments =
   await prisma.enrollment.findMany({

   where:{
      classId:id,
      class:{
       schoolId:getSchoolId(req)
      }
    }

   });

  const enrolledIds =
   enrollments.map(
    enrollment=>
      enrollment.studentId
   );

  const students =
   await prisma.student.findMany({

    where:{
      id:{
        notIn:
          enrolledIds
      },
      schoolId:getSchoolId(req)
    },

    include:{
      user:true
    }

   });

  res.json(
   students
  );

 }catch(error){

  console.error(error);

  res.status(500).json({
   message:"Server Error"
  });

 }

};

export const enrollStudentInClass =
async (req,res)=>{

 try{

  const { id } = req.params;

  const {
   studentId
  } = req.body;

  const existing =
   await prisma.enrollment.findFirst({

    where:{
      classId:id,
      studentId,
      class:{
       schoolId:getSchoolId(req)
      },
      student:{
       schoolId:getSchoolId(req)
      }
    }

   });

  if(existing){

   return res.status(400).json({
    message:"Already enrolled"
   });

  }

  const selectedClass =
   await prisma.class.findFirst({
    where:{
     id,
     schoolId:getSchoolId(req)
    }
   });

  const student =
   await prisma.student.findFirst({
    where:{
     id:studentId,
     schoolId:getSchoolId(req)
    }
   });

  if(!student || !selectedClass){

   return res.status(400).json({
    message:"Student or subject is not available for this school"
   });

  }

  await prisma.enrollment.create({

    data:{
      classId:id,
      studentId
    }

  });

  res.json({
   message:"Enrolled"
  });

 }catch(error){

  console.error(error);

  res.status(500).json({
   message:"Server Error"
  });

 }

};

export const removeStudentFromClass =
async (req,res)=>{

 try{

  const {
   studentId,
   classId
  } = req.params;

  await prisma.enrollment.deleteMany({

   where:{
    studentId,
    classId,
    student:{
     schoolId:getSchoolId(req)
    },
    class:{
     schoolId:getSchoolId(req)
    }
   }

  });

  res.json({
   message:"Student removed"
  });

 }catch(error){

  console.error(error);

  res.status(500).json({
   message:"Server Error"
  });

 }

};

export const resetStudentPassword =
async (req,res)=>{

 try{

  const { id } =
   req.params;

  const {
   newPassword
  } = req.body;

  const student =
   await prisma.student.findUnique({

   where:{
     id,
     schoolId:getSchoolId(req)
    },

    include:{
     user:true
    }

   });

  if(!student){

   return res.status(404).json({

    message:
     "Student not found"

   });

  }

  const hashedPassword =

   await bcrypt.hash(
    newPassword,
    10
   );

  await prisma.user.update({

   where:{
    id:
     student.userId
   },

   data:{
    passwordHash:
     hashedPassword
   }

  });

  res.json({

   message:
    "Password reset successfully"

  });

 }catch(error){

  console.error(error);

  res.status(500).json({

   message:
    "Server Error"

  });

 }

};

export const resetTeacherPassword =
async (req,res)=>{

 try{

  const { id } =
   req.params;

  const {
   newPassword
  } = req.body;

  const teacher =
   await prisma.teacher.findUnique({

   where:{
     id,
     schoolId:getSchoolId(req)
    },

    include:{
     user:true
    }

   });

  if(!teacher){

   return res.status(404).json({

    message:
     "Teacher not found"

   });

  }

  const hashedPassword =

   await bcrypt.hash(
    newPassword,
    10
   );

  await prisma.user.update({

   where:{
    id:
     teacher.userId
   },

   data:{
    passwordHash:
     hashedPassword
   }

  });

  res.json({

   message:
    "Password reset successfully"

  });

 }catch(error){

  console.error(error);

  res.status(500).json({

   message:
    "Server Error"

  });

 }

};

export const getTeacherPermissions =
async (req,res)=>{

 try{

  const teachers =
   await prisma.teacher.findMany({

    where:{
     schoolId:getSchoolId(req)
    },

    include:{
     user:true,
     permissions:true
    },

    orderBy:{
     user:{
      name:"asc"
     }
    }

   });

  res.json(
   teachers.map((teacher)=>({
    id:teacher.id,
    employeeId:teacher.employeeId,
    user:teacher.user,
    permissions:{
     canCreateStudents:
      teacher.permissions
      ?.canCreateStudents || false,
     canCreateClasses:
      teacher.permissions
      ?.canCreateClasses || false,
     canEnrollStudents:
      teacher.permissions
      ?.canEnrollStudents || false,
     canManageCalendar:
      teacher.permissions
      ?.canManageCalendar || false
    }
   }))
  );

 }catch(error){

  console.error(error);

  res.status(500).json({
   message:"Server Error"
  });

 }

};

export const bulkDeleteClasses =
async (req,res)=>{

 try{

  const {
   classIds
  } = req.body;

  if(
   !Array.isArray(classIds) ||
   classIds.length === 0
  ){
   return res.status(400).json({
    message:"Select at least one class to delete"
   });
  }

  const uniqueClassIds =
   [
    ...new Set(classIds)
   ];

  const availableClasses =
   await prisma.class.findMany({
    where:{
     id:{
      in:uniqueClassIds
     },
     schoolId:getSchoolId(req)
    },
    select:{
     id:true
    }
   });

  const availableClassIds =
   availableClasses.map(
    classItem=>classItem.id
   );

  if(availableClassIds.length === 0){
   return res.status(404).json({
    message:"No matching classes found"
   });
  }

  const deletedCount =
   await prisma.$transaction(
    async (tx)=>
     deleteClassesByIds({
      tx,
      classIds:availableClassIds,
      schoolId:getSchoolId(req)
     })
   );

  res.json({
   message:
    `${deletedCount} class${deletedCount === 1 ? "" : "es"} deleted`,
   deletedCount
  });

 }catch(error){

  console.error(error);

  res.status(500).json({
   message:"Server Error"
  });

 }

};

export const updateTeacherPermissions =
async (req,res)=>{

 try{

  const { id } =
   req.params;

  const {
   canCreateStudents,
   canCreateClasses,
   canEnrollStudents,
   canManageCalendar
  } = req.body;

  const teacher =
   await prisma.teacher.findFirst({
    where:{
     id,
     schoolId:getSchoolId(req)
    }
   });

  if(!teacher){
   return res.status(404).json({
    message:"Teacher not found"
   });
  }

  const permissions =
   await prisma.teacherPermission.upsert({
    where:{
     teacherId:id
    },
    update:{
     canCreateStudents,
     canCreateClasses,
     canEnrollStudents,
     canManageCalendar
    },
    create:{
     teacherId:id,
     canCreateStudents,
     canCreateClasses,
     canEnrollStudents,
     canManageCalendar
    }
   });

  res.json(permissions);

 }catch(error){

  console.error(error);

  res.status(500).json({
   message:"Server Error"
  });

 }

};
