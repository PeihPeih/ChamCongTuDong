import React, { useState } from "react";
import styles from "./LoginPage.module.css";
import PasswordField from "./PasswordField";
import InputField from "./InputField";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login logic here
    console.log("Login attempt with:", { username, password });
  };

  const handleForgotPassword = () => {
    // Handle forgot password logic
    console.log("Forgot password clicked");
  };

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap"
        rel="stylesheet"
      />
      <main className={styles.loginContainer}>
        <section className={styles.formCard}>
          <div className={styles.logoContainer}>
            <img
              src="https://placehold.co/60x60/00A651/00A651"
              alt="Mascom Logo"
              className="w-full h-full"
            />
          </div>
          <h1 className={styles.title}>Hệ thống quản lý chấm công</h1>
          <form onSubmit={handleSubmit} style={{ width: "100%" }}>
            <div className={styles.inputWrapper}>
              <InputField
                type="text"
                placeholder="Nhập Username"
                required={true}
                value={username}
                onChange={handleUsernameChange}
              />
            </div>
            <div className={styles.passwordWrapper}>
              <PasswordField
                placeholder="Nhập Password"
                required={true}
                value={password}
                onChange={handlePasswordChange}
              />
            </div>
            <button type="submit" className={styles.loginButton}>
              LOGIN
            </button>
          </form>
          <button
            className={styles.forgotPassword}
            onClick={handleForgotPassword}
          >
            Quên mật khẩu ?
          </button>
        </section>
      </main>
    </>
  );
}

export default LoginPage;
