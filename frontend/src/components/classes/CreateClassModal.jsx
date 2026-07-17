import {
  useEffect,
  useState
}
from "react";

import { motion }
from "framer-motion";

import api
from "../../api/axios";

import {
  buildAcademicSessionOptions,
  formatAcademicSession,
  getCurrentAcademicSessionYear
}
from "../../utils/academicSession";

const getInitialForm = () => ({
  name:"",
  code:"",
  subject:"",
  year:String(
    getCurrentAcademicSessionYear()
  ),
  teacherId:""
});

function CreateClassModal({
  open,
  onClose,
  onSuccess,
  endpoint = "/admin/classes",
  showTeacherSelect = true,
  title = "Create Subject"
}) {

  const [teachers,setTeachers] =
    useState([]);

  const [form,setForm] =
    useState(getInitialForm);

  const sessionOptions =
    buildAcademicSessionOptions();

  useEffect(()=>{

    const fetchTeachers =
      async ()=>{

        const response =
          await api.get(
            "/admin/teachers"
          );

        setTeachers(
          response.data
        );

      };

    if(open && showTeacherSelect){

      fetchTeachers();

    }

  },[
    open,
    showTeacherSelect
  ]);

  if(!open) return null;

  const handleSubmit =
    async (e)=>{

      e.preventDefault();

      try{

        await api.post(
          endpoint,
          form
        );

        onSuccess();

        setForm(
          getInitialForm()
        );

        onClose();

      }catch(error){

        console.error(error);

      }

    };

  return (

    <div
      className="
      fixed inset-0
      bg-black/40
      flex items-center
      justify-center
      p-4
      z-50
      "
    >

      <motion.div

        initial={{
          scale:0.9,
          opacity:0
        }}

        animate={{
          scale:1,
          opacity:1
        }}

        className="
        bg-white
        p-6
        sm:p-8
        rounded-2xl
        w-full
        max-w-[550px]
        max-h-[calc(100vh-2rem)]
        overflow-y-auto
        shadow-xl
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
          {title}
        </h2>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          <input
            placeholder="Class & Section (for example 10A)"
            className="w-full border p-3 rounded-xl"
            onChange={(e)=>
              setForm({
                ...form,
                name:e.target.value
              })
            }
          />

          <input
            placeholder="Subject Code"
            className="w-full border p-3 rounded-xl"
            onChange={(e)=>
              setForm({
                ...form,
                code:e.target.value
              })
            }
          />

          <input
            placeholder="Subject Name"
            className="w-full border p-3 rounded-xl"
            onChange={(e)=>
              setForm({
                ...form,
                subject:e.target.value
              })
            }
          />

          <select
            value={form.year}
            className="w-full border p-3 rounded-xl"
            onChange={(e)=>
              setForm({
                ...form,
                year:e.target.value
              })
            }
          >
            {sessionOptions.map(
              year=>(
                <option
                  key={year}
                  value={year}
                >
                  {formatAcademicSession(year)}
                </option>
              )
            )}
          </select>

          {
            showTeacherSelect &&

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
                teacherId:
                  e.target.value
              })
            }

          >

            <option value="">
              Select Teacher
            </option>

            {teachers.map(
              teacher=>(
                <option
                  key={teacher.id}
                  value={teacher.id}
                >
                  {
                    teacher.user.name
                  }
                </option>
              )
            )}

          </select>

          }

          <div className="flex flex-col sm:flex-row gap-3">

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
              type="submit"
              className="
              flex-1
              bg-[#008C95]
              text-white
              py-3
              rounded-xl
              "
            >
              Create
            </button>

          </div>

        </form>

      </motion.div>

    </div>

  );

}

export default CreateClassModal;
