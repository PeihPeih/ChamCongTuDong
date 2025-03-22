import React, { useState } from "react";
import styles from "./LoginPage.module.css";
import { Eye, EyeOff } from "lucide-react";

interface PasswordFieldProps {
  placeholder: string;
  name: string;
  required?: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const PasswordField: React.FC<PasswordFieldProps> = ({
  placeholder,
  name,
  required = false,
  value,
  onChange,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={styles.passwordContainer}>
      <input
        type={showPassword ? "text" : "password"}
        name={name}
        placeholder={placeholder}
        className={styles.input}
        value={value}
        onChange={onChange}
        aria-required={required}
      />
      {required && (
        <span className={styles.requiredIndicator} aria-hidden="true">
          *
        </span>
      )}
      <button
        type="button"
        className={styles.togglePassword}
        onClick={togglePasswordVisibility}
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        <i className={styles.eyeIcon}>
          {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
        </i>
      </button>
    </div>
  );
};

export default PasswordField;
