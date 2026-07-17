import {
  LayoutDashboard,
  School,
  ClipboardList,
  Megaphone,
  FileText,
  ScrollText,
  BarChart3,
  User,
  Settings
} from "lucide-react";

import {
  NavLink
} from "react-router-dom";

import {
  useContext
} from "react";

import {
  AuthContext
} from "../../context/auth-context";

const menu = [

  {
    name:"Dashboard",
    icon:LayoutDashboard,
    path:"/teacher"
  },

  {
    name:"My Subjects",
    icon:School,
    path:"/teacher/classes"
  },

  {
    name:"Assignments",
    icon:ClipboardList,
    path:"/teacher/assignments"
  },

  {
    name:"Announcements",
    icon:Megaphone,
    path:"/teacher/announcements"
  },

  {
    name:"Submissions",
    icon:FileText,
    path:"/teacher/submissions"
  },

  {
    name:"Logs",
    icon:ScrollText,
    path:"/teacher/logs"
  },

  {
    name:"Analytics",
    icon:BarChart3,
    path:"/teacher/analytics"
  },

  {
  name:"Profile",
  icon:User,
  path:"/teacher/profile"
},
{
  name:"Settings",
  icon:Settings,
  path:"/teacher/settings"
}

];

function TeacherSidebar({
  className = "",
  onNavigate
}) {

 const {
  user
} =
  useContext(AuthContext);

  return (

    <div
      className={`
      w-72
      min-h-screen
      bg-[#008C95]
      text-white
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
          Teacher Portal
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
                  "/teacher"
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

                    ? "bg-white text-[#008C95] font-semibold"

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
          p-4
          rounded-xl
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
            Teacher
          </p>

        </div>

      </div>

    </div>

  );

}

export default TeacherSidebar;
