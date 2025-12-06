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

// icons
import { letter, password } from "@/assets/icons/svgIcons";

const SuperAdminLoginPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { handleSubmit, register } = useForm();
    const [isLoading, setIsLoading] = useState(false);

    // Superadmin credentials
    const SUPERADMIN_EMAIL = "superadmin@gmail.com";
    const SUPERADMIN_PASSWORD = "superadmin11";

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            // Validate credentials (frontend only, no backend)
            if (data.email === SUPERADMIN_EMAIL && data.password === SUPERADMIN_PASSWORD) {
                dispatch(superadminLoggedIn());
                toast.success("Super Admin Login Successful!");
                navigate("/superadmin");
            } else {
                toast.error("Invalid email or password!");
            }
        } catch (error) {
            toast.error("An error occurred. Please try again.");
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
                        placeholder="Your Email Address"
                        type="email"
                        register={register}
                        name="email"
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







