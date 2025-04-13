import Staff from "../models/Staff.js";
import Role from "../models/Role.js";
import bcrypt from "bcrypt";
import { Op } from "sequelize";
import Image from "../models/Image.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lấy danh sách nhân viên
export const getAllStaff = async (req, res) => {
  try {
    const { name, page = 1, pageSize = 10 } = req.query;

    const whereClause = name
      ? {
        [Op.or]: [
        { Fullname: { [Op.like]: `%${name}%` } },
        { Code: { [Op.like]: `%${name}%` } },
        { Email: { [Op.like]: `%${name}%` } },
        ],
      }
      : {};
    const limit = parseInt(pageSize, 10);
    const offset = (parseInt(page, 10) - 1) * limit;

    const { count, rows } = await Staff.findAndCountAll({
      where: whereClause,
      include: [
        { model: Role, attributes: ["ID", "Name"] }, // Lấy thông tin Role
      ],
      limit,
      offset,
    });

    res.json({
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page, 10),
        pageSize: limit,
      },
    });
  } catch (error) {
    console.error("Error in getAllStaff:", error);
    res.status(500).json({ error: "Lỗi khi lấy danh sách nhân viên" });
  }
};

// Lấy nhân viên theo ID
export const getStaffById = async (req, res) => {
  try {
    const staff = await Staff.findByPk(req.params.id, {
      include: [{ model: Role, attributes: ["ID", "Name"] }],
    });
    if (!staff) {
      return res.status(404).json({ error: "Không tìm thấy nhân viên" });
    }
    res.json(staff);
  } catch (error) {
    console.error("Error in getStaffById:", error);
    res.status(500).json({ error: "Lỗi khi lấy nhân viên" });
  }
};

// Thêm nhân viên mới
export const createStaff = async (req, res) => {
  try {
    // Kiểm tra quyền admin (tùy vào logic xác thực của bạn)
    // if (!req.user || req.user.role !== "admin") {
    //   return res.status(403).json({ error: "Không có quyền tạo nhân viên" });
    // }

    const {
      Fullname,
      Code,
      Email,
      Gender,
      DayOfBirth,
      Username,
      Password,
      ConfirmPassword,
      RoleID,
    } = req.body;

    // Validate dữ liệu đầu vào
    if (
      !Fullname ||
      !Code ||
      !Email ||
      !Username ||
      !Password ||
      !ConfirmPassword ||
      !Gender ||
      !DayOfBirth ||
      !RoleID
    ) {
      return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });
    }

    // Kiểm tra email hợp lệ
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(Email)) {
      return res.status(400).json({ error: "Email không hợp lệ" });
    }

    // Kiểm tra username đã tồn tại
    const existingUsername = await Staff.findOne({ where: { Username } });
    if (existingUsername) {
      return res.status(400).json({ error: "Username đã tồn tại" });
    }

    // Kiểm tra email đã tồn tại
    const existingEmail = await Staff.findOne({ where: { Email } });
    if (existingEmail) {
      return res.status(400).json({ error: "Email đã tồn tại" });
    }

    // Kiểm tra password và confirm password
    if (Password !== ConfirmPassword) {
      return res.status(400).json({ error: "Mật khẩu xác nhận không khớp" });
    }

    // Kiểm tra độ dài mật khẩu
    if (Password.length < 6) {
      return res
        .status(400)
        .json({ error: "Mật khẩu phải có ít nhất 6 ký tự" });
    }

    // Kiểm tra RoleID có tồn tại
    const role = await Role.findByPk(RoleID);
    if (!role) {
      return res.status(400).json({ error: "Vai trò không tồn tại" });
    }

    // Băm mật khẩu
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(Password, salt);

    // Tạo nhân viên mới
    const newStaff = await Staff.create({
      Fullname,
      Code,
      Email,
      Username,
      Gender,
      DayOfBirth,
      Password: hash,
      RoleID,
    });

    res.status(201).json(newStaff);
  } catch (error) {
    console.error("Error in createStaff:", error);
    res.status(500).json({ error: "Lỗi khi tạo nhân viên" });
  }
};

// Cập nhật nhân viên
export const updateStaff = async (req, res) => {
  try {
    const staff = await Staff.findByPk(req.params.id);
    if (!staff) {
      return res.status(404).json({ error: "Không tìm thấy nhân viên" });
    }

    const {
      Fullname,
      Code,
      Email,
      Username,
      Password,
      ConfirmPassword,
      RoleID,
    } = req.body;

    // Validate dữ liệu đầu vào
    if (!Fullname || !Code || !Email || !Username || !RoleID) {
      return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });
    }

    // Kiểm tra email hợp lệ
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(Email)) {
      return res.status(400).json({ error: "Email không hợp lệ" });
    }

    // Kiểm tra username đã tồn tại (trừ bản ghi hiện tại)
    const existingUsername = await Staff.findOne({
      where: { Username, ID: { [Op.ne]: req.params.id } },
    });
    if (existingUsername) {
      return res.status(400).json({ error: "Username đã tồn tại" });
    }

    // Kiểm tra email đã tồn tại (trừ bản ghi hiện tại)
    const existingEmail = await Staff.findOne({
      where: { Email, ID: { [Op.ne]: req.params.id } },
    });
    if (existingEmail) {
      return res.status(400).json({ error: "Email đã tồn tại" });
    }

    // Kiểm tra RoleID có tồn tại
    const role = await Role.findByPk(RoleID);
    if (!role) {
      return res.status(400).json({ error: "Vai trò không tồn tại" });
    }

    // Nếu có cập nhật mật khẩu
    let updatedPassword = staff.Password;
    if (Password) {
      if (Password !== ConfirmPassword) {
        return res.status(400).json({ error: "Mật khẩu xác nhận không khớp" });
      }
      if (Password.length < 6) {
        return res
          .status(400)
          .json({ error: "Mật khẩu phải có ít nhất 6 ký tự" });
      }
      const salt = bcrypt.genSaltSync(10);
      updatedPassword = bcrypt.hashSync(Password, salt);
    }

    // Cập nhật nhân viên
    await staff.update({
      Fullname,
      Code,
      Email,
      Username,
      Password: updatedPassword,
      RoleID,
    });

    res.json(staff);
  } catch (error) {
    console.error("Error in updateStaff:", error);
    res.status(500).json({ error: "Lỗi khi cập nhật nhân viên" });
  }
};

// Xóa nhân viên
export const deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findByPk(req.params.id);
    if (!staff) {
      return res.status(404).json({ error: "Không tìm thấy nhân viên" });
    }

    await staff.destroy();
    res.json({ message: "Xóa nhân viên thành công" });
  } catch (error) {
    console.error("Error in deleteStaff:", error);
    res.status(500).json({ error: "Lỗi khi xóa nhân viên" });
  }
};

export const getStaffByPosition = async (req, res) => {
  try {
    const staff = await Staff.findAll({
      where: { PositionID: req.params.positionId },
    });
    res.json(staff);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi lấy nhân viên" });
  }
};

export const addSampleImage = async (req, res) => {
  try {
    const staffId = req.params.id;
    const staff = await Staff.findByPk(staffId);
    if (!staff) {
      return res.status(404).json({ error: "Không tìm thấy nhân viên" });
    }

    if (!req.body || req.body.length === 0) {
      return res.status(400).json({ error: "Vui lòng tải lên một tệp ảnh" });
    }

    const uploadDir = "data/";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/:/g, "-");
    const fileName = `sample-image-${staffId}-${timestamp}.jpg`;
    const filePath = path.join(uploadDir, fileName).replace(/\\/g, "/"); 

    fs.writeFileSync(filePath, req.body);

    const existingImage = await Image.findOne({ staffId: staffId });
    if (existingImage) {
      existingImage.imagePaths.push(filePath);
      await existingImage.save();
    } else {
      const newImage = new Image({
        staffId: staffId,
        imagePaths: [filePath],
      });
      await newImage.save();
    }

    res.json({ message: "Cập nhật ảnh mẫu thành công!", path: filePath });
  } catch (error) {
    console.error("Error in addSampleImage:", error);
    res.status(500).json({ error: "Lỗi khi cập nhật ảnh mẫu" });
  }
};

export const getSampleImage = async (req, res) => {
  try {
    const staffId = req.params.id;
    const image = await Image.findOne({ staffId: staffId });

    if (!image) {
      return res.status(404).json({ error: "Không tìm thấy ảnh mẫu" });
    }

    const imageObj = image.toObject();

    imageObj.uploadedAt = new Date(imageObj.uploadedAt).toISOString().split("T")[0];

    res.json(imageObj);
  } catch (error) {
    console.error("Error in getSampleImage:", error);
    res.status(500).json({ error: "Lỗi khi lấy ảnh mẫu" });
  }
};
