import {
 useCallback,
 useEffect,
 useState
}
from "react";

import {
 useParams
}
from "react-router-dom";

import {
 BookOpen,
 CheckCircle2,
 FileWarning,
 MessageSquareText
}
from "lucide-react";

import api
from "../api/axios";

import StudentLayout
from "../layouts/StudentLayout";

import PageHeader
from "../components/ui/PageHeader";

import LoadingSpinner
from "../components/ui/LoadingSpinner";

import StatCard
from "../components/dashboard/StatCard";

import {
 notifyError,
 notifySuccess
}
from "../utils/toast";

import {
 formatAcademicSession
}
from "../utils/academicSession";

import ClassCommentSection
from "../components/classes/ClassCommentSection";

function StudentClassDetails(){

 const { id } =
  useParams();

 const [
  data,
  setData
 ] = useState(null);

 const [
  loading,
  setLoading
 ] = useState(true);

 const [
  uploadingAssignment,
  setUploadingAssignment
 ] = useState(null);

 const [
  submitLinks,
  setSubmitLinks
 ] = useState({});

 const fetchClass =
  useCallback(
  async ()=>{

   try{

    const response =
     await api.get(
      `/student/classes/${id}`
     );

    setData(
     response.data
    );

   }catch(error){

    console.error(error);

   }finally{

    setLoading(false);

   }

  },
  [id]
  );

 useEffect(()=>{

  fetchClass();

 },[fetchClass]);

 const submitAssignment =
  async (
   assignmentId,
   submission
  )=>{

   if(!submission?.fileUrl){
    notifyError(
     "Paste a shared file link before submitting"
    );
    return;
   }

   if(!submission?.fileName){
    notifyError(
     "Enter a name for your shared file"
    );
    return;
   }

   try{

    setUploadingAssignment(
     assignmentId
    );

    await api.post(

     `/student/assignments/${assignmentId}/submit`,

     {

      fileUrl:
       submission.fileUrl,

      fileName:
       submission.fileName

     }

    );

    await fetchClass();

    notifySuccess(
     "Assignment submitted successfully"
    );

   }catch(error){

    console.error(error);

   }finally{

    setUploadingAssignment(
     null
    );

   }

  };

 const deleteSubmission =
  async (assignmentId)=>{

   if(
    !window.confirm(
     "Delete this submission?"
    )
   ){
    return;
   }

   try{

    await api.delete(
     `/student/assignments/${assignmentId}/submission`
    );

    await fetchClass();

    notifySuccess(
     "Submission deleted"
    );

   }catch(error){

    console.error(error);

   }

  };

 const scrollToSection =
  (sectionId)=>{
   document
    .getElementById(sectionId)
    ?.scrollIntoView({
     behavior:"smooth",
     block:"start"
    });
  };

 if(loading){

  return(

   <StudentLayout
    title="Subject"
   >

    <LoadingSpinner />

   </StudentLayout>

  );

 }

 const classAssignments =
  data.class.assignments || [];

 const classAssignmentIds =
  new Set(
   classAssignments.map(
    assignment=>assignment.id
   )
  );

 const classSubmissions =
  (data.submissions || [])
   .filter(
    submission=>
     classAssignmentIds.has(
      submission.assignmentId
     )
   );

 const submittedCount =
  classSubmissions.length;

 const pendingCount =
  Math.max(
   classAssignments.length -
   submittedCount,
   0
  );

 return(

  <StudentLayout
   title={
    data.class.subject
   }
  >

   <PageHeader

    title={
     data.class.subject
    }

    subtitle={
     `Class & Section: ${data.class.name}`
    }

    backTo="/student/classes"

    backLabel="Back to subjects"

   />

   <div
    className="
    bg-gradient-to-r
    from-[#008C95]
    to-teal-700
    text-white
    rounded-3xl
    p-8
    mb-6
    "
   >

    <h2
     className="
     text-3xl
     font-bold
     "
    >
     {data.class.subject}
    </h2>

    <p
     className="
     text-teal-100
     mt-2
     "
    >
     Class & Section: {data.class.name}
    </p>

    <div
     className="
     mt-4
     flex
     gap-8
     "
    >

     <div>

      <div
       className="
       text-teal-200
       text-sm
       "
      >
       Teacher
      </div>

      <div>
       {
        data.class.teacher
        ?.user?.name
       }
      </div>

     </div>

     <div>

      <div
       className="
       text-teal-200
       text-sm
       "
      >
       Year
      </div>

      <div>
       {
        formatAcademicSession(
         data.class.year
        )
       }
      </div>

     </div>

    </div>

   </div>

   <div
    className="
    grid
    md:grid-cols-4
    gap-6
    mb-6
    "
   >

    <StatCard
     title="Assignments"
     value={classAssignments.length}
     subtitle="Published work in this subject"
     icon={BookOpen}
     actionLabel="View assignments"
     onClick={()=>
      scrollToSection("student-class-assignments")
     }
    />

    <StatCard
     title="Submitted"
     value={submittedCount}
     subtitle="Assignments you have turned in"
     icon={CheckCircle2}
     actionLabel="Review submissions"
     onClick={()=>
      scrollToSection("student-class-assignments")
     }
    />

    <StatCard
     title="Pending"
     value={pendingCount}
     subtitle="Assignments still needing action"
     icon={FileWarning}
     actionLabel="Open pending work"
     onClick={()=>
      scrollToSection("student-class-assignments")
     }
    />

    <StatCard
     title="Class Comments"
     value={data.class.comments?.length || 0}
     subtitle="Questions and replies in this subject"
     icon={MessageSquareText}
     actionLabel="Open discussion"
     onClick={()=>
      scrollToSection("student-class-comments")
     }
    />

   </div>

   <div
    id="student-class-comments"
    className="mb-6 scroll-mt-24"
   >
    <ClassCommentSection
     endpoint={`/student/classes/${id}/comments`}
    />
   </div>

   <div
    className="
    grid
    lg:grid-cols-2
    gap-6
    "
   >

    <div
     id="student-class-assignments"
     className="
     bg-white
     rounded-3xl
     shadow-md
     p-6
     scroll-mt-24
     "
    >

     <h2
      className="
      text-xl
      font-bold
      mb-4
      "
     >
      Assignments
     </h2>

     {

      classAssignments.map(
       assignment=>{

        const submission =
         classSubmissions.find(
          s=>
           s.assignmentId ===
           assignment.id
         );

        const deadlinePassed =
         new Date() >
         new Date(
          assignment.dueDate
         );

        return(

         <div
          key={
           assignment.id
          }
          className="
          bg-gray-50
          rounded-2xl
          p-5
          mb-4
          "
         >

          <div
           className="
           text-lg
           font-bold
           "
          >
           {
            assignment.title
           }
          </div>

          {

           assignment.description &&

           <div
            className="
            text-gray-700
            mt-2
            "
           >
            {
             assignment.description
            }
           </div>

          }

          <div
           className="
           text-sm
           text-gray-500
           mt-3
           "
          >

           Due:

           {" "}

           {
            new Date(
             assignment.dueDate
            )
            .toLocaleDateString()
           }

          </div>

          {

           assignment.attachmentUrl &&

           <a

            href={
             assignment.attachmentUrl
            }

            target="_blank"

            rel="noreferrer"

            className="
            block
            mt-3
            text-[#008C95]
            underline
            "

           >

            📄

            {" "}

            {

             assignment.attachmentName

             ||

             "Open Resource Link"

            }

           </a>

          }

          <div
 className="
 mt-4
 "
>

 {

  submission

  ?

  <div>

   <span
    className="
    inline-block
    px-3
    py-1
    rounded-full
    bg-green-100
    text-green-700
    text-sm
    "
   >

    Submitted

   </span>

   {

   submission.fileUrl &&

    <div
     className="
     mt-3
     "
    >

     <a

      href={
       submission.fileUrl
      }

      target="_blank"

      rel="noreferrer"

      className="
      text-[#008C95]
      underline
      "

     >

      View Submission

     </a>

     {
      !deadlinePassed &&

      <button
       onClick={()=>
        deleteSubmission(
         assignment.id
        )
       }
       className="
       block
       mt-3
       text-red-600
       font-medium
       hover:underline
       "
      >
       Delete Submission
      </button>
     }

    </div>

   }

   {

    submission.grade !== null

    &&

    submission.grade !== undefined

    &&

    <div
     className="
     mt-3
     text-sm
     "
    >

     Grade:

     {" "}

     <span
      className="
      font-semibold
      "
     >

      {
       submission.grade
      }

     </span>

    </div>

   }

   {

    submission.feedback &&

    <div
     className="
     mt-2
     text-sm
     text-gray-600
     "
    >

     Feedback:

     {" "}

     {
      submission.feedback
     }

    </div>

   }

  </div>

  :

  <div>

   <span
    className="
    inline-block
    px-3
    py-1
    rounded-full
    bg-orange-100
    text-orange-700
    text-sm
    "
   >

    Pending

   </span>

   <div
    className="
    border-2
    border-dashed
    border-[#008C95]
    bg-teal-50
    rounded-xl
    p-4
    mt-4
    "
   >

    <input

     type="url"

     placeholder="Paste your shared file link"

     value={
      submitLinks[
       assignment.id
      ]?.fileUrl || ""
     }

     className="
     w-full
     border
     bg-white
     p-3
     rounded-xl
     "

     onChange={(e)=>{

      setSubmitLinks({

       ...submitLinks,

       [assignment.id]:
        {
         ...submitLinks[
          assignment.id
         ],
         fileUrl:
          e.target.value
        }

      });

     }}

    />

    <input

     placeholder="Submission file name"

     value={
      submitLinks[
       assignment.id
      ]?.fileName || ""
     }

     className="
     w-full
     border
     bg-white
     p-3
     rounded-xl
     mt-2
     "

     onChange={(e)=>{

      setSubmitLinks({

       ...submitLinks,

       [assignment.id]:
        {
         ...submitLinks[
          assignment.id
         ],
         fileName:
          e.target.value
        }

      });

     }}

    />

    <div
     className="
     text-sm
     text-gray-600
     mt-2
     "
    >

     Upload your file to Google Drive, OneDrive, or another service,
     then paste the shareable link here.

    </div>

   </div>

   <button

    disabled={

     !submitLinks[
      assignment.id
     ]?.fileUrl

     ||

     !submitLinks[
      assignment.id
     ]?.fileName

     ||

     uploadingAssignment !== null

    }

    onClick={()=>{

     submitAssignment(

      assignment.id,

      submitLinks[
       assignment.id
      ]

     );

    }}

    className="
    mt-4
    bg-[#008C95]
    text-white
    px-4
    py-2
    rounded-xl
    disabled:opacity-50
    "

   >

    {

     uploadingAssignment ===
     assignment.id

     ?

     "Submitting..."

     :

     "Submit Assignment"

    }

   </button>

  </div>

 }

</div>

         </div>

        );

       }
      )

     }

    </div>

    <div
     className="
     bg-white
     rounded-3xl
     shadow-md
     p-6
     "
    >

     <h2
      className="
      text-xl
      font-bold
      mb-4
      "
     >
      Announcements
     </h2>

     {

      data.class
      .announcements
      .map(
       announcement=>(

        <div

         key={
          announcement.id
         }

         className="
         bg-gray-50
         rounded-2xl
         p-4
         mb-4
         "

        >

         <div
          className="
          font-semibold
          "
         >
          {
           announcement.title
          }
         </div>

         <div
          className="
          text-gray-600
          mt-2
          "
         >
          {
           announcement.content
          }
         </div>

        </div>

       )
      )

     }

    </div>

   </div>

  </StudentLayout>

 );

}

export default StudentClassDetails;
