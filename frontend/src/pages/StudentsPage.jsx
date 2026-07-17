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

import StudentsTable
from "../components/students/StudentsTable";

import CreateStudentModal
from "../components/students/CreateStudentModal";

import api
from "../api/axios";

function StudentsPage() {

  const [students,setStudents] =
    useState([]);

  const [loading,setLoading] =
    useState(true);

  const [search,setSearch] =
    useState("");

  const [open,setOpen] =
    useState(false);

  const fetchStudents =
    async ()=>{

      try{

        const response =
          await api.get(
            "/admin/students"
          );

        setStudents(
          response.data
        );

      }catch(error){

        console.error(error);

      }finally{

        setLoading(false);

      }

    };

  useEffect(()=>{

    fetchStudents();

  },[]);

  const filteredStudents =
    students.filter(
      student =>{
        const query =
          search.toLowerCase();

        return (
          student.user.name
          .toLowerCase()
          .includes(query)
          ||
          student.rollNumber
          .toLowerCase()
          .includes(query)
          ||
          (student.classSection || "")
          .toLowerCase()
          .includes(query)
        );
      }
    );

  return (

    <AdminLayout
      title="Students"
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
          title="Students"
          subtitle="Manage all students"
        />

        <Button
          onClick={()=>
            setOpen(true)
          }
        >
          + Add Student
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

        <input
          value={search}
          onChange={(e)=>
            setSearch(
              e.target.value
            )
          }
          placeholder="Search students by name, roll number, or class section..."
          className="
          w-full
          border
          rounded-xl
          px-4
          py-3
          "
        />

      </div>

      {loading

        ? <LoadingSpinner />

        : (

          <StudentsTable
            students={
              filteredStudents
            }

             onSuccess={
    fetchStudents
  }
          />

        )

      }

      <CreateStudentModal

        open={open}

        onClose={()=>
          setOpen(false)
        }

        onSuccess={
          fetchStudents
        }

      />

    </AdminLayout>

  );

}

export default StudentsPage;
