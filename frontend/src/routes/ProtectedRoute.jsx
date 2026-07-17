import {
  useContext
}
from "react";

import {
  Navigate,
  useLocation
}
from "react-router-dom";

import {
  AuthContext
}
from "../context/auth-context";

const homeByRole = {
  ADMIN:"/admin",
  TEACHER:"/teacher",
  STUDENT:"/student"
};

function ProtectedRoute({
  children,
  allowedRoles
}) {

  const {
    user,
    isAuthenticated
  } = useContext(AuthContext);

  const location =
    useLocation();

  if(!isAuthenticated){
    return (
      <Navigate
        to="/"
        replace
        state={{
          from:
            location.pathname
        }}
      />
    );
  }

  if(
    allowedRoles &&
    !allowedRoles.includes(
      user?.role
    )
  ){
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

  return children;
}

export default ProtectedRoute;
