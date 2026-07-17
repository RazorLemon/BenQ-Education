import {
  useEffect,
  useState
}
from "react";

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

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
}
from "recharts";

import {
  Award,
  BarChart3,
  BookOpen,
  ClipboardCheck,
  FileWarning,
  Send,
  School,
  Users
}
from "lucide-react";

import {
  formatAcademicSession
}
from "../utils/academicSession";

function ChartCard({
  title,
  id,
  children
}) {
  return (
    <div
      id={id}
      className="bg-white rounded-2xl shadow-md p-6 scroll-mt-24"
    >
      <h2 className="text-xl font-bold mb-6">
        {title}
      </h2>
      <div className="h-[350px]">
        {children}
      </div>
    </div>
  );
}

function EmptyChart(){
  return (
    <div className="h-full flex items-center justify-center text-sm text-gray-500">
      No graded data available
    </div>
  );
}

const formatDate =
  (value)=>
    value
      ? new Date(value).toLocaleDateString()
      : "-";

function TeacherAnalytics() {

  const [data,setData] =
    useState(null);

  const [loading,setLoading] =
    useState(true);

  const [filters,setFilters] =
    useState({
      year:"all",
      subject:"all",
      classId:"all",
      studentId:"all"
    });

  useEffect(()=>{

    const fetchAnalytics =
      async ()=>{

        try{

          setLoading(true);

          const response =
            await api.get(
              "/teacher/analytics",
              {
                params:filters
              }
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

    fetchAnalytics();

  },[filters]);

  const updateFilter =
    (key,value)=>{
      setFilters(
        previous=>{
          const next = {
            ...previous,
            [key]:value
          };

          if(
            key === "year" ||
            key === "subject"
          ){
            next.classId = "all";
            next.studentId = "all";
          }

          if(key === "classId"){
            next.studentId = "all";
          }

          return next;
        }
      );
    };

  const scrollToSection =
    (id)=>{
      document
        .getElementById(id)
        ?.scrollIntoView({
          behavior:"smooth",
          block:"start"
        });
    };

  if(loading && !data){

    return (

      <TeacherLayout title="Analytics">
        <LoadingSpinner />
      </TeacherLayout>

    );

  }

  const options =
    data?.filterOptions || {
      sessions:[],
      subjects:[],
      classes:[],
      students:[]
    };

  const classOptions =
    options.classes.filter((classItem)=>{
      const matchesYear =
        filters.year === "all" ||
        String(classItem.year) ===
        filters.year;

      const matchesSubject =
        filters.subject === "all" ||
        classItem.subject ===
        filters.subject;

      return (
        matchesYear &&
        matchesSubject
      );
    });

  const filteredClassIds =
    filters.classId !== "all"
      ? [filters.classId]
      : classOptions.map(
          classItem=>classItem.id
        );

  const studentOptions =
    options.students.filter((student)=>{
      const classIds =
        student.classIds || [];

      if(!filteredClassIds.length){
        return false;
      }

      return classIds.some(
        classId=>
          filteredClassIds.includes(classId)
      );
    });

  const assignmentPerformance =
    data?.assignmentPerformance || [];

  const classPerformance =
    data?.classPerformance || [];

  const studentPerformance =
    data?.studentPerformance || [];

  const assignmentSummary =
    data?.assignmentSubmissionSummary || {
      expectedSubmissionCount:0,
      submittedCount:0,
      notSubmittedCount:0,
      pendingCount:0,
      missedDeadlineCount:0,
      lateSubmissionCount:0,
      assignmentDetails:[]
    };

  return (

    <TeacherLayout title="Analytics">

      <PageHeader
        title="Analytics"
        subtitle="Assignment, subject, student, and aggregate performance across your subjects"
      />

      <div className="bg-white rounded-2xl shadow-md p-4 mb-8 grid md:grid-cols-4 gap-3">
        <select
          value={filters.year}
          onChange={(event)=>
            updateFilter(
              "year",
              event.target.value
            )
          }
          className="border rounded-xl px-4 py-3 bg-white"
        >
          <option value="all">
            All Sessions
          </option>
          {options.sessions.map(
            year=>(
              <option
                key={year}
                value={year}
              >
                {formatAcademicSession(year)}
              </option>
            )
          )}
        </select>

        <select
          value={filters.subject}
          onChange={(event)=>
            updateFilter(
              "subject",
              event.target.value
            )
          }
          className="border rounded-xl px-4 py-3 bg-white"
        >
          <option value="all">
            All Subjects
          </option>
          {options.subjects.map(
            subject=>(
              <option
                key={subject}
                value={subject}
              >
                {subject}
              </option>
            )
          )}
        </select>

        <select
          value={filters.classId}
          onChange={(event)=>
            updateFilter(
              "classId",
              event.target.value
            )
          }
          className="border rounded-xl px-4 py-3 bg-white"
        >
          <option value="all">
            All Class & Sections
          </option>
          {classOptions.map(
            classItem=>(
              <option
                key={classItem.id}
                value={classItem.id}
              >
                {classItem.label}
              </option>
            )
          )}
        </select>

        <select
          value={filters.studentId}
          onChange={(event)=>
            updateFilter(
              "studentId",
              event.target.value
            )
          }
          className="border rounded-xl px-4 py-3 bg-white"
        >
          <option value="all">
            All Students
          </option>
          {studentOptions.map(
            student=>(
              <option
                key={student.id}
                value={student.id}
              >
                {student.name} ({student.rollNumber})
              </option>
            )
          )}
        </select>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Teacher Average"
          value={data?.teacherPerformance?.average || 0}
          subtitle="Average across filtered graded work"
          icon={BarChart3}
          actionLabel="View class performance"
          onClick={()=>
            scrollToSection("teacher-class-performance")
          }
        />
        <StatCard
          title="Highest Grade"
          value={data?.highestGrade || 0}
          subtitle="Best score in this view"
          icon={Award}
          actionLabel="View student rankings"
          onClick={()=>
            scrollToSection("teacher-student-rankings")
          }
        />
        <StatCard
          title="Subjects"
          value={data?.teacherPerformance?.subjects || 0}
          subtitle="Filtered subjects/classes"
          icon={BookOpen}
          actionLabel="View subject aggregate"
          onClick={()=>
            scrollToSection("teacher-aggregate")
          }
        />
        <StatCard
          title="Graded Submissions"
          value={data?.teacherPerformance?.gradedSubmissions || 0}
          subtitle="Submissions with marks"
          icon={ClipboardCheck}
          actionLabel="View assignment details"
          onClick={()=>
            scrollToSection("teacher-assignment-details")
          }
        />
      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Assignments Expected"
          value={assignmentSummary.expectedSubmissionCount}
          subtitle="Required submissions for this scope"
          icon={School}
          actionLabel="View details"
          onClick={()=>
            scrollToSection("teacher-assignment-details")
          }
        />
        <StatCard
          title="Submitted"
          value={assignmentSummary.submittedCount}
          subtitle="Work received from students"
          icon={Send}
          actionLabel="View details"
          onClick={()=>
            scrollToSection("teacher-assignment-details")
          }
        />
        <StatCard
          title="Not Submitted"
          value={assignmentSummary.notSubmittedCount}
          subtitle="Still pending or missed"
          icon={Users}
          actionLabel="View details"
          onClick={()=>
            scrollToSection("teacher-assignment-details")
          }
        />
        <StatCard
          title="Deadlines Missed"
          value={assignmentSummary.missedDeadlineCount}
          subtitle="Past-due missing work"
          icon={FileWarning}
          actionLabel="View details"
          onClick={()=>
            scrollToSection("teacher-assignment-details")
          }
        />
      </div>

      <div
        id="teacher-assignment-details"
        className="bg-white rounded-2xl shadow-md p-6 mb-8 scroll-mt-24"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div>
            <h2 className="text-xl font-bold">
              Assignment Submission Details
            </h2>
            <p className="text-sm text-gray-500">
              Submitted, pending, missed, and late assignment activity for the selected class and student scope.
            </p>
          </div>
          <div className="flex gap-3 text-sm">
            <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700">
              Pending: {assignmentSummary.pendingCount}
            </span>
            <span className="px-3 py-1 rounded-full bg-red-50 text-red-700">
              Late: {assignmentSummary.lateSubmissionCount}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b text-gray-500">
                <th className="py-3 pr-4">
                  Assignment
                </th>
                <th className="py-3 pr-4">
                  Class
                </th>
                {filters.studentId !== "all" && (
                  <th className="py-3 pr-4">
                    Student
                  </th>
                )}
                <th className="py-3 pr-4">
                  Due
                </th>
                {filters.studentId === "all" ? (
                  <>
                    <th className="py-3 pr-4">
                      Submitted
                    </th>
                    <th className="py-3 pr-4">
                      Not Submitted
                    </th>
                    <th className="py-3 pr-4">
                      Missed
                    </th>
                    <th className="py-3 pr-4">
                      Average
                    </th>
                  </>
                ) : (
                  <>
                    <th className="py-3 pr-4">
                      Status
                    </th>
                    <th className="py-3 pr-4">
                      Submitted On
                    </th>
                    <th className="py-3 pr-4">
                      Grade
                    </th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {assignmentSummary.assignmentDetails.map(
                item=>(
                  <tr
                    key={item.id}
                    className="border-b last:border-0"
                  >
                    <td className="py-3 pr-4 font-medium text-gray-800">
                      {item.assignmentTitle}
                    </td>
                    <td className="py-3 pr-4 text-gray-600">
                      {item.subject} ({item.classSection})
                    </td>
                    {filters.studentId !== "all" && (
                      <td className="py-3 pr-4 text-gray-600">
                        {item.studentName} ({item.rollNumber})
                      </td>
                    )}
                    <td className="py-3 pr-4 text-gray-600">
                      {formatDate(item.dueDate)}
                    </td>
                    {filters.studentId === "all" ? (
                      <>
                        <td className="py-3 pr-4">
                          {item.submittedCount}/{item.expectedCount}
                        </td>
                        <td className="py-3 pr-4">
                          {item.notSubmittedCount}
                        </td>
                        <td className="py-3 pr-4 text-red-600">
                          {item.missedDeadlineCount}
                        </td>
                        <td className="py-3 pr-4">
                          {item.averageGrade}
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-3 pr-4">
                          <span
                            className={
                              item.status === "Submitted"
                                ? "px-3 py-1 rounded-full bg-emerald-50 text-emerald-700"
                                : item.status === "Late"
                                  ? "px-3 py-1 rounded-full bg-orange-50 text-orange-700"
                                  : item.status === "Missed"
                                    ? "px-3 py-1 rounded-full bg-red-50 text-red-700"
                                    : "px-3 py-1 rounded-full bg-amber-50 text-amber-700"
                            }
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-gray-600">
                          {formatDate(item.submittedAt)}
                        </td>
                        <td className="py-3 pr-4">
                          {item.grade ?? "-"}
                        </td>
                      </>
                    )}
                  </tr>
                )
              )}
              {assignmentSummary.assignmentDetails.length === 0 && (
                <tr>
                  <td
                    colSpan={filters.studentId === "all" ? 8 : 7}
                    className="py-8 text-center text-gray-500"
                  >
                    No assignment data available for these filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid xl:grid-cols-2 gap-8">
        <ChartCard
          id="teacher-class-performance"
          title="Subject / Class Performance"
        >
          {
            classPerformance.length
            ? (
              <ResponsiveContainer>
                <BarChart data={classPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="className" />
                  <YAxis domain={[0,100]} />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="average"
                    name="Average"
                    fill="#008C95"
                    radius={[8,8,0,0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )
            : <EmptyChart />
          }
        </ChartCard>

        <ChartCard
          id="teacher-assignment-performance"
          title="Assignment Performance"
        >
          {
            assignmentPerformance.length
            ? (
              <ResponsiveContainer>
                <LineChart data={assignmentPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="assignmentTitle" />
                  <YAxis domain={[0,100]} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="average"
                    name="Assignment Avg"
                    stroke="#008C95"
                    strokeWidth={4}
                  />
                  <Line
                    type="monotone"
                    dataKey="highest"
                    name="Highest"
                    stroke="#22C55E"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            )
            : <EmptyChart />
          }
        </ChartCard>

        <ChartCard
          id="teacher-student-rankings"
          title="Student Rankings"
        >
          {
            studentPerformance.length
            ? (
              <ResponsiveContainer>
                <BarChart
                  layout="vertical"
                  data={[
                    ...studentPerformance
                  ].sort(
                    (a,b)=>b.average - a.average
                  )}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    type="number"
                    domain={[0,100]}
                  />
                  <YAxis
                    type="category"
                    dataKey="studentName"
                    width={130}
                  />
                  <Tooltip />
                  <Bar
                    dataKey="average"
                    fill="#008C95"
                    radius={[0,8,8,0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )
            : <EmptyChart />
          }
        </ChartCard>

        <ChartCard
          id="teacher-aggregate"
          title="Teacher Aggregate"
        >
          {
            classPerformance.length
            ? (
              <ResponsiveContainer>
                <BarChart data={classPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="subject" />
                  <YAxis domain={[0,100]} />
                  <Tooltip />
                  <Bar
                    dataKey="average"
                    name="Subject Average"
                    fill="#64748B"
                    radius={[8,8,0,0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )
            : <EmptyChart />
          }
        </ChartCard>
      </div>

    </TeacherLayout>

  );

}

export default TeacherAnalytics;
