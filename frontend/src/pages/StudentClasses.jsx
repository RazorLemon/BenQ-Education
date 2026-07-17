import {
 useEffect,
 useState
}
from "react";

import api
from "../api/axios";

import {
 useNavigate
}
from "react-router-dom";

import StudentLayout
from "../layouts/StudentLayout";

import PageHeader
from "../components/ui/PageHeader";

import LoadingSpinner
from "../components/ui/LoadingSpinner";

function StudentClasses(){

 const [
  classes,
  setClasses
 ] = useState([]);

 const [
  loading,
  setLoading
 ] = useState(true);

 const navigate =
  useNavigate();

 useEffect(()=>{

  const fetchClasses =
   async ()=>{

    try{

     const response =
      await api.get(
       "/student/classes"
      );

     setClasses(
      response.data
     );

    }catch(error){

     console.error(error);

    }finally{

     setLoading(false);

    }

   };

  fetchClasses();

 },[]);

 if(loading){

  return(

   <StudentLayout
    title="Subjects"
   >

    <LoadingSpinner />

   </StudentLayout>

  );

 }

 return(

  <StudentLayout
   title="Subjects"
  >

   <PageHeader

    title="My Subjects"

    subtitle="View enrolled subjects"

   />

   <div
    className="
    grid
    md:grid-cols-2
    lg:grid-cols-3
    gap-6
    "
   >

    {

     classes.map(
      enrollment=>(

       <div

        key={
         enrollment.id
        }

        onClick={()=>{

         navigate(

          `/student/classes/${enrollment.class.id}`

         );

        }}

        className="
        bg-white
        rounded-3xl
        shadow-md
        p-6
        cursor-pointer
        hover:shadow-xl
        transition
        "

       >

        <h2
         className="
         text-xl
         font-bold
         mb-2
         "
        >

         {
          enrollment.class.subject
         }

        </h2>

        <p
         className="
         text-gray-600
         "
        >

         Class & Section: {enrollment.class.name}

        </p>

        <p
         className="
         text-sm
         text-gray-500
         mt-3
         "
        >

         Teacher:

         {" "}

         {
          enrollment.class
          .teacher
          ?.user
          ?.name
         }

        </p>

       </div>

      )
     )

    }

   </div>

  </StudentLayout>

 );

}

export default StudentClasses;
