import prisma from "../prismaClient.js";
import {
 getSchoolSettings
} from "../services/settings.service.js";

const getSchoolId = (req) =>
 req.user.schoolId;

const calendarEventInclude = {
 classes:{
  include:{
   class:true
  }
 }
};

const formatClassLabel = (classItem) =>
 classItem
 ? `${classItem.subject} (${classItem.name})`
 : "";

const toCalendarEvent = (event) => ({
 id:event.id,
 title:event.title,
 description:event.description,
 startDate:event.startDate,
 endDate:event.endDate,
 eventType:event.eventType,
 scope:event.scope,
 source:"calendar",
 classIds:
  event.classes?.map(
   item=>item.classId
  ) || [],
 classes:
  event.classes?.map(
   item=>item.class
  ) || []
});

const toAssignmentEvent = (assignment) => ({
 id:`assignment-${assignment.id}`,
 assignmentId:assignment.id,
 title:`${assignment.title} Due`,
 description:assignment.description,
 startDate:assignment.dueDate,
 endDate:assignment.dueDate,
 eventType:"ASSIGNMENT",
 scope:"CLASS",
 source:"assignment",
 classIds:[
  assignment.classId
 ],
 classes:[
  assignment.class
 ],
 classLabel:
  formatClassLabel(assignment.class)
});

const sortEvents = (events) =>
 events.sort(
  (a,b)=>
   new Date(a.startDate) -
   new Date(b.startDate)
 );

const getClassOptions = async (where) =>
 prisma.class.findMany({
  where,
  include:{
   teacher:{
    include:{
     user:true
    }
   }
  },
  orderBy:[
   {
    year:"asc"
   },
   {
    name:"asc"
   },
   {
    subject:"asc"
   }
  ]
 });

const createEvent = async ({
 body,
 schoolId,
 createdBy,
 allowedClassWhere
}) => {
 const {
  title,
  description,
  startDate,
  endDate,
  eventType,
  scope,
  classIds = []
 } = body;

 const uniqueClassIds =
  [
   ...new Set(classIds)
  ];

 if(
  scope === "CLASS" &&
  uniqueClassIds.length === 0
 ){
  const error =
   new Error(
    "Select at least one class for a class-scoped calendar item"
   );
  error.statusCode = 400;
  throw error;
 }

 if(uniqueClassIds.length > 0){
  const availableClasses =
   await prisma.class.count({
    where:{
     ...allowedClassWhere,
     id:{
      in:uniqueClassIds
     }
    }
   });

  if(availableClasses !== uniqueClassIds.length){
   const error =
    new Error(
     "One or more selected classes are not available"
    );
   error.statusCode = 400;
   throw error;
  }
 }

 return prisma.calendarEvent.create({
  data:{
   title,
   description,
   startDate,
   endDate,
   eventType,
   scope,
   schoolId,
   createdBy,
   classes:{
    create:
     uniqueClassIds.map(
      classId=>({
       classId
      })
     )
   }
  },
  include:calendarEventInclude
 });
};

export const getAdminCalendar =
async (req,res)=>{
 try{
  const schoolId =
   getSchoolId(req);

  const [
   events,
   assignments,
   classes,
   settings
  ] = await Promise.all([
   prisma.calendarEvent.findMany({
    where:{
     schoolId
    },
    include:calendarEventInclude
   }),
   prisma.assignment.findMany({
    where:{
     class:{
      schoolId
     }
    },
    include:{
     class:true
    }
   }),
   getClassOptions({
    schoolId
   }),
   getSchoolSettings(schoolId)
  ]);

  res.json({
   events:
    sortEvents([
     ...events.map(toCalendarEvent),
     ...assignments.map(toAssignmentEvent)
    ]),
   classes,
   settings
  });
 }catch(error){
  console.error(error);
  res.status(500).json({
   message:"Server Error"
  });
 }
};

export const createAdminCalendarEvent =
async (req,res)=>{
 try{
  const event =
   await createEvent({
    body:req.body,
    schoolId:getSchoolId(req),
    createdBy:req.user.id,
    allowedClassWhere:{
     schoolId:getSchoolId(req)
    }
   });

  res.status(201).json(
   toCalendarEvent(event)
  );
 }catch(error){
  console.error(error);
  res.status(error.statusCode || 500).json({
   message:
    error.statusCode
    ? error.message
    : "Server Error"
  });
 }
};

export const getTeacherCalendar =
async (req,res)=>{
 try{
  const teacher =
   await prisma.teacher.findFirst({
    where:{
     userId:req.user.id
    },
    include:{
     permissions:true
    }
   });

  if(!teacher){
   return res.status(404).json({
    message:"Teacher not found"
   });
  }

  const classes =
   await getClassOptions({
    teacherId:teacher.id
   });

  const classIds =
   classes.map(
    classItem=>classItem.id
   );

  const [
   events,
   assignments,
   settings
  ] = await Promise.all([
   prisma.calendarEvent.findMany({
    where:{
     schoolId:teacher.schoolId,
     OR:[
      {
       scope:"SCHOOL"
      },
      {
       scope:"TEACHER"
      },
      {
       classes:{
        some:{
         classId:{
          in:classIds
         }
        }
       }
      }
     ]
    },
    include:calendarEventInclude
   }),
   prisma.assignment.findMany({
    where:{
     classId:{
      in:classIds
     }
    },
    include:{
     class:true
    }
   }),
   getSchoolSettings(teacher.schoolId)
  ]);

  res.json({
   canCreate:
    teacher.permissions
    ?.canManageCalendar || false,
   events:
    sortEvents([
     ...events.map(toCalendarEvent),
     ...assignments.map(toAssignmentEvent)
    ]),
   classes,
   settings
  });
 }catch(error){
  console.error(error);
  res.status(500).json({
   message:"Server Error"
  });
 }
};

export const createTeacherCalendarEvent =
async (req,res)=>{
 try{
  const teacher =
   await prisma.teacher.findFirst({
    where:{
     userId:req.user.id
    },
    include:{
     permissions:true
    }
   });

  if(!teacher){
   return res.status(404).json({
    message:"Teacher not found"
   });
  }

  if(!teacher.permissions?.canManageCalendar){
   return res.status(403).json({
    message:"You do not have permission to manage the calendar"
   });
  }

  const event =
   await createEvent({
    body:req.body,
    schoolId:teacher.schoolId,
    createdBy:req.user.id,
    allowedClassWhere:{
     teacherId:teacher.id
    }
   });

  res.status(201).json(
   toCalendarEvent(event)
  );
 }catch(error){
  console.error(error);
  res.status(error.statusCode || 500).json({
   message:
    error.statusCode
    ? error.message
    : "Server Error"
  });
 }
};

export const getStudentCalendar =
async (req,res)=>{
 try{
  const student =
   await prisma.student.findFirst({
    where:{
     userId:req.user.id
    },
    include:{
     enrollments:{
      include:{
       class:true
      }
     }
    }
   });

  if(!student){
   return res.status(404).json({
    message:"Student record not found"
   });
  }

  const classIds =
   student.enrollments.map(
    enrollment=>enrollment.classId
   );

  const [
   events,
   assignments,
   settings
  ] = await Promise.all([
   prisma.calendarEvent.findMany({
    where:{
     schoolId:student.schoolId,
     scope:{
      not:"TEACHER"
     },
     OR:[
      {
       scope:"SCHOOL"
      },
      {
       classes:{
        some:{
         classId:{
          in:classIds
         }
        }
       }
      }
     ]
    },
    include:calendarEventInclude
   }),
   prisma.assignment.findMany({
    where:{
     classId:{
      in:classIds
     },
     isPublished:true
    },
    include:{
     class:true
    }
   }),
   getSchoolSettings(student.schoolId)
  ]);

  res.json({
   events:
    sortEvents([
     ...events.map(toCalendarEvent),
     ...assignments.map(toAssignmentEvent)
    ]),
   classes:
    student.enrollments.map(
     enrollment=>enrollment.class
    ),
   settings
  });
 }catch(error){
  console.error(error);
  res.status(500).json({
   message:"Server Error"
  });
 }
};
