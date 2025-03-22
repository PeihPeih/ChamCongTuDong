import React, { useState } from "react";
import styles from "./LoginPage.module.css";
import PasswordField from "./PasswordField";
import InputField from "./InputField";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../../redux/systemSlice"; // Điều chỉnh đường dẫn nếu cần

// const env = (import.meta as any).env;
// const API_URL = `${env.VITE_BACKEND_HOST}:${env.VITE_BACKEND_PORT}`;
const API_URL = "http://localhost:3000"

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setError(""); // Xóa lỗi khi người dùng nhập
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setError(""); // Xóa lỗi khi người dùng nhập
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Kiểm tra form
    if (!email || !password) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Gọi API đăng nhập trực tiếp
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Email: email,
          Password: password
        })
      });

      // Xử lý phản hồi
      const data = await response.json();

      if (!response.ok) {
        // Xử lý các mã lỗi khác nhau
        if (response.status === 404) {
          setError("Người dùng không tồn tại");
        } else if (response.status === 401) {
          setError("Email hoặc mật khẩu không chính xác");
        } else {
          setError(data.message || "Đăng nhập thất bại. Vui lòng thử lại sau");
        }
        return;
      }

      if (data.success && data.data) {
        // Lưu dữ liệu người dùng vào Redux
        dispatch(login(data.data));

        localStorage.setItem('token', data.token);
        localStorage.setItem("user", JSON.stringify(data.data));
        // Chuyển hướng đến trang dashboard
        navigate('/overview');
      } else {
        setError(data.message || "Đăng nhập thất bại");
      }
    } catch (error) {
      setError("Không thể kết nối đến máy chủ");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate("/forgot-password");
  };

  const handleRegisterRedirect = () => {
    navigate("/register");
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

          {error && <div className={styles.errorMessage}>{error}</div>}

          <form onSubmit={handleSubmit} style={{ width: "100%" }}>
            <div className={styles.inputWrapper}>
              <InputField
                name="email"
                type="email"
                placeholder="Nhập Email"
                required={true}
                value={email}
                onChange={handleEmailChange}
              />
            </div>
            <div className={styles.passwordWrapper}>
              <PasswordField
                name="password"
                placeholder="Nhập Password"
                required={true}
                value={password}
                onChange={handlePasswordChange}
              />
            </div>
            <button
              type="submit"
              className={`${styles.loginButton} ${loading ? styles.loading : ''}`}
              disabled={loading}
            >
              {loading ? "ĐANG XỬ LÝ..." : "LOGIN"}
            </button>
          </form>

          <button
            className={styles.forgotPassword}
            onClick={handleForgotPassword}
          >
            Quên mật khẩu ?
          </button>
          <button
            className={styles.forgotPassword}
            onClick={handleRegisterRedirect}
          >
            Đăng ký
          </button>
        </section>
      </main>
    </>
  );
}

export default LoginPage;