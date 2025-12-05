import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const SuperAdminPrivateRoute = ({ children, redirectTo = "/superadmin/login" }) => {
  const location = useLocation();
  const { isAuthenticated } = useSelector((state) => state.superadminAuth);

  return isAuthenticated ? (
    children
  ) : (
    <Navigate state={{ from: location }} to={redirectTo} replace />
  );
};

export default SuperAdminPrivateRoute;


