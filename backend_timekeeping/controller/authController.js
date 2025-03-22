import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Staff from "../models/Staff.js";
export const register = async (req, res) => {
  try {
    console.log(req.body);

    if (
      !req.body.Fullname ||
      !req.body.Username ||
      !req.body.Password ||
      !req.body.Email
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields!" });
    }

    // Băm mật khẩu
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.Password, salt);

    // Tạo nhân viên mới
    const newStaff = new Staff({
      Fullname: req.body.Fullname,
      Username: req.body.Username,
      Code: req.body.Code,
      Password: hash,
      Email: req.body.Email,
      Gender: req.body.Gender,
      DayOfBirth: req.body.DayOfBirth || null,
      PositionID: req.body.PositionID || null,
      DepartmentID: req.body.DepartmentID || null,
      RoleID: req.body.RoleID || null
    });

    await newStaff.save();

    res
      .status(200)
      .json({ success: true, message: "Successfully registered!" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: `Error: ${error.message}` });
  }
};

// Đăng nhập nhân viên (Login)
export const login = async (req, res) => {
  const email = req.body.Email;
  try {
    const staff = await Staff.findOne({ where: { Email: email } });
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "User not found!",
      });
    }

    const checkCorrectPassword = await bcrypt.compare(
      req.body.Password,
      staff.Password
    );
    if (!checkCorrectPassword) {
      return res
        .status(401)
        .json({ success: false, message: "Incorrect username or password!" });
    }

    // Tạo JWT Token
    const token = jwt.sign(
      { id: staff.ID, role: staff.RoleID },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "15d" }
    );

    // Thiết lập cookie
    res
      .cookie("accessToken", token, {
        httpOnly: true,
        expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        sameSite: "Lax",
        secure: false,
      })
      .status(200)
      .json({
        token,
        success: true,
        message: "Successfully logged in!",
        data: {
          ID: staff.ID,
          Fullname: staff.Fullname,
          Username: staff.Username,
          Email: staff.Email,
          Gender: staff.Gender,
          RoleID: staff.RoleID,
        },
      });
  } catch (error) {
    console.log("Error: ", error)
    res.status(500).json({
      success: false,
      message: "Failed to login!",
    });
  }
};

export async function logout(req, res) {
  try {
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });

    return res.status(200).json({
      message: "Đăng xuất thành công",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
    });
  }
}

export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Thiếu thông tin!" });
    }

    const staff = await Staff.findByPk(userId);
    if (!staff) {
      return res.status(404).json({ success: false, message: "Người dùng không tồn tại!" });
    }

    const isMatch = await bcrypt.compare(oldPassword, staff.Password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Mật khẩu cũ không đúng!" });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(newPassword, salt);

    staff.Password = hashedPassword;
    await staff.save();

    return res.status(200).json({ success: true, message: "Đổi mật khẩu thành công!" });
  } catch (error) {
    return res.status(500).json({ success: false, message: `Lỗi: ${error.message}` });
  }
};

