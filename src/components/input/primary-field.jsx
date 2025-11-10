import React from "react";

const PrimaryField = ({ placeholder, name, register, className, ...props }) => {
  return (
    <input
      placeholder={placeholder}
      name={name}
      className={`py-2.5 px-4 rounded-full bg-white/30 w-full outline-none ${className}`}
      {...register(name)}
      {...props}
    />
  );
};

export default PrimaryField;
