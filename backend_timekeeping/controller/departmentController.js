import Department from "../models/Department.js";

export const getAllDepartments = async (req, res) => {
  try {
    const { name, page = 1, pageSize = 10 } = req.query; // Lấy query params: name, page, pageSize
    const whereClause = name ? { Name: { [Op.like]: `%${name}%` } } : {};
    const limit = parseInt(pageSize, 10);
    const offset = (parseInt(page, 10) - 1) * limit;

    const { count, rows } = await Department.findAndCountAll({
      where: whereClause,
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
    res.status(500).json({ error: "Lỗi khi lấy danh sách phòng ban" });
  }
};

export const getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findByPk(req.params.id);
    if (!department)
      return res.status(404).json({ error: "Không tìm thấy phòng ban" });
    res.json(department);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi lấy phòng ban" });
  }
};

export const createDepartment = async (req, res) => {
  try {
    const department = await Department.create(req.body);
    res.status(201).json(department);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi tạo phòng ban" });
  }
};

export const updateDepartment = async (req, res) => {
  try {
    const department = await Department.findByPk(req.params.id);
    if (!department)
      return res.status(404).json({ error: "Không tìm thấy phòng ban" });

    await department.update(req.body);
    res.json(department);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi cập nhật phòng ban" });
  }
};

export const deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findByPk(req.params.id);
    if (!department)
      return res.status(404).json({ error: "Không tìm thấy phòng ban" });

    await department.destroy();
    res.json({ message: "Xóa phòng ban thành công" });
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi xóa phòng ban" });
  }
};

export const getDepartmentsForDropdown = async (req, res) => {
  try {
    const departments = await Department.findAll({
      attributes: ["id", "Name"],
    });
    res.json(departments);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi lấy danh sách phòng ban" });
  }
}
