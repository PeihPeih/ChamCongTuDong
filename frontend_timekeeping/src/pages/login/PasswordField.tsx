import React, { useState } from "react";
import styles from "./LoginPage.module.css";

interface PasswordFieldProps {
  placeholder: string;
  required?: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const PasswordField: React.FC<PasswordFieldProps> = ({
  placeholder,
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
        <i className={styles.eyeIcon}>{showPassword ? "👁️" : "👁️‍🗨️"}</i>
      </button>
    </div>
  );
};

export default PasswordField;
