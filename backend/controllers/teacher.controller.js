import bcrypt from "bcrypt";
import prisma from "../prismaClient.js";
import {
 sendAccountCredentialsEmail
} from "../utils/email.js";

const defaultTeacherPermissions = {
 canCreateStudents:false,
 canCreateClasses:false,
 canEnrollStudents:false,
 canManageCalendar:false
};

const getTeacherByUserId = async (userId) =>
 await prisma.teacher.findFirst({
  where:{
   userId
  },
  include:{
   permissions:true
  }
 });

const getTeacherPermissionState = (teacher) => ({
 canCreateStudents:
  teacher?.permissions
  ?.canCreateStudents || false,
 canCreateClasses:
  teacher?.permissions
  ?.canCreateClasses || false,
 canEnrollStudents:
  teacher?.permissions
  ?.canEnrollStudents || false,
 canManageCalendar:
  teacher?.permissions
  ?.canManageCalendar || false
});

const requireTeacherPermission = (
 teacher,
 permission
) =>
 Boolean(
  getTeacherPermissionState(teacher)[permission]
 );

const averageValues = (values) =>
 values.length
 ? values.reduce(
    (sum,value)=>sum + value,
    0
   ) / values.length
 : 0;

const getTeacherClass = async (classId, teacherId) =>
 await prisma.class.findFirst({
  where:{
   id:classId,
   teacherId
  }
 });

const buildAssignmentUpdateData = (body) => {
 const data = {};

 [
  "title",
  "description",
  "attachmentUrl",
  "attachmentName",
  "isPublished",
  "classId"
 ].forEach((field)=>{
  if(body[field] !== undefined){
   data[field] = body[field];
  }
 });

 if(body.dueDate !== undefined){
  data.dueDate = new Date(body.dueDate);
 }

 return data;
};

const buildAnnouncementUpdateData = (body) => {
 const data = {};

 [
  "title",
  "content",
  "classId"
 ].forEach((field)=>{
  if(body[field] !== undefined){
   data[field] = body[field];
  }
 });

 return data;
};

const buildTeacherLogSearchText = (log) =>
 [
  log.action,
  log.message,
  log.studentName,
  log.rollNumber,
  log.classSection,
  log.subject,
  log.assignmentTitle
 ]
 .filter(Boolean)
 .join(" ")
 .toLowerCase();

export const getAssignmentLogs =
async (req,res)=>{

 try{

  const teacher =
   await getTeacherByUserId(
    req.user.id
   );

  if(!teacher){
   return res.status(404).json({
    message:"Teacher not found"
   });
  }

  const classes =
   await prisma.class.findMany({
    where:{
     teacherId:teacher.id
    },
    select:{
     id:true
    }
   });

  const classIds =
   classes.map(
    classItem=>classItem.id
   );

  const {
   query = "",
   action = "all"
  } = req.query;

  const normalizedAction =
   String(action)
    .trim()
    .toLowerCase();

  const actionFilter =
   normalizedAction === "submitted"
   ? ["ASSIGNMENT_SUBMITTED"]
   : normalizedAction === "deleted"
   ? ["ASSIGNMENT_DELETED"]
   : [
      "ASSIGNMENT_SUBMITTED",
      "ASSIGNMENT_DELETED"
     ];

  let logs =
   await prisma.activityLog.findMany({
    where:{
     classId:{
      in:classIds
     },
     action:{
      in:actionFilter
     }
    },
    orderBy:{
     createdAt:"desc"
    },
    take:200
   });

  const normalizedQuery =
   String(query)
    .trim()
    .toLowerCase();

  if(normalizedQuery){
   logs =
    logs.filter(
     log=>
      buildTeacherLogSearchText(log)
       .includes(normalizedQuery)
    );
  }

  res.json(
   logs.map(
    log=>({
     id:log.id,
     action:log.action,
     title:
      log.action === "ASSIGNMENT_DELETED"
      ? "Submission deleted"
      : "Assignment submitted",
     text:log.message,
     createdAt:log.createdAt,
     studentName:log.studentName,
     rollNumber:log.rollNumber,
     classSection:log.classSection,
     subject:log.subject,
     assignmentTitle:log.assignmentTitle,
     fileName:log.fileName
    })
   )
  );

 }catch(error){

  console.error(error);

  res.status(500).json({
   message:"Server Error"
  });

 }

};

export const getTeacherClasses =
async (req,res)=>{

 try{

  const userId = req.user.id;

  const teacher =
   await prisma.teacher.findFirst({

    where:{
      userId
    }

   });

  const classes =
   await prisma.class.findMany({

    where:{
      teacherId:teacher.id
    },

    include:{
      enrollments:true,
      assignments:true
      
    }

   });

  res.json(classes);

 }catch(error){

  console.error(error);

  res.status(500).json({
   message:"Server Error"
  });

 }

};


export const createAssignment = async (req, res) => {

  try {

    const {
  title,
  description,
  dueDate,
  classId,
  attachmentUrl,
  attachmentName
} = req.body;

    const userId = req.user.id;

    const teacher =
      await prisma.teacher.findFirst({
        where: {
          userId
        }
      });

    const teacherClass =
      await prisma.class.findFirst({
        where: {
          id: classId,
          teacherId: teacher.id
        }
      });

    if (!teacherClass) {
      return res.status(403).json({
        message: "You are not assigned to this class"
      });
    }

    const assignment =
      await prisma.assignment.create({

        data:{
  title,
  description,
  attachmentUrl,
  attachmentName,
  dueDate: new Date(dueDate),
  classId
}

      });

    res.status(201).json(
      assignment
    );

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server Error"
    });

  }

};


export const getAssignments = async (req,res)=>{

 try{

  const userId = req.user.id;

  const teacher =
   await prisma.teacher.findFirst({
    where:{
      userId
    }
   });

  const assignments =
   await prisma.assignment.findMany({

    where:{
      class:{
        teacherId:teacher.id
      }
    },

    include:{
      class:true
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


export const createAnnouncement =
async (req,res)=>{

 try{

  const {
   title,
   content,
   classId
  } = req.body;

  const teacher =
   await getTeacherByUserId(
    req.user.id
   );

  if(!teacher){

   return res.status(404).json({
    message:"Teacher not found"
   });

  }

  const teacherClass =
   await getTeacherClass(
    classId,
    teacher.id
   );

  if(!teacherClass){

   return res.status(403).json({
    message:"You are not assigned to this class"
   });

  }

  const announcement =
   await prisma.announcement.create({

    data:{
      title,
      content,
      classId
    }

   });

  res.status(201).json(
   announcement
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

  const teacher =
   await getTeacherByUserId(
    req.user.id
   );

  if(!teacher){

   return res.status(404).json({
    message:"Teacher not found"
   });

  }

  const announcements =
   await prisma.announcement.findMany({

    where:{
     class:{
      teacherId:teacher.id
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

export const getSubmissions =
async (req,res)=>{

 try{

  const userId =
   req.user.id;

  const teacher =
   await prisma.teacher.findFirst({

    where:{
     userId
    }

   });

  const submissions =
   await prisma.submission.findMany({

    where:{

      assignment:{
       class:{
        teacherId:
         teacher.id
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

    }

   });

  res.json(
   submissions
  );

 }catch(error){

  console.error(error);

  res.status(500).json({
   message:"Server Error"
  });

 }

};

export const gradeSubmission =
async (req,res)=>{

 try{

  const { id } = req.params;

  const {
   grade,
   feedback
  } = req.body;

  const teacher =
   await getTeacherByUserId(
    req.user.id
   );

  if(!teacher){

   return res.status(404).json({
    message:"Teacher not found"
   });

  }

  const ownedSubmission =
   await prisma.submission.findFirst({

    where:{
      id,
      assignment:{
       class:{
        teacherId:teacher.id
       }
      }
    }

   });

  if(!ownedSubmission){

   return res.status(404).json({
    message:"Submission not found"
   });

  }

  const submission =
   await prisma.submission.update({

    where:{
     id
    },

    data:{
      grade,
      feedback
    }

   });

  res.json(submission);

 }catch(error){

  console.error(error);

  res.status(500).json({
   message:"Server Error"
  });

 }

};

export const getTeacherDashboard =
async (req,res)=>{

 try{

  const teacher =
   await prisma.teacher.findFirst({

    where:{
      userId:req.user.id
    }

   });

  const classes =
   await prisma.class.count({

    where:{
      teacherId:teacher.id
    }

   });

  const assignments =
   await prisma.assignment.count({

    where:{
      class:{
       teacherId:teacher.id
      }
    }

   });

  const submissions =
   await prisma.submission.count({

    where:{
      assignment:{
       class:{
        teacherId:teacher.id
       }
      }
    }

   });

  res.json({
   classes,
   assignments,
   submissions
  });

 }catch(error){

  console.error(error);

  res.status(500).json({
   message:"Server Error"
  });

 }

};

export const getClassStudents =
async (req,res)=>{

 try{

  const { id } = req.params;

  const teacher =
   await prisma.teacher.findFirst({

    where:{
      userId:req.user.id
    }

   });

  const selectedClass =
   await prisma.class.findFirst({

    where:{
      id,
      teacherId:teacher.id
    }

   });

  if(!selectedClass){

   return res.status(404).json({
    message:"Class not found"
   });

  }

  const students =
   await prisma.enrollment.findMany({

    where:{
      classId:id
    },

    include:{
      student:{
       include:{
        user:true
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

export const updateAssignment =
async (req,res)=>{

 try{

  const { id } = req.params;

  const teacher =
   await getTeacherByUserId(
    req.user.id
   );

  if(!teacher){

   return res.status(404).json({
    message:"Teacher not found"
   });

  }

  const ownedAssignment =
   await prisma.assignment.findFirst({

    where:{
     id,
     class:{
      teacherId:teacher.id
     }
    }

   });

  if(!ownedAssignment){

   return res.status(404).json({
    message:"Assignment not found"
   });

  }

  if(req.body.classId){

   const teacherClass =
    await getTeacherClass(
     req.body.classId,
     teacher.id
    );

   if(!teacherClass){

    return res.status(403).json({
     message:"You are not assigned to this class"
    });

   }

  }

  const assignment =
   await prisma.assignment.update({

    where:{ id },

    data:
     buildAssignmentUpdateData(
      req.body
     )

   });

  res.json(assignment);

 }catch(error){

  console.error(error);

  res.status(500).json({
   message:"Server Error"
  });

 }

};

export const deleteAssignment =
async (req,res)=>{

 try{

  const { id } = req.params;

  const teacher =
   await getTeacherByUserId(
    req.user.id
   );

  if(!teacher){

   return res.status(404).json({
    message:"Teacher not found"
   });

  }

  const ownedAssignment =
   await prisma.assignment.findFirst({

    where:{
     id,
     class:{
      teacherId:teacher.id
     }
    }

   });

  if(!ownedAssignment){

   return res.status(404).json({
    message:"Assignment not found"
   });

  }

  await prisma.submission.deleteMany({

   where:{
    assignmentId:id
   }

  });

  await prisma.assignment.delete({

   where:{
    id
   }

  });

  res.json({
   message:"Assignment deleted"
  });

 }catch(error){

  console.error(error);

  res.status(500).json({
   message:"Server Error"
  });

 }

};

export const updateAnnouncement =
async (req,res)=>{

 try{

  const { id } = req.params;

  const teacher =
   await getTeacherByUserId(
    req.user.id
   );

  if(!teacher){

   return res.status(404).json({
    message:"Teacher not found"
   });

  }

  const ownedAnnouncement =
   await prisma.announcement.findFirst({

    where:{
     id,
     class:{
      teacherId:teacher.id
     }
    }

   });

  if(!ownedAnnouncement){

   return res.status(404).json({
    message:"Announcement not found"
   });

  }

  if(req.body.classId){

   const teacherClass =
    await getTeacherClass(
     req.body.classId,
     teacher.id
    );

   if(!teacherClass){

    return res.status(403).json({
     message:"You are not assigned to this class"
    });

   }

  }

  const updated =
   await prisma.announcement.update({

    where:{ id },

    data:
     buildAnnouncementUpdateData(
      req.body
     )

   });

  res.json(updated);

 }catch(error){

  console.error(error);

  res.status(500).json({
   message:"Server Error"
  });

 }

};

export const deleteAnnouncement =
async (req,res)=>{

 try{

  const { id } = req.params;

  const teacher =
   await getTeacherByUserId(
    req.user.id
   );

  if(!teacher){

   return res.status(404).json({
    message:"Teacher not found"
   });

  }

  const ownedAnnouncement =
   await prisma.announcement.findFirst({

    where:{
     id,
     class:{
      teacherId:teacher.id
     }
    }

   });

  if(!ownedAnnouncement){

   return res.status(404).json({
    message:"Announcement not found"
   });

  }

  await prisma.announcement.delete({

   where:{ id }

  });

  res.json({
   message:
   "Announcement deleted"
  });

 }catch(error){

  console.error(error);

  res.status(500).json({
   message:"Server Error"
  });

 }

};

export const getTeacherAnalytics =
async (req,res)=>{

 try{

  const teacher =
   await prisma.teacher.findFirst({

    where:{
      userId:req.user.id
    }

   });

  const {
   classId = "all",
   subject = "all",
   year = "all",
   studentId = "all"
  } = req.query;

  const classWhere = {
   teacherId:teacher.id
  };

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

  const classes =
   await prisma.class.findMany({

    where:classWhere,

    include:{
      enrollments:{
       include:{
        student:{
         include:{
          user:true
         }
        }
       }
      },
      teacher:{
       include:{
        user:true
       }
      }
    }

   });

  const allTeacherClasses =
   await prisma.class.findMany({
    where:{
     teacherId:teacher.id
    },
    include:{
     enrollments:{
      include:{
       student:{
        include:{
         user:true
        }
       }
      }
     },
     teacher:{
      include:{
       user:true
      }
     }
    }
   });

  const classIds =
   classes.map(
    classItem=>classItem.id
   );

  const submissionWhere = {
   assignment:{
    classId:{
     in:classIds
    }
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
          class:true
        }
      },
      student:{
        include:{
          user:true
        }
      }
    }

   });

  const gradedSubmissions =
   submissions.filter(
    s=>s.grade !== null
   );

  const overallAverage =

   gradedSubmissions.length

   ? gradedSubmissions.reduce(
      (sum,s)=>sum+s.grade,
      0
     ) /
     gradedSubmissions.length

   : 0;

  const highestGrade =

   gradedSubmissions.length

   ? Math.max(
      ...gradedSubmissions.map(
       s=>s.grade
      )
     )

   : 0;

  const lowestGrade =

   gradedSubmissions.length

   ? Math.min(
      ...gradedSubmissions.map(
       s=>s.grade
      )
     )

   : 0;

  const classPerformance =

   classes.map(classItem=>{

    const classSubmissions =

     gradedSubmissions.filter(
      s=>

       s.assignment.classId ===
       classItem.id
     );

    const average =

     classSubmissions.length

     ? classSubmissions.reduce(
        (sum,s)=>sum+s.grade,
        0
       ) /
       classSubmissions.length

     : 0;

    return{

     id:
      classItem.id,

     className:
      classItem.name,

     subject:
      classItem.subject,

     session:
      classItem.year,

     average:
      Number(
       average.toFixed(2)
      ),

     submissions:
      classSubmissions.length,

     students:
      classItem.enrollments.length

    };

   });

  const studentMap = {};

  gradedSubmissions.forEach(
   submission=>{

    const id =
     submission.student.id;

    const name =
     submission.student.user.name;

    if(!studentMap[id]){

     studentMap[id]={
      studentName:name,
      rollNumber:
       submission.student.rollNumber,
      grades:[]
     };

    }

    studentMap[id].grades.push(
     submission.grade
    );

   }
  );

  const studentPerformance =

   Object.entries(
    studentMap
   ).map(

    ([id,value])=>({

     id,

     studentName:
      value.studentName,

     rollNumber:
      value.rollNumber,

     average:Number(

      (
       value.grades.reduce(
        (a,b)=>a+b,
        0
       ) /
       value.grades.length

      ).toFixed(2)

     ),

     submissions:
      value.grades.length

    })

   );

  const selectedStudentIds =
   studentId !== "all"
   ? [
      String(studentId)
     ]
   : [
      ...new Set(
       classes.flatMap(
        classItem=>
         classItem.enrollments.map(
          enrollment=>
           enrollment.studentId
         )
       )
      )
     ];

  const assignments =
   await prisma.assignment.findMany({
    where:{
     classId:{
      in:classIds
     },
     isPublished:true
    },
    include:{
     class:true,
     submissions:{
      where:{
       studentId:{
        in:selectedStudentIds
       }
      },
      include:{
       student:{
        include:{
         user:true
        }
       }
      }
     }
    },
    orderBy:{
     dueDate:"asc"
    }
   });

  const now =
   new Date();

  let expectedSubmissionCount = 0;
  let submittedCount = 0;
  let notSubmittedCount = 0;
  let pendingCount = 0;
  let missedDeadlineCount = 0;
  let lateSubmissionCount = 0;

  const assignmentDetails =
   assignments.flatMap((assignment)=>{
    const classItem =
     classes.find(
      item=>item.id === assignment.classId
     );

    const eligibleStudents =
     (
      classItem?.enrollments || []
     )
     .map(
      enrollment=>enrollment.student
     )
     .filter(Boolean)
     .filter(
      student=>
       studentId === "all" ||
       student.id === String(studentId)
     );

    const expectedCount =
     eligibleStudents.length;

    const missingCount =
     Math.max(
      expectedCount -
      assignment.submissions.length,
      0
     );

    const isPastDue =
     now >
     new Date(assignment.dueDate);

    const lateCount =
     assignment.submissions.filter(
      submission=>
       submission.submittedAt &&
       new Date(submission.submittedAt) >
       new Date(assignment.dueDate)
     ).length;

    expectedSubmissionCount +=
     expectedCount;

    submittedCount +=
     assignment.submissions.length;

    notSubmittedCount +=
     missingCount;

    lateSubmissionCount +=
     lateCount;

    if(isPastDue){
     missedDeadlineCount +=
      missingCount;
    }else{
     pendingCount +=
      missingCount;
    }

    if(studentId === "all"){
     return [{
      id:assignment.id,
      assignmentTitle:assignment.title,
      subject:assignment.class?.subject,
      classSection:assignment.class?.name,
      dueDate:assignment.dueDate,
      expectedCount,
      submittedCount:
       assignment.submissions.length,
      notSubmittedCount:
       missingCount,
      missedDeadlineCount:
       isPastDue ? missingCount : 0,
      pendingCount:
       isPastDue ? 0 : missingCount,
      lateSubmissionCount:
       lateCount,
      averageGrade:Number(
       averageValues(
        assignment.submissions
         .filter(
          submission=>
           submission.grade !== null
         )
         .map(
          submission=>submission.grade
         )
       ).toFixed(2)
      )
     }];
    }

    const submittedByStudent =
     new Map(
      assignment.submissions.map(
       submission=>[
        submission.studentId,
        submission
       ]
      )
     );

    return eligibleStudents.map((student)=>{
     const submission =
      submittedByStudent.get(student.id);

     const isLate =
      Boolean(
       submission?.submittedAt &&
       new Date(submission.submittedAt) >
       new Date(assignment.dueDate)
      );

     return {
      id:
       `${assignment.id}-${student.id}`,
      assignmentId:
       assignment.id,
      assignmentTitle:
       assignment.title,
      subject:
       assignment.class?.subject,
      classSection:
       assignment.class?.name,
      studentId:
       student.id,
      studentName:
       student.user?.name || "Student",
      rollNumber:
       student.rollNumber,
      dueDate:
       assignment.dueDate,
      submittedAt:
       submission?.submittedAt || null,
      grade:
       submission?.grade ?? null,
      feedback:
       submission?.feedback || "",
      status:
       submission
       ? (
          isLate
          ? "Late"
          : "Submitted"
         )
       : (
          isPastDue
          ? "Missed"
          : "Pending"
         )
     };
    });
   });

  const assignmentSubmissionSummary = {
   expectedSubmissionCount,
   submittedCount,
   notSubmittedCount,
   pendingCount,
   missedDeadlineCount,
   lateSubmissionCount,
   assignmentDetails
  };

  const assignmentPerformance =
   classes.flatMap(
    classItem=>{
     const classAssignments =
      {};

     gradedSubmissions
      .filter(
       submission=>
        submission.assignment.classId ===
        classItem.id
      )
      .forEach((submission)=>{
       const assignment =
        submission.assignment;

       if(!classAssignments[assignment.id]){
        classAssignments[assignment.id] = {
         id:assignment.id,
         assignmentTitle:assignment.title,
         subject:classItem.subject,
         classSection:classItem.name,
         grades:[]
        };
       }

       classAssignments[assignment.id]
        .grades.push(submission.grade);
      });

     return Object.values(classAssignments)
      .map((assignment)=>({
       id:assignment.id,
       assignmentTitle:
        assignment.assignmentTitle,
       subject:
       assignment.subject,
       classSection:
        assignment.classSection,
       average:
        Number(
         averageValues(assignment.grades)
          .toFixed(2)
        ),
       highest:
        Math.max(...assignment.grades),
       lowest:
        Math.min(...assignment.grades),
       submissions:
        assignment.grades.length
      }));
    }
   );

  const teacherPerformance = {
   teacherName:
    allTeacherClasses[0]
     ?.teacher
     ?.user
     ?.name ||
    "Teacher",
   subjects:
    classes.length,
   students:
    classes.reduce(
     (sum,classItem)=>
      sum + classItem.enrollments.length,
     0
    ),
   average:
    Number(
     overallAverage.toFixed(2)
    ),
   gradedSubmissions:
    gradedSubmissions.length
  };

  const filterOptions = {
   sessions:[
    ...new Set(
     allTeacherClasses.map(
      classItem=>classItem.year
     )
    )
   ].sort(
    (a,b)=>a-b
   ),
   subjects:[
    ...new Set(
     allTeacherClasses.map(
      classItem=>classItem.subject
     )
    )
   ].sort(),
   classes:
    allTeacherClasses
     .map((classItem)=>({
      id:classItem.id,
      label:
       `${classItem.subject} (${classItem.name})`,
      subject:classItem.subject,
      classSection:classItem.name,
      year:classItem.year
     }))
     .sort(
      (a,b)=>
       a.label.localeCompare(b.label)
     ),
   students:
    Object.values(
     allTeacherClasses.reduce(
      (acc,classItem)=>{
       classItem.enrollments.forEach(
        enrollment=>{
         const student =
          enrollment.student;

         if(!student){
          return;
         }

         if(!acc[student.id]){
          acc[student.id] = {
           id:student.id,
           name:
            student.user?.name ||
            "Student",
           rollNumber:
            student.rollNumber,
           classIds:[]
          };
         }

         acc[student.id].classIds.push(
          classItem.id
         );
        }
       );

       return acc;
      },
      {}
     )
    )
    .map((student)=>({
     ...student,
     classIds:[
      ...new Set(student.classIds)
     ]
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

   teacherPerformance,

   filterOptions,

   classPerformance,

   studentPerformance,

   assignmentPerformance,

   assignmentSubmissionSummary

  });

 }catch(error){

  console.error(error);

  res.status(500).json({
   message:"Server Error"
  });

 }

};

export const getPerformanceTrends =
async (req,res)=>{

 try{

  const teacher =
   await prisma.teacher.findFirst({

    where:{
      userId:req.user.id
    }

   });

  const assignments =
   await prisma.assignment.findMany({

    where:{
      class:{
        teacherId:teacher.id
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
       submission=>

        submission.grade !==
        null
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

      average:
       Number(
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

   message:
   "Server Error"

  });

 }

};

export const getClassDetails =
async (req,res)=>{

 try{

  const { id } = req.params;

  const teacher =
   await prisma.teacher.findFirst({

    where:{
     userId:req.user.id
    }

   });

  const selectedClass =
   await prisma.class.findFirst({

    where:{
     id,
     teacherId:teacher.id
    },

    include:{

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

  const gradeDistribution = {

   A:0,
   B:0,
   C:0,
   D:0,
   F:0

  };

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

       if(
        submission.grade >= 90
       ){

        gradeDistribution.A++;

       }else if(
        submission.grade >= 80
       ){

        gradeDistribution.B++;

       }else if(
        submission.grade >= 70
       ){

        gradeDistribution.C++;

       }else if(
        submission.grade >= 60
       ){

        gradeDistribution.D++;

       }else{

        gradeDistribution.F++;

       }

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
    .enrollments
    .length,

   assignmentCount:
    selectedClass
    .assignments
    .length,

   averageGrade,

   gradeChart:[

    {
     name:"A (90-100)",
     value:
      gradeDistribution.A
    },

    {
     name:"B (80-89)",
     value:
      gradeDistribution.B
    },

    {
     name:"C (70-79)",
     value:
      gradeDistribution.C
    },

    {
     name:"D (60-69)",
     value:
      gradeDistribution.D
    },

    {
     name:"F (<60)",
     value:
      gradeDistribution.F
    }

   ]

  });

 }catch(error){

  console.error(error);

  res.status(500).json({
   message:"Server Error"
  });

 }

};

export const getUpcomingDeadlines =
async (req,res)=>{

 try{

  const teacher =
   await prisma.teacher.findFirst({

    where:{
     userId:req.user.id
    }

   });

  const assignments =
   await prisma.assignment.findMany({

    where:{
     class:{
      teacherId:teacher.id
     }
    },

    include:{
     class:true
    },

    orderBy:{
     dueDate:"asc"
    },

    take:20

   });

  const deadlines =
   assignments.map(
    assignment=>{

     const diffDays =

      Math.ceil(

       (
        new Date(
         assignment.dueDate
        ) -

        new Date()

       )

       /

       (
        1000 *
        60 *
        60 *
        24
       )

      );

     return{

      id:
       assignment.id,

      title:
       assignment.title,

      className:
       assignment.class.name,

      dueDate:
       assignment.dueDate,

      daysRemaining:
       Math.abs(
        diffDays
       ),

      isOverdue:
       diffDays < 0

     };

    }
   );

  deadlines.sort(

   (a,b)=>{

    if(
     a.isOverdue !==
     b.isOverdue
    ){

     return (
      a.isOverdue
      ? 1
      : -1
     );

    }

    return (
     a.daysRemaining -
     b.daysRemaining
    );

   }

  );

  res.json(
   deadlines
  );

 }catch(error){

  console.error(error);

  res.status(500).json({
   message:"Server Error"
  });

 }

};

export const getStudentPerformance =
async (req,res)=>{

 try{

  const {
   classId,
   studentId
  } = req.params;

  const teacher =
   await getTeacherByUserId(
    req.user.id
   );

  if(!teacher){

   return res.status(404).json({
    message:"Teacher not found"
   });

  }

  const selectedClass =
   await getTeacherClass(
    classId,
    teacher.id
   );

  if(!selectedClass){

   return res.status(404).json({
    message:"Class not found"
   });

  }

  const student =
   await prisma.student.findUnique({

    where:{
     id:studentId
    },

    include:{
     user:true
    }

   });

  if(!student){

   return res.status(404).json({
    message:"Student not found"
   });

  }

  const enrollment =
   await prisma.enrollment.findFirst({

    where:{
     classId,
     studentId
    }

   });

  if(!enrollment){

   return res.status(403).json({
    message:"Student is not enrolled in this class"
   });

  }

  const assignments =
   await prisma.assignment.findMany({

    where:{
     classId
    },

    include:{

     submissions:{

      where:{
       studentId
      }

     }

    }

   });

  let totalGrades = 0;
  let gradeCount = 0;

  let submittedCount = 0;
  let lateCount = 0;
  let onTimeCount = 0;

  const history = [];
  const missingAssignments = [];

  assignments.forEach(
   assignment=>{

    const submission =
     assignment.submissions[0];

    if(submission){

     submittedCount++;

     if(
      submission.grade !== null
     ){

      totalGrades +=
       submission.grade;

      gradeCount++;

     }

     if(

      submission.submittedAt &&

      new Date(
       submission.submittedAt
      )

      >

      new Date(
       assignment.dueDate
      )

     ){

      lateCount++;

     }else{

      onTimeCount++;

     }

     history.push({

 submissionId:
  submission.id,

 title:
  assignment.title,

 grade:
  submission.grade,

 feedback:
  submission.feedback,

 submittedAt:
  submission.submittedAt,

 dueDate:
  assignment.dueDate

});

    }else{

     missingAssignments.push({

      title:
       assignment.title

     });

    }

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

   student,

   totalAssignments:
    assignments.length,

   submittedCount,

   missingCount:
    missingAssignments.length,

   lateCount,

   onTimeCount,

   averageGrade,

   history,

   missingAssignments

  });

 }catch(error){

  console.error(error);

  res.status(500).json({

   message:"Server Error"

  });

 }

};

export const getAssignmentAnalytics =
async (req,res)=>{

 try{

  const { id } = req.params;

  const teacher =
   await getTeacherByUserId(
    req.user.id
   );

  if(!teacher){

   return res.status(404).json({
    message:"Teacher not found"
   });

  }

  const assignment =
   await prisma.assignment.findFirst({

    where:{
     id,
     class:{
      teacherId:teacher.id
     }
    },

    include:{

     class:{
      include:{
       enrollments:true
      }
     },

     submissions:{
      include:{
       student:{
        include:{
         user:true
        }
       }
      }
     }

    }

   });

  if(!assignment){

   return res.status(404).json({

    message:
     "Assignment not found"

   });

  }

  const totalStudents =

   assignment.class
   .enrollments
   .length;

  const submittedCount =

   assignment.submissions
   .length;

  const pendingCount =

   totalStudents -
   submittedCount;

  const gradedSubmissions =

   assignment.submissions.filter(
    submission=>

     submission.grade !== null
   );

  const averageGrade =

   gradedSubmissions.length > 0

   ?

   (

    gradedSubmissions.reduce(

     (
      total,
      submission
     )=>

      total +
      submission.grade,

     0

    )

    /

    gradedSubmissions.length

   ).toFixed(1)

   :

   0;

  const highestGrade =

   gradedSubmissions.length > 0

   ?

   Math.max(

    ...gradedSubmissions.map(
     submission=>
      submission.grade
    )

   )

   :

   null;

  const lowestGrade =

   gradedSubmissions.length > 0

   ?

   Math.min(

    ...gradedSubmissions.map(
     submission=>
      submission.grade
    )

   )

   :

   null;

  res.json({

   assignment,

   totalStudents,

   submittedCount,

   pendingCount,

   averageGrade,

   highestGrade,

   lowestGrade

  });

 }catch(error){

  console.error(error);

  res.status(500).json({

   message:
    "Server Error"

  });

 }

};

export const getTeacherProfile =
async (req,res)=>{

 try{

  const teacher =
   await prisma.teacher.findFirst({

    where:{
     userId:req.user.id
    },

    include:{

     user:true,

     classes:{
      include:{
       enrollments:true,
       assignments:true
      }
     }

    }

   });

  if(!teacher){

   return res.status(404).json({

    message:
     "Teacher not found"

   });

  }

  const classCount =
   teacher.classes.length;

  const studentCount =

   teacher.classes.reduce(

    (
     total,
     currentClass
    )=>

     total +
     currentClass
     .enrollments
     .length,

    0

   );

  const assignmentCount =

   teacher.classes.reduce(

    (
     total,
     currentClass
    )=>

     total +
     currentClass
     .assignments
     .length,

    0

   );

  res.json({

   name:
    teacher.user.name,

   email:
    teacher.user.email,

   employeeId:
    teacher.employeeId,

   classCount,

   studentCount,

   assignmentCount

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

  const teacher =
   await getTeacherByUserId(
    req.user.id
   );

  if(!teacher){
   return res.status(404).json({
    message:"Teacher not found"
   });
  }

  res.json({
   ...defaultTeacherPermissions,
   ...getTeacherPermissionState(
    teacher
   )
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

  const teacher =
   await getTeacherByUserId(
    req.user.id
   );

  if(!teacher){
   return res.status(404).json({
    message:"Teacher not found"
   });
  }

  if(
   !requireTeacherPermission(
    teacher,
    "canCreateStudents"
   )
  ){
   return res.status(403).json({
    message:
     "You do not have permission to create students"
   });
  }

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
     schoolId:teacher.schoolId
    }
   });

  if(existingUser){
   return res.status(400).json({
    message:"Email already exists"
   });
  }

  const existingRollNumber =
   await prisma.student.findFirst({
    where:{
     rollNumber,
     schoolId:teacher.schoolId
    }
   });

  if(existingRollNumber){
   return res.status(400).json({
    message:"Roll number already exists"
   });
  }

  const hashedPassword =
   await bcrypt.hash(
    password,
    10
   );

  const user =
   await prisma.user.create({
    data:{
     name,
     email,
     passwordHash:hashedPassword,
     role:"STUDENT",
     schoolId:teacher.schoolId
    }
   });

  const student =
   await prisma.student.create({
    data:{
     rollNumber,
     classSection,
     userId:user.id,
     schoolId:teacher.schoolId
    },
    include:{
     user:true
    }
   });

  const school =
   await prisma.school.findUnique({
    where:{
     id:teacher.schoolId
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

export const createClass =
async (req,res)=>{

 try{

  const teacher =
   await getTeacherByUserId(
    req.user.id
   );

  if(!teacher){
   return res.status(404).json({
    message:"Teacher not found"
   });
  }

  if(
   !requireTeacherPermission(
    teacher,
    "canCreateClasses"
   )
  ){
   return res.status(403).json({
    message:
     "You do not have permission to create subjects"
   });
  }

  const {
   name,
   code,
   subject,
   year
  } = req.body;

  const existingClass =
   await prisma.class.findFirst({
    where:{
     code,
     schoolId:teacher.schoolId
    }
   });

  if(existingClass){
   return res.status(400).json({
    message:"Subject code already exists"
   });
  }

  const newClass =
   await prisma.class.create({
    data:{
     name,
     code,
     subject,
     year,
     teacherId:teacher.id,
     schoolId:teacher.schoolId
    }
   });

  res.status(201).json(
   newClass
  );

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

  const { id } =
   req.params;

  const teacher =
   await getTeacherByUserId(
    req.user.id
   );

  if(!teacher){
   return res.status(404).json({
    message:"Teacher not found"
   });
  }

  if(
   !requireTeacherPermission(
    teacher,
    "canEnrollStudents"
   )
  ){
   return res.status(403).json({
    message:
     "You do not have permission to enroll students"
   });
  }

  const selectedClass =
   await getTeacherClass(
    id,
    teacher.id
   );

  if(!selectedClass){
   return res.status(404).json({
    message:"Subject not found"
   });
  }

  const enrollments =
   await prisma.enrollment.findMany({
    where:{
     classId:id
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
      notIn:enrolledIds
     },
     schoolId:teacher.schoolId
    },
    include:{
     user:true
    },
    orderBy:[
     {
      classSection:"asc"
     },
     {
      rollNumber:"asc"
     }
    ]
   });

  res.json(students);

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

  const { id } =
   req.params;

  const { studentId } =
   req.body;

  const teacher =
   await getTeacherByUserId(
    req.user.id
   );

  if(!teacher){
   return res.status(404).json({
    message:"Teacher not found"
   });
  }

  if(
   !requireTeacherPermission(
    teacher,
    "canEnrollStudents"
   )
  ){
   return res.status(403).json({
    message:
     "You do not have permission to enroll students"
   });
  }

  const selectedClass =
   await getTeacherClass(
    id,
    teacher.id
   );

  const student =
   await prisma.student.findFirst({
    where:{
     id:studentId,
     schoolId:teacher.schoolId
    }
   });

  if(!selectedClass || !student){
   return res.status(400).json({
    message:
     "Student or subject is not available for this school"
   });
  }

  const existing =
   await prisma.enrollment.findFirst({
    where:{
     classId:id,
     studentId
    }
   });

  if(existing){
   return res.status(400).json({
    message:"Already enrolled"
   });
  }

  await prisma.enrollment.create({
   data:{
    classId:id,
    studentId
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

export const updateStudent =
async (req,res)=>{

 try{

  const {
   classId,
   studentId
  } = req.params;

  const {
   name,
   email,
   rollNumber,
   classSection
  } = req.body;

  const teacher =
   await getTeacherByUserId(
    req.user.id
   );

  if(!teacher){
   return res.status(404).json({
    message:"Teacher not found"
   });
  }

  if(
   !requireTeacherPermission(
    teacher,
    "canCreateStudents"
   )
  ){
   return res.status(403).json({
    message:
     "You do not have permission to update students"
   });
  }

  const selectedClass =
   await getTeacherClass(
    classId,
    teacher.id
   );

  if(!selectedClass){
   return res.status(404).json({
    message:"Subject not found"
   });
  }

  const enrollment =
   await prisma.enrollment.findFirst({
    where:{
     classId,
     studentId
    }
   });

  if(!enrollment){
   return res.status(403).json({
    message:
     "Student is not enrolled in this subject"
   });
  }

  const student =
   await prisma.student.findFirst({
    where:{
     id:studentId,
     schoolId:teacher.schoolId
    },
    include:{
     user:true
    }
   });

  if(!student){
   return res.status(404).json({
    message:"Student not found"
   });
  }

  const existingUser =
   await prisma.user.findFirst({
    where:{
     email,
     schoolId:teacher.schoolId,
     id:{
      not:student.userId
     }
    }
   });

  if(existingUser){
   return res.status(400).json({
    message:"Email already exists"
   });
  }

  const existingRollNumber =
   await prisma.student.findFirst({
    where:{
     rollNumber,
     schoolId:teacher.schoolId,
     id:{
      not:studentId
     }
    }
   });

  if(existingRollNumber){
   return res.status(400).json({
    message:"Roll number already exists"
   });
  }

  const updatedStudent =
   await prisma.$transaction(async (tx)=>{

    await tx.user.update({
     where:{
      id:student.userId
     },
     data:{
      name,
      email
     }
    });

    return tx.student.update({
     where:{
      id:studentId
     },
     data:{
      rollNumber,
      classSection
     },
     include:{
      user:true
     }
    });

   });

  res.json(updatedStudent);

 }catch(error){

  console.error(error);

  res.status(500).json({
   message:"Server Error"
  });

 }

};
