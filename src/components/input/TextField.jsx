import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const TextField = ({
  type = "text",
  placeholder,
  label,
  className = "",
  inputClassName = "",
  register,
  registerOptions,
  name,
  icon,
  error,
  disabled = false,
  multiline = false,
  rows = 3,
  maxLength,
  ...rest
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password" && !multiline;
  const registerProps =
    register && name ? register(name, registerOptions) : {};

  const fieldClassNames = `border ${
    error ? "border-red-500 dark:border-red-500" : "border-black/5 dark:border-white/10"
  } py-2.5 pr-10 bg-bg50 w-full outline-none focus:border-green-300/50 dark:focus:border-green-300/50 dark:text-white/90 ${
    icon && !multiline ? "pl-11" : "pl-4"
  } ${disabled ? "opacity-60 cursor-not-allowed" : ""} ${
    multiline ? "min-h-[120px] resize-y" : ""
  } ${inputClassName}`.trim();

  const commonProps = {
    placeholder,
    disabled,
    className: fieldClassNames,
    maxLength,
    ...registerProps,
    ...rest,
  };

  const wrapperClassNames = `flex flex-col gap-2 ${className}`.trim();

  return (
    <div className={wrapperClassNames}>
      {label && <label className="text-black/50 dark:text-white/50 text-sm ml-1">{label}</label>}
      <div className="relative">
        {multiline ? (
          <textarea {...commonProps} rows={rows} />
        ) : (
          <>
            <input
              type={isPassword && !showPassword ? "password" : type}
              {...commonProps}
              className={`${fieldClassNames} password-input`}
            />
            {icon && <span className="absolute top-1/2 -translate-y-1/2 left-3">{icon}</span>}
          </>
        )}
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
      {error && (
        <span className="text-red-500 text-xs ml-1">{error.message}</span>
      )}
    </div>
  );
};

export default TextField;
