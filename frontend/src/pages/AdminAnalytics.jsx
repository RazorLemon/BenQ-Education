import {
  useEffect,
  useState
}
from "react";

import api
from "../api/axios";

import AdminLayout
from "../layouts/AdminLayout";

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
  School,
  Send
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

function AdminAnalytics() {

  const [data,setData] =
    useState(null);

  const [loading,setLoading] =
    useState(true);

  const [filters,setFilters] =
    useState({
      year:"all",
      teacherId:"all",
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
              "/admin/analytics",
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
            key === "teacherId" ||
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

      <AdminLayout title="Analytics">
        <LoadingSpinner />
      </AdminLayout>

    );

  }

  const options =
    data?.filterOptions || {
      sessions:[],
      teachers:[],
      classes:[],
      subjects:[],
      students:[]
    };

  const classOptions =
    options.classes.filter((classItem)=>{
      const matchesYear =
        filters.year === "all" ||
        String(classItem.year) ===
        filters.year;

      const matchesTeacher =
        filters.teacherId === "all" ||
        classItem.teacherId ===
        filters.teacherId;

      const matchesSubject =
        filters.subject === "all" ||
        classItem.subject ===
        filters.subject;

      return (
        matchesYear &&
        matchesTeacher &&
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

  const classPerformance =
    data?.classPerformance || [];

  const teacherPerformance =
    data?.teacherPerformance || [];

  const subjectPerformance =
    data?.subjectPerformance || [];

  const studentPerformance =
    data?.studentPerformance || [];

  const assignmentPerformance =
    data?.assignmentPerformance || [];

  return (

    <AdminLayout title="Analytics">

      <PageHeader
        title="Institution Analytics"
        subtitle="Filter from institution level down to teacher, class, subject, and student performance"
      />

      <div className="bg-white rounded-2xl shadow-md p-4 mb-8 grid md:grid-cols-5 gap-3">
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
          value={filters.teacherId}
          onChange={(event)=>
            updateFilter(
              "teacherId",
              event.target.value
            )
          }
          className="border rounded-xl px-4 py-3 bg-white"
        >
          <option value="all">
            All Teachers
          </option>
          {options.teachers.map(
            teacher=>(
              <option
                key={teacher.id}
                value={teacher.id}
              >
                {teacher.name}
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
          title="Institution Average"
          value={data?.overallAverage || 0}
          subtitle="Average across filtered graded submissions"
          icon={BarChart3}
          actionLabel="View assignment trend"
          onClick={()=>
            scrollToSection("admin-assignment-trend")
          }
        />
        <StatCard
          title="Highest Grade"
          value={data?.highestGrade || 0}
          subtitle="Best result in the current filter"
          icon={Award}
          actionLabel="View student rankings"
          onClick={()=>
            scrollToSection("admin-student-rankings")
          }
        />
        <StatCard
          title="Classes"
          value={data?.selectedClasses || 0}
          subtitle="Classes included in this view"
          icon={School}
          actionLabel="View class performance"
          onClick={()=>
            scrollToSection("admin-class-performance")
          }
        />
        <StatCard
          title="Graded Submissions"
          value={data?.totalSubmissions || 0}
          subtitle="Submissions used for analytics"
          icon={Send}
          actionLabel="View assignment trend"
          onClick={()=>
            scrollToSection("admin-assignment-trend")
          }
        />
      </div>

      <div className="grid xl:grid-cols-2 gap-8">
        <ChartCard
          id="admin-teacher-performance"
          title="Teacher Performance"
        >
          {
            teacherPerformance.length
            ? (
              <ResponsiveContainer>
                <BarChart data={teacherPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="teacherName" />
                  <YAxis domain={[0,100]} />
                  <Tooltip />
                  <Bar
                    dataKey="average"
                    name="Teacher Avg"
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
          id="admin-class-performance"
          title="Class Performance"
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
                  <Bar
                    dataKey="average"
                    name="Class Avg"
                    fill="#64748B"
                    radius={[8,8,0,0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )
            : <EmptyChart />
          }
        </ChartCard>

        <ChartCard
          id="admin-subject-performance"
          title="Subject Performance"
        >
          {
            subjectPerformance.length
            ? (
              <ResponsiveContainer>
                <BarChart data={subjectPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="subject" />
                  <YAxis domain={[0,100]} />
                  <Tooltip />
                  <Bar
                    dataKey="average"
                    name="Subject Avg"
                    fill="#14B8A6"
                    radius={[8,8,0,0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )
            : <EmptyChart />
          }
        </ChartCard>

        <ChartCard
          id="admin-student-rankings"
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

        <div className="xl:col-span-2">
          <ChartCard
            id="admin-assignment-trend"
            title="Assignment Trend"
          >
            {
              assignmentPerformance.length
              ? (
                <ResponsiveContainer>
                  <LineChart data={assignmentPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="assignment" />
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
                    <Line
                      type="monotone"
                      dataKey="lowest"
                      name="Lowest"
                      stroke="#EF4444"
                      strokeWidth={3}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )
              : <EmptyChart />
            }
          </ChartCard>
        </div>
      </div>

    </AdminLayout>

  );

}

export default AdminAnalytics;
