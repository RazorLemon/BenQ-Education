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

  const [title,setTitle] =
    useState("");

  const [content,setContent] =
    useState("");

  const [selected,setSelected] =
    useState([]);

  useEffect(()=>{

    const fetchClasses =
      async ()=>{

        const response =
          await api.get(
            "/admin/classes"
          );

        setClasses(
          response.data
        );

      };

    if(open){

      fetchClasses();

    }

  },[open]);

  const submit =
    async ()=>{

      try{

        await api.post(
          "/admin/announcements",
          {
            title,
            content,
            classIds:selected
          }
        );

        onSuccess();

        onClose();

      }catch(error){

        console.error(error);

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
        rounded-2xl
        p-6
        sm:p-8
        w-full
        max-w-[700px]
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

        <div className="space-y-4">

          <input

            placeholder="Title"

            value={title}

            onChange={(e)=>
              setTitle(
                e.target.value
              )
            }

            className="
            w-full
            border
            p-3
            rounded-xl
            "

          />

          <textarea

            rows={5}

            placeholder="Content"

            value={content}

            onChange={(e)=>
              setContent(
                e.target.value
              )
            }

            className="
            w-full
            border
            p-3
            rounded-xl
            "

          />

          <div
            className="
            border
            rounded-xl
            p-4
            max-h-64
            overflow-y-auto
            "
          >

            {classes.map(
              classItem=>(

                <label

                  key={classItem.id}

                  className="
                  flex
                  items-center
                  gap-3
                  mb-3
                  "

                >

                  <input

                    type="checkbox"

                    value={classItem.id}

                    onChange={(e)=>{

                      if(
                        e.target.checked
                      ){

                        setSelected(

                          prev=>[
                            ...prev,
                            classItem.id
                          ]

                        );

                      }else{

                        setSelected(

                          prev=>

                            prev.filter(
                              id=>
                              id !==
                              classItem.id
                            )

                        );

                      }

                    }}

                  />

                  {`${classItem.subject} (${classItem.name})`}

                </label>

              )
            )}

          </div>

          <button

            onClick={submit}

            className="
            w-full
            bg-[#008C95]
            text-white
            py-3
            rounded-xl
            "

          >

            Create Announcement

          </button>

        </div>

      </div>

    </div>

  );

}

export default CreateAnnouncementModal;
