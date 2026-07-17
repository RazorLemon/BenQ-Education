import {
  LayoutDashboard,
  Users,
  GraduationCap,
  School,
  ClipboardList,
    ScrollText,
    BarChart3,
    ShieldCheck,
    Settings
}
from "lucide-react";

import {
  NavLink
}
from "react-router-dom";

import {
  useContext
}
from "react";

import {
  AuthContext
}
from "../../context/auth-context";

import { motion }
from "framer-motion";

const menu = [

  {
    name:"Dashboard",
    icon:LayoutDashboard,
    path:"/admin"
  },

  {
    name:"Teachers",
    icon:Users,
    path:"/admin/teachers"
  },

  {
    name:"Students",
    icon:GraduationCap,
    path:"/admin/students"
  },

  {
    name:"Subjects",
    icon:School,
    path:"/admin/classes"
  },
  {
  name:"Assignments",
  icon:ClipboardList,
  path:"/admin/assignments"
},
{
  name:"Logs",
  icon:ScrollText,
  path:"/admin/logs"
},
{
  name:"Permissions",
  icon:ShieldCheck,
  path:"/admin/permissions"
},
{
  name:"Analytics",
  icon:BarChart3,
  path:"/admin/analytics"
},
{
  name:"Settings",
  icon:Settings,
  path:"/admin/settings"
}
  

];

function Sidebar({
  className = "",
  onNavigate
}) {

  const {
    user
  } =
    useContext(AuthContext);

  return (

    <motion.div

      initial={{
        x:-100
      }}

      animate={{
        x:0
      }}

      className={`
      w-72
      bg-[#008C95]
      text-white
      min-h-screen
      p-6
      flex
      flex-col
      shrink-0
      ${className}
      `}

    >

      <div>

        <div className="flex flex-col items-start">
          <h2
            className="
              text-[1.8rem]
              font-bold
              tracking-tight
              leading-none
              ml-5
              mb-3
              drop-shadow-sm
            "
          >
            <span className="text-white">
              BenQ{" "}
            </span>

            <span
              className="
                text-[#AACCB7]
                text-[2.3rem]
                font-normal
                font-['Caveat']
                relative
                top-0.4
              "
            >
              Education
            </span>
          </h2>

          <img
            src="/benqlogo.png"
            alt="Download"
            className="w-80 h-auto object-contain -mt-4"
          />
        </div>

        <p
          className="
          text-teal-200
          text-sm
          mt-3
          "
        >
          Admin Portal
        </p>

      </div>

      <div
        className="
        mt-10
        flex-1
        space-y-2
        "
      >

        {menu.map(
          item=>{

            const Icon =
              item.icon;

            return (

              <NavLink

                end={
                  item.path ===
                  "/admin"
                }

                key={
                  item.name
                }

                to={
                  item.path
                }

                onClick={
                  onNavigate
                }

                className={
                  ({isActive})=>

                  `
                  flex
                  items-center
                  gap-3
                  px-4
                  py-3
                  rounded-xl
                  transition-all

                  ${
                    isActive

                    ? "bg-white text-[#008C95] font-semibold shadow-lg"

                    : "hover:bg-[#00A7A5]"
                  }

                  `
                }

              >

                <Icon size={20}/>

                {item.name}

              </NavLink>

            );

          }
        )}

      </div>

      <div
        className="
        border-t
        border-teal-400
        pt-4
        "
      >

        <div
          className="
          bg-[#00A7A5]
          rounded-xl
          p-4
          "
        >

          <p
            className="
            font-semibold
            "
          >
            {user?.name}
          </p>

          <p
            className="
            text-sm
            text-teal-200
            "
          >
            {user?.role}
          </p>

        </div>

      </div>

    </motion.div>

  );

}

export default Sidebar;
