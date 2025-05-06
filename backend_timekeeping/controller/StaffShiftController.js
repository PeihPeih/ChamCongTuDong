import StaffShift from "../models/StaffShift.js";
import Staff from "../models/Staff.js";
import Shift from "../models/Shift.js";
import { Op } from "sequelize";

// Lấy tất cả phân công ca làm việc
export const getAllStaffShifts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;

    const { count, rows } = await StaffShift.findAndCountAll({
      include: [
        {
          model: Staff,
          attributes: ["ID", "Fullname", "Code", "Email"], // Chỉ lấy các trường cần thiết của Staff
        },
        {
          model: Shift,
          attributes: ["ID", "Name", "Time_in", "Time_out", "Type_shift"], // Chỉ lấy các trường cần thiết của Shift
        },
      ],
      offset: (page - 1) * pageSize,
      limit: pageSize,
      distinct: true,
    });

    res.status(200).json({
      data: rows,
      pagination: {
        page,
        pageSize,
        total: count,
        totalPages: Math.ceil(count / pageSize),
      },
    });
  } catch (error) {
    console.error("Error in getAllStaffShifts:", error);
    res.status(500).json({
      success: false,
      error: "Lỗi khi lấy danh sách phân công ca làm việc",
    });
  }
};
// Lấy thông tin phân công ca làm việc theo ID
export const getStaffShiftById = async (req, res) => {
  try {
    const id = req.params.id;
    const staffShift = await StaffShift.findByPk(id, {
      include: [Staff, Shift],
    });

    if (!staffShift) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy phân công ca làm việc",
      });
    }

    res.status(200).json({
      success: true,
      data: staffShift,
    });
  } catch (error) {
    console.error("Error in getStaffShiftById:", error);
    res.status(500).json({
      success: false,
      error: "Lỗi khi lấy thông tin phân công ca làm việc",
    });
  }
};

// Lấy phân công ca làm việc theo nhân viên
export const getStaffShiftsByStaff = async (req, res) => {
  try {
    const staffId = req.params.staffId;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;

    const { count, rows } = await StaffShift.findAndCountAll({
      where: { StaffID: staffId },
      include: [Staff, Shift],
      offset: (page - 1) * pageSize,
      limit: pageSize,
    });

    res.status(200).json({
      data: rows,
      pagination: {
        page,
        pageSize,
        total: count,
        totalPages: Math.ceil(count / pageSize),
      },
    });
  } catch (error) {
    console.error("Error in getStaffShiftsByStaff:", error);
    res.status(500).json({
      success: false,
      error: "Lỗi khi lấy danh sách phân công ca làm việc theo nhân viên",
    });
  }
};

// Lấy phân công ca làm việc theo ca làm việc
export const getStaffShiftsByShift = async (req, res) => {
  try {
    const shiftId = req.params.shiftId;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;

    const { count, rows } = await StaffShift.findAndCountAll({
      where: { ShiftID: shiftId },
      include: [Staff, Shift],
      offset: (page - 1) * pageSize,
      limit: pageSize,
    });

    res.status(200).json({
      data: rows,
      pagination: {
        page,
        pageSize,
        total: count,
        totalPages: Math.ceil(count / pageSize),
      },
    });
  } catch (error) {
    console.error("Error in getStaffShiftsByShift:", error);
    res.status(500).json({
      success: false,
      error: "Lỗi khi lấy danh sách phân công ca làm việc theo ca làm việc",
    });
  }
};

// Tạo mới phân công ca làm việc
export const createStaffShift = async (req, res) => {
  try {
    const { StaffID, ShiftID } = req.body;

    // Kiểm tra xem nhân viên đã được phân công bất kỳ ca làm việc nào chưa
    const existingShiftForStaff = await StaffShift.findOne({
      where: {
        StaffID,
      },
    });

    if (existingShiftForStaff) {
      return res.status(400).json({
        success: false,
        error:
          "Nhân viên đã được phân công một ca làm việc. Mỗi nhân viên chỉ được gán một ca duy nhất.",
      });
    }

    // Kiểm tra xem StaffID và ShiftID có tồn tại không
    const staff = await Staff.findByPk(StaffID);
    if (!staff) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy nhân viên",
      });
    }

    const shift = await Shift.findByPk(ShiftID);
    if (!shift) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy ca làm việc",
      });
    }

    // Tạo phân công mới
    const newStaffShift = await StaffShift.create({
      StaffID,
      ShiftID,
    });

    // Lấy thông tin đầy đủ bao gồm cả Staff và Shift
    const staffShiftWithDetails = await StaffShift.findByPk(newStaffShift.ID, {
      include: [Staff, Shift],
    });

    res.status(201).json({
      success: true,
      data: staffShiftWithDetails,
    });
  } catch (error) {
    console.error("Lỗi khi tạo phân công ca làm việc:", error);
    res.status(500).json({
      success: false,
      error: "Lỗi khi tạo phân công ca làm việc",
    });
  }
};

// Cập nhật phân công ca làm việc
export const updateStaffShift = async (req, res) => {
  try {
    const id = req.params.id;
    const { StaffID, ShiftID } = req.body;

    // Kiểm tra xem phân công tồn tại không
    const staffShift = await StaffShift.findByPk(id);
    if (!staffShift) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy phân công ca làm việc",
      });
    }

    // Kiểm tra xem có phân công trùng lặp không (nếu thay đổi StaffID hoặc ShiftID)
    if (StaffID !== staffShift.StaffID || ShiftID !== staffShift.ShiftID) {
      const existingAssignment = await StaffShift.findOne({
        where: {
          StaffID,
          ShiftID,
          ID: { [Op.ne]: id }, // Không phải là bản ghi hiện tại
        },
      });

      if (existingAssignment) {
        return res.status(400).json({
          success: false,
          error: "Nhân viên đã được phân công ca làm việc này",
        });
      }
    }

    // Kiểm tra xem StaffID và ShiftID có tồn tại không
    const staff = await Staff.findByPk(StaffID);
    if (!staff) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy nhân viên",
      });
    }

    const shift = await Shift.findByPk(ShiftID);
    if (!shift) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy ca làm việc",
      });
    }

    // Cập nhật phân công
    await staffShift.update({
      StaffID,
      ShiftID,
    });

    // Lấy thông tin đầy đủ bao gồm cả Staff và Shift
    const updatedStaffShift = await StaffShift.findByPk(id, {
      include: [Staff, Shift],
    });

    res.status(200).json({
      success: true,
      data: updatedStaffShift,
    });
  } catch (error) {
    console.error("Error in updateStaffShift:", error);
    res.status(500).json({
      success: false,
      error: "Lỗi khi cập nhật phân công ca làm việc",
    });
  }
};

// Xóa phân công ca làm việc
export const deleteStaffShift = async (req, res) => {
  try {
    const id = req.params.id;

    // Kiểm tra xem phân công tồn tại không
    const staffShift = await StaffShift.findByPk(id);
    if (!staffShift) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy phân công ca làm việc",
      });
    }

    // Xóa phân công
    await staffShift.destroy();

    res.status(200).json({
      success: true,
      message: "Đã xóa phân công ca làm việc thành công",
    });
  } catch (error) {
    console.error("Error in deleteStaffShift:", error);
    res.status(500).json({
      success: false,
      error: "Lỗi khi xóa phân công ca làm việc",
    });
  }
};

// API cho dropdown
export const getStaffShiftsDropdown = async (req, res) => {
  try {
    const staffShifts = await StaffShift.findAll({
      include: [
        {
          model: Staff,
          attributes: ["ID", "Fullname", "Code"],
        },
        {
          model: Shift,
          attributes: ["ID", "Name", "Time_in", "Time_out", "Type_shift"],
        },
      ],
      attributes: ["ID"],
    });

    // Format lại dữ liệu cho dễ sử dụng
    const formattedData = staffShifts.map((item) => ({
      ID: item.ID,
      StaffID: item.Staff.ID,
      StaffName: item.Staff.Fullname,
      StaffCode: item.Staff.Code,
      ShiftID: item.Shift.ID,
      ShiftName: item.Shift.Name,
      ShiftTime: `${item.Shift.Time_in} - ${item.Shift.Time_out}`,
      ShiftType: item.Shift.Type_shift === "1" ? "Ca sáng" : "Ca tối",
    }));

    res.status(200).json(formattedData);
  } catch (error) {
    console.error("Error in getStaffShiftsDropdown:", error);
    res.status(500).json({
      success: false,
      error: "Lỗi khi lấy danh sách phân công ca làm việc cho dropdown",
    });
  }
};
