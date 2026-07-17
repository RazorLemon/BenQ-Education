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

import Button
from "../components/ui/Button";

import LoadingSpinner
from "../components/ui/LoadingSpinner";

import ClassCards
from "../components/teachers/ClassCards";

import CreateClassModal
from "../components/classes/CreateClassModal";

import CreateStudentModal
from "../components/students/CreateStudentModal";

import {
  formatAcademicSession
}
from "../utils/academicSession";

function TeacherClasses() {

  const [classes,setClasses] =
    useState([]);

  const [loading,setLoading] =
    useState(true);

  const [permissions,setPermissions] =
    useState({
      canCreateStudents:false,
      canCreateClasses:false,
      canEnrollStudents:false
    });

  const [search,setSearch] =
    useState("");

  const [sessionFilter,setSessionFilter] =
    useState("all");

  const [sectionFilter,setSectionFilter] =
    useState("all");

  const [subjectFilter,setSubjectFilter] =
    useState("all");

  const [subjectOpen,setSubjectOpen] =
    useState(false);

  const [studentOpen,setStudentOpen] =
    useState(false);

  const fetchClasses =
    async ()=>{

      try{

        const response =
          await api.get(
            "/teacher/classes"
          );

        setClasses(
          response.data
        );

      }catch(error){

        console.error(error);

      }finally{

        setLoading(false);

      }

    };

  useEffect(()=>{

    const fetchData =
      async ()=>{

        try{

          const [
            classesResponse,
            permissionsResponse
          ] = await Promise.all([
            api.get(
              "/teacher/classes"
            ),
            api.get(
              "/teacher/permissions"
            )
          ]);

          setClasses(
            classesResponse.data
          );

          setPermissions(
            permissionsResponse.data
          );

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

      <TeacherLayout
        title="My Subjects"
      >

        <LoadingSpinner />

      </TeacherLayout>

    );

  }

  const sessionOptions =
    [
      ...new Set(
        classes.map(
          classItem=>classItem.year
        )
      )
    ].sort(
      (a,b)=>Number(a) - Number(b)
    );

  const sectionOptions =
    [
      ...new Set(
        classes.map(
          classItem=>classItem.name
        )
      )
    ].sort();

  const subjectOptions =
    [
      ...new Set(
        classes.map(
          classItem=>classItem.subject
        )
      )
    ].sort();

  const normalizedSearch =
    search.toLowerCase();

  const filteredClasses =
    classes.filter(
      classItem=>{
        const matchesSearch =
          classItem.name
            .toLowerCase()
            .includes(normalizedSearch)
          ||
          classItem.subject
            .toLowerCase()
            .includes(normalizedSearch)
          ||
          classItem.code
            .toLowerCase()
            .includes(normalizedSearch);

        const matchesSession =
          sessionFilter === "all" ||
          String(classItem.year) ===
          sessionFilter;

        const matchesSection =
          sectionFilter === "all" ||
          classItem.name ===
          sectionFilter;

        const matchesSubject =
          subjectFilter === "all" ||
          classItem.subject ===
          subjectFilter;

        return (
          matchesSearch &&
          matchesSession &&
          matchesSection &&
          matchesSubject
        );
      }
    );

  const resetFilters =
    ()=>{
      setSearch("");
      setSessionFilter("all");
      setSectionFilter("all");
      setSubjectFilter("all");
    };

  return (

    <TeacherLayout
      title="My Subjects"
    >

      <div
        className="
        flex
        flex-col
        gap-4
        sm:flex-row
        sm:items-center
        sm:justify-between
        mb-6
        "
      >
        <PageHeader
          title="My Subjects"
          subtitle="Subjects assigned to you"
        />

        <div className="flex flex-col sm:flex-row gap-3">
          {
            permissions.canCreateStudents &&

            <Button
              onClick={()=>
                setStudentOpen(true)
              }
            >
              + Add Student
            </Button>
          }

          {
            permissions.canCreateClasses &&

            <Button
              onClick={()=>
                setSubjectOpen(true)
              }
            >
              + Create Subject
            </Button>
          }
        </div>
      </div>

      <div
        className="
        bg-white
        p-4
        rounded-2xl
        shadow-md
        mb-6
        space-y-4
        "
      >
        <input
          value={search}
          onChange={(event)=>
            setSearch(
              event.target.value
            )
          }
          placeholder="Search by class section, subject, or code..."
          className="
          w-full
          border
          rounded-xl
          px-4
          py-3
          "
        />

        <div
          className="
          grid
          md:grid-cols-3
          gap-3
          "
        >
          <select
            value={sessionFilter}
            onChange={(event)=>
              setSessionFilter(
                event.target.value
              )
            }
            className="border rounded-xl px-4 py-3 bg-white"
          >
            <option value="all">
              All Sessions
            </option>

            {sessionOptions.map(
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
            value={sectionFilter}
            onChange={(event)=>
              setSectionFilter(
                event.target.value
              )
            }
            className="border rounded-xl px-4 py-3 bg-white"
          >
            <option value="all">
              All Class & Sections
            </option>

            {sectionOptions.map(
              section=>(
                <option
                  key={section}
                  value={section}
                >
                  {section}
                </option>
              )
            )}
          </select>

          <select
            value={subjectFilter}
            onChange={(event)=>
              setSubjectFilter(
                event.target.value
              )
            }
            className="border rounded-xl px-4 py-3 bg-white"
          >
            <option value="all">
              All Subjects
            </option>

            {subjectOptions.map(
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
        </div>

        <div
          className="
          flex
          flex-col
          gap-3
          sm:flex-row
          sm:items-center
          sm:justify-between
          "
        >
          <p className="text-sm text-gray-500">
            Showing {filteredClasses.length} of {classes.length} subjects
          </p>

          <button
            type="button"
            onClick={resetFilters}
            className="
            border
            rounded-xl
            px-4
            py-3
            text-gray-700
            "
          >
            Clear Filters
          </button>
        </div>
      </div>

      <ClassCards
  classes={filteredClasses}
/>

      <CreateClassModal
        open={subjectOpen}
        onClose={()=>
          setSubjectOpen(false)
        }
        onSuccess={fetchClasses}
        endpoint="/teacher/classes"
        showTeacherSelect={false}
        title="Create Subject"
      />

      <CreateStudentModal
        open={studentOpen}
        onClose={()=>
          setStudentOpen(false)
        }
        onSuccess={()=>{
          setStudentOpen(false);
        }}
        endpoint="/teacher/students"
      />

    </TeacherLayout>

  );

}

export default TeacherClasses;
