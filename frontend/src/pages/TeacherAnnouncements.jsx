import {
  useCallback,
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

import AnnouncementFeed
from "../components/teachers/AnnouncementFeed";

import CreateAnnouncementModal
from "../components/teachers/CreateAnnouncementModal";

function TeacherAnnouncements() {

  const [announcements,setAnnouncements] =
    useState([]);

  const [loading,setLoading] =
    useState(true);

  const [search,setSearch] =
    useState("");

  const [classFilter,setClassFilter] =
    useState("all");

  const [sortBy,setSortBy] =
    useState("newest");

  const [open,setOpen] =
    useState(false);

  const fetchAnnouncements =
    useCallback(
    async ()=>{

      try{

        const response =
          await api.get(
            "/teacher/announcements"
          );

        setAnnouncements(
          response.data
        );

      }catch(error){

        console.error(error);

      }finally{

        setLoading(false);

      }

    },
    []
    );

  useEffect(()=>{

    fetchAnnouncements();

  },[fetchAnnouncements]);

  const deleteAnnouncement =
    async (id)=>{

      try{

        await api.delete(
          `/teacher/announcements/${id}`
        );

        fetchAnnouncements();

      }catch(error){

        console.error(error);

      }

    };

  const uniqueClasses =
    [...new Set(

      announcements
      .map(
        announcement=>
          announcement.class
          ?.name
      )
      .filter(Boolean)

    )];

  let filteredAnnouncements =
    announcements.filter(
      announcement=>{

        const matchesSearch =

          announcement.title
          .toLowerCase()
          .includes(
            search.toLowerCase()
          )

          ||

          announcement.content
          .toLowerCase()
          .includes(
            search.toLowerCase()
          );

        const matchesClass =

          classFilter ===
          "all"

          ||

          announcement.class
          ?.name

          ===

          classFilter;

        return (

          matchesSearch

          &&

          matchesClass

        );

      }
    );

  filteredAnnouncements.sort(
    (a,b)=>{

      if(
        sortBy ===
        "newest"
      ){

        return (

          new Date(
            b.createdAt
          )

          -

          new Date(
            a.createdAt
          )

        );

      }

      return (

        new Date(
          a.createdAt
        )

        -

        new Date(
          b.createdAt
        )

      );

    }
  );

  return (

    <TeacherLayout
      title="Announcements"
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
          title="Announcements"
          subtitle="Manage announcements"
        />

        <Button
          onClick={()=>
            setOpen(true)
          }
        >
          + Create Announcement
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
          md:grid-cols-3
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
            Search announcements...
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

            <option value="newest">
              Newest First
            </option>

            <option value="oldest">
              Oldest First
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

          <AnnouncementFeed

            announcements={
              filteredAnnouncements
            }

            onDelete={
              deleteAnnouncement
            }

          />

        )

      }

      <CreateAnnouncementModal

        open={open}

        onClose={()=>
          setOpen(false)
        }

        onSuccess={
          fetchAnnouncements
        }

      />

    </TeacherLayout>

  );

}

export default TeacherAnnouncements;
