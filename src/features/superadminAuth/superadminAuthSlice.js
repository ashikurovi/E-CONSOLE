import { createSlice } from "@reduxjs/toolkit";

// Check if superadmin is already logged in (from localStorage)
const getSuperAdminAuth = () => {
    try {
        const stored = localStorage.getItem("superadmin_auth");
        return stored ? JSON.parse(stored) : { isAuthenticated: false };
    } catch {
        return { isAuthenticated: false };
    }
};

const initialState = {
    isAuthenticated: getSuperAdminAuth().isAuthenticated || false,
};

export const superadminAuthSlice = createSlice({
    name: "superadminAuth",
    initialState,
    reducers: {
        superadminLoggedIn: (state) => {
            state.isAuthenticated = true;
            localStorage.setItem("superadmin_auth", JSON.stringify({ isAuthenticated: true }));
        },
        superadminLoggedOut: (state) => {
            state.isAuthenticated = false;
            localStorage.removeItem("superadmin_auth");
        },
    },
});

export const { superadminLoggedIn, superadminLoggedOut } =
    superadminAuthSlice.actions;

export default superadminAuthSlice.reducer;
