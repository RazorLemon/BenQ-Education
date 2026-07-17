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
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
}
from "recharts";

import {
  BarChart3,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  ClockAlert,
  FileText,
  Megaphone
}
from "lucide-react";

import api
from "../api/axios";

import TeacherLayout
from "../layouts/TeacherLayout";

import PageHeader
from "../components/ui/PageHeader";

import LoadingSpinner
from "../components/ui/LoadingSpinner";

import StatCard
from "../components/dashboard/StatCard";

import AcademicCalendar
from "../components/calendar/AcademicCalendar";

function TeacherDashboard() {
  const [stats,setStats] =
    useState(null);

  const [analytics,setAnalytics] =
    useState(null);

  const [trends,setTrends] =
    useState([]);

  const [deadlines,setDeadlines] =
    useState([]);

  const [classes,setClasses] =
    useState([]);

  const [submissions,setSubmissions] =
    useState([]);

  const [announcements,setAnnouncements] =
    useState([]);

  const [dashboardPanel,setDashboardPanel] =
    useState("calendar");

  const [loading,setLoading] =
    useState(true);

  const navigate =
    useNavigate();

  useEffect(()=>{
    const fetchData =
      async ()=>{
        try{
          const [
            dashboardRes,
            analyticsRes,
            trendsRes,
            classesRes,
            submissionsRes,
            deadlinesRes,
            announcementsRes
          ] = await Promise.all([
            api.get("/teacher/dashboard"),
            api.get("/teacher/analytics"),
            api.get("/teacher/analytics/trends"),
            api.get("/teacher/classes"),
            api.get("/teacher/submissions"),
            api.get("/teacher/upcoming-deadlines"),
            api.get("/teacher/announcements")
          ]);

          setStats(dashboardRes.data);
          setAnalytics(analyticsRes.data);
          setTrends(trendsRes.data);
          setClasses(classesRes.data);
          setSubmissions(submissionsRes.data);
          setDeadlines(deadlinesRes.data);
          setAnnouncements(announcementsRes.data);
        }catch(error){
          console.error(error);
        }finally{
          setLoading(false);
        }
      };

    fetchData();
  },[]);

  if(loading){
    return (
      <TeacherLayout title="Dashboard">
        <LoadingSpinner />
      </TeacherLayout>
    );
  }

  const ungradedSubmissions =
    submissions.filter(
      submission=>
        submission.grade === null ||
        submission.grade === undefined
    ).length;

  const overdueDeadlines =
    deadlines.filter(
      deadline=>deadline.isOverdue
    ).length;

  const teacherAverage =
    analytics?.overallAverage || 0;

  return (
    <TeacherLayout title="Dashboard">
      <PageHeader
        title="Teacher Dashboard"
        subtitle="Overview"
      />

      <div className="mb-8 grid gap-6 md:grid-cols-2 xl:grid-cols-5">
        <StatCard
          title="My Subjects"
          value={stats.classes}
          subtitle="Classes you teach"
          icon={BookOpen}
          actionLabel="Open classes"
          onClick={()=>
            navigate("/teacher/classes")
          }
        />

        <StatCard
          title="Assignments"
          value={stats.assignments}
          subtitle="Created across your subjects"
          icon={FileText}
          actionLabel="Manage assignments"
          onClick={()=>
            navigate("/teacher/assignments")
          }
        />

        <StatCard
          title="Needs Grading"
          value={ungradedSubmissions}
          subtitle={`${stats.submissions} total submissions`}
          icon={ClipboardCheck}
          actionLabel="Open submissions"
          onClick={()=>
            navigate("/teacher/submissions")
          }
        />

        <StatCard
          title="Deadline Alerts"
          value={overdueDeadlines}
          subtitle={`${deadlines.length} tracked deadlines`}
          icon={ClockAlert}
          actionLabel="Show calendar"
          onClick={()=>
            setDashboardPanel("calendar")
          }
          active={
            dashboardPanel === "calendar" &&
            overdueDeadlines > 0
          }
        />

        <StatCard
          title="Class Average"
          value={teacherAverage}
          subtitle="Graded submission average"
          icon={BarChart3}
          actionLabel="Open analytics"
          onClick={()=>
            navigate("/teacher/analytics")
          }
        />
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl bg-white p-6 shadow-md">
              <h2 className="mb-4 text-xl font-bold">
                Recent Submissions
              </h2>

              <div className="space-y-4">
                {
                  submissions.slice(0,5).map(
                    submission=>(
                      <div
                        key={submission.id}
                        className="border-b pb-3 last:border-b-0 last:pb-0"
                      >
                        <p className="font-semibold">
                          {submission.student?.user?.name}
                        </p>

                        <p className="text-sm text-gray-500">
                          {submission.assignment?.title}
                        </p>
                      </div>
                    )
                  )
                }

                {
                  submissions.length === 0 && (
                    <p className="text-sm text-gray-500">
                      No recent submissions
                    </p>
                  )
                }
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-md">
              <h2 className="mb-4 text-xl font-bold">
                Upcoming Deadlines
              </h2>

              <div className="space-y-4">
                {
                  deadlines.slice(0,5).map(
                    deadline=>(
                      <div
                        key={deadline.id}
                        className="border-b pb-3 last:border-b-0 last:pb-0"
                      >
                        <p className="font-semibold">
                          {deadline.title}
                        </p>

                        <p className="text-sm text-gray-500">
                          {deadline.className}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          Due: {new Date(deadline.dueDate).toLocaleDateString()}
                        </p>

                        <p
                          className={`
                            mt-1
                            text-xs
                            font-medium
                            ${
                              deadline.isOverdue
                              ? "text-red-500"
                              : "text-green-600"
                            }
                          `}
                        >
                          {
                            deadline.isOverdue
                            ? `Passed ${deadline.daysRemaining} days ago`
                            : `${deadline.daysRemaining} days remaining`
                          }
                        </p>
                      </div>
                    )
                  )
                }

                {
                  deadlines.length === 0 && (
                    <p className="text-sm text-gray-500">
                      No upcoming deadlines
                    </p>
                  )
                }
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-md">
            <h2 className="mb-6 text-xl font-bold">
              Performance Trend
            </h2>

            <ResponsiveContainer
              width="100%"
              height={300}
            >
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="assignment" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="average"
                  stroke="#008C95"
                  strokeWidth={4}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
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
                endpoint="/teacher/calendar"
                createEndpoint="/teacher/calendar"
                compact
              />
            )
            : (
              <div className="space-y-4">
                {
                  announcements.length === 0
                  ? (
                    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6 text-sm text-gray-500">
                      No announcements yet
                    </div>
                  )
                  : announcements.slice(0,6).map(
                    announcement=>(
                      <div
                        key={announcement.id}
                        className="rounded-2xl border border-gray-100 bg-gray-50 p-4"
                      >
                        <p className="font-semibold text-gray-900">
                          {announcement.title}
                        </p>

                        <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                          {announcement.content}
                        </p>

                        <p className="mt-2 text-xs font-semibold text-[#008C95]">
                          {announcement.class?.subject}
                          {" "}
                          ({announcement.class?.name})
                        </p>
                      </div>
                    )
                  )
                }
              </div>
            )
          }
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-xl font-bold">
          My Subjects
        </h2>

        <div className="grid gap-6 md:grid-cols-3">
          {
            classes.map(
              classItem=>(
                <div
                  key={classItem.id}
                  className="rounded-3xl bg-white p-6 shadow-md"
                >
                  <h3 className="text-lg font-bold">
                    {classItem.subject}
                  </h3>

                  <p className="text-gray-500">
                    Class & Section: {classItem.name}
                  </p>

                  <div className="mt-4">
                    <span className="rounded-full bg-teal-100 px-3 py-1 text-sm text-[#008C95]">
                      {classItem.code}
                    </span>
                  </div>
                </div>
              )
            )
          }
        </div>
      </div>
    </TeacherLayout>
  );
}

export default TeacherDashboard;
