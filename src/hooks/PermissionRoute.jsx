import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { hasPermission } from "@/constants/feature-permission";

const PermissionRoute = ({ children, permission, redirectTo = "/" }) => {
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  if (!permission) return children;

  const allowed = hasPermission(user, permission);

  if (!allowed) {
    // Redirect to dashboard instead of login for unauthorized routes
    return <Navigate state={{ from: location }} to={redirectTo} replace />;
  }

  return children;
};

export default PermissionRoute;


