import {
  School,
  Users,
  BookOpen,
  CalendarDays,
  User
}
from "lucide-react";

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
        classItem=>(

          <div

            key={classItem.id}

            onClick={()=>{

              navigate(
                `/admin/classes/${classItem.id}`
              );

            }}

            className="
            bg-white
            rounded-3xl
            shadow-md
            hover:shadow-xl
            cursor-pointer
            transition-all
            p-6
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

                <School size={22} />

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

                <BookOpen size={16} />

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

                <CalendarDays size={16} />

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

                <User size={16} />

                <span>
                  {
                    classItem.teacher
                    ?.user?.name ||
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

                <Users size={16} />

                <span>

                  {
                    classItem.enrollments
                    ?.length || 0
                  }

                  {" "}
                  Students

                </span>

              </div>

            </div>

          </div>

        )
      )}

    </div>

  );

}

export default ClassCards;
