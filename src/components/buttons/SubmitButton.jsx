import React from "react";
import AtomLoader from "../loader/AtomLoader";

const SubmitButton = ({
  type = "submit",
  children,
  isLoading,
  className,
  ...props
}) => {
  return (
    <button {...props} type={type} className={`bg-primary py-3 rounded-full text-white font-medium ${className}`}>
      {isLoading && <AtomLoader />}
      {children}
    </button>
  );
};

export default SubmitButton;
