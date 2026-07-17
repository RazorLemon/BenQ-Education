import {
  useState
}
from "react";

import Sidebar
from "../components/layout/Sidebar";

import Navbar
from "../components/layout/Navbar";

function AdminLayout({
  children,
  title
}) {
  const [
    mobileMenuOpen,
    setMobileMenuOpen
  ] = useState(false);

  return (

    <div
      className="
      flex
      bg-[#F8F9FC]
      min-h-screen
      "
    >

      <Sidebar
        className="hidden lg:flex"
      />

      {
        mobileMenuOpen && (
          <div
            className="
            fixed
            inset-0
            z-50
            lg:hidden
            "
          >
            <button
              type="button"
              className="
              absolute
              inset-0
              bg-black/45
              "
              onClick={()=>
                setMobileMenuOpen(false)
              }
            />

            <Sidebar
              className="
              relative
              z-10
              max-w-[85vw]
              shadow-2xl
              "
              onNavigate={()=>
                setMobileMenuOpen(false)
              }
            />
          </div>
        )
      }

      <div className="flex-1 min-w-0">

        <Navbar
          title={title}
          onMenuClick={()=>
            setMobileMenuOpen(true)
          }
        />

        <div
          className="
          p-4
          sm:p-6
          lg:p-8
          "
        >

          {children}

        </div>

      </div>

    </div>

  );

}

export default AdminLayout;
