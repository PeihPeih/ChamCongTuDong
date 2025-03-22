import React, { useState } from "react";
import styles from "./ChangePassword.module.css";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";

const API_URL = "http://localhost:3000"; // Cập nhật theo API của bạn

const ChangePassword: React.FC = () => {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!oldPassword || !newPassword || !confirmPassword) {
            setError("Vui lòng nhập đầy đủ thông tin");
            return;
        }
        if (newPassword !== confirmPassword) {
            setError("Mật khẩu mới không khớp");
            return;
        }

        try {
            setLoading(true);
            setError("");
            setSuccess("");

            const token = localStorage.getItem("token");
            const response = await fetch(`${API_URL}/api/auth/change-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    oldPassword,
                    newPassword,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Đổi mật khẩu thất bại");
                return;
            }

            setSuccess("Đổi mật khẩu thành công!");
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setTimeout(() => navigate("/overview"), 2000);
        } catch (error) {
            setError("Lỗi kết nối đến máy chủ");
        } finally {
            setLoading(false);
        }
    };

    return (
        <MainLayout title="Đổi mật khẩu">
            <section className={styles.card}>
                <h1 className={styles.title}>Đổi mật khẩu</h1>
                {error && <div className={styles.error}>{error}</div>}
                {success && <div className={styles.success}>{success}</div>}

                <form className={styles.form} onSubmit={handleSubmit}>
                    <input
                        className={styles.input}
                        type="password"
                        placeholder="Nhập mật khẩu cũ"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        required
                    />
                    <input
                        className={styles.input}
                        type="password"
                        placeholder="Nhập mật khẩu mới"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                    <input
                        className={styles.input}
                        type="password"
                        placeholder="Xác nhận mật khẩu mới"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />

                    <button className={styles.button} type="submit" disabled={loading}>
                        {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
                    </button>
                </form>
            </section>
        </MainLayout>
    );
};

export default ChangePassword;
