import {
 LayoutDashboard,
 BookOpen,
 BarChart3,
 Megaphone,
 User,
 Settings
}
from "lucide-react";

import {
 NavLink
}
from "react-router-dom";

function StudentSidebar({
 className = "",
 onNavigate
}){

 const linkClass =
 ({isActive})=>

  `
  flex
  items-center
  gap-3
  px-4
  py-3
  rounded-xl
  transition

  ${
   isActive

   ? "bg-white text-[#008C95]"

   : "text-white/80 hover:bg-white/10"
  }
 `;

 return(

  <aside
   className={`
   w-72
   bg-[#008C95]
   min-h-screen
   p-6
   flex
   flex-col
   shrink-0
   ${className}
   `}
  >

   <div
    className="
    mb-10
    "
   >

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
     Student Portal
    </p>

   </div>

   <nav
    className="
    space-y-2
    flex-1
    "
   >

    <NavLink
     to="/student"
     end
     className={linkClass}
     onClick={onNavigate}
    >
     <LayoutDashboard />
     Dashboard
    </NavLink>

    <NavLink
     to="/student/classes"
     className={linkClass}
     onClick={onNavigate}
    >
     <BookOpen />
     Subjects
    </NavLink>

    <NavLink
     to="/student/grades"
     className={linkClass}
     onClick={onNavigate}
    >
     <BarChart3 />
     Analytics
    </NavLink>

    <NavLink
     to="/student/announcements"
     className={linkClass}
     onClick={onNavigate}
    >
     <Megaphone />
     Announcements
    </NavLink>

    <NavLink
     to="/student/profile"
     className={linkClass}
     onClick={onNavigate}
    >
     <User />
     Profile
    </NavLink>

    <NavLink
     to="/student/settings"
     className={linkClass}
     onClick={onNavigate}
    >
     <Settings />
     Settings
    </NavLink>

   </nav>

  </aside>

 );

}

export default StudentSidebar;
