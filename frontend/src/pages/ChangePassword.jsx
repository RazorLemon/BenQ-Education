import {
  useState
}
from "react";

import api
from "../api/axios";

import {
  useNavigate
}
from "react-router-dom";

import { ArrowLeft }
from "lucide-react";

import {
  useContext
}
from "react";

import {
  AuthContext
}
from "../context/auth-context";

import {
  notifyError,
  notifySuccess
}
from "../utils/toast";

function ChangePassword() {

  const navigate =
    useNavigate();

  const { user } =
    useContext(AuthContext);

  const [
    currentPassword,
    setCurrentPassword
  ] = useState("");

  const [
    newPassword,
    setNewPassword
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword
  ] = useState("");

  const [
    loading,
    setLoading
  ] = useState(false);

  const handleSubmit =
    async ()=>{

      if(
        !currentPassword ||
        !newPassword ||
        !confirmPassword
      ){

        notifyError(
          "Please fill all fields"
        );

        return;

      }

      if(
        newPassword !==
        confirmPassword
      ){

        notifyError(
          "Passwords do not match"
        );

        return;

      }

      try{

        setLoading(true);

        const response =
          await api.post(

            "/auth/change-password",

            {
              currentPassword,
              newPassword
            }

          );

        notifySuccess(
          response.data.message
        );

        navigate(
          user?.role === "ADMIN"
          ? "/admin"
          : user?.role === "TEACHER"
          ? "/teacher"
          : "/student"
        );

      }catch(error){

        console.error(error);

      }finally{

        setLoading(false);

      }

    };

  return (

    <div
      className="
      min-h-screen
      bg-[#F8F9FC]
      flex
      items-center
      justify-center
      "
    >

      <div
        className="
        bg-white
        rounded-3xl
        shadow-lg
        p-8
        w-full
        max-w-lg
        "
      >

        <div
          className="
          flex
          items-start
          gap-3
          mb-6
          "
        >

          <button
            type="button"
            onClick={()=>
              navigate(-1)
            }
            aria-label="Back"
            title="Back"
            className="
            inline-flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-full
            border
            border-gray-200
            bg-white
            text-gray-700
            shadow-sm
            transition
            hover:border-[#008C95]
            hover:text-[#008C95]
            "
          >
            <ArrowLeft size={20} />
          </button>

          <h1
            className="
            text-3xl
            font-bold
            "
          >
            Change Password
          </h1>

        </div>

        <div
          className="
          space-y-4
          "
        >

          <input

            type="password"

            placeholder="
            Current Password
            "

            value={
              currentPassword
            }

            onChange={(e)=>

              setCurrentPassword(
                e.target.value
              )

            }

            className="
            w-full
            border
            rounded-xl
            p-3
            "

          />

          <input

            type="password"

            placeholder="
            New Password
            "

            value={
              newPassword
            }

            onChange={(e)=>

              setNewPassword(
                e.target.value
              )

            }

            className="
            w-full
            border
            rounded-xl
            p-3
            "

          />

          <input

            type="password"

            placeholder="
            Confirm Password
            "

            value={
              confirmPassword
            }

            onChange={(e)=>

              setConfirmPassword(
                e.target.value
              )

            }

            className="
            w-full
            border
            rounded-xl
            p-3
            "

          />

          <button

            onClick={
              handleSubmit
            }

            disabled={
              loading
            }

            className="
            w-full
            bg-[#008C95]
            text-white
            py-3
            rounded-xl
            font-medium
            "

          >

            {

              loading

              ? "Updating..."

              : "Update Password"

            }

          </button>

        </div>

      </div>

    </div>

  );

}

export default ChangePassword;
