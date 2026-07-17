import {
  useEffect,
  useState
}
from "react";

import api
from "../../api/axios";

function CreateAnnouncementModal({
  open,
  onClose,
  onSuccess
}) {

  const [classes,setClasses] =
    useState([]);

  const [loading,setLoading] =
    useState(false);

  const [form,setForm] =
    useState({

      title:"",
      content:"",
      classId:""

    });

  useEffect(()=>{

    const fetchClasses =
      async ()=>{

        const response =
          await api.get(
            "/teacher/classes"
          );

        setClasses(
          response.data
        );

      };

    if(open){

      fetchClasses();

    }

  },[open]);

  const handleSubmit =
    async (e)=>{

      e.preventDefault();

      setLoading(true);

      try{

        await api.post(
          "/teacher/announcements",
          form
        );

        onSuccess();

        onClose();

      }catch(error){

        console.error(error);

      }finally{

        setLoading(false);

      }

    };

  if(!open){

    return null;

  }

  return (

    <div
      className="
      fixed
      inset-0
      bg-black/50
      flex
      items-center
      justify-center
      p-4
      z-50
      "
    >

      <div
        className="
        bg-white
        p-6
        sm:p-8
        rounded-2xl
        w-full
        max-w-[600px]
        max-h-[calc(100vh-2rem)]
        overflow-y-auto
        "
      >

        <h2
          className="
          text-xl
          sm:text-2xl
          font-bold
          mb-6
          "
        >
          Create Announcement
        </h2>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          <input

            placeholder="Title"

            className="
            w-full
            border
            p-3
            rounded-xl
            "

            onChange={(e)=>

              setForm({

                ...form,

                title:e.target.value

              })

            }

          />

          <textarea

            placeholder="Content"

            className="
            w-full
            border
            p-3
            rounded-xl
            "

            rows={5}

            onChange={(e)=>

              setForm({

                ...form,

                content:e.target.value

              })

            }

          />

          <select

            className="
            w-full
            border
            p-3
            rounded-xl
            "

            onChange={(e)=>

              setForm({

                ...form,

                classId:e.target.value

              })

            }

          >

            <option value="">
              Select Subject
            </option>

            {classes.map(
              classItem=>(

                <option

                  key={classItem.id}

                  value={classItem.id}

                >

                  {`${classItem.subject} (${classItem.name})`}

                </option>

              )
            )}

          </select>

          <div
            className="
            flex
            flex-col
            sm:flex-row
            gap-3
            "
          >

            <button

              type="button"

              onClick={onClose}

              className="
              flex-1
              border
              py-3
              rounded-xl
              "

            >

              Cancel

            </button>

            <button

              disabled={loading}

              className="
              flex-1
              bg-[#008C95]
              text-white
              py-3
              rounded-xl
              "

            >

              {

                loading

                ? "Creating..."

                : "Create"

              }

            </button>

          </div>

        </form>

      </div>

    </div>

  );

}

export default CreateAnnouncementModal;
