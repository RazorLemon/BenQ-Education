import {
 useEffect,
 useState
}
from "react";

import {
 Award,
 BarChart3,
 ClipboardCheck,
 Users
}
from "lucide-react";

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

import api
from "../api/axios";

import StudentLayout
from "../layouts/StudentLayout";

import PageHeader
from "../components/ui/PageHeader";

import LoadingSpinner
from "../components/ui/LoadingSpinner";

import StatCard
from "../components/dashboard/StatCard";

function ChartCard({
 title,
 id,
 children
}){
 return (
  <div
   id={id}
   className="
   bg-white
   rounded-2xl
   shadow-md
   p-6
   scroll-mt-24
   "
  >
   <h2
    className="
    text-lg
    font-bold
    mb-5
    "
   >
    {title}
   </h2>

   <div className="h-[340px]">
    {children}
   </div>
  </div>
 );
}

function EmptyChart(){
 return (
  <div
   className="
   h-full
   flex
   items-center
   justify-center
   text-gray-500
   text-sm
   "
  >
   No graded data available yet
  </div>
 );
}

function StudentGrades(){

 const [data,setData] =
  useState(null);

 const [loading,setLoading] =
  useState(true);

 const [subjectFilter,setSubjectFilter] =
  useState("all");

 const [assignmentFilter,setAssignmentFilter] =
  useState("all");

 const scrollToSection =
  (id)=>{
   document
    .getElementById(id)
    ?.scrollIntoView({
     behavior:"smooth",
     block:"start"
    });
  };

 useEffect(()=>{

  const fetchAnalytics =
   async ()=>{

    try{

     const response =
      await api.get(
       "/student/analytics"
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

 },[]);

 if(loading){
  return (
   <StudentLayout title="Analytics">
    <LoadingSpinner />
   </StudentLayout>
  );
 }

 const overall =
  data?.overall || {};

 const subjectOptions =
  (data?.subjectAnalytics || [])
   .map((subject)=>({
    value:subject.classId,
    label:
     `${subject.subject} (${subject.classSection})`
   }));

 const assignmentOptions =
  (data?.assignmentAnalytics || [])
   .filter(
    assignment=>
     subjectFilter === "all" ||
     assignment.classId === subjectFilter
   )
   .map((assignment)=>({
    value:assignment.id,
    label:assignment.assignmentTitle
   }));

 const filteredAssignments =
  (data?.assignmentAnalytics || [])
   .filter(
    assignment=>
     subjectFilter === "all" ||
     assignment.classId === subjectFilter
   )
   .filter(
    assignment=>
     assignmentFilter === "all" ||
     assignment.id === assignmentFilter
   );

 const filteredSubjects =
  (data?.subjectAnalytics || [])
   .filter(
    subject=>
     subjectFilter === "all" ||
     subject.classId === subjectFilter
   );

 const selectedAssignment =
  filteredAssignments.find(
   assignment=>
    assignment.id === assignmentFilter
  );

 const selectedSubject =
  filteredSubjects[0];

 const focusedPeerRows =
  selectedAssignment
  ? (selectedAssignment.peerRows || [])
    .map((row)=>({
     id:row.id,
     studentName:row.studentName,
     average:row.grade,
     isCurrentStudent:
      row.isCurrentStudent
    }))
  : subjectFilter !== "all" &&
    selectedSubject
  ? selectedSubject.peerRows || []
  : data?.overallPeerRows || [];

 const focusedAverage =
  selectedAssignment
  ? selectedAssignment.myGrade
  : subjectFilter !== "all" &&
    selectedSubject
  ? selectedSubject.myAverage
  : overall.average;

 const focusedPeerAverage =
  selectedAssignment
  ? selectedAssignment.classAverage
  : subjectFilter !== "all" &&
    selectedSubject
  ? selectedSubject.classAverage
  : overall.peerAverage;

 const focusedRank =
  selectedAssignment
  ? selectedAssignment.rank
  : subjectFilter !== "all" &&
    selectedSubject
  ? selectedSubject.rank
  : overall.rank;

 const focusedTotalStudents =
  selectedAssignment
  ? selectedAssignment.totalGraded
  : subjectFilter !== "all" &&
    selectedSubject
  ? selectedSubject.totalStudents
  : overall.totalStudents;

 const assignmentChart =
  filteredAssignments
   .map((item)=>({
    name:item.assignmentTitle || "Assignment",
    subject:item.subject || "Subject",
    myGrade:item.myGrade || 0,
    classAverage:item.classAverage || 0
   }));

 const subjectChart =
  filteredSubjects
   .map((item)=>({
    name:`${item.subject || "Subject"} (${item.classSection || "Class"})`,
    myAverage:item.myAverage || 0,
    classAverage:item.classAverage || 0
   }));

 const peerRows =
  focusedPeerRows;

 return (

  <StudentLayout title="Analytics">

   <PageHeader
    title="My Analytics"
    subtitle="See your performance from assignment level up to your full enrolled set"
   />

   <div
    className="
    bg-white
    rounded-2xl
    shadow-md
    p-4
    mb-8
    grid
    md:grid-cols-2
    gap-3
    "
   >
    <select
     value={subjectFilter}
     onChange={(event)=>{
      setSubjectFilter(
       event.target.value
      );
      setAssignmentFilter("all");
     }}
     className="
     border
     rounded-xl
     px-4
     py-3
     bg-white
     "
    >
     <option value="all">
      All Subjects
     </option>

     {subjectOptions.map(
      subject=>(
       <option
        key={subject.value}
        value={subject.value}
       >
        {subject.label}
       </option>
      )
     )}
    </select>

    <select
     value={assignmentFilter}
     onChange={(event)=>
      setAssignmentFilter(
       event.target.value
      )
     }
     className="
     border
     rounded-xl
     px-4
     py-3
     bg-white
     "
    >
     <option value="all">
      All Assignments
     </option>

     {assignmentOptions.map(
      assignment=>(
       <option
        key={assignment.value}
        value={assignment.value}
       >
        {assignment.label}
       </option>
      )
     )}
    </select>
   </div>

   <div
    className="
    grid
    md:grid-cols-4
    gap-6
    mb-8
    "
   >
    <StatCard
     title={
      selectedAssignment
      ? "My Marks"
      : "My Average"
     }
     value={focusedAverage || 0}
     subtitle="Your current filtered performance"
     icon={BarChart3}
     actionLabel="View trend"
     onClick={()=>
      scrollToSection("student-performance-trend")
     }
    />

    <StatCard
     title={
      selectedAssignment
      ? "Assignment Avg"
      : "Peer Average"
     }
     value={focusedPeerAverage || 0}
     subtitle="Class comparison for this scope"
     icon={Users}
     actionLabel="Compare with class"
     onClick={()=>
      scrollToSection("student-assignment-comparison")
     }
    />

    <StatCard
     title="Standing"
     value={
      focusedRank
      ? `${focusedRank}/${focusedTotalStudents}`
      : "-"
     }
     subtitle="Rank among graded classmates"
     icon={Award}
     actionLabel="View peer standing"
     onClick={()=>
      scrollToSection("student-peer-standing")
     }
    />

    <StatCard
     title="Graded Work"
     value={
      selectedAssignment
      ? selectedAssignment.totalGraded || 0
      : subjectFilter !== "all" &&
        selectedSubject
      ? selectedSubject.gradedSubmissions || 0
      : overall.gradedAssignments || 0
     }
     subtitle="Assignments counted in analytics"
     icon={ClipboardCheck}
     actionLabel="View subject standing"
     onClick={()=>
      scrollToSection("student-subject-standing")
     }
    />
   </div>

   <div
    className="
    grid
    xl:grid-cols-2
    gap-8
    "
   >

    <ChartCard
     id="student-assignment-comparison"
     title="Assignment vs Class Average"
    >
     {
      assignmentChart.length
      ? (
       <ResponsiveContainer
        width="100%"
        height="100%"
       >
        <BarChart data={assignmentChart}>
         <CartesianGrid strokeDasharray="3 3" />
         <XAxis
          dataKey="name"
          tick={{
           fontSize:12
          }}
         />
         <YAxis domain={[0,100]} />
         <Tooltip />
         <Legend />
         <Bar
          dataKey="classAverage"
          name="Class Average"
          fill="#94A3B8"
          radius={[8,8,0,0]}
         />
         <Bar
          dataKey="myGrade"
          name="My Marks"
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
     id="student-subject-aggregates"
     title="Subject Aggregates"
    >
     {
      subjectChart.length
      ? (
       <ResponsiveContainer
        width="100%"
        height="100%"
       >
        <BarChart data={subjectChart}>
         <CartesianGrid strokeDasharray="3 3" />
         <XAxis
          dataKey="name"
          tick={{
           fontSize:12
          }}
         />
         <YAxis domain={[0,100]} />
         <Tooltip />
         <Legend />
         <Bar
          dataKey="classAverage"
          name="Class Average"
          fill="#94A3B8"
          radius={[8,8,0,0]}
         />
         <Bar
          dataKey="myAverage"
          name="My Average"
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
     id="student-peer-standing"
     title="Overall Peer Standing"
    >
     {
      peerRows.length
      ? (
       <ResponsiveContainer
        width="100%"
        height="100%"
       >
        <BarChart
         layout="vertical"
         data={peerRows}
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
          name="Average"
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
     id="student-performance-trend"
     title="Performance Trend"
    >
     {
      assignmentChart.length
      ? (
       <ResponsiveContainer
        width="100%"
        height="100%"
       >
        <LineChart data={assignmentChart}>
         <CartesianGrid strokeDasharray="3 3" />
         <XAxis dataKey="name" />
         <YAxis domain={[0,100]} />
         <Tooltip />
         <Legend />
         <Line
          type="monotone"
          dataKey="classAverage"
          name="Class Average"
          stroke="#94A3B8"
          strokeWidth={3}
         />
         <Line
          type="monotone"
          dataKey="myGrade"
          name="My Marks"
          stroke="#008C95"
          strokeWidth={4}
         />
        </LineChart>
       </ResponsiveContainer>
      )
      : <EmptyChart />
     }
    </ChartCard>

   </div>

   <div
    id="student-subject-standing"
    className="
    mt-8
    bg-white
    rounded-2xl
    shadow-md
    p-6
    scroll-mt-24
    "
   >
    <h2 className="text-lg font-bold mb-5">
     Subject Standing
    </h2>

    <div className="space-y-4">
     {
      filteredSubjects.length
      ? filteredSubjects.map(
       subject=>(
        <div
         key={subject.classId}
         className="
         border
         border-gray-100
         rounded-xl
         p-4
         "
        >
         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
           <p className="font-semibold">
            {subject.subject} ({subject.classSection})
           </p>
           <p className="text-sm text-gray-500">
            {subject.gradedSubmissions} graded submissions
           </p>
          </div>

          <div className="text-sm text-gray-600">
           Rank{" "}
           <span className="font-bold text-[#008C95]">
            {
             subject.rank
             ? `${subject.rank}/${subject.totalStudents}`
             : "-"
            }
           </span>
          </div>
         </div>
        </div>
       )
      )
      : (
       <div className="text-gray-500 text-sm">
        No subject analytics yet
       </div>
      )
     }
    </div>
   </div>

  </StudentLayout>

 );
}

export default StudentGrades;
