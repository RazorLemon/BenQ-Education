import {
  FileText,
  Calendar,
  BookOpen,
  Users
}
from "lucide-react";

import {
  useState
}
from "react";

import AdminAssignmentDetailsModal
from "./AdminAssignmentDetailsModal";

function AssignmentsCards({
  assignments
}) {

  const [
    selectedAssignment,
    setSelectedAssignment
  ] = useState(null);

  const [
    open,
    setOpen
  ] = useState(false);

  return (

    <>

      <div
        className="
        grid
        md:grid-cols-2
        xl:grid-cols-3
        gap-6
        "
      >

        {assignments.map(
          assignment=>(

            <div

              key={
                assignment.id
              }

              onClick={()=>{

                setSelectedAssignment(
                  assignment
                );

                setOpen(
                  true
                );

              }}

              className="
              bg-white
              rounded-3xl
              shadow-md
              hover:shadow-xl
              transition-all
              p-6
              cursor-pointer
              "

            >

              <div
                className="
                flex
                justify-between
                items-start
                mb-4
                "
              >

                <div>

                  <h3
                    className="
                    text-lg
                    font-bold
                    "
                  >
                    {
                      assignment.title
                    }
                  </h3>

                  <p
                    className="
                    text-gray-500
                    text-sm
                    "
                  >
                    {
                      assignment.class
                      ?.name
                    }
                  </p>

                </div>

                <div
                  className="
                  bg-teal-100
                  text-[#008C95]
                  p-3
                  rounded-2xl
                  "
                >

                  <FileText
                    size={20}
                  />

                </div>

              </div>

              <div
                className="
                space-y-3
                text-sm
                "
              >

                <div
                  className="
                  flex
                  items-center
                  gap-3
                  "
                >

                  <BookOpen
                    size={16}
                  />

                  <span>

                    {
                      assignment.class
                      ?.subject
                    }

                  </span>

                </div>

                <div
                  className="
                  flex
                  items-center
                  gap-3
                  "
                >

                  <Calendar
                    size={16}
                  />

                  <span>

                    Due:

                    {" "}

                    {

                      new Date(
                        assignment.dueDate
                      )
                      .toLocaleDateString()

                    }

                  </span>

                </div>

                <div
                  className="
                  flex
                  items-center
                  gap-3
                  "
                >

                  <Users
                    size={16}
                  />

                  <span>

                    {
                      assignment
                      .submissions
                      ?.length || 0
                    }

                    {" "}
                    Submissions

                  </span>

                </div>

              </div>

              {

                assignment
                .attachmentUrl && (

                  <div
                    className="
                    mt-4
                    text-xs
                    text-[#008C95]
                    font-medium
                    "
                  >

                    📎 Contains Resource Link

                  </div>

                )

              }

            </div>

          )
        )}

      </div>

      <AdminAssignmentDetailsModal

        assignment={
          selectedAssignment
        }

        open={
          open
        }

        onClose={()=>
          setOpen(false)
        }

      />

    </>

  );

}

export default AssignmentsCards;