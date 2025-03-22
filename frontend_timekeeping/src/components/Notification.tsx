import { notification } from "antd";
import { useEffect } from "react";

type NotificationType = "success" | "error" | "info" | "warning";

interface NotifyProps {
    type: NotificationType;
    message: string;
    description?: string;
}

// Hàm notify không cần context, chỉ cần gọi trực tiếp từ API global
export const notify = ({ type, message, description }: NotifyProps) => {
    console.log("Calling notify:", { type, message, description }); // Debug
    notification[type]({
        message,
        description,
        placement: "topRight",
        duration: 3,
    });
};

// Component Notification sử dụng useNotification (nếu cần context riêng)
const Notification: React.FC<NotifyProps & { open?: boolean }> = ({ type, message, description, open }) => {
    const [api, contextHolder] = notification.useNotification();

    useEffect(() => {
        if (open) {
            api[type]({
                message,
                description,
                placement: "topRight",
                duration: 3,
            });
        }
    }, [open, api, type, message, description]);

    return <>{contextHolder}</>;
};

export default Notification;