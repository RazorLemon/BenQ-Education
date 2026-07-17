import {
 useEffect,
 useState
}
from "react";

import {
 useNavigate
}
from "react-router-dom";

import {
 BarChart3,
 CalendarDays,
 CheckCircle2,
 Clock,
 FileWarning,
 Megaphone
}
from "lucide-react";

import api
from "../api/axios";

import StudentLayout
from "../layouts/StudentLayout";

import PageHeader
from "../components/ui/PageHeader";

import StatCard
from "../components/dashboard/StatCard";

import LoadingSpinner
from "../components/ui/LoadingSpinner";

import AcademicCalendar
from "../components/calendar/AcademicCalendar";

function StudentDashboard(){
 const [data,setData] =
  useState(null);

 const [loading,setLoading] =
  useState(true);

 const [dashboardPanel,setDashboardPanel] =
  useState("calendar");

 const navigate =
  useNavigate();

 useEffect(()=>{
  const fetchDashboard =
   async ()=>{
    try{
     const response =
      await api.get("/student/dashboard");

     setData(response.data);
    }catch(error){
     console.error(error);
    }finally{
     setLoading(false);
    }
   };

  fetchDashboard();
 },[]);

 if(loading){
  return(
   <StudentLayout title="Dashboard">
    <LoadingSpinner />
   </StudentLayout>
  );
 }

 const sortedAssignments =
  [
   ...(data.assignments || [])
  ].sort(
   (a,b)=>
    new Date(a.dueDate) -
    new Date(b.dueDate)
  );

 const now =
  new Date();

 const dueSoonCount =
  sortedAssignments.filter(
   assignment=>{
    const dueDate =
     new Date(assignment.dueDate);

    const daysRemaining =
     (
      dueDate - now
     ) /
     (1000 * 60 * 60 * 24);

    return (
     daysRemaining >= 0 &&
     daysRemaining <= 7
    );
   }
  ).length;

 const overdueCount =
  sortedAssignments.filter(
   assignment=>
    new Date(assignment.dueDate) < now
  ).length;

 return(
  <StudentLayout title="Dashboard">
   <PageHeader
    title="Student Dashboard"
    subtitle="Track your academic progress"
   />

   <div className="mb-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
    <StatCard
     title="Average Grade"
     value={data.averageGrade}
     subtitle="Across graded submissions"
     icon={BarChart3}
     actionLabel="Open grades"
     onClick={()=>
      navigate("/student/grades")
     }
    />

    <StatCard
     title="Due Soon"
     value={dueSoonCount}
     subtitle="Pending within 7 days"
     icon={Clock}
     actionLabel="Review assignments"
     onClick={()=>
      navigate("/student/assignments")
     }
    />

    <StatCard
     title="Submitted"
     value={data.submittedCount}
     subtitle="Completed assignment work"
     icon={CheckCircle2}
     actionLabel="View submissions"
     onClick={()=>
      navigate("/student/assignments")
     }
    />

    <StatCard
     title="Needs Attention"
     value={data.pendingCount}
     subtitle={`${overdueCount} overdue assignments`}
     icon={FileWarning}
     actionLabel="Open pending work"
     onClick={()=>
      navigate("/student/assignments")
     }
    />
   </div>

   <div className="grid gap-6 lg:grid-cols-3">
    <div className="rounded-3xl bg-white p-6 shadow-md lg:col-span-2">
     <h2 className="mb-4 text-xl font-bold">
      Upcoming Assignments
     </h2>

     {
      sortedAssignments.length > 0
      ? sortedAssignments
       .slice(0,8)
       .map(
        assignment=>(
         <div
          key={assignment.id}
          className="border-b py-3 last:border-b-0"
         >
          <div className="font-semibold">
           {assignment.title}
          </div>

          <div className="text-sm text-gray-500">
           Due: {new Date(assignment.dueDate).toLocaleDateString()}
          </div>
         </div>
        )
       )
      : (
       <div className="text-gray-500">
        No pending assignments
       </div>
      )
     }
    </div>

    <div className="min-w-0 rounded-3xl bg-white p-6 shadow-md">
     <div className="mb-5 flex rounded-xl bg-gray-100 p-1">
      <button
       type="button"
       onClick={()=>
        setDashboardPanel("calendar")
       }
       className={`
        flex
        flex-1
        items-center
        justify-center
        gap-2
        rounded-lg
        px-3
        py-2
        text-sm
        font-semibold
        transition
        ${
         dashboardPanel === "calendar"
         ? "bg-[#008C95] text-white shadow-sm"
         : "text-gray-600 hover:bg-white"
        }
       `}
      >
       <CalendarDays size={16} />
       Calendar
      </button>

      <button
       type="button"
       onClick={()=>
        setDashboardPanel("announcements")
       }
       className={`
        flex
        flex-1
        items-center
        justify-center
        gap-2
        rounded-lg
        px-3
        py-2
        text-sm
        font-semibold
        transition
        ${
         dashboardPanel === "announcements"
         ? "bg-[#008C95] text-white shadow-sm"
         : "text-gray-600 hover:bg-white"
        }
       `}
      >
       <Megaphone size={16} />
       Announcements
      </button>
     </div>

     {
      dashboardPanel === "calendar"
      ? (
       <AcademicCalendar
        endpoint="/student/calendar"
        compact
       />
      )
      : (
       <div className="space-y-4">
        {
         data.announcements?.length > 0
         ? data.announcements.map(
          announcement=>(
           <div
            key={announcement.id}
            className="rounded-2xl border border-gray-100 bg-gray-50 p-4"
           >
            <p className="font-semibold text-gray-900">
             {announcement.title}
            </p>

            <p className="mt-1 text-sm text-gray-500">
             {announcement.class?.name}
            </p>
           </div>
          )
         )
         : (
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6 text-sm text-gray-500">
           No announcements
          </div>
         )
        }
       </div>
      )
     }
    </div>
   </div>
  </StudentLayout>
 );
}

export default StudentDashboard;
