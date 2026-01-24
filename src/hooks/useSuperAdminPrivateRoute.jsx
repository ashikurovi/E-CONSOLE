import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { getSuperadminTokens } from "@/features/superadminAuth/superadminAuthSlice";
import { decodeJWT } from "@/utils/jwt-decoder";

const SuperAdminPrivateRoute = ({ children, redirectTo = "/login" }) => {
  const location = useLocation();
  const { isAuthenticated, user } = useSelector(
    (state) => state.superadminAuth,
  );

  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate state={{ from: location }} to={redirectTo} replace />;
  }

  // Verify token exists and is valid
  const { accessToken } = getSuperadminTokens();
  if (!accessToken) {
    return <Navigate state={{ from: location }} to={redirectTo} replace />;
  }

  // Decode token to check role
  try {
    const { payload } = decodeJWT(accessToken);

    // Check if user has SUPER_ADMIN role
    if (payload.role !== "SUPER_ADMIN") {
      return <Navigate state={{ from: location }} to={redirectTo} replace />;
    }

    // Check if token is expired
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return <Navigate state={{ from: location }} to={redirectTo} replace />;
    }
  } catch (error) {
    console.error("Failed to decode superadmin token:", error);
    return <Navigate state={{ from: location }} to={redirectTo} replace />;
  }

  return children;
};

export default SuperAdminPrivateRoute;
