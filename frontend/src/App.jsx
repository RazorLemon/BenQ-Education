import {
  lazy,
  Suspense
}
from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
}
from "react-router-dom";

import LoadingSpinner
from "./components/ui/LoadingSpinner";

import ProtectedRoute
from "./routes/ProtectedRoute";

const Login =
  lazy(()=>
    import("./pages/Login")
  );

const SchoolSetup =
  lazy(()=>
    import("./pages/SchoolSetup")
  );

const AdminDashboard =
  lazy(()=>
    import("./pages/AdminDashboard")
  );

const TeacherDashboard =
  lazy(()=>
    import("./pages/TeacherDashboard")
  );

const StudentDashboard =
  lazy(()=>
    import("./pages/StudentDashboard")
  );

const TeachersPage =
  lazy(()=>
    import("./pages/TeachersPage")
  );

const StudentsPage =
  lazy(()=>
    import("./pages/StudentsPage")
  );

const ClassesPage =
  lazy(()=>
    import("./pages/ClassesPage")
  );

const TeacherClasses =
  lazy(()=>
    import("./pages/TeacherClasses")
  );

const TeacherAssignments =
  lazy(()=>
    import("./pages/TeacherAssignments")
  );

const TeacherAnnouncements =
  lazy(()=>
    import("./pages/TeacherAnnouncements")
  );

const TeacherSubmissions =
  lazy(()=>
    import("./pages/TeacherSubmissions")
  );

const TeacherLogs =
  lazy(()=>
    import("./pages/TeacherLogs")
  );

const TeacherAnalytics =
  lazy(()=>
    import("./pages/TeacherAnalytics")
  );

const AdminAnalytics =
  lazy(()=>
    import("./pages/AdminAnalytics")
  );

const AdminLogs =
  lazy(()=>
    import("./pages/AdminAnnouncements")
  );

const AdminPermissions =
  lazy(()=>
    import("./pages/AdminPermissions")
  );

const SettingsPage =
  lazy(()=>
    import("./pages/SettingsPage")
  );

const TeacherClassDetails =
  lazy(()=>
    import("./pages/TeacherClassDetails")
  );

const AdminClassDetails =
  lazy(()=>
    import("./pages/AdminClassDetails")
  );

const ChangePassword =
  lazy(()=>
    import("./pages/ChangePassword")
  );

const StudentAssignments =
  lazy(()=>
    import("./pages/StudentAssignments")
  );

const StudentGrades =
  lazy(()=>
    import("./pages/StudentGrades")
  );

const StudentAnnouncements =
  lazy(()=>
    import("./pages/StudentAnnouncements")
  );

const StudentProfile =
  lazy(()=>
    import("./pages/StudentProfile")
  );

const StudentClasses =
  lazy(()=>
    import("./pages/StudentClasses")
  );

const StudentClassDetails =
  lazy(()=>
    import("./pages/StudentClassDetails")
  );

const TeacherProfile =
  lazy(()=>
    import("./pages/TeacherProfile")
  );

function App() {

  const protectedElement = (
    element,
    allowedRoles
  ) => (
    <ProtectedRoute
      allowedRoles={
        allowedRoles
      }
    >
      {element}
    </ProtectedRoute>
  );

  return (

    <BrowserRouter>

      <Suspense
        fallback={<LoadingSpinner />}
      >

      <Routes>

        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/school-setup"
          element={<SchoolSetup />}
        />

<Route
 path="/student/assignments"
 element={
  protectedElement(
   <StudentAssignments />,
   ["STUDENT"]
  )
 }
/>

<Route
 path="/student/classes/:id"
 element={
  protectedElement(
   <StudentClassDetails />,
   ["STUDENT"]
  )
 }
/>

<Route
 path="/student/classes"
 element={
  protectedElement(
   <StudentClasses />,
   ["STUDENT"]
  )
 }
/>

<Route
 path="/teacher/profile"
 element={
  protectedElement(
   <TeacherProfile />,
   ["TEACHER"]
  )
 }
/>

<Route
 path="/student/grades"
 element={
  protectedElement(
   <StudentGrades />,
   ["STUDENT"]
  )
 }
/>

<Route
 path="/student/announcements"
 element={
  protectedElement(
   <StudentAnnouncements />,
   ["STUDENT"]
  )
 }
/>

<Route
 path="/student/profile"
 element={
  protectedElement(
   <StudentProfile />,
   ["STUDENT"]
  )
 }
/>

<Route
 path="/admin/classes/:id"
 element={
  protectedElement(
   <AdminClassDetails />,
   ["ADMIN"]
  )
 }
/>

<Route
 path="/change-password"
 element={
  protectedElement(
   <ChangePassword />,
   [
    "ADMIN",
    "TEACHER",
    "STUDENT"
   ]
  )
 }
/>

<Route
 path="/admin/logs"
 element={
  protectedElement(
   <AdminLogs />,
   ["ADMIN"]
  )
 }
/>

<Route
 path="/admin/announcements"
 element={
  protectedElement(
   <AdminLogs />,
   ["ADMIN"]
  )
 }
/>

<Route
 path="/admin/permissions"
 element={
  protectedElement(
   <AdminPermissions />,
   ["ADMIN"]
  )
 }
/>

<Route
 path="/admin/settings"
 element={
  protectedElement(
   <SettingsPage />,
   ["ADMIN"]
  )
 }
/>

<Route
 path="/teacher/settings"
 element={
  protectedElement(
   <SettingsPage />,
   ["TEACHER"]
  )
 }
/>

<Route
  path="/teacher/classes"
  element={
   protectedElement(
    <TeacherClasses />,
    ["TEACHER"]
   )
  }
/>

<Route
  path="/teacher/classes/:id"
  element={
   protectedElement(
    <TeacherClassDetails />,
    ["TEACHER"]
   )
  }
/>

<Route
  path="/teacher/assignments"
  element={
   protectedElement(
    <TeacherAssignments />,
    ["TEACHER"]
   )
  }
/>

<Route
  path="/teacher/announcements"
  element={
   protectedElement(
    <TeacherAnnouncements />,
    ["TEACHER"]
   )
  }
/>

<Route
  path="/teacher/submissions"
  element={
   protectedElement(
    <TeacherSubmissions />,
    ["TEACHER"]
   )
  }
/>

<Route
  path="/teacher/logs"
  element={
   protectedElement(
    <TeacherLogs />,
    ["TEACHER"]
   )
  }
/>

<Route
  path="/teacher/analytics"
  element={
   protectedElement(
    <TeacherAnalytics />,
    ["TEACHER"]
   )
  }
/>

        <Route
  path="/admin/classes"
  element={
   protectedElement(
    <ClassesPage />,
    ["ADMIN"]
   )
  }
/>

        <Route
  path="/admin/students"
  element={
   protectedElement(
    <StudentsPage />,
    ["ADMIN"]
   )
  }
/>

        <Route
          path="/admin"
          element={
            protectedElement(
              <AdminDashboard />,
              ["ADMIN"]
            )
          }
        />

        <Route
          path="/admin/analytics"
          element={
            protectedElement(
              <AdminAnalytics />,
              ["ADMIN"]
            )
          }
        />

        <Route  
          path="/teacher"
          element={
            protectedElement(
              <TeacherDashboard />,
              ["TEACHER"]
            )
          }
        />

        <Route
          path="/student"
          element={
            protectedElement(
              <StudentDashboard />,
              ["STUDENT"]
            )
          }
        />

        <Route
  path="/admin/teachers"
  element={
   protectedElement(
    <TeachersPage />,
    ["ADMIN"]
   )
  }
/>

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>

      </Suspense>

    </BrowserRouter>

  );

}

export default App;
