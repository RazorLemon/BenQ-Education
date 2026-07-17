import {
  useEffect,
  useState
}
from "react";

import api
from "../../api/axios";

const hours =
  Array.from(
    {
      length:12
    },
    (_,index)=>
      String(index + 1)
  );

const minutes =
  Array.from(
    {
      length:60
    },
    (_,index)=>
      String(index).padStart(2, "0")
  );

const buildDeadlineValue = ({
  date,
  hour,
  minute,
  period
})=>{
  if(
    !date ||
    !hour ||
    !minute ||
    !period
  ){
    return "";
  }

  const hourNumber =
    Number(hour);

  const hour24 =
    period === "PM"
    ? hourNumber === 12
      ? 12
      : hourNumber + 12
    : hourNumber === 12
    ? 0
    : hourNumber;

  return `${date}T${String(hour24).padStart(2, "0")}:${minute}`;
};

function CreateAssignmentModal({
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
      description:"",
      dueDate:"",
      classId:"",
      attachmentUrl:"",
      attachmentName:""

    });

  const [deadline,setDeadline] =
    useState({
      date:"",
      hour:"",
      minute:"00",
      period:"AM"
    });

  useEffect(()=>{

    const fetchClasses =
      async ()=>{

        try{

          const response =
            await api.get(
              "/teacher/classes"
            );

          setClasses(
            response.data
          );

        }catch(error){

          console.error(error);

        }

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
          "/teacher/assignments",
          {
            ...form,
            dueDate:
              buildDeadlineValue(
                deadline
              )
          }
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
        rounded-2xl
        p-6
        sm:p-8
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
          Create Assignment
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

            placeholder="Description"

            className="
            w-full
            border
            p-3
            rounded-xl
            "

            onChange={(e)=>

              setForm({
                ...form,
                description:e.target.value
              })

            }

          />

          <div className="space-y-2">
            <label
              className="
              block
              text-sm
              font-semibold
              text-gray-700
              "
            >
              Deadline
            </label>

            <div
              className="
              grid
              grid-cols-1
              sm:grid-cols-[1.5fr_1fr_1fr_1fr]
              gap-3
              "
            >
              <input

                type="date"

                value={deadline.date}

                required

                className="
                w-full
                border
                p-3
                rounded-xl
                "

                onChange={(e)=>

                  setDeadline({
                    ...deadline,
                    date:e.target.value
                  })

                }

              />

              <select

                value={deadline.hour}

                required

                className="
                w-full
                border
                p-3
                rounded-xl
                "

                onChange={(e)=>

                  setDeadline({
                    ...deadline,
                    hour:e.target.value
                  })

                }

              >

                <option value="">
                  Hour
                </option>

                {hours.map(
                  hour=>(
                    <option
                      key={hour}
                      value={hour}
                    >
                      {hour}
                    </option>
                  )
                )}

              </select>

              <select

                value={deadline.minute}

                required

                className="
                w-full
                border
                p-3
                rounded-xl
                "

                onChange={(e)=>

                  setDeadline({
                    ...deadline,
                    minute:e.target.value
                  })

                }

              >

                {minutes.map(
                  minute=>(
                    <option
                      key={minute}
                      value={minute}
                    >
                      {minute}
                    </option>
                  )
                )}

              </select>

              <select

                value={deadline.period}

                required

                className="
                w-full
                border
                p-3
                rounded-xl
                "

                onChange={(e)=>

                  setDeadline({
                    ...deadline,
                    period:e.target.value
                  })

                }

              >

                <option value="AM">
                  AM
                </option>

                <option value="PM">
                  PM
                </option>

              </select>
            </div>
          </div>

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
            border
            border-dashed
            border-teal-300
            bg-teal-50
            rounded-2xl
            p-4
            space-y-3
            "
          >

            <input

              type="url"

              placeholder="Shared file link (Google Drive, OneDrive, etc.)"

              value={form.attachmentUrl}

              className="
              w-full
              border
              bg-white
              p-3
              rounded-xl
              "

              onChange={(e)=>

                setForm({
                  ...form,
                  attachmentUrl:e.target.value
                })

              }

            />

            <input

              placeholder="Link name shown to students"

              value={form.attachmentName}

              className="
              w-full
              border
              bg-white
              p-3
              rounded-xl
              "

              onChange={(e)=>

                setForm({
                  ...form,
                  attachmentName:e.target.value
                })

              }

            />

          </div>

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

                : "Create Assignment"

              }

            </button>

          </div>

        </form>

      </div>

    </div>

  );

}

export default CreateAssignmentModal;
