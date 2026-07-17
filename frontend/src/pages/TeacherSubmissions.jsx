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

import SubmissionsTable
from "../components/teachers/SubmissionsTable";

import GradeSubmissionModal
from "../components/teachers/GradeSubmissionModal";

function TeacherSubmissions() {

  const [submissions,setSubmissions] =
    useState([]);

  const [loading,setLoading] =
    useState(true);

  const [selected,setSelected] =
    useState(null);

  const [search,setSearch] =
    useState("");

  const [classFilter,setClassFilter] =
    useState("all");

  const [assignmentFilter,setAssignmentFilter] =
    useState("all");

  const [statusFilter,setStatusFilter] =
    useState("all");

  const fetchSubmissions =
    async ()=>{

      try{

        const response =
          await api.get(
            "/teacher/submissions"
          );

        setSubmissions(
          response.data
        );

      }catch(error){

        console.error(error);

      }finally{

        setLoading(false);

      }

    };

  useEffect(()=>{

    fetchSubmissions();

  },[]);

  const uniqueAssignments =
    [...new Set(

      submissions.map(
        submission=>
          submission.assignment
          ?.title
      )
      .filter(Boolean)

    )];

  const uniqueClasses =
    [...new Set(

      submissions.map(
        submission=>
          submission.assignment
          ?.class?.name
      )
      .filter(Boolean)

    )];

  const filteredSubmissions =
    submissions.filter(
      submission=>{

        const studentName =

          submission.student
          ?.user?.name
          ?.toLowerCase()

          ||

          "";

        const matchesSearch =

          studentName.includes(
            search.toLowerCase()
          );

        const matchesClass =

          classFilter === "all"

          ||

          submission.assignment
          ?.class?.name

          ===

          classFilter;

        const matchesAssignment =

          assignmentFilter === "all"

          ||

          submission.assignment
          ?.title

          ===

          assignmentFilter;

        const matchesStatus =

          statusFilter === "all"

          ||

          (

            statusFilter ===
            "graded"

            &&

            submission.grade
            !== null

          )

          ||

          (

            statusFilter ===
            "needsGrading"

            &&

            submission.grade
            === null

          );

        return (

          matchesSearch

          &&

          matchesClass

          &&

          matchesAssignment

          &&

          matchesStatus

        );

      }
    );

  return (

    <TeacherLayout
      title="Submissions"
    >

      <PageHeader
        title="Submissions"
        subtitle="Review and grade student work"
      />

      <div
        className="
        bg-white
        rounded-2xl
        shadow-md
        p-4
        mb-6
        "
      >

        <div
          className="
          grid
          md:grid-cols-4
          gap-4
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
            Search Student...
            "

            className="
            border
            rounded-xl
            px-4
            py-3
            "

          />

          <select

            value={classFilter}

            onChange={(e)=>
              setClassFilter(
                e.target.value
              )
            }

            className="
            border
            rounded-xl
            px-4
            py-3
            "

          >

            <option value="all">
              All Subjects
            </option>

            {

              uniqueClasses.map(
                className=>(

                  <option
                    key={className}
                    value={className}
                  >
                    {className}
                  </option>

                )
              )

            }

          </select>

          <select

            value={assignmentFilter}

            onChange={(e)=>
              setAssignmentFilter(
                e.target.value
              )
            }

            className="
            border
            rounded-xl
            px-4
            py-3
            "

          >

            <option value="all">
              All Assignments
            </option>

            {

              uniqueAssignments.map(
                assignment=>(

                  <option
                    key={assignment}
                    value={assignment}
                  >
                    {assignment}
                  </option>

                )
              )

            }

          </select>

          <select

            value={statusFilter}

            onChange={(e)=>
              setStatusFilter(
                e.target.value
              )
            }

            className="
            border
            rounded-xl
            px-4
            py-3
            "

          >

            <option value="all">
              All
            </option>

            <option value="needsGrading">
              Needs Grading
            </option>

            <option value="graded">
              Graded
            </option>

          </select>

        </div>

      </div>

      {

        loading

        ? (

          <LoadingSpinner />

        )

        : (

          <SubmissionsTable

            submissions={
              filteredSubmissions
            }

            onGrade={
              setSelected
            }

          />

        )

      }

      <GradeSubmissionModal

        submission={
          selected
        }

        onClose={()=>
          setSelected(null)
        }

        onSuccess={
          fetchSubmissions
        }

      />

    </TeacherLayout>

  );

}

export default TeacherSubmissions;
