import prisma from "../prismaClient.js";

export const getStudentProfile =
async (req,res)=>{

 try{

  const student =
   await prisma.student.findFirst({

    where:{
     userId:req.user.id
    },

    include:{

     user:true,

     enrollments:{
      include:{
       class:true
      }
     },

     submissions:true

    }

   });

  if(!student){

   return res.status(404).json({

    message:
     "Student not found"

   });

  }

  const gradedSubmissions =

   student.submissions.filter(
    submission=>

     submission.grade !== null

     &&

     submission.grade !== undefined
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

  res.json({

   id:
    student.id,

   name:
    student.user.name,

   email:
    student.user.email,

   rollNumber:
    student.rollNumber,

   classSection:
    student.classSection,

   classCount:
    student.enrollments.length,

   averageGrade

  });

 }catch(error){

  console.error(error);

  res.status(500).json({

   message:
    "Server Error"

  });

 }

};

export const getStudentClasses =
async (req,res)=>{

 try{

  const student =
   await prisma.student.findFirst({

    where:{
      userId:req.user.id
    }

   });

  const enrollments =
   await prisma.enrollment.findMany({

    where:{
      studentId:student.id
    },

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

   });

  res.json(enrollments);

 }catch(error){

  console.error(error);

  res.status(500).json({
   message:"Server Error"
  });

 }

};

export const getStudentAssignments =
async (req,res)=>{

 try{

  const student =
   await prisma.student.findFirst({

    where:{
      userId:req.user.id
    }

   });

  const enrollments =
   await prisma.enrollment.findMany({

    where:{
      studentId:student.id
    }

   });

  const classIds =
   enrollments.map(
    e=>e.classId
   );

  const assignments =
   await prisma.assignment.findMany({

    where:{
      classId:{
       in:classIds
      },
      isPublished:true
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

export const getStudentAnnouncements =
async (req,res)=>{

 try{

  const student =
   await prisma.student.findFirst({

    where:{
      userId:req.user.id
    }

   });

  const enrollments =
   await prisma.enrollment.findMany({

    where:{
      studentId:student.id
    }

   });

  const classIds =
   enrollments.map(
    e=>e.classId
   );

  const announcements =
   await prisma.announcement.findMany({

    where:{
      classId:{
       in:classIds
      }
    },

    include:{
      class:true
    }

   });

  res.json(announcements);

 }catch(error){

  console.error(error);

  res.status(500).json({
   message:"Server Error"
  });

 }

};

export const submitAssignment =
async (req,res)=>{

 try{

  const { id } = req.params;

  const {
   fileUrl,
   fileName
  } = req.body;

  const student =
   await prisma.student.findFirst({

    where:{
      userId:req.user.id
    },

    include:{
     user:true
    }

   });

  if(!student){

   return res.status(404).json({
    message:"Student record not found"
   });

  }

  const assignment =
   await prisma.assignment.findUnique({

    where:{
      id
    },

    include:{
     class:true
    }

   });

  if(!assignment){

   return res.status(404).json({
    message:"Assignment not found"
   });

  }

  const enrollment =
   await prisma.enrollment.findFirst({

    where:{
     studentId:student.id,
     classId:assignment.classId
    }

   });


  if(!enrollment){

   return res.status(403).json({
    message:
    "Not enrolled in this subject"
   });

  }

  if(

   new Date()

   >

   new Date(
    assignment.dueDate
   )

  ){

   return res.status(400).json({

    message:
     "Submission deadline has passed"

   });

  }

  const existingSubmission =
   await prisma.submission.findFirst({

    where:{
      assignmentId:id,
      studentId:student.id
    }

   });

  if(existingSubmission){

   return res.status(400).json({
    message:"Assignment already submitted"
   });

  }

  const submittedAt =
   new Date();

  const submission =
   await prisma.submission.create({

    data:{
      assignmentId:id,
      studentId:student.id,
      fileUrl,
      fileName,
      submittedAt
    }

   });

  await prisma.activityLog.create({
   data:{
    schoolId:
     student.schoolId ||
     assignment.class?.schoolId,
    action:"ASSIGNMENT_SUBMITTED",
    actorRole:"STUDENT",
    actorId:req.user.id,
    studentId:student.id,
    studentName:
     student.user?.name,
    rollNumber:
     student.rollNumber,
    classId:
     assignment.classId,
    classSection:
     assignment.class?.name ||
     student.classSection,
    subject:
     assignment.class?.subject,
    assignmentId:
     assignment.id,
    assignmentTitle:
     assignment.title,
    fileName,
    message:
     `${student.user?.name || "Student"} submitted ${assignment.title}`,
    createdAt:
     submittedAt
   }
  });

  res.status(201).json(
   submission
  );

 }catch(error){

  console.error(error);

  res.status(500).json({
   message:"Server Error"
  });

 }

};

export const getStudentSubmissions =
async (req,res)=>{

 try{

  const student =
   await prisma.student.findFirst({

    where:{
      userId:req.user.id
    }

   });

  const submissions =
   await prisma.submission.findMany({

    where:{
      studentId:student.id
    },

    include:{
      assignment:{
        include:{
          class:true
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

const average = (values) =>
 values.length
 ? values.reduce(
    (sum,value)=>sum + value,
    0
   ) / values.length
 : 0;

const round = (value) =>
 Number(
  Number(value || 0).toFixed(2)
 );

const rankValue = (
 rows,
 targetId
) => {
 const sorted =
  [...rows].sort(
   (a,b)=>b.average - a.average
  );

 const index =
  sorted.findIndex(
   row=>row.id === targetId
  );

 return index === -1
 ? null
 : index + 1;
};

const buildStudentAverageRows = (
 submissions,
 studentId
) => {
 const studentMap = {};

 submissions.forEach((submission)=>{
  if(submission.grade === null){
   return;
  }

  const id =
   submission.studentId;

  if(!studentMap[id]){
   studentMap[id] = {
    id,
    studentName:
     submission.student?.user?.name ||
     "Student",
    rollNumber:
     submission.student?.rollNumber,
    grades:[]
   };
  }

  studentMap[id].grades.push(
   submission.grade
  );
 });

 return Object.values(studentMap)
  .map((row)=>({
   id:row.id,
   studentName:row.studentName,
   rollNumber:row.rollNumber,
   average:
    round(
     average(row.grades)
    ),
   submissions:
    row.grades.length,
   isCurrentStudent:
    row.id === studentId
  }))
  .sort(
   (a,b)=>b.average - a.average
  );
};

export const getStudentAnalytics =
async (req,res)=>{

 try{

  const student =
   await prisma.student.findFirst({
    where:{
     userId:req.user.id
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
    message:"Student record not found"
   });
  }

  const classIds =
   student.enrollments.map(
    enrollment=>enrollment.classId
   );

  const assignments =
   await prisma.assignment.findMany({
    where:{
     classId:{
      in:classIds
     }
    },
    include:{
     class:true,
     submissions:{
      where:{
       grade:{
        not:null
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
     createdAt:"asc"
    }
   });

  const allGradedSubmissions =
   assignments.flatMap(
    assignment=>
     assignment.submissions.map(
      submission=>({
       ...submission,
       assignment
      })
     )
   );

  const myGradedSubmissions =
   allGradedSubmissions.filter(
    submission=>
     submission.studentId ===
     student.id
   );

  const assignmentAnalytics =
   assignments
    .map((assignment)=>{
     const graded =
      assignment.submissions;

     const grades =
      graded.map(
       submission=>submission.grade
      );

     const mySubmission =
      graded.find(
       submission=>
        submission.studentId ===
        student.id
      );

     const peerRows =
      graded
       .map((submission)=>({
        id:submission.studentId,
        studentName:
         submission.student?.user?.name ||
         "Student",
        rollNumber:
         submission.student?.rollNumber,
        grade:submission.grade,
        isCurrentStudent:
         submission.studentId ===
         student.id
       }))
       .sort(
        (a,b)=>b.grade - a.grade
       );

     const rank =
      mySubmission
      ? peerRows.findIndex(
         row=>row.id === student.id
        ) + 1
      : null;

     return {
      id:assignment.id,
      assignmentTitle:assignment.title,
      subject:assignment.class?.subject,
      classSection:assignment.class?.name,
      classId:assignment.classId,
      classAverage:
       round(average(grades)),
      highest:
       grades.length ? Math.max(...grades) : 0,
      lowest:
       grades.length ? Math.min(...grades) : 0,
      myGrade:
       mySubmission?.grade ?? null,
      rank,
      totalGraded:
       graded.length,
      peerRows
     };
    })
    .filter(
     item=>
      item.totalGraded > 0 ||
      item.myGrade !== null
    );

  const subjectAnalytics =
   student.enrollments.map((enrollment)=>{
    const classSubmissions =
     allGradedSubmissions.filter(
      submission=>
       submission.assignment.classId ===
       enrollment.classId
     );

    const myClassSubmissions =
     classSubmissions.filter(
      submission=>
       submission.studentId ===
       student.id
     );

    const peerRows =
     buildStudentAverageRows(
      classSubmissions,
      student.id
     );

    return {
     classId:enrollment.classId,
     subject:
      enrollment.class?.subject,
     classSection:
      enrollment.class?.name,
     classAverage:
      round(
       average(
        classSubmissions.map(
         submission=>submission.grade
        )
       )
      ),
     myAverage:
      round(
       average(
        myClassSubmissions.map(
         submission=>submission.grade
        )
       )
      ),
     rank:
      rankValue(
       peerRows,
       student.id
      ),
     totalStudents:
      peerRows.length,
     gradedSubmissions:
      classSubmissions.length,
     peerRows
    };
   });

  const overallPeerRows =
   buildStudentAverageRows(
    allGradedSubmissions,
    student.id
   );

  const overall = {
   studentName:
    student.user?.name,
   average:
    round(
     average(
      myGradedSubmissions.map(
       submission=>submission.grade
      )
     )
    ),
   peerAverage:
    round(
     average(
      allGradedSubmissions.map(
       submission=>submission.grade
      )
     )
    ),
   rank:
    rankValue(
     overallPeerRows,
     student.id
    ),
   totalStudents:
    overallPeerRows.length,
   gradedAssignments:
    myGradedSubmissions.length,
   enrolledSubjects:
    student.enrollments.length
  };

  res.json({
   overall,
   assignmentAnalytics,
   subjectAnalytics,
   overallPeerRows
  });

 }catch(error){

  console.error(error);

  res.status(500).json({
   message:"Server Error"
  });

 }

};

export const getStudentDashboard =
async (req,res)=>{

 try{

  const student =
   await prisma.student.findFirst({

    where:{
     userId:req.user.id
    }

   });

  const submissions =
   await prisma.submission.findMany({

    where:{
     studentId:student.id
    },

    include:{
     assignment:true
    }

   });

  const enrollments =
   await prisma.enrollment.findMany({

    where:{
     studentId:student.id
    }

   });

  const classIds =
   enrollments.map(
    e=>e.classId
   );

  const assignments =
   await prisma.assignment.findMany({

    where:{
     classId:{
      in:classIds
     },
     isPublished:true
    }

   });

  const announcements =
   await prisma.announcement.findMany({

    where:{
     classId:{
      in:classIds
     }
    },

    include:{
     class:true
    },

    orderBy:{
     createdAt:"desc"
    },

    take:5

   });

  let totalGrades = 0;
  let gradeCount = 0;

  submissions.forEach(
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

  const averageGrade =

   gradeCount > 0

   ? (
      totalGrades /
      gradeCount
     ).toFixed(1)

   : 0;

  const submittedCount =
   submissions.length;

  const missingCount =

   assignments.length -

   submissions.length;

  const pendingCount =

   assignments.filter(
    assignment=>{

     const submitted =

      submissions.some(
       submission=>

        submission
        .assignmentId ===
        assignment.id

      );

     const duePassed =

      new Date()

      >

      new Date(
       assignment.dueDate
      );

     return (
      !submitted &&
      !duePassed
     );

    }
   )
   .length;

  const performanceTrend =

   submissions

    .filter(
     s=>
      s.grade !== null
    )

    .map(
     s=>({

      assignment:
       s.assignment.title,

      grade:
       s.grade

     })
    );

  res.json({

 averageGrade,

 submittedCount,

 pendingCount,

 missingCount,

 announcements,

 assignments:

  assignments.filter(
   assignment=>

    !submissions.some(
     submission=>

      submission.assignmentId ===
      assignment.id
    )
  ),

 performanceTrend

});

 }catch(error){

  console.error(error);

  res.status(500).json({

   message:"Server Error"

  });

 }

};

export const getStudentClassDetails =
async (req,res)=>{

 try{

  const { id } = req.params;

  const student =
   await prisma.student.findFirst({

    where:{
     userId:req.user.id
    }

   });

  const enrollment =
   await prisma.enrollment.findFirst({

    where:{
     classId:id,
     studentId:student.id
    }

   });

  if(!enrollment){

   return res.status(403).json({

    message:
     "Not enrolled in this subject"

   });

  }

  const selectedClass =
   await prisma.class.findUnique({

    where:{
     id
    },

    include:{

     teacher:{
      include:{
       user:true
      }
     },

     announcements:{
      orderBy:{
       createdAt:"desc"
      }
     },

     assignments:{
      orderBy:{
       dueDate:"asc"
      }
     },

     comments:{
      select:{
       id:true
      }
     }

    }

   });

  const submissions =
   await prisma.submission.findMany({

    where:{
     studentId:student.id
    }

   });

  const submittedCount =
   submissions.filter(
    submission=>

     selectedClass
     .assignments
     .some(
      assignment=>

       assignment.id ===
       submission.assignmentId
     )
   ).length;

  const pendingCount =

   selectedClass
   .assignments
   .length

   -

   submittedCount;

  res.json({

   class:selectedClass,

   submissions,

   completionChart:[

    {
     name:"Submitted",
     value:submittedCount
    },

    {
     name:"Pending",
     value:pendingCount
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

export const deleteSubmission =
async (req,res)=>{

 try{

  const { id } =
   req.params;

  const student =
   await prisma.student.findFirst({

    where:{
     userId:req.user.id
    },

    include:{
     user:true
    }

   });

  if(!student){
   return res.status(404).json({
    message:"Student record not found"
   });
  }

  const assignment =
   await prisma.assignment.findUnique({
    where:{
     id
    },
    include:{
     class:true
    }
   });

  if(!assignment){
   return res.status(404).json({
    message:"Assignment not found"
   });
  }

  if(
   new Date() >
   new Date(assignment.dueDate)
  ){
   return res.status(400).json({
    message:
     "Submission can only be deleted before the deadline"
   });
  }

  const existingSubmission =
   await prisma.submission.findFirst({
    where:{
     assignmentId:id,
     studentId:student.id
    }
   });

  if(!existingSubmission){
   return res.status(404).json({
    message:"Submission not found"
   });
  }

  const deletedAt =
   new Date();

  await prisma.submission.delete({
   where:{
    id:existingSubmission.id
   }
  });

  await prisma.activityLog.create({
   data:{
    schoolId:
     student.schoolId ||
     assignment.class?.schoolId,
    action:"ASSIGNMENT_DELETED",
    actorRole:"STUDENT",
    actorId:req.user.id,
    studentId:student.id,
    studentName:
     student.user?.name,
    rollNumber:
     student.rollNumber,
    classId:
     assignment.classId,
    classSection:
     assignment.class?.name ||
     student.classSection,
    subject:
     assignment.class?.subject,
    assignmentId:
     assignment.id,
    assignmentTitle:
     assignment.title,
    fileName:
     existingSubmission.fileName,
    message:
     `${student.user?.name || "Student"} deleted ${assignment.title}`,
    createdAt:
     deletedAt
   }
  });

  res.json({
   message:"Submission deleted"
  });

 }catch(error){

  console.error(error);

  res.status(500).json({
   message:"Server Error"
  });

 }

};
