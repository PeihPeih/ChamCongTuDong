import path from "path";
import { fileURLToPath } from "url";

// Dùng để lấy __dirname khi dùng ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getImage = async (req, res) => {
  try {
    const imagePath = req.params[0]; // ví dụ: data/image.jpg

    if (imagePath.includes("..")) {
      return res.status(400).json({ error: "Đường dẫn không hợp lệ" });
    }

    // Đi từ backend/controllers => project-root/data
    const fullPath = path.join(__dirname, "..", "..", imagePath);

    res.sendFile(fullPath, (err) => {
      if (err) {
        console.error("Lỗi khi gửi ảnh:", err);
        res.status(404).json({ error: "Không tìm thấy ảnh" });
      }
    });
  } catch (error) {
    console.error("Lỗi trong getImage:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
};
