import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

// components
import SubmitButton from "@/components/buttons/SubmitButton";
import TextField from "@/components/input/TextField";
import AuthPage from "@/pages/auth";

// hooks and function
import { superadminLoggedIn } from "@/features/superadminAuth/superadminAuthSlice";
import { useSuperadminLoginMutation } from "@/features/superadminAuth/superadminAuthApiSlice";

// icons
import { letter, password } from "@/assets/icons/svgIcons";

const SuperAdminLoginPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { handleSubmit, register } = useForm();
    const [isLoading, setIsLoading] = useState(false);
    const [superadminLogin] = useSuperadminLoginMutation();

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            const result = await superadminLogin({
                name: data.name,
                password: data.password,
            }).unwrap();
            
            // Verify response structure
            if (result && result.accessToken) {
                dispatch(superadminLoggedIn({
                    accessToken: result.accessToken,
                    refreshToken: result.refreshToken || null,
                    user: result.user || null,
                }));
                toast.success("Super Admin Login Successful!");
                navigate("/superadmin");
            } else {
                toast.error("Login failed: Invalid response from server.");
            }
        } catch (error) {
            // Handle different error formats
            let errorMessage = "Invalid name or password!";
            
            if (error?.data?.message) {
                errorMessage = error.data.message;
            } else if (error?.message) {
                errorMessage = error.message;
            } else if (error?.error?.data?.message) {
                errorMessage = error.error.data.message;
            } else if (error?.error?.message) {
                errorMessage = error.error.message;
            }
            
            toast.error(errorMessage);
            console.error("Superadmin login error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthPage title="Super Admin Login" subtitle="Enter your credentials to access the super admin panel">
            <>
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="flex flex-col gap-5 mt-8"
                >
                    <TextField
                        placeholder="Your Name"
                        type="text"
                        register={register}
                        name="name"
                        icon={letter}
                        disabled={isLoading}
                        required
                    />
                    <TextField
                        placeholder="Type your Password"
                        register={register}
                        name="password"
                        type="password"
                        icon={password}
                        disabled={isLoading}
                        required
                    />

                    <SubmitButton
                        isLoading={isLoading}
                        disabled={isLoading}
                        className="mt-4"
                    >
                        {isLoading ? "Logging In..." : "Login"}
                    </SubmitButton>
                </form>
            </>
        </AuthPage>
    );
};

export default SuperAdminLoginPage;








