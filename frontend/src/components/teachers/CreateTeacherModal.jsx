import { useState } from "react";
import { motion } from "framer-motion";

import api from "../../api/axios";
import {
  notifySuccess
}
from "../../utils/toast";

function CreateTeacherModal({
  open,
  onClose,
  onSuccess
}) {

  const [form,setForm] =
    useState({
      name:"",
      email:"",
      password:"",
      employeeId:""
    });

  if(!open) return null;

  const handleSubmit =
    async (e)=>{

      e.preventDefault();

      try{

        const response =
        await api.post(
          "/admin/teachers",
          form
        );

        notifySuccess(
          response.data.emailSent
          ? "Teacher created and credentials email sent"
          : "Teacher created. Configure SMTP to send credentials by email."
        );

        onSuccess();

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
          opacity:0,
          scale:0.9
        }}

        animate={{
          opacity:1,
          scale:1
        }}

        className="
        bg-white
        rounded-2xl
        p-6
        sm:p-8
        w-full
        max-w-[500px]
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
          Create Teacher
        </h2>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          <input
            placeholder="Name"
            className="w-full border p-3 rounded-xl"
            onChange={(e)=>
              setForm({
                ...form,
                name:e.target.value
              })
            }
          />

          <input
            placeholder="Email"
            className="w-full border p-3 rounded-xl"
            onChange={(e)=>
              setForm({
                ...form,
                email:e.target.value
              })
            }
          />

          <input
            placeholder="Password"
            className="w-full border p-3 rounded-xl"
            onChange={(e)=>
              setForm({
                ...form,
                password:e.target.value
              })
            }
          />

          <input
            placeholder="Employee ID"
            className="w-full border p-3 rounded-xl"
            onChange={(e)=>
              setForm({
                ...form,
                employeeId:e.target.value
              })
            }
          />

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

export default CreateTeacherModal;
