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

function StudentAnnouncements(){

 const [
  announcements,
  setAnnouncements
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

  const fetchAnnouncements =
   async ()=>{

    try{

     const response =
      await api.get(
       "/student/announcements"
      );

     setAnnouncements(
      response.data
     );

    }catch(error){

     console.error(error);

    }finally{

     setLoading(false);

    }

   };

  fetchAnnouncements();

 },[]);

 if(loading){

  return(

   <StudentLayout
    title="Announcements"
   >

    <LoadingSpinner />

   </StudentLayout>

  );

 }

 const filteredAnnouncements =

  announcements.filter(
   announcement=>

    announcement.title
    .toLowerCase()
    .includes(
     search.toLowerCase()
    )

    ||

    announcement.content
    .toLowerCase()
    .includes(
     search.toLowerCase()
    )

    ||

    announcement.class?.name
    ?.toLowerCase()
    .includes(
     search.toLowerCase()
    )
  );

 return(

  <StudentLayout
   title="Announcements"
  >

   <PageHeader

    title="Announcements"

    subtitle="Stay updated with your classes"

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

     placeholder="Search announcements..."

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
    space-y-5
    "
   >

    {

     filteredAnnouncements.length > 0

     ?

     filteredAnnouncements.map(
      announcement=>(

       <div

        key={
         announcement.id
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

         <div>

          <h2
           className="
           text-xl
           font-bold
           "
          >

           {
            announcement.title
           }

          </h2>

          <div
           className="
           text-sm
           text-[#008C95]
           font-medium
           mt-1
           "
          >

           {
            announcement.class
            ?.name
           }

          </div>

         </div>

         <div
          className="
          text-xs
          text-gray-500
          "
         >

          {

           new Date(
            announcement.createdAt
           )
           .toLocaleDateString()

          }

         </div>

        </div>

        <p
         className="
         text-gray-700
         leading-relaxed
         "
        >

         {
          announcement.content
         }

        </p>

       </div>

      )
     )

     :

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

      No announcements found

     </div>

    }

   </div>

  </StudentLayout>

 );

}

export default StudentAnnouncements;