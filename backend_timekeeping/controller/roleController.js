import { Op } from "sequelize";
import Role from "../models/Role.js";

export const getAllRoles = async (req, res) => {
  try {
    const { name, page = 1, pageSize = 10 } = req.query; // Lấy query params: name, page, pageSize

    // Điều kiện tìm kiếm
    const whereClause = name ? { Name: { [Op.like]: `%${name}%` } } : {};

    // Tính toán offset và limit cho phân trang
    const limit = parseInt(pageSize, 10);
    const offset = (parseInt(page, 10) - 1) * limit;

    // Lấy danh sách roles với phân trang
    const { count, rows } = await Role.findAndCountAll({
      where: whereClause,
      limit,
      offset,
    });

    // Trả về dữ liệu với thông tin phân trang
    res.json({
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page, 10),
        pageSize: limit,
      },
    });
  } catch (error) {
    console.error("Error in getAllRoles:", error);
    res.status(500).json({ error: "Lỗi khi lấy danh sách vai trò" });
  }
};

export const getRoleById = async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id);
    if (!role) return res.status(404).json({ error: "Không tìm thấy vai trò" });
    res.json(role);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi lấy vai trò" });
  }
};

export const createRole = async (req, res) => {
  try {
    const { Name, Is_default } = req.body;
    // Kiểm tra trùng tên trong trường Name
    const existingRole = await Role.findOne({ where: { Name } });
    if (existingRole) {
      return res.status(400).json({ error: "Tên vai trò đã tồn tại" });
    }
    // Kiểm tra chỉ có 1 bản ghi Is_default = true
    if (Is_default === 1) {
      const defaultRole = await Role.findOne({ where: { Is_default: 1 } });
      if (defaultRole) {
        return res.status(400).json({
          error:
            "Đã tồn tại một vai trò mặc định. Chỉ được phép có một vai trò mặc định.",
        });
      }
    }
    // Tạo role mới nếu vượt qua các kiểm tra
    const role = await Role.create(req.body);
    res.status(201).json(role);
  } catch (error) {
    console.error("Error in createRole:", error);
    res.status(500).json({ error: "Lỗi khi tạo vai trò" });
  }
};

export const updateRole = async (req, res) => {
  try {
    const { Name, Is_default } = req.body;
    const roleId = req.params.id;
    const role = await Role.findByPk(roleId);
    if (!role) return res.status(404).json({ error: "Không tìm thấy vai trò" });
    // Kiểm tra trùng tên (trừ bản ghi hiện tại)
    const existingRole = await Role.findOne({
      where: { Name, ID: { [Op.ne]: roleId } }, // [Op.ne] là "not equal"
    });
    if (existingRole) {
      return res.status(400).json({ error: "Tên vai trò đã tồn tại" });
    }
    // Kiểm tra Is_default = true
    if (Is_default === 1) {
      const defaultRole = await Role.findOne({
        where: { Is_default: 1, ID: { [Op.ne]: roleId } },
      });
      if (defaultRole) {
        return res.status(400).json({
          error:
            "Đã tồn tại một vai trò mặc định. Chỉ được phép có một vai trò mặc định.",
        });
      }
    }
    // Cập nhật role nếu vượt qua các kiểm tra
    await role.update(req.body);
    res.json(role);
  } catch (error) {
    console.error("Error in updateRole:", error);
    res.status(500).json({ error: "Lỗi khi cập nhật vai trò" });
  }
};

export const deleteRole = async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id);
    if (!role) return res.status(404).json({ error: "Không tìm thấy vai trò" });

    await role.destroy();
    res.json({ message: "Xóa vai trò thành công" });
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi xóa vai trò" });
  }
};

// Lấy danh sách roles để hiển thị trong dropdown
export const getRolesForDropdown = async (req, res) => {
  try {
    const roles = await Role.findAll({
      attributes: ["ID", "Name", "Is_default"],
    });
    res.json(roles);
  } catch (error) {
    console.error("Error in getRolesForDropdown:", error);
    res.status(500).json({ error: "Lỗi khi lấy danh sách vai trò" });
  }
};
