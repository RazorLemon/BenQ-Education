import { motion }
from "framer-motion";

function ClassesTable({
  classes
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

        <thead className="bg-gray-50">

          <tr>

            <th className="p-4 text-left">
              Class & Section
            </th>

            <th className="p-4 text-left">
              Code
            </th>

            <th className="p-4 text-left">
              Subject
            </th>

            <th className="p-4 text-left">
              Teacher
            </th>

            <th className="p-4 text-left">
              Students
            </th>

            <th className="p-4 text-left">
              Assignments
            </th>

          </tr>

        </thead>

        <tbody>

          {classes.map(
            (classItem)=>(

              <tr
                key={classItem.id}
                className="border-t"
              >

                <td className="p-4">
                  {classItem.name}
                </td>

                <td className="p-4">
                  {classItem.code}
                </td>

                <td className="p-4">
                  {classItem.subject}
                </td>

                <td className="p-4">
                  {
                    classItem.teacher
                    ?.user?.name
                  }
                </td>

                <td className="p-4">
                  {
                    classItem.enrollments
                    .length
                  }
                </td>

                <td className="p-4">
                  {
                    classItem.assignments
                    .length
                  }
                </td>

              </tr>

            )
          )}

        </tbody>

      </table>

    </motion.div>

  );

}

export default ClassesTable;
