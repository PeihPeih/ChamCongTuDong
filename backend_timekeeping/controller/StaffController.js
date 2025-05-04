import Staff from "../models/Staff.js";
import Role from "../models/Role.js";
import bcrypt from "bcrypt";
import { Op } from "sequelize";
import Image from "../models/Image.js";
import XLSX from "xlsx"; // Thêm thư viện xlsx để đọc file Excel
import path from "path";
import fs from "fs";
import { publishMessage } from "../mqtt/mqttClient.js";

import dotenv from "dotenv";
import axios from "axios";

dotenv.config(); // Load environment variables

const FACE_API = process.env.FACE_API || "http://localhost:5000"; // Địa chỉ API AI

import { fileURLToPath } from "url";
import Department from "../models/Department.js";
import Position from "../models/Position.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, "..", "..", "data");

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
        { model: Role, attributes: ["ID", "Name"] },
        { model: Department, attributes: ["ID", "Name"] },
        { model: Position, attributes: ["ID", "Name"] },
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
      DepartmentID,
      PositionID,
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
      !RoleID ||
      !DepartmentID ||
      !PositionID
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

    // Kiểm tra DepartmentID có tồn tại
    const department = await Department.findByPk(DepartmentID);
    if (!department) {
      return res.status(400).json({ error: "Phòng ban không tồn tại" });
    }

    // Kiểm tra PositionID có tồn tại
    const position = await Position.findByPk(PositionID);
    if (!position) {
      return res.status(400).json({ error: "Chức vụ không tồn tại" });
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
      DepartmentID,
      PositionID,
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
      DepartmentID,
      PositionID,
    } = req.body;

    // Validate dữ liệu đầu vào
    if (
      !Fullname ||
      !Code ||
      !Email ||
      !Username ||
      !RoleID ||
      !DepartmentID ||
      !PositionID
    ) {
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

    // Kiểm tra DepartmentID có tồn tại
    const department = await Department.findByPk(DepartmentID);
    if (!department) {
      return res.status(400).json({ error: "Phòng ban không tồn tại" });
    }

    // Kiểm tra PositionID có tồn tại
    const position = await Position.findByPk(PositionID);
    if (!position) {
      return res.status(400).json({ error: "Chức vụ không tồn tại" });
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
      DepartmentID,
      PositionID,
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

    // Check mặt
    const imageBase64 = Buffer.from(req.body).toString("base64");

    const response = await axios.post(`${FACE_API}/api/check-frontal-face`, {
      image_base64: imageBase64,
    });
    if (response.data["stt"] != 1000) {
      return res.status(400).json({ error: "Vui lòng tải lên ảnh mặt chính diện" });
    }

    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/:/g, "-");
    const fileName = `sample-image-${staffId}-${timestamp}.jpg`;


    const absolutePath = path.join(DATA_DIR, fileName); // để ghi file
    const relativePath = path.join("data", fileName).replace(/\\/g, "/"); // để lưu vào Mongo

    fs.writeFileSync(absolutePath, Buffer.from(req.body));

    const existingImage = await Image.findOne({ staffId: staffId });
    if (existingImage) {
      existingImage.imagePaths.push(relativePath);
      await existingImage.save();
    } else {
      const newImage = new Image({
        staffId: staffId,
        imagePaths: [relativePath],
      });
      await newImage.save();
    }
    publishMessage("topic/retrain_model", {});
    res.json({ message: "Cập nhật ảnh mẫu thành công!", path: relativePath });
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

    const staff = await Staff.findByPk(staffId);
    if (!staff) {
      return res.status(404).json({ error: "Không tìm thấy thông tin nhân viên" });
    }

    const imageObj = image.toObject();

    imageObj.uploadedAt = new Date(imageObj.uploadedAt)
      .toISOString()
      .split("T")[0];

    const response = {
      ...imageObj,
      staffInfo: {
        ID: staff.ID,
        Fullname: staff.Fullname,
        Code: staff.Code,
      }
    };

    res.json(response);
  } catch (error) {
    console.error("Error in getSampleImage:", error);
    res.status(500).json({ error: "Lỗi khi lấy ảnh mẫu" });
  }
};

export const deleteImages = async (req, res) => {
  const { id } = req.params;
  const { imageNames } = req.body;

  if (!imageNames || imageNames.length === 0) {
    return res.status(400).json({ message: "Danh sách tên ảnh bị rỗng" });
  }

  try {
    const imageDoc = await Image.findOne({ staffId: Number(id) });
    if (!imageDoc) {
      return res.status(404).json({ message: "Không tìm thấy nhân viên với ID này" });
    }
    const imagesToDelete = imageDoc.imagePaths.filter((imgPath) =>
      imageNames.some((imgName) => imgPath.includes(imgName))
    );


    if (imagesToDelete.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy ảnh nào để xóa" });
    }


    for (let relativePath of imagesToDelete) {
      const fullPath = path.join(__dirname, "..", "..", relativePath);
      try {
        await fs.promises.unlink(fullPath);
      } catch (err) {
        console.warn(`Không thể xóa file: ${fullPath}`, err);
      }

      // Xoá khỏi Mongo
      imageDoc.imagePaths = imageDoc.imagePaths.filter(p => p !== relativePath);

    }

    await imageDoc.save();
    publishMessage("topic/retrain_model", {});
    return res.status(200).json({
      message: "Xóa ảnh thành công",
      deletedImages: imagesToDelete,
    });

  } catch (err) {
    console.error("Lỗi server:", err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

// Hàm import nhân viên từ file Excel
export const importStaffs = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Vui lòng tải lên file Excel" });
    }

    // Đọc file Excel
    const filePath = req.file.path;
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet);

    const errors = [];
    const createdStaffs = [];

    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      const rowNumber = i + 2; // +2 vì Excel bắt đầu từ hàng 1 và có header

      // Validate các trường bắt buộc
      const requiredFields = [
        "Fullname",
        "Code",
        "Email",
        "Username",
        "Password",
        "Gender",
        "DayOfBirth",
        "RoleName",
        "DepartmentName",
        "PositionName",
      ];
      for (const field of requiredFields) {
        if (!row[field] || row[field].toString().trim() === "") {
          errors.push(`Hàng ${rowNumber}: ${field} là bắt buộc`);
          continue;
        }
      }

      if (errors.length > 0) continue;

      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(row.Email)) {
        errors.push(`Hàng ${rowNumber}: Email không hợp lệ`);
        continue;
      }

      // Validate password length
      if (row.Password.length < 6) {
        errors.push(`Hàng ${rowNumber}: Mật khẩu phải có ít nhất 6 ký tự`);
        continue;
      }

      // Validate Gender
      if (!["male", "female"].includes(row.Gender.toLowerCase())) {
        errors.push(
          `Hàng ${rowNumber}: Giới tính phải là 'male' hoặc 'female'`
        );
        continue;
      }

      // Xử lý DayOfBirth
      let dayOfBirth;
      if (typeof row.DayOfBirth === "number") {
        // Nếu là số seri, chuyển đổi thành chuỗi YYYY-MM-DD
        const excelDate = new Date(
          (row.DayOfBirth - 25569) * 86400 * 1000 // Chuyển số seri Excel thành timestamp
        );
        dayOfBirth = excelDate.toISOString().split("T")[0]; // Lấy YYYY-MM-DD
      } else if (typeof row.DayOfBirth === "string") {
        // Nếu là chuỗi, kiểm tra định dạng MM-DD-YYYY
        const dateRegex = /^\d{2}-\d{2}-\d{4}$/;
        if (!dateRegex.test(row.DayOfBirth)) {
          errors.push(
            `Hàng ${rowNumber}: Ngày sinh phải có định dạng MM-DD-YYYY`
          );
          continue;
        }
        // Chuyển MM-DD-YYYY thành YYYY-MM-DD để lưu vào database
        const [month, day, year] = row.DayOfBirth.split("-");
        dayOfBirth = `${year}-${month}-${day}`;
      } else {
        errors.push(`Hàng ${rowNumber}: Ngày sinh không hợp lệ`);
        continue;
      }

      // Validate định dạng ngày sau khi chuyển đổi (YYYY-MM-DD)
      const dateRegexISO = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegexISO.test(dayOfBirth)) {
        errors.push(
          `Hàng ${rowNumber}: Ngày sinh không hợp lệ sau khi chuyển đổi`
        );
        continue;
      }

      // Kiểm tra ngày hợp lệ
      const date = new Date(dayOfBirth);
      if (isNaN(date.getTime())) {
        errors.push(`Hàng ${rowNumber}: Ngày sinh không hợp lệ`);
        continue;
      }

      // Tìm kiếm RoleID từ RoleName
      const role = await Role.findOne({ where: { Name: row.RoleName.trim() } });
      if (!role) {
        errors.push(
          `Hàng ${rowNumber}: Vai trò '${row.RoleName}' không tồn tại`
        );
        continue;
      }

      // Tìm kiếm DepartmentID từ DepartmentName
      const department = await Department.findOne({
        where: { Name: row.DepartmentName.trim() },
      });
      if (!department) {
        errors.push(
          `Hàng ${rowNumber}: Phòng ban '${row.DepartmentName}' không tồn tại`
        );
        continue;
      }

      // Tìm kiếm PositionID từ PositionName
      const position = await Position.findOne({
        where: { Name: row.PositionName.trim() },
      });
      if (!position) {
        errors.push(
          `Hàng ${rowNumber}: Chức vụ '${row.PositionName}' không tồn tại`
        );
        continue;
      }

      // Kiểm tra username đã tồn tại
      const existingUsername = await Staff.findOne({
        where: { Username: row.Username },
      });
      if (existingUsername) {
        errors.push(`Hàng ${rowNumber}: Username '${row.Username}' đã tồn tại`);
        continue;
      }

      // Kiểm tra email đã tồn tại
      const existingEmail = await Staff.findOne({
        where: { Email: row.Email },
      });
      if (existingEmail) {
        errors.push(`Hàng ${rowNumber}: Email '${row.Email}' đã tồn tại`);
        continue;
      }

      // Băm mật khẩu
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(row.Password, salt);

      // Tạo nhân viên mới
      const newStaff = await Staff.create({
        Fullname: row.Fullname,
        Code: row.Code,
        Email: row.Email,
        Username: row.Username,
        Password: hash,
        Gender: row.Gender.toLowerCase(),
        DayOfBirth: row.DayOfBirth,
        RoleID: role.ID,
        DepartmentID: department.ID,
        PositionID: position.ID,
      });

      createdStaffs.push(newStaff);
    }

    // Xóa file tạm sau khi xử lý
    fs.unlinkSync(filePath);

    if (errors.length > 0) {
      return res.status(400).json({
        message: "Import hoàn tất với một số lỗi",
        createdCount: createdStaffs.length,
        errors,
      });
    }

    res.status(201).json({
      message: "Import nhân viên thành công",
      createdCount: createdStaffs.length,
      data: createdStaffs,
    });
  } catch (error) {
    console.error("Error in importStaffs:", error);
    if (fs.existsSync(req.file?.path)) {
      fs.unlinkSync(req.file.path); // Xóa file tạm nếu có lỗi
    }
    res.status(500).json({ error: "Lỗi khi import nhân viên" });
  }
};
