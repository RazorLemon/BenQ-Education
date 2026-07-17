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

function TeacherDetailsModal({

  teacher,
  open,
  onClose,
  onSuccess

}) {

  const [form,setForm] =
    useState(()=>
      teacher
        ? {
          name:
            teacher.user.name,

          email:
            teacher.user.email,

          employeeId:
            teacher.employeeId
        }
        : null
    );

  const [resetPassword,setResetPassword] =
    useState("");

  const [resettingPassword,setResettingPassword] =
    useState(false);

  useEffect(()=>{
    if(!open || !teacher){
      setForm(null);
      return;
    }

    setForm({
      name:
        teacher.user.name,
      email:
        teacher.user.email,
      employeeId:
        teacher.employeeId
    });

    setResetPassword("");
  },[
    open,
    teacher
  ]);

  if(
    !open ||
    !teacher ||
    !form
  ){

    return null;

  }

  const updateTeacher =
    async ()=>{

      try{

        await api.put(

          `/admin/teachers/${teacher.id}`,

          form

        );

        onSuccess();
        onClose();

      }catch(error){

        console.error(error);

      }

    };

  const deleteTeacher =
    async ()=>{

      if(
        !window.confirm(
          "Delete teacher?"
        )
      ){
        return;
      }

      try{

        await api.delete(
          `/admin/teachers/${teacher.id}`
        );

        onSuccess();
        onClose();

      }catch(error){

        console.error(error);

      }

    };

  const resetTeacherPassword =
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

          `/admin/teachers/${teacher.id}/reset-password`,

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
            Teacher Details
          </h2>

          <button
            onClick={onClose}
            aria-label="Close"
            title="Close"
          >
            ✕
          </button>

        </div>

        <div className="space-y-4">

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
              form.employeeId
            }

            onChange={(e)=>

              setForm({

                ...form,

                employeeId:
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
                updateTeacher
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
                resetTeacherPassword
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
                deleteTeacher
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

export default TeacherDetailsModal;
