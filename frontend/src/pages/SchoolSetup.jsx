import {
  useContext,
  useMemo,
  useState
} from "react";
import {
  Navigate,
  useNavigate
} from "react-router-dom";

import api from "../api/axios";
import {
  AuthContext
} from "../context/auth-context";
import {
  notifySuccess
} from "../utils/toast";

const homeByRole = {
  ADMIN:"/admin",
  TEACHER:"/teacher",
  STUDENT:"/student"
};

const toSchoolCode = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");

function SchoolSetup() {

  const navigate =
    useNavigate();

  const {
    user,
    isAuthenticated
  } = useContext(AuthContext);

  const [loading,setLoading] =
    useState(false);

  const [form,setForm] =
    useState({
      setupSecret:"",
      schoolName:"",
      schoolCode:"",
      adminName:"",
      adminEmail:"",
      adminPassword:""
    });

  const suggestedCode =
    useMemo(
      ()=>
        toSchoolCode(
          form.schoolName
        ),
      [form.schoolName]
    );

  if(isAuthenticated){
    return (
      <Navigate
        to={
          homeByRole[user?.role] ||
          "/"
        }
        replace
      />
    );
  }

  const updateForm = (
    key,
    value
  ) => {
    setForm((previous)=>({
      ...previous,
      [key]:value
    }));
  };

  const handleSubmit =
    async (event)=> {

      event.preventDefault();

      setLoading(true);

      try{

        const payload = {
          schoolName:
            form.schoolName,
          schoolCode:
            form.schoolCode ||
            suggestedCode,
          adminName:
            form.adminName,
          adminEmail:
            form.adminEmail,
          adminPassword:
            form.adminPassword
        };

        await api.post(
          "/setup/school-admin",
          payload,
          {
            headers:{
              "x-setup-secret":
                form.setupSecret
            }
          }
        );

        notifySuccess(
          "School and admin account are ready"
        );

        navigate("/");

      }finally{

        setLoading(false);

      }

    };

  return (

    <div
      className="
      min-h-screen
      bg-gray-100
      px-4
      py-8
      flex
      items-center
      justify-center
      "
    >

      <div
        className="
        w-full
        max-w-2xl
        bg-white
        rounded-2xl
        shadow-xl
        p-6
        sm:p-8
        "
      >

        <div className="mb-6">

          <h1
            className="
            text-2xl
            sm:text-3xl
            font-bold
            text-[#008C95]
            "
          >
            School Setup
          </h1>

          <p
            className="
            text-sm
            text-gray-500
            mt-2
            "
          >
            Create a school and its first admin account.
          </p>

        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          <input
            type="password"
            placeholder="Setup password"
            value={form.setupSecret}
            onChange={(event)=>
              updateForm(
                "setupSecret",
                event.target.value
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
            grid
            sm:grid-cols-2
            gap-4
            "
          >

            <input
              placeholder="School name"
              value={form.schoolName}
              onChange={(event)=>
                updateForm(
                  "schoolName",
                  event.target.value
                )
              }
              className="
              w-full
              border
              p-3
              rounded-xl
              "
            />

            <input
              placeholder={
                suggestedCode ||
                "school-code"
              }
              value={form.schoolCode}
              onChange={(event)=>
                updateForm(
                  "schoolCode",
                  toSchoolCode(
                    event.target.value
                  )
                )
              }
              className="
              w-full
              border
              p-3
              rounded-xl
              "
            />

          </div>

          <div
            className="
            grid
            sm:grid-cols-2
            gap-4
            "
          >

            <input
              placeholder="Admin name"
              value={form.adminName}
              onChange={(event)=>
                updateForm(
                  "adminName",
                  event.target.value
                )
              }
              className="
              w-full
              border
              p-3
              rounded-xl
              "
            />

            <input
              type="email"
              placeholder="Admin email"
              value={form.adminEmail}
              onChange={(event)=>
                updateForm(
                  "adminEmail",
                  event.target.value
                )
              }
              className="
              w-full
              border
              p-3
              rounded-xl
              "
            />

          </div>

          <input
            type="password"
            placeholder="Admin password"
            value={form.adminPassword}
            onChange={(event)=>
              updateForm(
                "adminPassword",
                event.target.value
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
            flex
            flex-col
            sm:flex-row
            gap-3
            pt-2
            "
          >

            <button
              type="button"
              onClick={()=>
                navigate("/")
              }
              className="
              flex-1
              border
              py-3
              rounded-xl
              "
            >
              Back to Login
            </button>

            <button
              disabled={loading}
              className="
              flex-1
              bg-[#008C95]
              text-white
              py-3
              rounded-xl
              disabled:opacity-60
              "
            >
              {
                loading
                  ? "Creating..."
                  : "Create School"
              }
            </button>

          </div>

        </form>

      </div>

    </div>

  );

}

export default SchoolSetup;
