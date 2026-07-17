function AdminAssignmentDetailsModal({

  assignment,

  open,

  onClose

}) {

  if(
    !open ||
    !assignment
  ){

    return null;

  }

  return (

    <div

      onClick={onClose}

      className="
      fixed
      inset-0
      bg-black/50
      flex
      items-center
      justify-center
      z-50
      "

    >

      <div

        onClick={(e)=>
          e.stopPropagation()
        }

        className="
        bg-white
        rounded-3xl
        p-8
        w-full
        max-w-2xl
        "

      >

        <div
          className="
          flex
          justify-between
          mb-6
          "
        >

          <h2
            className="
            text-2xl
            font-bold
            "
          >
            Assignment Details
          </h2>

          <button
            onClick={onClose}
          >
            ✕
          </button>

        </div>

        <div
          className="
          space-y-4
          "
        >

          <div>

            <p
              className="
              text-sm
              text-gray-500
              "
            >
              Title
            </p>

            <p>
              {
                assignment.title
              }
            </p>

          </div>

          <div>

            <p
              className="
              text-sm
              text-gray-500
              "
            >
              Description
            </p>

            <p>
              {
                assignment.description
              }
            </p>

          </div>

          <div>

            <p
              className="
              text-sm
              text-gray-500
              "
            >
              Class
            </p>

            <p>
              {
                assignment.class
                ?.name
              }
            </p>

          </div>

          <div>

            <p
              className="
              text-sm
              text-gray-500
              "
            >
              Due Date
            </p>

            <p>

              {

                new Date(
                  assignment.dueDate
                )
                .toLocaleDateString()

              }

            </p>

          </div>

          <div>

            <p
              className="
              text-sm
              text-gray-500
              "
            >
              Submissions
            </p>

            <p>

              {
                assignment
                .submissions
                ?.length || 0
              }

            </p>

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

                className="
                text-[#008C95]
                font-semibold
                hover:underline
                "

              >

                Open Resource Link

              </a>

            )

          }

        </div>

      </div>

    </div>

  );

}

export default AdminAssignmentDetailsModal;
