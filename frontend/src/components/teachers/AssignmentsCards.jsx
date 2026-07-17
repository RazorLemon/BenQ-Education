import {
  useState
}
from "react";

import {
  FileText,
  Calendar,
  BookOpen,
  Clock
}
from "lucide-react";

import { motion }
from "framer-motion";

import AssignmentDetailsModal
from "./AssignmentDetailsModal";

function AssignmentsCards({
  assignments
}) {

  const [
    selectedAssignment,
    setSelectedAssignment
  ] = useState(null);

  const [
    modalOpen,
    setModalOpen
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
          (assignment,index)=>(

            <motion.div

              key={assignment.id}

              onClick={()=>{

                setSelectedAssignment(
                  assignment
                );

                setModalOpen(
                  true
                );

              }}

              initial={{
                opacity:0,
                y:20
              }}

              animate={{
                opacity:1,
                y:0
              }}

              transition={{
                delay:index * 0.05
              }}

              whileHover={{
                y:-5
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
                    {assignment.title}
                  </h3>

                  <p
                    className="
                    text-gray-500
                    text-sm
                    "
                  >
                    {assignment.description}
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
                      ?.name
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
                      ).toLocaleDateString()

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

                  <Clock
                    size={16}
                  />

                  <span>
                    Created:
                    {" "}
                    {
                      new Date(
                        assignment.createdAt
                      ).toLocaleString()
                    }
                  </span>

                </div>

              </div>

              {

                assignment
                .attachmentUrl && (

                  <a

                    href={
                      assignment
                      .attachmentUrl
                    }

                    target="_blank"

                    rel="noreferrer"

                    onClick={(e)=>
                      e.stopPropagation()
                    }

                    className="
                    block
                    mt-5
                    bg-teal-50
                    border
                    border-teal-200
                    rounded-xl
                    p-3
                    text-[#008C95]
                    "

                  >

                    📎 Contains Resource Link

                    <div
                      className="
                      text-xs
                      mt-1
                      "
                    >

                      {

                        assignment
                        .attachmentName

                        ||

                        "Click to View"

                      }

                    </div>

                  </a>

                )

              }

              <div
                className="
                mt-5
                pt-4
                border-t
                "
              >

                <span
                  className="
                  bg-teal-100
                  text-[#008C95]
                  px-3
                  py-1
                  rounded-full
                  text-xs
                  "
                >

                  Published

                </span>

              </div>

            </motion.div>

          )
        )}

      </div>

      <AssignmentDetailsModal

        assignment={
          selectedAssignment
        }

        open={
          modalOpen
        }

        onClose={()=>
          setModalOpen(
            false
          )
        }

      />

    </>

  );

}

export default AssignmentsCards;
