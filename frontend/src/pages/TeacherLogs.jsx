import {
  useCallback,
  useEffect,
  useState
}
from "react";

import {
  BookOpen,
  Filter,
  Search,
  Trash2,
  Upload
}
from "lucide-react";

import api
from "../api/axios";

import TeacherLayout
from "../layouts/TeacherLayout";

import PageHeader
from "../components/ui/PageHeader";

import LoadingSpinner
from "../components/ui/LoadingSpinner";

const actionFilters = [
  {
    value:"all",
    label:"All Assignment Logs"
  },
  {
    value:"submitted",
    label:"Submitted"
  },
  {
    value:"deleted",
    label:"Deleted"
  }
];

function TeacherLogs(){

  const [logs,setLogs] =
    useState([]);

  const [loading,setLoading] =
    useState(true);

  const [search,setSearch] =
    useState("");

  const [action,setAction] =
    useState("all");

  const fetchLogs =
    useCallback(
      async ()=>{

        try{

          setLoading(true);

          const response =
            await api.get(
              "/teacher/logs",
              {
                params:{
                  query:search,
                  action
                }
              }
            );

          setLogs(
            response.data
          );

        }catch(error){

          console.error(error);

        }finally{

          setLoading(false);

        }

      },
      [
        search,
        action
      ]
    );

  useEffect(()=>{

    const timeout =
      setTimeout(
        fetchLogs,
        250
      );

    return ()=>
      clearTimeout(timeout);

  },[fetchLogs]);

  return (

    <TeacherLayout title="Logs">

      <PageHeader
        title="Logs"
        subtitle="Assignment submissions and deletions across your subjects"
      />

      <div
        className="
        bg-white
        rounded-2xl
        shadow-md
        p-4
        mb-6
        grid
        md:grid-cols-[1fr_220px]
        gap-3
        "
      >

        <div className="relative">
          <Search
            size={18}
            className="
            absolute
            left-3
            top-1/2
            -translate-y-1/2
            text-gray-400
            "
          />

          <input
            value={search}
            onChange={(event)=>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search by student, roll number, class, section, subject, or assignment..."
            className="
            w-full
            border
            rounded-xl
            py-3
            pl-10
            pr-4
            "
          />
        </div>

        <div className="relative">
          <Filter
            size={18}
            className="
            absolute
            left-3
            top-1/2
            -translate-y-1/2
            text-gray-400
            "
          />

          <select
            value={action}
            onChange={(event)=>
              setAction(
                event.target.value
              )
            }
            className="
            w-full
            border
            rounded-xl
            py-3
            pl-10
            pr-4
            bg-white
            "
          >
            {actionFilters.map(
              option=>(
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              )
            )}
          </select>
        </div>

      </div>

      {
        loading
        ? <LoadingSpinner />
        : (
          <div
            className="
            bg-white
            rounded-2xl
            shadow-md
            overflow-hidden
            "
          >
            {
              logs.length === 0
              ? (
                <div
                  className="
                  p-8
                  text-center
                  text-gray-500
                  "
                >
                  No assignment logs match your filters
                </div>
              )
              : logs.map(
                log=>{
                  const isDeleted =
                    log.action ===
                    "ASSIGNMENT_DELETED";

                  const Icon =
                    isDeleted
                    ? Trash2
                    : Upload;

                  return (
                    <div
                      key={log.id}
                      className="
                      p-5
                      border-b
                      border-gray-100
                      last:border-b-0
                      "
                    >
                      <div
                        className="
                        flex
                        items-start
                        gap-4
                        "
                      >
                        <div
                          className={`
                          p-3
                          rounded-full
                          ${
                            isDeleted
                            ? "bg-red-50 text-red-600"
                            : "bg-teal-100 text-[#008C95]"
                          }
                          `}
                        >
                          <Icon size={18} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div
                            className="
                            flex
                            flex-col
                            gap-1
                            sm:flex-row
                            sm:items-start
                            sm:justify-between
                            "
                          >
                            <div>
                              <p
                                className="
                                font-semibold
                                text-gray-900
                                "
                              >
                                {log.title}
                              </p>

                              <p
                                className="
                                text-gray-700
                                mt-1
                                "
                              >
                                {log.text}
                              </p>
                            </div>

                            <span
                              className="
                              text-xs
                              text-gray-500
                              shrink-0
                              "
                            >
                              {new Date(
                                log.createdAt
                              ).toLocaleString()}
                            </span>
                          </div>

                          <div
                            className="
                            flex
                            flex-wrap
                            gap-2
                            mt-3
                            "
                          >
                            <span
                              className={`
                              text-xs
                              px-3
                              py-1
                              rounded-full
                              ${
                                isDeleted
                                ? "bg-red-50 text-red-700"
                                : "bg-teal-50 text-[#008C95]"
                              }
                              `}
                            >
                              {
                                isDeleted
                                ? "Deleted"
                                : "Submitted"
                              }
                            </span>

                            {log.studentName && (
                              <span className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full">
                                {log.studentName}
                              </span>
                            )}

                            {log.rollNumber && (
                              <span className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full">
                                Roll {log.rollNumber}
                              </span>
                            )}

                            {log.subject && (
                              <span className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full">
                                {log.subject}
                              </span>
                            )}

                            {log.classSection && (
                              <span className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full">
                                {log.classSection}
                              </span>
                            )}

                            {log.assignmentTitle && (
                              <span className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full inline-flex items-center gap-1">
                                <BookOpen size={12} />
                                {log.assignmentTitle}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
              )
            }
          </div>
        )
      }

    </TeacherLayout>

  );

}

export default TeacherLogs;
