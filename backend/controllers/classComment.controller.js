import prisma from "../prismaClient.js";
import {
 invalidateSchoolCache
} from "../services/cache.service.js";

const authorSelect = {
 id:true,
 name:true,
 role:true
};

const commentInclude = {
 author:{
  select:authorSelect
 },
 replies:{
  include:{
   author:{
    select:authorSelect
   }
  },
  orderBy:{
   createdAt:"asc"
  }
 }
};

const serializeComment = (comment) => ({
 id:comment.id,
 content:comment.content,
 pinned:comment.pinned,
 createdAt:comment.createdAt,
 updatedAt:comment.updatedAt,
 parentId:comment.parentId,
 author:comment.author,
 replies:
  comment.replies?.map(
   serializeComment
  ) || []
});

const getTeacherClass = async (
 classId,
 userId
) =>
 prisma.class.findFirst({
  where:{
   id:classId,
   teacher:{
    userId
   }
  },
  select:{
   id:true,
   schoolId:true
  }
 });

const getStudentClass = async (
 classId,
 userId
) =>
 prisma.class.findFirst({
  where:{
   id:classId,
   enrollments:{
    some:{
     student:{
      userId
     }
    }
   }
  },
  select:{
   id:true,
   schoolId:true
  }
 });

const getAccessibleClass = async (
 req,
 res,
 role
) => {
 const classId =
  req.params.id;

 const classItem =
  role === "teacher"
  ? await getTeacherClass(
     classId,
     req.user.id
    )
  : await getStudentClass(
     classId,
     req.user.id
    );

 if(!classItem){
  res.status(404).json({
   message:"Class not found"
  });
  return null;
 }

 return classItem;
};

export const listTeacherClassComments =
 async (req,res) =>
  listClassComments(
   req,
   res,
   "teacher"
  );

export const createTeacherClassComment =
 async (req,res) =>
  createClassComment(
   req,
   res,
   "teacher"
  );

export const pinTeacherClassComment =
 async (req,res) => {
  try{
   const classItem =
    await getAccessibleClass(
     req,
     res,
     "teacher"
    );

   if(!classItem){
    return;
   }

   const comment =
    await prisma.classComment.findFirst({
     where:{
      id:req.params.commentId,
      classId:classItem.id
     }
    });

   if(!comment){
    return res.status(404).json({
     message:"Comment not found"
    });
   }

   const updated =
    await prisma.classComment.update({
     where:{
      id:comment.id
     },
     data:{
      pinned:req.body.pinned
     },
     include:commentInclude
    });

   await invalidateSchoolCache(
    classItem.schoolId
   );

   return res.json(
    serializeComment(updated)
   );

  }catch(error){
   console.error(error);

   return res.status(500).json({
    message:"Server Error"
   });
  }
 };

export const listStudentClassComments =
 async (req,res) =>
  listClassComments(
   req,
   res,
   "student"
  );

export const createStudentClassComment =
 async (req,res) =>
  createClassComment(
   req,
   res,
   "student"
  );

const listClassComments =
 async (
  req,
  res,
  role
 ) => {
  try{
   const classItem =
    await getAccessibleClass(
     req,
     res,
     role
    );

   if(!classItem){
    return;
   }

   const comments =
    await prisma.classComment.findMany({
     where:{
      classId:classItem.id,
      parentId:null
     },
     include:commentInclude,
     orderBy:[
      {
       pinned:"desc"
      },
      {
       createdAt:"desc"
      }
     ]
    });

   return res.json(
    comments.map(
     serializeComment
    )
   );

  }catch(error){
   console.error(error);

   return res.status(500).json({
    message:"Server Error"
   });
  }
 };

const createClassComment =
 async (
  req,
  res,
  role
 ) => {
  try{
   const classItem =
    await getAccessibleClass(
     req,
     res,
     role
    );

   if(!classItem){
    return;
   }

   const {
    content,
    parentId
   } = req.body;

   if(parentId){
    const parent =
     await prisma.classComment.findFirst({
      where:{
       id:parentId,
       classId:classItem.id
      }
     });

    if(!parent){
     return res.status(404).json({
      message:"Comment not found"
     });
    }

    if(parent.parentId){
     return res.status(400).json({
      message:"Replies can only be added to main comments"
     });
    }
   }

   const comment =
    await prisma.classComment.create({
     data:{
      content,
      classId:classItem.id,
      authorId:req.user.id,
      parentId:parentId || null
     },
     include:commentInclude
    });

   await invalidateSchoolCache(
    classItem.schoolId
   );

   return res.status(201).json(
    serializeComment(comment)
   );

  }catch(error){
   console.error(error);

   return res.status(500).json({
    message:"Server Error"
   });
  }
 };
