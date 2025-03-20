import Timekeeping from "../models/Timekeeping.js";
import moment from "moment";
import { Op } from "sequelize";

export const getAllTimekeeping = async (req, res) => {
  try {
    const timekeeping = await Timekeeping.findAll();
    res.json(timekeeping);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi lấy danh sách chấm công" });
  }
};

export const getTimekeepingById = async (req, res) => {
  try {
    const timekeeping = await Timekeeping.findByPk(req.params.id);
    if (!timekeeping)
      return res
        .status(404)
        .json({ error: "Không tìm thấy dữ liệu chấm công" });
    res.json(timekeeping);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi lấy dữ liệu chấm công" });
  }
};

export const getTimekeepingByStaff = async (req, res) => {
  try {
    const { staffId } = req.params;
    const { year, month, date, timeIn, timeOut } = req.query;

    const conditions = {
      StaffID: staffId,
    };

    if (year) {
      const startOfYear = moment(`${year}-01-01`).startOf('year').format('YYYY-MM-DD HH:mm:ss');
      const endOfYear = moment(`${year}-12-31`).endOf('year').format('YYYY-MM-DD HH:mm:ss');

      if (month) {
        const startOfMonth = moment(`${year}-${month.padStart(2, '0')}-01`).startOf('month').format('YYYY-MM-DD HH:mm:ss');
        const endOfMonth = moment(`${year}-${month.padStart(2, '0')}-01`).endOf('month').format('YYYY-MM-DD HH:mm:ss');

        if (date) {
          const startOfDay = moment(`${year}-${month.padStart(2, '0')}-${date.padStart(2, '0')}`).startOf('day').format('YYYY-MM-DD HH:mm:ss');
          const endOfDay = moment(`${year}-${month.padStart(2, '0')}-${date.padStart(2, '0')}`).endOf('day').format('YYYY-MM-DD HH:mm:ss');
          conditions.Date = {
            [Op.between]: [startOfDay, endOfDay],
          };
        } else {
          conditions.Date = {
            [Op.between]: [startOfMonth, endOfMonth],
          };
        }
      } else {
        conditions.Date = {
          [Op.between]: [startOfYear, endOfYear],
        };
      }
    }

    // Lọc theo timeIn và timeOut
    if (timeIn) {
      conditions.Time_in = { [Op.gte]: timeIn };
    }
    if (timeOut) {
      conditions.Time_out = { [Op.lte]: timeOut };
    }

    const timekeeping = await Timekeeping.findAll({
      where: conditions,
    });

    res.json(timekeeping);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Lỗi khi lấy dữ liệu chấm công" });
  }
};

export const createTimekeeping = async (req, res) => {
  try {
    const timekeeping = await Timekeeping.create(req.body);
    res.status(201).json(timekeeping);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi tạo bản ghi chấm công" });
  }
};

export const updateTimekeeping = async (req, res) => {
  try {
    const timekeeping = await Timekeeping.findByPk(req.params.id);
    if (!timekeeping)
      return res
        .status(404)
        .json({ error: "Không tìm thấy dữ liệu chấm công" });

    await timekeeping.update(req.body);
    res.json(timekeeping);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi cập nhật dữ liệu chấm công" });
  }
};

export const deleteTimekeeping = async (req, res) => {
  try {
    const timekeeping = await Timekeeping.findByPk(req.params.id);
    if (!timekeeping)
      return res
        .status(404)
        .json({ error: "Không tìm thấy dữ liệu chấm công" });

    await timekeeping.destroy();
    res.json({ message: "Xóa bản ghi chấm công thành công" });
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi xóa dữ liệu chấm công" });
  }
};
