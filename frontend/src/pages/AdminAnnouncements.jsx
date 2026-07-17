import {
  useCallback,
  useEffect,
  useState
}
from "react";

import api
from "../api/axios";

import AdminLayout
from "../layouts/AdminLayout";

import PageHeader
from "../components/ui/PageHeader";

import LoadingSpinner
from "../components/ui/LoadingSpinner";

import {
  BookOpen,
  CalendarClock,
  ClipboardList,
  Filter,
  Megaphone,
  Search,
  ShieldCheck,
  UserPlus
}
from "lucide-react";

const logTypes = [
  {
    value:"all",
    label:"All Activity"
  },
  {
    value:"account",
    label:"Accounts"
  },
  {
    value:"assignment",
    label:"Assignments"
  },
  {
    value:"submission",
    label:"Submissions"
  },
  {
    value:"announcement",
    label:"Announcements"
  },
  {
    value:"permission",
    label:"Permissions"
  }
];

const typeIconMap = {
  account:UserPlus,
  assignment:ClipboardList,
  submission:BookOpen,
  announcement:Megaphone,
  permission:ShieldCheck
};

function AdminLogs() {

  const [logs,setLogs] =
    useState([]);

  const [loading,setLoading] =
    useState(true);

  const [search,setSearch] =
    useState("");

  const [type,setType] =
    useState("all");

  const fetchLogs =
    useCallback(
    async ()=>{

      try{

        setLoading(true);

        const response =
          await api.get(
            "/admin/logs",
            {
              params:{
                query:search,
                type
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
      type
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

  },[
    fetchLogs
  ]);

  return (

    <AdminLayout
      title="Logs"
    >

      <PageHeader
        title="Logs"
        subtitle="Search recent activity across accounts, assignments, submissions, and announcements"
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
            value={type}
            onChange={(event)=>
              setType(
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
            {logTypes.map(
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
                  No logs match your filters
                </div>
              )
              : logs.map(
                log=>{
                  const Icon =
                    typeIconMap[log.type] ||
                    CalendarClock;

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
                          className="
                          bg-teal-100
                          text-[#008C95]
                          p-3
                          rounded-full
                          "
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
                              className="
                              bg-gray-100
                              text-gray-700
                              text-xs
                              px-3
                              py-1
                              rounded-full
                              capitalize
                              "
                            >
                              {log.type}
                            </span>

                            {log.studentName && (
                              <span className="bg-teal-50 text-[#008C95] text-xs px-3 py-1 rounded-full">
                                {log.studentName}
                              </span>
                            )}

                            {log.rollNumber && (
                              <span className="bg-teal-50 text-[#008C95] text-xs px-3 py-1 rounded-full">
                                Roll {log.rollNumber}
                              </span>
                            )}

                            {log.classSection && (
                              <span className="bg-teal-50 text-[#008C95] text-xs px-3 py-1 rounded-full">
                                {log.classSection}
                              </span>
                            )}

                            {log.subject && (
                              <span className="bg-teal-50 text-[#008C95] text-xs px-3 py-1 rounded-full">
                                {log.subject}
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

    </AdminLayout>

  );

}

export default AdminLogs;
