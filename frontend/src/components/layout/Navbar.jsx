import {
  Bell,
  Menu
}
from "lucide-react";

import {
  useContext,
  useState
}
from "react";

import {
  useNavigate
}
from "react-router-dom";

import {
  AuthContext
}
from "../../context/auth-context";

function Navbar({
  title,
  onMenuClick
}) {

  const {
    user,
    logout
  } =
    useContext(AuthContext);

  const navigate =
    useNavigate();

  const [
    profileOpen,
    setProfileOpen
  ] = useState(false);

  const handleNotifications =
    ()=>{

      if(
        user?.role ===
        "ADMIN"
      ){

        navigate(
          "/admin/announcements"
        );

      }

      if(
        user?.role ===
        "TEACHER"
      ){

        navigate(
          "/teacher/announcements"
        );

      }

    };

  return (

    <div
      className="
      bg-white
      shadow-sm
      px-4
      sm:px-6
      lg:px-8
      py-4
      flex
      items-center
      justify-between
      sticky
      top-0
      z-30
      "
    >

      <div
        className="
        flex
        items-center
        gap-3
        min-w-0
        "
      >
        <button
          type="button"
          onClick={onMenuClick}
          className="
          lg:hidden
          h-10
          w-10
          shrink-0
          rounded-xl
          bg-teal-50
          text-[#008C95]
          flex
          items-center
          justify-center
          "
        >
          <Menu size={22} />
        </button>

        <h1
          className="
          text-xl
          sm:text-2xl
          font-bold
          text-gray-800
          truncate
          "
        >
          {title}
        </h1>
      </div>

      <div
        className="
        flex
        items-center
        gap-3
        sm:gap-5
        "
      >

        <button

          onClick={
            handleNotifications
          }

          className="
          text-gray-600
          hover:text-[#008C95]
          transition
          "

        >

          <Bell
            size={22}
          />

        </button>

        <span
          className="
          px-3
          py-1
          bg-teal-100
          text-[#008C95]
          rounded-full
          text-sm
          font-medium
          hidden
          sm:inline-flex
          "
        >
          {user?.role}
        </span>

        <div
          className="
          relative
          "
        >

          <button

            onClick={()=>
              setProfileOpen(
                !profileOpen
              )
            }

            className="
            flex
            items-center
            gap-3
            "

          >

            <div
              className="
              h-10
              w-10
              shrink-0
              rounded-full
              bg-[#008C95]
              text-white
              flex
              items-center
              justify-center
              font-bold
              "
            >

              {
                user?.name
                ?.charAt(0)
              }

            </div>

            <div
              className="
              hidden
              sm:block
              "
            >

              <p
                className="
                font-medium
                "
              >
                {user?.name}
              </p>

            </div>

          </button>

          {

            profileOpen && (

              <div
                className="
                absolute
                right-0
                mt-2
                w-56
                bg-white
                rounded-xl
                shadow-lg
                border
                z-50
                "
              >

                <button

                  onClick={()=>{

                    navigate(
                      "/change-password"
                    );

                    setProfileOpen(
                      false
                    );

                  }}

                  className="
                  w-full
                  text-left
                  px-4
                  py-3
                  hover:bg-gray-100
                  "

                >

                  Change Password

                </button>

                <button

                  onClick={()=>{

                    logout();

                    navigate(
                      "/",
                      {
                        replace:true
                      }
                    );

                  }}

                  className="
                  w-full
                  text-left
                  px-4
                  py-3
                  text-red-500
                  hover:bg-gray-100
                  "

                >

                  Logout

                </button>

              </div>

            )

          }

        </div>

      </div>

    </div>

  );

}

export default Navbar;
