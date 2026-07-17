function AssignmentsTable({
  assignments
}) {

  return (

    <div
      className="
      bg-white
      rounded-2xl
      shadow-md
      overflow-hidden
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
              Title
            </th>

            <th className="p-4 text-left">
              Class
            </th>

            <th className="p-4 text-left">
              Due Date
            </th>

            <th className="p-4 text-left">
              Submissions
            </th>

            <th className="p-4 text-left">
              Resource Link
            </th>

          </tr>

        </thead>

        <tbody>

          {assignments.map(
            assignment=>(

              <tr
                key={assignment.id}
                className="border-t"
              >

                <td className="p-4">
                  {assignment.title}
                </td>

                <td className="p-4">
                  {assignment.class?.name}
                </td>

                <td className="p-4">
                  {
                    new Date(
                      assignment.dueDate
                    ).toLocaleDateString()
                  }
                </td>

                <td className="p-4">
                  {
                    assignment.submissions
                    ?.length
                  }
                </td>

                <td className="p-4">

                  {assignment.attachmentUrl && (

                    <a

                      href={
                        assignment.attachmentUrl
                      }

                      target="_blank"

                      rel="noreferrer"

                      className="
                      text-[#008C95]
                      hover:underline
                      "

                    >

                      {
                        assignment.attachmentName
                      }

                    </a>

                  )}

                </td>

              </tr>

            )
          )}

        </tbody>

      </table>

    </div>

  );

}

export default AssignmentsTable;
