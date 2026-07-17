import { useEffect, useState } from "react";

import AdminLayout
from "../layouts/AdminLayout";

import PageHeader
from "../components/ui/PageHeader";

import TeachersTable
from "../components/teachers/TeachersTable";

import LoadingSpinner
from "../components/ui/LoadingSpinner";

import api
from "../api/axios";

import Button
from "../components/ui/Button";

import CreateTeacherModal
from "../components/teachers/CreateTeacherModal";

import TeacherDetailsModal
from "../components/teachers/TeacherDetailsModal";

function TeachersPage() {

    const [open,setOpen] =
  useState(false);

  const [teachers, setTeachers] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

    const [
 selectedTeacher,
 setSelectedTeacher
] = useState(null);

const [
 modalOpen,
 setModalOpen
] = useState(false);

  useEffect(() => {

    const fetchTeachers =
      async () => {

        try {

          const response =
            await api.get(
              "/admin/teachers"
            );

          setTeachers(
            response.data
          );

        } catch (error) {

          console.error(error);

        } finally {

          setLoading(false);

        }

      };

    fetchTeachers();

  }, []);

  const filteredTeachers =
    teachers.filter((teacher) =>

      teacher.user.name
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )

      ||

      teacher.user.email
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )

      ||

      teacher.employeeId
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        )

    );

  return (

    <AdminLayout
      title="Teachers"
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
    title="Teachers"
    subtitle="Manage all teachers"
  />

  <Button
    onClick={()=>
      setOpen(true)
    }
  >
    + Add Teacher
  </Button>

  <CreateTeacherModal

  open={open}

  onClose={()=>
    setOpen(false)
  }

  onSuccess={async ()=>{

    const response =
      await api.get(
        "/admin/teachers"
      );

    setTeachers(
      response.data
    );

  }}

/>

</div>

      <div
        className="
        mb-6
        max-w-md
        sm:max-w-md
        "
      >

        <input

          value={search}

          onChange={(event)=>
            setSearch(
              event.target.value
            )
          }

          placeholder="Search teachers..."

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
          <TeachersTable

 teachers={
  filteredTeachers
 }

 onTeacherClick={(teacher)=>{

  setSelectedTeacher(
   teacher
  );

  setModalOpen(
   true
  );

 }}

/>
        )
      }

      <TeacherDetailsModal

 key={
  selectedTeacher?.id ||
  "teacher-details"
 }

 teacher={
  selectedTeacher
 }

 open={
  modalOpen
 }

 onClose={()=>
  setModalOpen(
   false
  )
 }

 onSuccess={async ()=>{

  const response =
   await api.get(
    "/admin/teachers"
   );

  setTeachers(
   response.data
  );

 }}

/>

    </AdminLayout>

  );

}

export default TeachersPage;
