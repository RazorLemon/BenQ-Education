import {
 useEffect,
 useState
}
from "react";

import api
from "../api/axios";

import StudentLayout
from "../layouts/StudentLayout";

import PageHeader
from "../components/ui/PageHeader";

import LoadingSpinner
from "../components/ui/LoadingSpinner";

function StudentAssignments(){

 const [
  assignments,
  setAssignments
 ] = useState([]);

 const [
  submissions,
  setSubmissions
 ] = useState([]);

 const [
  loading,
  setLoading
 ] = useState(true);

 const [
  search,
  setSearch
 ] = useState("");

 useEffect(()=>{

  const fetchData =
   async ()=>{

    try{

     const [
      assignmentsResponse,
      submissionsResponse
     ] = await Promise.all([

      api.get(
       "/student/assignments"
      ),

      api.get(
       "/student/submissions"
      )

     ]);

     setAssignments(
      assignmentsResponse.data
     );

     setSubmissions(
      submissionsResponse.data
     );

    }catch(error){

     console.error(error);

    }finally{

     setLoading(false);

    }

   };

  fetchData();

 },[]);

 if(loading){

  return(

   <StudentLayout
    title="Assignments"
   >

    <LoadingSpinner />

   </StudentLayout>

  );

 }

 const filteredAssignments =

  assignments.filter(
   assignment=>

    assignment.title
    .toLowerCase()
    .includes(
     search.toLowerCase()
    )

    ||

    assignment.class?.name
    ?.toLowerCase()
    .includes(
     search.toLowerCase()
    )
  );

 return(

  <StudentLayout
   title="Assignments"
  >

   <PageHeader

    title="Assignments"

    subtitle="View all assignments"

   />

   <div
    className="
    bg-white
    rounded-3xl
    shadow-md
    p-5
    mb-6
    "
   >

    <input

     value={search}

     onChange={(e)=>

      setSearch(
       e.target.value
      )

     }

     placeholder="Search assignments..."

     className="
     w-full
     border
     rounded-xl
     px-4
     py-3
     "

    />

   </div>

   <div
    className="
    grid
    lg:grid-cols-2
    gap-6
    "
   >

    {

     filteredAssignments.map(
      assignment=>{

       const submission =

        submissions.find(
         s=>

          s.assignmentId ===
          assignment.id

        );

       return(

        <div

         key={
          assignment.id
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
          mb-3
          "
         >

          <h2
           className="
           text-xl
           font-bold
           "
          >

           {
            assignment.title
           }

          </h2>

          {

           submission

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

            Submitted

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

            Pending

           </span>

          }

         </div>

         <div
          className="
          text-sm
          text-[#008C95]
          font-medium
          mb-2
          "
         >

          {
           assignment.class?.name
          }

         </div>

         {

          assignment.description &&

          <p
           className="
           text-gray-700
           mb-4
           "
          >

           {
            assignment.description
           }

          </p>

         }

         <div
          className="
          text-sm
          text-gray-500
          mb-3
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
           text-[#008C95]
           underline
           block
           mb-4
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

         {

          submission?.grade !==
          null

          &&

          submission?.grade !==
          undefined

          &&

          <div
           className="
           mb-2
           "
          >

           <span
            className="
            font-semibold
            "
           >

            Grade:

           </span>

           {" "}

           {
            submission.grade
           }

          </div>

         }

         {

          submission?.feedback &&

          <div
           className="
           text-sm
           text-gray-600
           "
          >

           <span
            className="
            font-semibold
            "
           >

            Feedback:

           </span>

           {" "}

           {
            submission.feedback
           }

          </div>

         }

        </div>

       );

      }
     )

    }

   </div>

  </StudentLayout>

 );

}

export default StudentAssignments;
