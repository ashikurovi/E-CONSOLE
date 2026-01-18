import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { userLoggedIn, userLoggedOut } from "@/features/auth/authSlice";
import { superadminLoggedIn, superadminLoggedOut } from "@/features/superadminAuth/superadminAuthSlice";
import { getTokens } from "./useToken";
import { decodeJWT } from "@/utils/jwt-decoder";

/**
 * Hook to sync authentication state across browser tabs/windows in real-time
 * Listens to storage events and updates Redux state accordingly
 */
const useStorageSync = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const handleStorageChange = (event) => {
      // Handle regular auth changes
      if (event.key === "accessToken" || event.key === "refreshToken" || event.key === "auth_sync" || event.key === "restro_exp") {
        const { accessToken, refreshToken } = getTokens();

        if (!accessToken || !refreshToken) {
          // User logged out in another tab
          dispatch(userLoggedOut());
        } else {
          // User logged in or token updated in another tab
          try {
            const { payload } = decodeJWT(accessToken);
            dispatch(
              userLoggedIn({
                accessToken,
                refreshToken,
                rememberMe: event.key !== "accessToken", // if not in sessionStorage, it's from cookie
              })
            );
          } catch (error) {
            console.error("Failed to decode token during storage sync:", error);
            dispatch(userLoggedOut());
          }
        }
      }

      // Handle superadmin auth changes
      if (event.key === "superadmin_auth") {
        try {
          const superadminAuth = event.newValue ? JSON.parse(event.newValue) : null;
          
          if (superadminAuth?.isAuthenticated) {
            dispatch(superadminLoggedIn());
          } else {
            dispatch(superadminLoggedOut());
          }
        } catch (error) {
          console.error("Failed to parse superadmin auth during storage sync:", error);
          dispatch(superadminLoggedOut());
        }
      }
    };

    // Listen for storage events (cross-tab communication)
    window.addEventListener("storage", handleStorageChange);

    // Listen for custom events (same-tab communication)
    const handleCustomStorageChange = (event) => {
      if (event.detail?.type === "auth_change") {
        const { accessToken, refreshToken } = getTokens();

        if (!accessToken || !refreshToken) {
          dispatch(userLoggedOut());
        } else {
          try {
            const { payload } = decodeJWT(accessToken);
            dispatch(
              userLoggedIn({
                accessToken,
                refreshToken,
                rememberMe: event.detail?.rememberMe || false,
              })
            );
          } catch (error) {
            console.error("Failed to decode token during custom storage sync:", error);
            dispatch(userLoggedOut());
          }
        }
      }

      // Handle superadmin auth custom events
      if (event.detail?.type === "superadmin_auth_change") {
        const superadminAuth = localStorage.getItem("superadmin_auth");
        
        if (superadminAuth) {
          try {
            const auth = JSON.parse(superadminAuth);
            if (auth.isAuthenticated) {
              dispatch(superadminLoggedIn());
            } else {
              dispatch(superadminLoggedOut());
            }
          } catch (error) {
            console.error("Failed to parse superadmin auth:", error);
            dispatch(superadminLoggedOut());
          }
        } else {
          dispatch(superadminLoggedOut());
        }
      }
    };

    window.addEventListener("storage_sync", handleCustomStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("storage_sync", handleCustomStorageChange);
    };
  }, [dispatch]);
};

export default useStorageSync;

/**
 * Trigger a custom storage sync event for same-tab updates
 * Call this after setting/removing items from storage
 */
export const triggerStorageSync = (rememberMe = false, type = "auth_change") => {
  // Dispatch custom event for same-tab updates
  const event = new CustomEvent("storage_sync", {
    detail: { type, rememberMe },
  });
  window.dispatchEvent(event);

  // Use localStorage as a bridge for cross-tab communication
  // (since sessionStorage events don't work across tabs)
  localStorage.setItem("auth_sync", Date.now().toString());
  localStorage.removeItem("auth_sync");
};
