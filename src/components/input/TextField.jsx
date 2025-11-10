import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const TextField = ({
  type = "text",
  placeholder,
  label,
  className,
  register,
  name,
  icon,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && <label className="text-black/50 dark:text-white/50 text-sm ml-1">{label}</label>}
      <div className="relative">
        <input
          type={isPassword && !showPassword ? "password" : "text"}
          placeholder={placeholder}
          {...register(name)}
          className={`border border-black/5 dark:border-white/10 py-2.5 pr-10 rounded-full bg-bg50 w-full outline-none focus:border-green-300/50 dark:focus:border-green-300/50 dark:text-white/90 ${
            icon ? "pl-11" : "pl-4"
          } password-input`}
        />
        {icon && <span className="absolute top-1/2 -translate-y-1/2 left-3">{icon}</span>}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-black/50 dark:text-white/50"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
    </div>
  );
};

export default TextField;
