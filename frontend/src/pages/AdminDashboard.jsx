import {
  useEffect,
  useState
}
from "react";

import {
  useNavigate
}
from "react-router-dom";

import AdminLayout
from "../layouts/AdminLayout";

import PageHeader
from "../components/ui/PageHeader";

import StatCard
from "../components/dashboard/StatCard";

import PerformanceChart
from "../components/Charts/PerformanceChart";

import LoadingSpinner
from "../components/ui/LoadingSpinner";

import api
from "../api/axios";

import QuickActions
from "../components/dashboard/QuickActions";

import Button
from "../components/ui/Button";

import CreateAnnouncementModal
from "../components/admin/CreateAnnouncementModal";

import AcademicCalendar
from "../components/calendar/AcademicCalendar";

import {
  BarChart3,
  CalendarDays,
  GraduationCap,
  Megaphone,
  School,
  Users,
  UserRoundCheck
}
from "lucide-react";

function AdminDashboard() {

  const [stats,setStats] =
    useState(null);

  const [loading,setLoading] =
    useState(true);

  const [announcementOpen,setAnnouncementOpen] =
    useState(false);

  const [dashboardPanel,setDashboardPanel] =
    useState("calendar");

  const navigate =
    useNavigate();

  const fetchDashboard =
    async ()=>{

      try{

        const response =
          await api.get(
            "/admin/dashboard"
          );

        setStats(
          response.data
        );

      }catch(error){

        console.error(error);

      }finally{

        setLoading(false);

      }

    };

  useEffect(()=>{

    fetchDashboard();

  },[]);

  if(loading){

    return (
      <AdminLayout title="Dashboard">
        <LoadingSpinner />
      </AdminLayout>
    );

  }

  const performanceTrend =
    Array.isArray(
      stats.performanceTrend
    )
    ? stats.performanceTrend
    : [];

  const recentAnnouncements =
    Array.isArray(
      stats.recentAnnouncements
    )
    ? stats.recentAnnouncements
    : [];

  const schoolAverage =
    performanceTrend.length
      ? performanceTrend[
          performanceTrend.length - 1
        ].score
      : 0;

  return (

    <AdminLayout
      title="Dashboard"
    >

      <PageHeader
        title="Welcome Back"
        subtitle="School performance overview"
      />

      <div
        className="
        grid
        md:grid-cols-2
        xl:grid-cols-5
        gap-6
        mb-8
        "
      >

        <StatCard
          title="School Average"
          value={schoolAverage}
          subtitle="Latest graded performance"
          icon={BarChart3}
          actionLabel="Open analytics"
          onClick={()=>
            navigate("/admin/analytics")
          }
        />

        <StatCard
          title="Students"
          value={stats.students}
          subtitle="Enrolled learner records"
          icon={GraduationCap}
          actionLabel="Review students"
          onClick={()=>
            navigate("/admin/students")
          }
        />

        <StatCard
          title="Teachers"
          value={stats.teachers}
          subtitle="Active teaching staff"
          icon={UserRoundCheck}
          actionLabel="Review teachers"
          onClick={()=>
            navigate("/admin/teachers")
          }
        />

        <StatCard
          title="Class Subjects"
          value={stats.classes}
          subtitle="Managed class sections"
          icon={School}
          actionLabel="Review classes"
          onClick={()=>
            navigate("/admin/classes")
          }
        />

        <StatCard
          title="Submissions"
          value={stats.submissions}
          subtitle={`${stats.assignments} assignments created`}
          icon={Users}
          actionLabel="Open assignments"
          onClick={()=>
            navigate("/admin/assignments")
          }
        />

      </div>

      <div
  className="
  grid
  grid-cols-3
  gap-6
  mb-6
  "
>

  <div className="col-span-2">

    <PerformanceChart
      key={`performance-${
        stats.submissions
      }-${
        performanceTrend.length
      }`}
      data={
        performanceTrend
      }
    />

  </div>

    <div
    className="
    bg-white
    rounded-2xl
    p-6
    shadow-md
    min-w-0
    "
  >

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
          endpoint="/admin/calendar"
          createEndpoint="/admin/calendar"
          allowCreate
          compact
        />
      )
      : (
        <>
          <div className="mb-5">
            <Button
              onClick={()=>
                setAnnouncementOpen(true)
              }
              className="
              w-full
              justify-center
              "
            >
              Create Announcement
            </Button>
          </div>

          <div className="space-y-4">
      {
        recentAnnouncements.length === 0
        ? (
          <div
            className="
            text-sm
            text-gray-500
            py-6
            "
          >
            No announcements yet
          </div>
        )
        : recentAnnouncements.map(
          announcement=>(
            <div
              key={announcement.id}
              className="
              border-b
              border-gray-100
              pb-4
              last:border-b-0
              last:pb-0
              "
            >
              <div
                className="
                flex
                items-start
                gap-3
                "
              >
                <div
                  className="
                  bg-teal-100
                  text-[#008C95]
                  p-2
                  rounded-full
                  "
                >
                  <Megaphone size={16} />
                </div>

                <div className="min-w-0 flex-1">
                  <p
                    className="
                    font-semibold
                    text-gray-900
                    "
                  >
                    {announcement.title}
                  </p>

                  <p
                    className="
                    text-sm
                    text-gray-600
                    line-clamp-2
                    mt-1
                    "
                  >
                    {announcement.content}
                  </p>

                  <div
                    className="
                    flex
                    flex-wrap
                    items-center
                    gap-2
                    text-xs
                    text-gray-500
                    mt-2
                    "
                  >
                    <School size={13} />

                    <span>
                      {announcement.class?.subject}
                      {" "}
                      ({announcement.class?.name})
                    </span>

                    <span>
                      {new Date(
                        announcement.createdAt
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )
        )
      }
          </div>
        </>
      )
    }

  </div>

</div>

<QuickActions />

<CreateAnnouncementModal
  open={announcementOpen}
  onClose={()=>
    setAnnouncementOpen(false)
  }
  onSuccess={
    fetchDashboard
  }
/>

    </AdminLayout>

  );

}

export default AdminDashboard;
