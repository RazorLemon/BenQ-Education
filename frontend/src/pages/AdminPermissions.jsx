import {
  useEffect,
  useState
}
from "react";

import {
  Search,
  ShieldCheck
}
from "lucide-react";

import AdminLayout
from "../layouts/AdminLayout";

import PageHeader
from "../components/ui/PageHeader";

import LoadingSpinner
from "../components/ui/LoadingSpinner";

import api
from "../api/axios";

import {
  notifySuccess
}
from "../utils/toast";

const permissionFields = [
  {
    key:"canCreateStudents",
    label:"Create students"
  },
  {
    key:"canCreateClasses",
    label:"Create subjects"
  },
  {
    key:"canEnrollStudents",
    label:"Enroll students"
  },
  {
    key:"canManageCalendar",
    label:"Manage calendar"
  }
];

function AdminPermissions() {
  const [teachers,setTeachers] =
    useState([]);

  const [loading,setLoading] =
    useState(true);

  const [saving,setSaving] =
    useState("");

  const [search,setSearch] =
    useState("");

  const fetchPermissions =
    async ()=>{
      try{
        const response =
          await api.get(
            "/admin/permissions"
          );

        setTeachers(
          response.data
        );
      }catch(error){
        console.error(error);
      }finally{
        setLoading(false);
      }
    };

  useEffect(()=>{
    fetchPermissions();
  },[]);

  const updatePermission =
    async (
      teacher,
      key
    )=>{
      const nextPermissions = {
        ...teacher.permissions,
        [key]:
          !teacher.permissions[key]
      };

      setTeachers((current)=>
        current.map((item)=>
          item.id === teacher.id
            ? {
              ...item,
              permissions:
                nextPermissions
            }
            : item
        )
      );

      try{
        setSaving(
          `${teacher.id}-${key}`
        );

        await api.put(
          `/admin/permissions/${teacher.id}`,
          nextPermissions
        );

        notifySuccess(
          "Teacher permissions updated"
        );
      }catch(error){
        console.error(error);

        fetchPermissions();
      }finally{
        setSaving("");
      }
    };

  const normalizedSearch =
    search.trim().toLowerCase();

  const filteredTeachers =
    normalizedSearch
      ? teachers.filter((teacher)=>{
        const haystack =
          [
            teacher.user?.name,
            teacher.user?.email,
            teacher.employeeId
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

        return haystack.includes(
          normalizedSearch
        );
      })
      : teachers;

  if(loading){
    return (
      <AdminLayout title="Permissions">
        <LoadingSpinner />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Permissions">
      <PageHeader
        title="Permissions"
        subtitle="Select which teachers can manage students and subjects"
      />

      <div className="mb-5 rounded-2xl bg-white p-4 shadow-md">
        <label
          className="
          flex
          items-center
          gap-3
          rounded-xl
          border
          border-gray-200
          px-4
          py-3
          focus-within:border-[#008C95]
          "
        >
          <Search
            size={18}
            className="text-gray-400"
          />

          <input
            value={search}
            onChange={(event)=>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search teachers by name, email, or employee ID"
            className="
            w-full
            bg-transparent
            text-sm
            outline-none
            "
          />
        </label>
      </div>

      <div
        className="
        bg-white
        rounded-2xl
        shadow-md
        overflow-x-auto
        "
      >
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-left">
                Teacher
              </th>

              {
                permissionFields.map((field)=>(
                  <th
                    key={field.key}
                    className="p-4 text-left"
                  >
                    {field.label}
                  </th>
                ))
              }
            </tr>
          </thead>

          <tbody>
            {
              filteredTeachers.map((teacher)=>(
                <tr
                  key={teacher.id}
                  className="border-t"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="
                        bg-teal-100
                        text-[#008C95]
                        p-2
                        rounded-xl
                        "
                      >
                        <ShieldCheck size={18} />
                      </div>

                      <div>
                        <div className="font-semibold">
                          {teacher.user.name}
                        </div>

                        <div className="text-sm text-gray-500">
                          {teacher.employeeId}
                          {" "}
                          |
                          {" "}
                          {teacher.user.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  {
                    permissionFields.map((field)=>{
                      const enabled =
                        teacher.permissions[field.key];

                      return (
                        <td
                          key={field.key}
                          className="p-4"
                        >
                          <button
                            type="button"
                            disabled={
                              saving ===
                              `${teacher.id}-${field.key}`
                            }
                            onClick={()=>
                              updatePermission(
                                teacher,
                                field.key
                              )
                            }
                            className={`
                            relative
                            h-8
                            w-14
                            rounded-full
                            transition
                            disabled:opacity-60
                            ${
                              enabled
                                ? "bg-[#008C95]"
                                : "bg-gray-300"
                            }
                            `}
                            aria-pressed={enabled}
                            aria-label={`${field.label} for ${teacher.user.name}`}
                          >
                            <span
                              className={`
                              absolute
                              top-1
                              h-6
                              w-6
                              rounded-full
                              bg-white
                              shadow
                              transition
                              ${
                                enabled
                                  ? "left-7"
                                  : "left-1"
                              }
                              `}
                            />
                          </button>
                        </td>
                      );
                    })
                  }
                </tr>
              ))
            }

            {
              filteredTeachers.length === 0 && (
                <tr>
                  <td
                    colSpan={
                      permissionFields.length + 1
                    }
                    className="border-t p-8 text-center text-sm text-gray-500"
                  >
                    No teachers match your search.
                  </td>
                </tr>
              )
            }
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}

export default AdminPermissions;
