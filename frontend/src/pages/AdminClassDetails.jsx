
import {
  useEffect,
  useState
}
from "react";

import {
  useParams
}
from "react-router-dom";

import {
  BarChart3,
  BookOpen,
  UserRoundCheck,
  Users
}
from "lucide-react";

import api
from "../api/axios";

import AdminLayout
from "../layouts/AdminLayout";

import LoadingSpinner
from "../components/ui/LoadingSpinner";

import PageHeader
from "../components/ui/PageHeader";

import StatCard
from "../components/dashboard/StatCard";

import EnrollStudentModal
from "../components/admin/EnrollStudentModal";

function AdminClassDetails() {

 const { id } =
  useParams();

 const [data,setData] =
  useState(null);

 const [loading,setLoading] =
  useState(true);

 const [
  enrollModalOpen,
  setEnrollModalOpen
 ] = useState(false);

 useEffect(()=>{

  const fetchData =
   async ()=>{

    try{

     const response =
      await api.get(
       `/admin/classes/${id}`
      );

     setData(
      response.data
     );

    }catch(error){

     console.error(error);

    }finally{

     setLoading(false);

    }

   };

  fetchData();

 },[id]);

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

   <AdminLayout>

    <LoadingSpinner />

   </AdminLayout>

  );

 }

 if(!data){

  return(

   <AdminLayout>

    <div className="p-8">
     Failed to load class
    </div>

   </AdminLayout>

  );

 }

 return(

  <>

   <AdminLayout>

    <PageHeader

     title={
      data.class.subject
     }

     subtitle={
      `Class & Section: ${data.class.name}`
     }

     backTo="/admin/classes"

     backLabel="Back to subjects"

    />

    <div
     className="
     grid
     md:grid-cols-4
     gap-6
     mb-8
     "
    >

     <StatCard
      title="Students"
      value={
       data.studentCount
      }
      subtitle="Students enrolled in this class"
      icon={Users}
      actionLabel="View students"
      onClick={()=>
       scrollToSection("admin-class-students")
      }
     />

     <StatCard
      title="Assignments"
      value={
       data.assignmentCount
      }
      subtitle="Assignments created for this class"
      icon={BookOpen}
      actionLabel="View assignments"
      onClick={()=>
       scrollToSection("admin-class-assignments")
      }
     />

     <StatCard
      title="Average Grade"
      value={
       data.averageGrade
      }
      subtitle="Class graded average"
      icon={BarChart3}
      actionLabel="Open analytics"
      onClick={()=>
       scrollToSection("admin-class-assignments")
      }
     />

     <StatCard
      title="Teacher"
      value={
       1
      }
      subtitle={
       data.class.teacher
       ?.user?.name || "Assigned teacher"
      }
      icon={UserRoundCheck}
      actionLabel="View teacher context"
      onClick={()=>
       scrollToSection("admin-class-students")
      }
     />

    </div>

    <div
     id="admin-class-students"
     className="
     bg-white
     rounded-3xl
     shadow-md
     p-6
     mb-8
     scroll-mt-24
     "
    >

     <div
      className="
      flex
      justify-between
      items-center
      mb-4
      "
     >

      <h2
       className="
       text-xl
       font-bold
       "
      >
       Students
      </h2>

      <button

       onClick={()=>
        setEnrollModalOpen(
         true
        )
       }

       className="
       bg-[#008C95]
       text-white
       px-4
       py-2
       rounded-xl
       "

      >

       + Enroll Student

      </button>

     </div>

     {

      data.class
      .enrollments
      .map(
       enrollment=>(

        <div

         key={
          enrollment.id
         }

         className="
         border-b
         py-3
         "

        >

         <div className="font-semibold">
          {
           enrollment
           .student
           .user
           .name
          }
         </div>

         <div className="text-sm text-gray-500">
          Roll Number:
          {" "}
          {
           enrollment
           .student
           .rollNumber
          }
          {" "}
          |
          {" "}
          Class & Section:
          {" "}
          {
           enrollment
           .student
           .classSection ||
           "Not set"
          }
         </div>

        </div>

       )
      )

     }

    </div>

    <div
     id="admin-class-assignments"
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

      data.class
      .assignments
      .map(
       assignment=>(

        <div

         key={
          assignment.id
         }

         className="
         border-b
         py-3
         "

        >

         <div
          className="
          font-semibold
          "
         >
          {
           assignment.title
          }
         </div>

         <div
          className="
          text-sm
          text-gray-500
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

        </div>

       )
      )

     }

    </div>

   </AdminLayout>

   <EnrollStudentModal

    open={
     enrollModalOpen
    }

    onClose={()=>
     setEnrollModalOpen(
      false
     )
    }

    classId={
     id
    }

    onSuccess={()=>
     window.location.reload()
    }

   />

  </>

 );

}

export default AdminClassDetails;
