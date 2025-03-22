import React, { useState } from "react";
import styles from "./RegisterPage.module.css";
import PasswordField from "../login/PasswordField";
import InputField from "../login/InputField";
import { useNavigate } from "react-router-dom";

// const env = (import.meta as any).env;
// const API_URL = `${env.VITE_BACKEND_HOST}:${env.VITE_BACKEND_PORT}`;
const API_URL = "http://localhost:3000"

function RegisterPage() {
    const [formData, setFormData] = useState({
        Fullname: "",
        Code: "",
        Username: "",
        Password: "",
        Gender: "Male",
        Email: "",
        // Các trường bổ sung có thể null
        DayOfBirth: null,
        PositionID: null,
        DepartmentID: null,
        RoleID: null // Mặc định là người dùng thông thường, có thể điều chỉnh
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        // Xóa thông báo lỗi khi người dùng thay đổi dữ liệu
        setError("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Kiểm tra dữ liệu cơ bản
        if (!formData.Fullname || !formData.Username || !formData.Password || !formData.Email) {
            setError("Vui lòng điền đầy đủ thông tin bắt buộc!");
            return;
        }

        try {
            setLoading(true);
            setError("");
            setSuccess("");

            // Gọi API đăng ký
            const response = await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                // Xử lý các lỗi
                setError(data.message || "Đăng ký thất bại. Vui lòng thử lại sau!");
                return;
            }

            // Đăng ký thành công
            setSuccess("Đăng ký tài khoản thành công! Chuyển hướng đến trang đăng nhập...");

            // Sau 2 giây, chuyển hướng đến trang đăng nhập
            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (error) {
            setError("Không thể kết nối đến máy chủ. Vui lòng thử lại sau!");
            console.error("Register error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <link
                href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap"
                rel="stylesheet"
            />
            <main className={styles.registerContainer}>
                <section className={styles.formCard}>
                    <div className={styles.logoContainer}>
                        <img
                            src="https://placehold.co/60x60/00A651/00A651"
                            alt="Mascom Logo"
                            className="w-full h-full"
                        />
                    </div>
                    <h1 className={styles.title}>Đăng ký tài khoản</h1>

                    {error && <div className={styles.errorMessage}>{error}</div>}
                    {success && <div className={styles.successMessage}>{success}</div>}

                    <form onSubmit={handleSubmit} style={{ width: "100%" }}>
                        <div className={styles.inputWrapper}>
                            <InputField
                                type="text"
                                placeholder="Họ và tên"
                                required
                                name="Fullname"
                                value={formData.Fullname}
                                onChange={handleChange}
                            />
                        </div>
                        <div className={styles.inputWrapper}>
                            <InputField
                                type="text"
                                placeholder="Mã nhân viên"
                                required
                                name="Code"
                                value={formData.Code}
                                onChange={handleChange}
                            />
                        </div>
                        <div className={styles.inputWrapper}>
                            <InputField
                                type="text"
                                placeholder="Tên đăng nhập"
                                required
                                name="Username"
                                value={formData.Username}
                                onChange={handleChange}
                            />
                        </div>
                        <div className={styles.passwordWrapper}>
                            <PasswordField
                                placeholder="Mật khẩu"
                                required
                                name="Password"
                                value={formData.Password}
                                onChange={handleChange}
                            />
                        </div>
                        <div className={styles.inputWrapper}>
                            <select
                                className={styles.selectInput}
                                name="Gender"
                                value={formData.Gender}
                                onChange={handleChange}
                                required
                            >
                                <option value="Male">Nam</option>
                                <option value="Female">Nữ</option>
                                <option value="Other">Khác</option>
                            </select>
                        </div>
                        <div className={styles.inputWrapper}>
                            <InputField
                                type="email"
                                placeholder="Email"
                                required
                                name="Email"
                                value={formData.Email}
                                onChange={handleChange}
                            />
                        </div>
                        <button
                            type="submit"
                            className={styles.registerButton}
                            disabled={loading}
                        >
                            {loading ? "Đang xử lý..." : "Đăng ký"}
                        </button>
                    </form>

                    <button
                        className={styles.registerButton}
                        onClick={() => navigate('/login')}
                    >
                        Đã có tài khoản? Đăng nhập
                    </button>
                </section>
            </main>
        </>
    );
}

export default RegisterPage;