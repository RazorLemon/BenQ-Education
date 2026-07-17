import {
  motion
}
from "framer-motion";

function TeachersTable({
  teachers,
  onTeacherClick
}) {

  return (

    <motion.div

      initial={{
        opacity:0
      }}

      animate={{
        opacity:1
      }}

      className="
      bg-white
      rounded-2xl
      shadow-md
      overflow-x-auto
      "

    >

      <table className="w-full">

        <thead
          className="
          bg-gray-50
          "
        >

          <tr>

            <th className="p-4 text-left">
              Name
            </th>

            <th className="p-4 text-left">
              Email
            </th>

            <th className="p-4 text-left">
              Employee ID
            </th>

          </tr>

        </thead>

        <tbody>

          {

            teachers.map(
              teacher=>(

                <tr

                  key={teacher.id}

                  onClick={()=>
                    onTeacherClick(
                      teacher
                    )
                  }

                  className="
                  border-t
                  cursor-pointer
                  hover:bg-gray-50
                  "

                >

                  <td className="p-4">
                    {teacher.user.name}
                  </td>

                  <td className="p-4">
                    {teacher.user.email}
                  </td>

                  <td className="p-4">
                    {teacher.employeeId}
                  </td>

                </tr>

              )
            )

          }

        </tbody>

      </table>

    </motion.div>

  );

}

export default TeachersTable;
