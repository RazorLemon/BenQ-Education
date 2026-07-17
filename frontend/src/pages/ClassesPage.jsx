import {
  useEffect,
  useState
}
from "react";

import AdminLayout
from "../layouts/AdminLayout";

import PageHeader
from "../components/ui/PageHeader";

import Button
from "../components/ui/Button";

import LoadingSpinner
from "../components/ui/LoadingSpinner";

import ClassCards
from "../components/classes/ClassCards";

import CreateClassModal
from "../components/classes/CreateClassModal";

import api
from "../api/axios";

import {
  formatAcademicSession
}
from "../utils/academicSession";

function ClassesPage() {

  const [classes,setClasses] =
    useState([]);

  const [loading,setLoading] =
    useState(true);

  const [search,setSearch] =
    useState("");

  const [sessionFilter,setSessionFilter] =
    useState("all");

  const [sectionFilter,setSectionFilter] =
    useState("all");

  const [subjectFilter,setSubjectFilter] =
    useState("all");

  const [teacherFilter,setTeacherFilter] =
    useState("all");

  const [open,setOpen] =
    useState(false);

  const [deleting,setDeleting] =
    useState(false);

  const fetchClasses =
    async ()=>{

      try{

        const response =
          await api.get(
            "/admin/classes"
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

    fetchClasses();

  },[]);

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

  const teacherOptions =
    [
      ...new Map(
        classes
          .filter(
            classItem=>
              classItem.teacher?.id
          )
          .map(
            classItem=>[
              classItem.teacher.id,
              classItem.teacher.user?.name ||
              "Assigned Teacher"
            ]
          )
      )
    ].sort(
      (a,b)=>
        a[1].localeCompare(b[1])
    );

  const normalizedSearch =
    search.toLowerCase();

  const filteredClasses =
    classes.filter(
      classItem =>{
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
            .includes(normalizedSearch)
          ||
          (
            classItem.teacher?.user?.name ||
            ""
          )
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

        const matchesTeacher =
          teacherFilter === "all" ||
          classItem.teacher?.id ===
          teacherFilter;

        return (
          matchesSearch &&
          matchesSession &&
          matchesSection &&
          matchesSubject &&
          matchesTeacher
        );
      }
    );

  const resetFilters =
    ()=>{
      setSearch("");
      setSessionFilter("all");
      setSectionFilter("all");
      setSubjectFilter("all");
      setTeacherFilter("all");
    };

  const deleteFilteredClasses =
    async ()=>{
      if(filteredClasses.length === 0){
        return;
      }

      const confirmed =
        window.confirm(
          `Delete ${filteredClasses.length} filtered subject${filteredClasses.length === 1 ? "" : "s"}? This will also delete their assignments, submissions, announcements, and enrollments.`
        );

      if(!confirmed){
        return;
      }

      try{
        setDeleting(true);

        await api.post(
          "/admin/classes/bulk-delete",
          {
            classIds:
              filteredClasses.map(
                classItem=>classItem.id
              )
          }
        );

        await fetchClasses();

      }catch(error){

        console.error(error);

      }finally{

        setDeleting(false);

      }
    };

  return (

    <AdminLayout
      title="Subjects"
    >

      <div
        className="
        flex
        flex-col
        gap-4
        sm:flex-row
        justify-between
        sm:items-center
        mb-6
        "
      >

        <PageHeader
          title="Subjects"
          subtitle="Manage subjects for each class and section"
        />

        <Button
          onClick={()=>
            setOpen(true)
          }
        >
          + Create Subject
        </Button>

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

          onChange={(e)=>
            setSearch(
              e.target.value
            )
          }

          placeholder="
          Search by class section,
          subject or code...
          "

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
          md:grid-cols-4
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

          <select
            value={teacherFilter}
            onChange={(event)=>
              setTeacherFilter(
                event.target.value
              )
            }
            className="border rounded-xl px-4 py-3 bg-white"
          >
            <option value="all">
              All Teachers
            </option>

            {teacherOptions.map(
              ([teacherId,teacherName])=>(
                <option
                  key={teacherId}
                  value={teacherId}
                >
                  {teacherName}
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

          <div
            className="
            flex
            flex-col
            sm:flex-row
            gap-3
            "
          >
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

            <button
              type="button"
              disabled={
                deleting ||
                filteredClasses.length === 0
              }
              onClick={deleteFilteredClasses}
              className="
              rounded-xl
              px-4
              py-3
              bg-red-600
              text-white
              font-medium
              disabled:opacity-50
              "
            >
              {
                deleting
                ? "Deleting..."
                : filteredClasses.length ===
                  classes.length
                ? "Delete All Subjects"
                : "Delete Filtered Subjects"
              }
            </button>
          </div>
        </div>

      </div>

      {

        loading

        ? (

          <LoadingSpinner />

        )

        : (

          <ClassCards
            classes={
              filteredClasses
            }
          />

        )

      }

      <CreateClassModal

        open={open}

        onClose={()=>
          setOpen(false)
        }

        onSuccess={
          fetchClasses
        }

      />

    </AdminLayout>

  );

}

export default ClassesPage;
