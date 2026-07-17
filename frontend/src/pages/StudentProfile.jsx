import {
 useEffect,
 useState
}
from "react";

import {
 useNavigate
}
from "react-router-dom";

import api
from "../api/axios";

import StudentLayout
from "../layouts/StudentLayout";

import PageHeader
from "../components/ui/PageHeader";

import LoadingSpinner
from "../components/ui/LoadingSpinner";

function StudentProfile(){

 const navigate =
  useNavigate();

 const [
  profile,
  setProfile
 ] = useState(null);

 const [
  loading,
  setLoading
 ] = useState(true);

 useEffect(()=>{

  const fetchProfile =
   async ()=>{

    try{

     const response =
      await api.get(
       "/student/profile"
      );

     setProfile(
      response.data
     );

    }catch(error){

     console.error(error);

    }finally{

     setLoading(false);

    }

   };

  fetchProfile();

 },[]);

 if(loading){

  return(

   <StudentLayout
    title="Profile"
   >

    <LoadingSpinner />

   </StudentLayout>

  );

 }

 return(

  <StudentLayout
   title="Profile"
  >

   <PageHeader

    title="My Profile"

    subtitle="Manage your account"

   />

   <div
    className="
    grid
    md:grid-cols-3
    lg:grid-cols-4
    gap-6
    mb-8
    "
   >

    <div
     className="
     bg-white
     rounded-3xl
     shadow-md
     p-6
     "
    >

     <div
      className="
      text-gray-500
      text-sm
      "
     >
      Subjects Enrolled
     </div>

     <div
      className="
      text-3xl
      font-bold
      mt-2
      "
     >
      {
       profile.classCount
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

     <div
      className="
      text-gray-500
      text-sm
      "
     >
      Class & Section
     </div>

     <div
      className="
      text-3xl
      font-bold
      mt-2
      "
     >
      {
       profile.classSection ||
       "Not set"
      }
     </div>

    </div>

   </div>

    <div
     className="
     bg-white
     rounded-3xl
     shadow-md
     p-6
     "
    >

     <div
      className="
      text-gray-500
      text-sm
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
       profile.averageGrade
      }
     </div>

    </div>

    <div
     className="
     bg-white
     rounded-3xl
     shadow-md
     p-6
     "
    >

     <div
      className="
      text-gray-500
      text-sm
      "
     >
      Roll Number
     </div>

     <div
      className="
      text-3xl
      font-bold
      mt-2
      "
     >
      {
       profile.rollNumber
      }
     </div>

    </div>

   </div>

   <div
    className="
    bg-white
    rounded-3xl
    shadow-md
    p-8
    "
   >

    <div
     className="
     flex
     items-center
     gap-5
     mb-8
     "
    >

     <div
      className="
      h-20
      w-20
      rounded-full
      bg-[#008C95]
      text-white
      flex
      items-center
      justify-center
      text-3xl
      font-bold
      "
     >

      {
       profile.name
       ?.charAt(0)
      }

     </div>

     <div>

      <h2
       className="
       text-2xl
       font-bold
       "
      >

       {
        profile.name
       }

      </h2>

      <p
       className="
       text-gray-500
       "
      >

       Student

      </p>

     </div>

    </div>

    <div
     className="
     space-y-5
     "
    >

     <div>

      <div
       className="
       text-sm
       text-gray-500
       "
      >
       Full Name
      </div>

      <div
       className="
       font-medium
       "
      >
       {
        profile.name
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
       Email
      </div>

      <div
       className="
       font-medium
       "
      >
       {
        profile.email
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
       Roll Number
      </div>

      <div
       className="
       font-medium
       "
      >
       {
        profile.rollNumber
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
       Class & Section
      </div>

      <div
       className="
       font-medium
       "
      >
       {
        profile.classSection ||
        "Not set"
       }
      </div>

     </div>

     <button

      onClick={()=>{

       navigate(
        "/change-password"
       );

      }}

      className="
      mt-6
      bg-[#008C95]
      text-white
      px-6
      py-3
      rounded-xl
      "

     >

      Change Password

     </button>

    </div>

   </div>

  </StudentLayout>

 );

}

export default StudentProfile;
