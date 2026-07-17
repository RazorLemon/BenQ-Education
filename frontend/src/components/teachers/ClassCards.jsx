import {
  School,
  BookOpen,
  Users,
  User,
  CalendarDays
}
from "lucide-react";

import { motion }
from "framer-motion";

import {
  useNavigate
}
from "react-router-dom";

import {
  formatAcademicSession
}
from "../../utils/academicSession";

function ClassCards({
  classes
}) {

  const navigate =
    useNavigate();

  return (

    <div
      className="
      grid
      md:grid-cols-2
      xl:grid-cols-3
      gap-6
      "
    >

      {classes.map(
        (classItem,index)=>(

          <motion.div

            key={classItem.id}

            onClick={()=>

              navigate(
                `/teacher/classes/${classItem.id}`
              )

            }

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
              y:-6
            }}

            className="
            bg-white
            rounded-3xl
            shadow-md
            hover:shadow-xl
            transition-all
            p-6
            border
            border-gray-100
            cursor-pointer
            "

          >

            <div
              className="
              flex
              justify-between
              items-start
              mb-5
              "
            >

              <div>

                <h3
                  className="
                  text-xl
                  font-bold
                  "
                >
                  {classItem.subject}
                </h3>

                <p
                  className="
                  text-gray-500
                  "
                >
                  Class & Section: {classItem.name}
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

                <School
                  size={22}
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
                  {classItem.code}
                </span>

              </div>

              <div
                className="
                flex
                items-center
                gap-3
                "
              >

                <CalendarDays
                  size={16}
                />

                <span>
                  {formatAcademicSession(classItem.year)}
                </span>

              </div>

              <div
                className="
                flex
                items-center
                gap-3
                "
              >

                <User
                  size={16}
                />

                <span>
                  {
                    classItem.teacher
                    ?.user?.name
                    ||
                    "Assigned Teacher"
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
                    classItem.enrollments
                    ?.length || 0
                  }

                  {" "}Students

                </span>

              </div>

            </div>

            <div
              className="
              mt-6
              pt-4
              border-t
              "
            >

              <div
                className="
                flex
                justify-between
                text-sm
                "
              >

                <span
                  className="
                  text-gray-500
                  "
                >
                  Assignments
                </span>

                <span
                  className="
                  font-semibold
                  text-[#008C95]
                  "
                >
                  {
                    classItem.assignments
                    ?.length || 0
                  }
                </span>

              </div>

            </div>

          </motion.div>

        )
      )}

    </div>

  );

}

export default ClassCards;
