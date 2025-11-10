import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
// import { useGetMyProfileQuery } from "@/features/settings/settingsApiSlice";
// import { userDetailsFetched } from "@/features/auth/authSlice";

const useAuth = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [authChecked, setAuthChecked] = useState(false);

  // const { data, isSuccess, isLoading, refetch } = useGetMyProfileQuery(
  //   undefined,
  //   {
  //     skip: !isAuthenticated,
  //   }
  // );

  useEffect(() => {
    if (!isAuthenticated) {
      setAuthChecked(true);
      return;
    }

    // if (isSuccess && data?.data) {
    //   dispatch(userDetailsFetched(data.data));
    //   setAuthChecked(true);
    // }
  }, [
    // isSuccess,
    //  data,
    dispatch,
    isAuthenticated,
  ]);

  return {
    isLoading:
      //  isLoading ||
      isAuthenticated && !authChecked,
    authChecked,
    // refetchProfile: refetch,
  };
};

export default useAuth;
