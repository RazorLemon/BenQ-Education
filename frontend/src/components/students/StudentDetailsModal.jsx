import {
  useEffect,
  useState
}
from "react";

import api
from "../../api/axios";

import {
  notifyError,
  notifySuccess
}
from "../../utils/toast";

function StudentDetailsModal({

  student,
  open,
  onClose,
  onSuccess

}) {

  const [form,setForm] =
    useState(()=>
      student
        ? {
          name:
            student.user.name,

          email:
            student.user.email,

          rollNumber:
            student.rollNumber,

          classSection:
            student.classSection || ""
        }
        : null
    );

  const [classes,setClasses] =
    useState([]);

  const [
  enrollments,
  setEnrollments
] = useState(()=>
  student?.enrollments ||
  []
);

  const [selectedClass,setSelectedClass] =
    useState("");

  const [resetPassword,setResetPassword] =
    useState("");

  const [resettingPassword,setResettingPassword] =
    useState(false);

  useEffect(()=>{
    if(!open || !student){
      setForm(null);
      setEnrollments([]);
      return;
    }

    setForm({
      name:
        student.user.name,
      email:
        student.user.email,
      rollNumber:
        student.rollNumber,
      classSection:
        student.classSection || ""
    });

    setEnrollments(
      student.enrollments || []
    );

    setSelectedClass("");
    setResetPassword("");
  },[
    open,
    student
  ]);

  useEffect(()=>{

    const fetchClasses =
      async ()=>{

        try{

          const response =
            await api.get(
              "/admin/classes"
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

  if(
    !open ||
    !student ||
    !form
  ){

    return null;

  }

  const updateStudent =
    async ()=>{

      try{

        await api.put(

          `/admin/students/${student.id}`,

          form

        );

        onSuccess();
        onClose();

      }catch(error){

        console.error(error);

      }

    };

  const deleteStudent =
    async ()=>{

      if(
        !window.confirm(
          "Delete student?"
        )
      ){
        return;
      }

      try{

        await api.delete(
          `/admin/students/${student.id}`
        );

        onSuccess();
        onClose();

      }catch(error){

        console.error(error);

      }

    };

  const enrollStudent =
    async ()=>{

      try{

        await api.post(

          `/admin/students/${student.id}/enroll`,

          {
            classId:
              selectedClass
          }

        );

        onSuccess();

        notifySuccess(
          "Student enrolled"
        );

      }catch(error){

        console.error(error);

      }

    };

  const resetStudentPassword =
    async ()=>{

      if(resetPassword.length < 8){
        notifyError(
          "Password must be at least 8 characters"
        );

        return;
      }

      try{

        setResettingPassword(true);

        await api.put(

          `/admin/students/${student.id}/reset-password`,

          {
            newPassword:
              resetPassword
          }

        );

        setResetPassword("");

        notifySuccess(
          "Password reset successfully"
        );

      }catch(error){

        console.error(error);

      }finally{

        setResettingPassword(false);

      }

    };

  return (

    <div
      className="
      fixed
      inset-0
      bg-black/50
      flex
      items-center
      justify-center
      z-50
      "
      onClick={onClose}
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
            Student Details
          </h2>

          <button
            onClick={onClose}
            aria-label="Close"
            title="Close"
          >
            ✕
          </button>

        </div>

        <div
          className="
          space-y-4
          "
        >

          <input

            value={form.name}

            onChange={(e)=>

              setForm({

                ...form,

                name:
                  e.target.value

              })

            }

            className="
            w-full
            border
            p-3
            rounded-xl
            "

          />

          <input

            value={
              form.classSection
            }

            onChange={(e)=>

              setForm({

                ...form,

                classSection:
                  e.target.value

              })

            }

            placeholder="Class & Section"

            className="
            w-full
            border
            p-3
            rounded-xl
            "

          />

          <input

            value={form.email}

            onChange={(e)=>

              setForm({

                ...form,

                email:
                  e.target.value

              })

            }

            className="
            w-full
            border
            p-3
            rounded-xl
            "

          />

          <input

            value={
              form.rollNumber
            }

            onChange={(e)=>

              setForm({

                ...form,

                rollNumber:
                  e.target.value

              })

            }

            className="
            w-full
            border
            p-3
            rounded-xl
            "

          />

          <div>

            <h3
              className="
              font-semibold
              mb-2
              "
            >
              Enrolled Subjects
            </h3>

            {

 enrollments
 .map(
  enrollment=>(

   <div

    key={
     enrollment.id
    }

    className="
    flex
    justify-between
    items-center
    bg-gray-100
    rounded-xl
    px-3
    py-2
    mb-2
    "

   >

    <span>

     {
      enrollment
      .class
      ?.subject
     }

     {" "}

     <span className="text-gray-500">
      (
      {
       enrollment
       .class
       ?.name
      }
      )
     </span>

    </span>

    <button

     onClick={async()=>{

      if(

       !window.confirm(
        "Remove student from class?"
       )

      ){
       return;
      }

      try{

       await api.delete(

 `/admin/students/${student.id}/classes/${enrollment.classId}`

);

setEnrollments(

 enrollments.filter(
  item=>

   item.id !==
   enrollment.id
 )

);

onSuccess();

      }catch(error){

       console.error(error);

      }

     }}

     className="
     text-red-500
     font-bold
     "

    >

     ✕

    </button>

   </div>

  )
 )

}

          </div>

          <div>

            <h3
              className="
              font-semibold
              mb-2
              "
            >
              Enroll In Subject
            </h3>

            <div
              className="
              flex
              gap-3
              "
            >

              <select

                value={
                  selectedClass
                }

                onChange={(e)=>

                  setSelectedClass(
                    e.target.value
                  )

                }

                className="
                flex-1
                border
                p-3
                rounded-xl
                "

              >

                <option value="">
                  Select Subject
                </option>

                {

                  classes.map(
                    classItem=>(

                      <option

                        key={
                          classItem.id
                        }

                        value={
                          classItem.id
                        }

                      >

                        {
                          `${classItem.subject} (${classItem.name})`
                        }

                      </option>

                    )
                  )

                }

              </select>

              <button

                onClick={
                  enrollStudent
                }

                className="
                bg-[#008C95]
                text-white
                px-5
                rounded-xl
                "

              >

                Enroll

              </button>

            </div>

          </div>

          <div
            className="
            rounded-2xl
            border
            border-orange-100
            bg-orange-50
            p-4
            "
          >

            <label
              className="
              block
              text-sm
              font-semibold
              text-gray-700
              mb-2
              "
            >
              New Password
            </label>

            <input
              type="password"
              value={resetPassword}
              onChange={(event)=>
                setResetPassword(
                  event.target.value
                )
              }
              placeholder="Enter at least 8 characters"
              className="
              w-full
              border
              border-orange-200
              bg-white
              p-3
              rounded-xl
              "
            />

          </div>

          <div
            className="
            flex
            gap-3
            pt-4
            "
          >

            <button
              onClick={
                updateStudent
              }
              className="
              flex-1
              bg-[#008C95]
              text-white
              py-3
              rounded-xl
              "
            >
              Update
            </button>

            <button
              onClick={
                resetStudentPassword
              }
              disabled={
                resettingPassword ||
                resetPassword.length < 8
              }
              className="
              flex-1
              bg-orange-500
              text-white
              py-3
              rounded-xl
              disabled:opacity-50
              "
            >
              {
                resettingPassword
                ? "Resetting..."
                : "Reset Password"
              }
            </button>

            <button
              onClick={
                deleteStudent
              }
              className="
              flex-1
              bg-red-500
              text-white
              py-3
              rounded-xl
              "
            >
              Delete
            </button>

          </div>

        </div>

      </div>

    </div>

  );

}

export default StudentDetailsModal;
