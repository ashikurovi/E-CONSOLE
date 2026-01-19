import { Navigate, useLocation } from "react-router-dom";
import { useGetCurrentUserQuery } from "@/features/auth/authApiSlice";
import { hasPermission } from "@/constants/feature-permission";
import AtomLoader from "@/components/loader/AtomLoader";

const PermissionRoute = ({ children, permission, redirectTo = "/" }) => {
  const location = useLocation();
  // Fetch user data from API instead of Redux
  const { data: user, isLoading: isLoadingUser } = useGetCurrentUserQuery();

  if (!permission) return children;

  // Show loader while fetching user data
  if (isLoadingUser) {
    return (
      <div className="h-screen w-screen center">
        <AtomLoader />
      </div>
    );
  }

  const allowed = hasPermission(user, permission);

  if (!allowed) {
    // Redirect to dashboard instead of login for unauthorized routes
    return <Navigate state={{ from: location }} to={redirectTo} replace />;
  }

  return children;
};

export default PermissionRoute;


