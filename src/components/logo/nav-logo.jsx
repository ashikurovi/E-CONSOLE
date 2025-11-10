import React from "react";
// import logo from "../../assets/images/logo.svg";
import { Link } from "react-router-dom";

export const NavLogo = () => {
  return (
    <Link
      to={"/"}
      className={`lg:h-[60px] lg:w-[150px] lg:bg-bg50 lg:dark:bg-white/5 dark:hover:bg-white/10 hover:bg-gray-100 tr rounded-full center`}
    >
      {/* <img src={logo} alt="restro-fx" className="h-6" /> */}
    </Link>
  );
};

export const FooterLogo = () => {
  return (
    <Link to={"/"} className={``}>
      {/* <img src={logo} alt="restro-fx" className="h-6" /> */}
    </Link>
  );
};

export default NavLogo;
