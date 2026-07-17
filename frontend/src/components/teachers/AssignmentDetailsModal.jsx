import {
 useEffect,
 useState
}
from "react";

import api
from "../../api/axios";

function AssignmentDetailsModal({

 assignment,
 open,
 onClose

}){

 const [
  analytics,
  setAnalytics
 ] = useState(null);

 const [
  loading,
  setLoading
 ] = useState(false);

 useEffect(()=>{

  const fetchAnalytics =
   async ()=>{

    if(
     !assignment
    ){
     return;
    }

    try{

     setLoading(true);

     const response =
      await api.get(

       `/teacher/assignments/${assignment.id}/analytics`

      );

     setAnalytics(
      response.data
     );

    }catch(error){

     console.error(error);

    }finally{

     setLoading(false);

    }

   };

  if(open){

   fetchAnalytics();

  }

 },[
  open,
  assignment
 ]);

 if(
  !open ||
  !assignment
 ){

  return null;

 }

 return(

  <div

   onClick={onClose}

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

    onClick={(e)=>
     e.stopPropagation()
    }

    className="
    bg-white
    rounded-3xl
    p-8
    w-full
    max-w-4xl
    shadow-xl
    max-h-[90vh]
    overflow-y-auto
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
      text-3xl
      font-bold
      "
     >

      Assignment Analytics

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

    {

     loading

     ?

     <div
      className="
      text-center
      py-10
      "
     >

      Loading...

     </div>

     :

     analytics && (

      <>

       <div
        className="
        mb-8
        "
       >

        <h3
         className="
         text-2xl
         font-bold
         "
        >

         {
          assignment.title
         }

        </h3>

        <p
         className="
         text-gray-600
         mt-2
         "
        >

         {
          assignment.description
         }

        </p>

       </div>

       <div
        className="
        grid
        md:grid-cols-3
        gap-5
        mb-8
        "
       >

        <div
         className="
         bg-teal-50
         rounded-2xl
         p-5
         "
        >

         <div
          className="
          text-sm
          text-gray-500
          "
         >
          Students Assigned
         </div>

         <div
          className="
          text-3xl
          font-bold
          mt-2
          "
         >
          {
           analytics.totalStudents
          }
         </div>

        </div>

        <div
         className="
         bg-green-50
         rounded-2xl
         p-5
         "
        >

         <div
          className="
          text-sm
          text-gray-500
          "
         >
          Submitted
         </div>

         <div
          className="
          text-3xl
          font-bold
          text-green-600
          mt-2
          "
         >
          {
           analytics.submittedCount
          }
         </div>

        </div>

        <div
         className="
         bg-orange-50
         rounded-2xl
         p-5
         "
        >

         <div
          className="
          text-sm
          text-gray-500
          "
         >
          Pending
         </div>

         <div
          className="
          text-3xl
          font-bold
          text-orange-500
          mt-2
          "
         >
          {
           analytics.pendingCount
          }
         </div>

        </div>

       </div>

       <div
        className="
        grid
        md:grid-cols-3
        gap-5
        mb-8
        "
       >

        <div
         className="
         bg-white
         border
         rounded-2xl
         p-5
         "
        >

         <div
          className="
          text-sm
          text-gray-500
          "
         >
          Average Grade
         </div>

         <div
          className="
          text-3xl
          font-bold
          mt-2
          "
         >
          {
           analytics.averageGrade
          }
         </div>

        </div>

        <div
         className="
         bg-white
         border
         rounded-2xl
         p-5
         "
        >

         <div
          className="
          text-sm
          text-gray-500
          "
         >
          Highest Grade
         </div>

         <div
          className="
          text-3xl
          font-bold
          text-green-600
          mt-2
          "
         >
          {
           analytics.highestGrade
           ?? "-"
          }
         </div>

        </div>

        <div
         className="
         bg-white
         border
         rounded-2xl
         p-5
         "
        >

         <div
          className="
          text-sm
          text-gray-500
          "
         >
          Lowest Grade
         </div>

         <div
          className="
          text-3xl
          font-bold
          text-red-500
          mt-2
          "
         >
          {
           analytics.lowestGrade
           ?? "-"
          }
         </div>

        </div>

       </div>

       <div>

        <h3
         className="
         text-xl
         font-bold
         mb-4
         "
        >

         Recent Submissions

        </h3>

        {

         analytics.assignment
         .submissions
         .length > 0

         ?

         analytics.assignment
         .submissions
         .map(
          submission=>(

           <div

            key={
             submission.id
            }

            className="
            flex
            justify-between
            items-center
            border-b
            py-4
            "

           >

            <div>

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

             <div
              className="
              text-sm
              text-gray-500
              "
             >

              {

               submission
               .submittedAt

               ?

               new Date(
                submission.submittedAt
               )
               .toLocaleDateString()

               :

               ""

              }

             </div>

            </div>

            <div
             className="
             font-bold
             "
            >

             {

              submission.grade
              !== null

              ?

              submission.grade

              :

              "Pending"

             }

            </div>

           </div>

          )
         )

         :

         <div
          className="
          text-gray-500
          "
         >

          No submissions yet

         </div>

        }

       </div>

      </>

     )

    }

   </div>

  </div>

 );

}

export default AssignmentDetailsModal;