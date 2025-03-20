import DayOffs from "../models/DayOffs.js";
import Staff from "../models/Staff.js";
import DayOffType from "../models/DayOffType.js";
import Position from "../models/Position.js";

export const getAllDayOffs = async (req, res) => {
  try {
    const dayOffs = await DayOffs.findAll({
      include: [
        { model: Staff, as: "Employee" }, 
        { model: Staff, as: "Manager" },  
        { model: DayOffType },           
      ],
    });
    res.json(dayOffs);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Lỗi khi lấy danh sách nghỉ phép" });
  }
};

export const getDayOffById = async (req, res) => {
  try {
    const dayOff = await DayOffs.findByPk(req.params.id, {
      include: [
        { model: Staff, as: "Employee" }, 
        { model: Staff, as: "Manager" },  
        { model: DayOffType },           
      ],
    });
    if (!dayOff)
      return res.status(404).json({ error: "Không tìm thấy đơn nghỉ phép" });
    res.json(dayOff);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi lấy đơn nghỉ phép" });
  }
};

export const createDayOff = async (req, res) => {
  try {
    const manager = await Staff.findByPk(req.body.ManagerID);
    if (!manager) return res.status(404).json({ error: "Không tìm thấy quản lý" });

    const position = await Position.findByPk(manager.PositionID);
    if (position.Name !== "Quan ly" || position.ID !== 2) return res.status(400).json({ error: "Người này không phải quản lý" });

    const dayOff = await DayOffs.create(req.body);
    res.status(201).json(dayOff);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

export const updateDayOff = async (req, res) => {
  try {
    const manager = await Staff.findByPk(req.body.ManagerID);
    if (!manager) return res.status(404).json({ error: "Không tìm thấy quản lý" });

    const position = await Position.findByPk(manager.PositionID);
    if (position.Name !== "Quan ly" || position.ID !== 2) return res.status(400).json({ error: "Người này không phải quản lý" });
    
    const dayOff = await DayOffs.findByPk(req.params.id);
    if (!dayOff)
      return res.status(404).json({ error: "Không tìm thấy đơn nghỉ phép" });

    await dayOff.update(req.body);
    res.json(dayOff);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi cập nhật đơn nghỉ phép" });
  }
};

export const deleteDayOff = async (req, res) => {
  try {
    const dayOff = await DayOffs.findByPk(req.params.id);
    if (!dayOff)
      return res.status(404).json({ error: "Không tìm thấy đơn nghỉ phép" });

    await dayOff.destroy();
    res.json({ message: "Xóa đơn nghỉ phép thành công" });
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi xóa đơn nghỉ phép" });
  }
};
