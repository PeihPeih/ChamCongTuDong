import Shift from "../models/Shift.js";
import { Op } from "sequelize";

// Lấy danh sách ca làm việc (hỗ trợ phân trang và tìm kiếm)
export const getAllShifts = async (req, res) => {
  try {
    const { name, page = 1, pageSize = 10 } = req.query;

    const whereClause = name ? { Name: { [Op.like]: `%${name}%` } } : {};
    const limit = parseInt(pageSize, 10);
    const offset = (parseInt(page, 10) - 1) * limit;

    const { count, rows } = await Shift.findAndCountAll({
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
    console.log(error);
    res.status(500).json({ error: "Lỗi khi lấy danh sách ca làm việc" });
  }
};

// Thêm ca làm việc
export const createShift = async (req, res) => {
  try {
    const {
      Name,
      Time_in,
      Time_out,
      Is_default,
      Type_shift,
      Start_date,
      Total_time,
    } = req.body;
    // Validation
    if (!Name) {
      return res.status(400).json({ error: "Tên ca làm việc là bắt buộc" });
    }
    if (!Time_in) {
      return res.status(400).json({ error: "Thời gian bắt đầu là bắt buộc" });
    }
    if (!Time_out) {
      return res.status(400).json({ error: "Thời gian kết thúc là bắt buộc" });
    }
    if (Is_default === undefined || Is_default === null) {
      return res.status(400).json({ error: "Trường Is_default là bắt buộc" });
    }
    if (!Type_shift || !["1", "2"].includes(Type_shift)) {
      return res
        .status(400)
        .json({ error: "Loại ca phải là '1' (Ca sáng) hoặc '2' (Ca tối)" });
    }
    if (!Start_date) {
      return res.status(400).json({ error: "Ngày bắt đầu là bắt buộc" });
    }
    if (!Total_time) {
      return res
        .status(400)
        .json({ error: "Tổng thời gian làm việc là bắt buộc" });
    }

    // Kiểm tra định dạng thời gian (HH:mm)
    const timeFormatRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeFormatRegex.test(Time_in)) {
      return res
        .status(400)
        .json({ error: "Thời gian bắt đầu phải có định dạng HH:mm" });
    }
    if (!timeFormatRegex.test(Time_out)) {
      return res
        .status(400)
        .json({ error: "Thời gian kết thúc phải có định dạng HH:mm" });
    }

    // Kiểm tra logic thời gian
    const timeToMinutes = (time) => {
      const [hours, minutes] = time.split(":").map(Number);
      return hours * 60 + minutes;
    };

    if (timeToMinutes(Time_in) >= timeToMinutes(Time_out) && Type_shift === "1") {
      return res
        .status(400)
        .json({ error: "Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc" });
    }

    const shift = await Shift.create({
      Name,
      Time_in,
      Time_out,
      Is_default,
      Type_shift,
      Start_date,
      Total_time,
    });

    res.status(201).json(shift);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Lỗi khi tạo ca làm việc" });
  }
};

// Cập nhật ca làm việc
export const updateShift = async (req, res) => {
  try {
    const shift = await Shift.findByPk(req.params.id);
    if (!shift) {
      return res.status(404).json({ error: "Không tìm thấy ca làm việc" });
    }

    const {
      Name,
      Time_in,
      Time_out,
      Is_default,
      Type_shift,
      Start_date,
      Total_time,
    } = req.body;

    // Validation
    if (!Name) {
      return res.status(400).json({ error: "Tên ca làm việc là bắt buộc" });
    }
    if (!Time_in) {
      return res.status(400).json({ error: "Thời gian bắt đầu là bắt buộc" });
    }
    if (!Time_out) {
      return res.status(400).json({ error: "Thời gian kết thúc là bắt buộc" });
    }
    if (Is_default === undefined || Is_default === null) {
      return res.status(400).json({ error: "Trường Is_default là bắt buộc" });
    }
    if (!Type_shift || !["1", "2"].includes(Type_shift)) {
      return res
        .status(400)
        .json({ error: "Loại ca phải là '1' (Ca sáng) hoặc '2' (Ca tối)" });
    }
    if (!Start_date) {
      return res.status(400).json({ error: "Ngày bắt đầu là bắt buộc" });
    }
    if (!Total_time) {
      return res
        .status(400)
        .json({ error: "Tổng thời gian làm việc là bắt buộc" });
    }

    // Kiểm tra định dạng thời gian (HH:mm)
    const timeFormatRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeFormatRegex.test(Time_in)) {
      return res
        .status(400)
        .json({ error: "Thời gian bắt đầu phải có định dạng HH:mm" });
    }
    if (!timeFormatRegex.test(Time_out)) {
      return res
        .status(400)
        .json({ error: "Thời gian kết thúc phải có định dạng HH:mm" });
    }

    // Kiểm tra logic thời gian
    const timeToMinutes = (time) => {
      const [hours, minutes] = time.split(":").map(Number);
      return hours * 60 + minutes;
    };

    if (timeToMinutes(Time_in) >= timeToMinutes(Time_out)) {
      return res
        .status(400)
        .json({ error: "Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc" });
    }

    await shift.update({
      Name,
      Time_in,
      Time_out,
      Is_default,
      Type_shift,
      Start_date,
      Total_time,
    });

    res.json(shift);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi cập nhật ca làm việc" });
  }
};

// Xóa ca làm việc
export const deleteShift = async (req, res) => {
  try {
    const shift = await Shift.findByPk(req.params.id);
    if (!shift) {
      return res.status(404).json({ error: "Không tìm thấy ca làm việc" });
    }

    await shift.destroy();
    res.json({ message: "Xóa ca làm việc thành công" });
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi xóa ca làm việc" });
  }
};
