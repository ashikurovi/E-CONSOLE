import { createSlice } from "@reduxjs/toolkit";
import { triggerStorageSync } from "@/hooks/useStorageSync";

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
            
            // Trigger storage sync to notify other tabs about superadmin login
            triggerStorageSync(false, "superadmin_auth_change");
        },
        superadminLoggedOut: (state) => {
            state.isAuthenticated = false;
            localStorage.removeItem("superadmin_auth");
            
            // Trigger storage sync to notify other tabs about superadmin logout
            triggerStorageSync(false, "superadmin_auth_change");
        },
    },
});

export const { superadminLoggedIn, superadminLoggedOut } =
    superadminAuthSlice.actions;

export default superadminAuthSlice.reducer;
