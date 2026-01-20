import Footer from "@/components/footer/footer";
import TopNavbar from "@/components/navbar/TopNavbar";
import React from "react";
import { Outlet } from "react-router-dom";
import SideNav from "@/components/navbar/SideNav";
import { useGetCurrentUserQuery } from "@/features/auth/authApiSlice";
import { useDispatch } from "react-redux";
import { userDetailsFetched } from "@/features/auth/authSlice";

const Layout = () => {
    const dispatch = useDispatch();
    
    // Fetch user data at layout level so it's cached and available to all child components
    const { data: user, isLoading } = useGetCurrentUserQuery();

    // Update Redux state when user data is fetched (for backward compatibility)
    React.useEffect(() => {
        if (user) {
            dispatch(userDetailsFetched(user));
        }
    }, [user, dispatch]);

    return (
        <main className="w-screen min-h-screen dark:bg-black/90 bg-gray-100 dark:text-white/75 text-black/75 ">
            <div className="w-full ">

                <div className="lg:px-0 px-2">
                    {/* Desktop layout with persistent sidebar and content area */}
                    <div className="lg:flex">
                        <div className="lg:block hidden">
                            <SideNav />

                        </div>


                        <div className="flex-1 min-w-0">
                            <div className="lg:sticky top-0 z-10">
                                <TopNavbar />
                            </div>
                            <div className="px-3 md:max-w-[1100px] lg:w-full xl:max-w-[1400px] 2xl:max-w-[1800px] pb-5">
                                <Outlet />
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Layout;
