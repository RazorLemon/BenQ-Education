import {
 useState
}
from "react";

import api
from "../../api/axios";

function GradeSubmissionModal({

 submission,
 onClose,
 onSuccess

}){

 const [
  grade,
  setGrade
 ] = useState(
  submission?.grade || ""
 );

 const [
  feedback,
  setFeedback
 ] = useState(
  submission?.feedback || ""
 );

 const [
  loading,
  setLoading
 ] = useState(false);

 if(!submission){

  return null;

 }

 const handleSubmit =
  async (e)=>{

   e.preventDefault();

   setLoading(true);

   try{

    await api.post(

     `/teacher/submissions/${submission.id}/grade`,

     {

      grade:
       Number(grade),

      feedback

     }

    );

    onSuccess();

    onClose();

   }catch(error){

    console.error(error);

   }finally{

    setLoading(false);

   }

  };

 return(

  <div
   className="
   fixed
   inset-0
   bg-black/50
   flex
   items-center
   justify-center
   z-50
   "
  >

   <div
    className="
    bg-white
    rounded-3xl
    p-8
    w-full
    max-w-2xl
    "
   >

    <div
     className="
     flex
     justify-between
     items-center
     mb-6
     "
    >

     <h2
      className="
      text-2xl
      font-bold
      "
     >

      Grade Submission

     </h2>

     <button
      onClick={onClose}
      className="
      text-gray-500
      text-xl
      "
     >
      ✕
     </button>

    </div>

    <div
     className="
     bg-gray-50
     rounded-2xl
     p-5
     mb-6
     "
    >

     <div
      className="
      grid
      md:grid-cols-2
      gap-4
      "
     >

      <div>

       <div
        className="
        text-sm
        text-gray-500
        "
       >
        Student
       </div>

       <div
        className="
        font-semibold
        "
       >
        {
         submission.student
         ?.user?.name
        }
       </div>

      </div>

      <div>

       <div
        className="
        text-sm
        text-gray-500
        "
       >
        Assignment
       </div>

       <div
        className="
        font-semibold
        "
       >
        {
         submission.assignment
         ?.title
        }
       </div>

      </div>

      <div>

       <div
        className="
        text-sm
        text-gray-500
        "
       >
        Class
       </div>

       <div
        className="
        font-semibold
        "
       >
        {
         submission.assignment
         ?.class?.name
        }
       </div>

      </div>

      <div>

       <div
        className="
        text-sm
        text-gray-500
        "
       >
        Submission
       </div>

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

        {
         submission.fileName
        }

       </a>

      </div>

     </div>

    </div>

    <form
     onSubmit={handleSubmit}
     className="
     space-y-5
     "
    >

     <div>

      <label
       className="
       block
       mb-2
       font-medium
       "
      >

       Grade

      </label>

      <input

       type="number"

       min="0"

       max="100"

       value={grade}

       onChange={(e)=>{

        setGrade(
         e.target.value
        );

       }}

       placeholder="Enter grade"

       className="
       w-full
       border
       rounded-xl
       p-3
       "

      />

     </div>

     <div>

      <label
       className="
       block
       mb-2
       font-medium
       "
      >

       Feedback

      </label>

      <textarea

       rows={6}

       value={feedback}

       onChange={(e)=>{

        setFeedback(
         e.target.value
        );

       }}

       placeholder="
       Add detailed feedback for the student
       "

       className="
       w-full
       border
       rounded-xl
       p-3
       "

      />

     </div>

     <div
      className="
      flex
      gap-3
      pt-2
      "
     >

      <button

       type="button"

       onClick={onClose}

       className="
       flex-1
       border
       py-3
       rounded-xl
       "

      >

       Cancel

      </button>

      <button

       disabled={loading}

       className="
       flex-1
       bg-[#008C95]
       text-white
       py-3
       rounded-xl
       "

      >

       {

        loading

        ?

        "Saving..."

        :

        submission.grade !== null

        ?

        "Update Grade"

        :

        "Save Grade"

       }

      </button>

     </div>

    </form>

   </div>

  </div>

 );

}

export default GradeSubmissionModal;