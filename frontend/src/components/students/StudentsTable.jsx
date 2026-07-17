import {
  useState
}
from "react";

import { motion }
from "framer-motion";

import StudentDetailsModal
from "./StudentDetailsModal";

function StudentsTable({
  students,
  onSuccess
}) {

  const [
    selectedStudent,
    setSelectedStudent
  ] = useState(null);

  const [
    open,
    setOpen
  ] = useState(false);

  return (

    <>

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
                Roll Number
              </th>

              <th className="p-4 text-left">
                Class & Section
              </th>

              <th className="p-4 text-left">
                Subjects
              </th>

            </tr>

          </thead>

          <tbody>

            {students.map(
              (student)=>(

                <tr

                  key={student.id}

                  onClick={()=>{

                    setSelectedStudent(
                      student
                    );

                    setOpen(
                      true
                    );

                  }}

                  className="
                  border-t
                  cursor-pointer
                  hover:bg-gray-50
                  transition
                  "

                >

                  <td className="p-4">
                    {student.user.name}
                  </td>

                  <td className="p-4">
                    {student.user.email}
                  </td>

                  <td className="p-4">
                    {student.rollNumber}
                  </td>

                  <td className="p-4">
                    {
                      student.classSection ||
                      "Not set"
                    }
                  </td>

                  <td className="p-4">
                    {
                      student.enrollments
                      .length
                    }
                  </td>

                </tr>

              )
            )}

          </tbody>

        </table>

      </motion.div>

      <StudentDetailsModal

        key={
          selectedStudent?.id ||
          "student-details"
        }

        student={
          selectedStudent
        }

        open={
          open
        }

        onClose={()=>
          setOpen(false)
        }

        onSuccess={
          onSuccess
        }

      />

    </>

  );

}

export default StudentsTable;
