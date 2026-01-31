import Footer from "@/components/footer/footer";
import TopNavbar from "@/components/navbar/TopNavbar";
import React from "react";
import { Outlet } from "react-router-dom";
import SideNav from "@/components/navbar/SideNav";
import { useGetCurrentUserQuery } from "@/features/auth/authApiSlice";
import { useDispatch } from "react-redux";
import { userDetailsFetched } from "@/features/auth/authSlice";
import { useSearch } from "@/contexts/SearchContext";

const Layout = () => {
  const dispatch = useDispatch();
  const { isSearching } = useSearch();

  // Fetch user data at layout level so it's cached and available to all child components
  const { data: user, isLoading } = useGetCurrentUserQuery();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  // Update Redux state when user data is fetched (for backward compatibility)
  React.useEffect(() => {
    if (user) {
      dispatch(userDetailsFetched(user));
    }
  }, [user, dispatch]);

  return (
    <main className="w-full min-h-screen dark:bg-black/90 bg-gray-100 dark:text-white/75 text-black/75 ">
      <div className="w-full max-h-screen">
        <div className="lg:px-0 px-2 max-h-screen">
          <div className="lg:flex">
            <SideNav
              isMobileMenuOpen={isMobileMenuOpen}
              setIsMobileMenuOpen={setIsMobileMenuOpen}
            />

            <div className="flex-1 min-w-0">
              <div className="lg:sticky top-0 z-40">
                <TopNavbar setIsMobileMenuOpen={setIsMobileMenuOpen} />
              </div>
              {!isSearching && (
                <div className="px-3 md:max-w-[1100px] lg:w-full xl:max-w-[1400px] 2xl:max-w-[1800px] pb-5">
                  <Outlet />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Layout;
