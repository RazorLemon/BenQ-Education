import {
  useEffect,
  useState,
  useContext
} from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/axios";
import { AuthContext } from "../context/auth-context";

function Login() {

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [schoolCode, setSchoolCode] =
    useState("");

  const [error, setError] =
    useState("");

  const [loggingIn, setLoggingIn] =
    useState(false);

  const navigate =
    useNavigate();

  const { login } =
    useContext(AuthContext);

  const {
    user,
    isAuthenticated
  } = useContext(AuthContext);

  useEffect(()=>{

    if(!isAuthenticated){
      return;
    }

    if(user?.role === "ADMIN"){
      navigate("/admin", {
        replace:true
      });
    }

    if(user?.role === "TEACHER"){
      navigate("/teacher", {
        replace:true
      });
    }

    if(user?.role === "STUDENT"){
      navigate("/student", {
        replace:true
      });
    }

  },[
    isAuthenticated,
    navigate,
    user
  ]);

  const handleLogin =
    async () => {

      if(loggingIn){
        return;
      }

      setLoggingIn(true);
      setError("");

      const trimmedSchoolCode =
        schoolCode.trim();

      if(!trimmedSchoolCode){
        setError("Enter your school code");
        setLoggingIn(false);
        return;
      }

      try {

        const response =
          await api.post(
            "/auth/login",
            {
              email,
              password,
              schoolCode:trimmedSchoolCode
            }
          );

        login(
          response.data.user,
          response.data.token
        );

        const role =
          response.data.user.role;

        if (role === "ADMIN") {
          navigate("/admin");
        }

        if (role === "TEACHER") {
          navigate("/teacher");
        }

        if (role === "STUDENT") {
          navigate("/student");
        }

      } catch (err) {

        setError(
          err.response?.data?.message ||
          "Login failed"
        );

      } finally {

        setLoggingIn(false);

      }

    };

  return (

    <div
      className="
      min-h-screen
      flex
      items-center
      justify-center
      bg-gray-100
      px-4
      py-8
      "
    >

      <div
        className="
        bg-white
        p-6
        sm:p-8
        rounded-2xl
        shadow-xl
        w-full
        max-w-[400px]
        "
      >

        <h1
          className="
          text-2xl
          sm:text-3xl
          font-bold
          text-center
          mb-6
          text-teal-700
          "
        >
          Smart Classroom
        </h1>

        {error && (
          <p className="text-red-500 mb-4">
            {error}
          </p>
        )}

        <input
          type="text"
          placeholder="School code"
          value={schoolCode}
          onChange={(e)=>
            setSchoolCode(e.target.value)
          }
          autoComplete="organization"
          className="w-full border p-3 rounded-lg mb-4"
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e)=>
            setEmail(e.target.value)
          }
          className="w-full border p-3 rounded-lg mb-4"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e)=>
            setPassword(e.target.value)
          }
          className="w-full border p-3 rounded-lg mb-4"
        />

        <button
          onClick={handleLogin}
          disabled={loggingIn}
          className="
          w-full
          bg-teal-700
          text-white
          py-3
          rounded-lg
          hover:bg-teal-800
          transition
          disabled:opacity-60
          disabled:cursor-not-allowed
          "
        >
          {
            loggingIn
              ? "Logging in..."
              : "Login"
          }
        </button>

      </div>

    </div>

  );

}

export default Login;
