function AnnouncementsTable({
  announcements,
  onDelete
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
              Content
            </th>

            <th className="p-4 text-left">
              Actions
            </th>

          </tr>

        </thead>

        <tbody>

          {announcements.map(
            announcement=>(

              <tr
                key={announcement.id}
                className="border-t"
              >

                <td className="p-4 font-semibold">
                  {announcement.title}
                </td>

                <td className="p-4">
                  {announcement.content}
                </td>

                <td className="p-4">

                  <button

                    onClick={()=>
                      onDelete(
                        announcement.id
                      )
                    }

                    className="
                    bg-red-500
                    hover:bg-red-600
                    text-white
                    px-4
                    py-2
                    rounded-lg
                    "

                  >

                    Delete

                  </button>

                </td>

              </tr>

            )
          )}

        </tbody>

      </table>

    </div>

  );

}

export default AnnouncementsTable;