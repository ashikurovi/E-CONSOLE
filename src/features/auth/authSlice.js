import { setAuthCookie } from "@/hooks/useCookie";
import { clearTokens, getTokens, setSessionToken } from "@/hooks/useToken";
import { decodeJWT } from "@/utils/jwt-decoder";
import { createSlice } from "@reduxjs/toolkit";

const { accessToken } = getTokens();

const initialState = (() => {
  if (!accessToken) {
    return {
      accessToken: null,
      user: null,
      isAuthenticated: false,
    };
  }

  try {
    const { payload } = decodeJWT(accessToken);
    return {
      accessToken,
      user: payload || null,
      isAuthenticated: true,
    };
  } catch {
    return {
      accessToken: null,
      user: null,
      isAuthenticated: false,
    };
  }
})();

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    userLoggedIn: (state, action) => {
      const token = action.payload.accessToken;

      if (!token) {
        console.error("userLoggedIn: accessToken is missing from payload");
        return;
      }

      state.accessToken = token;
      state.isAuthenticated = true;

      try {
        const { payload } = decodeJWT(token);
        state.user = payload || null;
      } catch {
        state.user = null;
      }

      if (action.payload.rememberMe) {
        try {
          setAuthCookie(action.payload);
        } catch (error) {
          console.error("Failed to set auth cookie:", error);
        }
      } else {
        setSessionToken(
          action.payload.accessToken,
          action.payload.refreshToken
        );
      }
    },
    userDetailsFetched: (state, action) => {
      state.user = action.payload;
    },
    userLoggedOut: (state) => {
      state.accessToken = null;
      state.user = null;
      state.isAuthenticated = false;
      clearTokens();
    },
  },
});

export const { userLoggedIn, userDetailsFetched, userLoggedOut } =
  authSlice.actions;

export default authSlice.reducer;
