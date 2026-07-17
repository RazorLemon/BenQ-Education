function SubmissionsTable({
 submissions,
 onGrade
}){

 if(
  submissions.length === 0
 ){

  return(

   <div
    className="
    bg-white
    rounded-3xl
    shadow-md
    p-10
    text-center
    text-gray-500
    "
   >

    No submissions found

   </div>

  );

 }

 return(

  <div
   className="
   grid
   lg:grid-cols-2
   gap-6
   "
  >

   {

    submissions.map(
     submission=>(

      <div

       key={
        submission.id
       }

       className="
       bg-white
       rounded-3xl
       shadow-md
       p-6
       "

      >

       <div
        className="
        flex
        justify-between
        items-start
        mb-4
        "
       >

        <div>

         <h2
          className="
          text-xl
          font-bold
          "
         >

          {
           submission.student
           ?.user?.name
          }

         </h2>

         <div
          className="
          text-sm
          text-[#008C95]
          mt-1
          "
         >

          {
           submission.assignment
           ?.class?.name
          }

         </div>

        </div>

        {

         submission.grade !==
         null

         ?

         <span
          className="
          bg-green-100
          text-green-700
          px-3
          py-1
          rounded-full
          text-sm
          "
         >

          Graded

         </span>

         :

         <span
          className="
          bg-orange-100
          text-orange-700
          px-3
          py-1
          rounded-full
          text-sm
          "
         >

          Needs Grading

         </span>

        }

       </div>

       <div
        className="
        mb-4
        "
       >

        <div
         className="
         font-semibold
         "
        >

         Assignment

        </div>

        <div>

         {
          submission.assignment
          ?.title
         }

        </div>

       </div>

       <div
        className="
        mb-4
        "
       >

        <div
         className="
         font-semibold
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

       <div
        className="
        mb-4
        "
       >

        <div
         className="
         font-semibold
         "
        >

         Current Grade

        </div>

        <div
         className="
         text-2xl
         font-bold
         "
        >

         {

          submission.grade

          ??

          "-"

         }

        </div>

       </div>

       {

        submission.feedback &&

        <div
         className="
         mb-4
         "
        >

         <div
          className="
          font-semibold
          "
         >

          Feedback

         </div>

         <div
          className="
          text-gray-600
          "
         >

          {
           submission.feedback
          }

         </div>

        </div>

       }

       <button

        onClick={()=>{

         onGrade(
          submission
         );

        }}

        className="
        w-full
        bg-[#008C95]
        text-white
        py-3
        rounded-xl
        "

       >

        {

         submission.grade !==
         null

         ?

         "Update Grade"

         :

         "Grade Submission"

        }

       </button>

      </div>

     )
    )

   }

  </div>

 );

}

export default SubmissionsTable;