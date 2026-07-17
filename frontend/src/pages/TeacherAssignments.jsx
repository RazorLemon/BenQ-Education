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

import AssignmentsCards
from "../components/teachers/AssignmentsCards";

import CreateAssignmentModal
from "../components/teachers/CreateAssignmentModal";

function TeacherAssignments() {

  const [assignments,setAssignments] =
    useState([]);

  const [loading,setLoading] =
    useState(true);

  const [search,setSearch] =
    useState("");

  const [status,setStatus] =
    useState("all");

  const [classFilter,setClassFilter] =
    useState("all");

  const [sortBy,setSortBy] =
    useState("dueSoon");

  const [open,setOpen] =
    useState(false);

  const fetchAssignments =
    async ()=>{

      try{

        const response =
          await api.get(
            "/teacher/assignments"
          );

        setAssignments(
          response.data
        );

      }catch(error){

        console.error(error);

      }finally{

        setLoading(false);

      }

    };

  useEffect(()=>{

    fetchAssignments();

  },[]);

  const uniqueClasses =
    [...new Set(

      assignments.map(
        assignment=>
          assignment.class?.name
      )

    )];

  let filteredAssignments =
    assignments.filter(
      assignment=>{

        const matchesSearch =

          assignment.title
          .toLowerCase()
          .includes(
            search.toLowerCase()
          )

          ||

          assignment.class?.name
          .toLowerCase()
          .includes(
            search.toLowerCase()
          );

        const isOverdue =

          new Date(
            assignment.dueDate
          )

          <

          new Date();

        const matchesStatus =

          status === "all"

          ||

          (
            status === "active"
            &&
            !isOverdue
          )

          ||

          (
            status === "overdue"
            &&
            isOverdue
          );

        const matchesClass =

          classFilter === "all"

          ||

          assignment.class?.name
          ===
          classFilter;

        return (

          matchesSearch

          &&

          matchesStatus

          &&

          matchesClass

        );

      }
    );

  filteredAssignments.sort(
    (a,b)=>{

      if(
        sortBy ===
        "dueSoon"
      ){

        return (

          new Date(
            a.dueDate
          )

          -

          new Date(
            b.dueDate
          )

        );

      }

      if(
        sortBy ===
        "dueLatest"
      ){

        return (

          new Date(
            b.dueDate
          )

          -

          new Date(
            a.dueDate
          )

        );

      }

      return 0;

    }
  );

  return (

    <TeacherLayout
      title="Assignments"
    >

      <div
        className="
        flex
        justify-between
        items-center
        mb-6
        "
      >

        <PageHeader
          title="Assignments"
          subtitle="Manage assignments"
        />

        <Button
          onClick={()=>
            setOpen(true)
          }
        >
          + Create Assignment
        </Button>

      </div>

      <div
        className="
        bg-white
        p-4
        rounded-2xl
        shadow-md
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

            placeholder="Search..."

            className="
            border
            rounded-xl
            px-4
            py-3
            "

          />

          <select

            value={status}

            onChange={(e)=>
              setStatus(
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

            <option value="active">
              Active
            </option>

            <option value="overdue">
              Overdue
            </option>

          </select>

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

            value={sortBy}

            onChange={(e)=>
              setSortBy(
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

            <option value="dueSoon">
              Due Soon
            </option>

            <option value="dueLatest">
              Due Latest
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

          <AssignmentsCards
            assignments={
              filteredAssignments
            }
          />

        )

      }

      <CreateAssignmentModal

        open={open}

        onClose={()=>
          setOpen(false)
        }

        onSuccess={
          fetchAssignments
        }

      />

    </TeacherLayout>

  );

}

export default TeacherAssignments;
