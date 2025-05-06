import Timekeeping from "../models/Timekeeping.js";
import moment from "moment";
import { Op } from "sequelize";
import { insertOrUpdateWorklog } from "./worklogController.js";
import Staff from "../models/Staff.js";
import StaffShift from "../models/StaffShift.js";
import Shift from "../models/Shift.js";

export const getAllTimekeeping = async (req, res) => {
  try {
    const timekeeping = await Timekeeping.findAll({
      include: [
        {
          model: Staff,
          attributes: ['ID', 'Fullname', 'Code', 'Email', 'Gender']
        }
      ]
    });
    res.json(timekeeping);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi lấy danh sách chấm công" });
  }
};

export const getTimekeepingById = async (req, res) => {
  try {
    const timekeeping = await Timekeeping.findByPk(req.params.id, {
      include: [
        {
          model: Staff,
          attributes: ['ID', 'Fullname', 'Code', 'Email', 'Gender']
        }
      ]
    });
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
      const startOfYear = moment(`${year}-01-01`).startOf('year').format('YYYY/MM/DD HH:mm:ss');
      const endOfYear = moment(`${year}-12-31`).endOf('year').format('YYYY/MM/DD HH:mm:ss');

      if (month) {
        const startOfMonth = moment(`${year}-${month.padStart(2, '0')}-01`).startOf('month').format('YYYY/MM/DD HH:mm:ss');
        const endOfMonth = moment(`${year}-${month.padStart(2, '0')}-01`).endOf('month').format('YYYY/MM/DD HH:mm:ss');

        if (date) {
          const startOfDay = moment(`${year}-${month.padStart(2, '0')}-${date.padStart(2, '0')}`).startOf('day').format('YYYY/MM/DD HH:mm:ss');
          const endOfDay = moment(`${year}-${month.padStart(2, '0')}-${date.padStart(2, '0')}`).endOf('day').format('YYYY/MM/DD HH:mm:ss');
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
      conditions.Time_in = { [Op.gte]: moment(timeIn, 'YYYY/MM/DD HH:mm:ss').toDate() };
    }
    if (timeOut) {
      conditions.Time_out = { [Op.lte]: moment(timeOut, 'YYYY/MM/DD HH:mm:ss').toDate() };
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
    const { Time_in, Time_out, ...rest } = req.body;
    
    const timekeeping = await Timekeeping.create({
      ...rest,
      Time_in: Time_in ? moment(Time_in, 'YYYY/MM/DD HH:mm:ss').add(7, 'hours').toDate() : null,
      Time_out: Time_out ? moment(Time_out, 'YYYY/MM/DD HH:mm:ss').add(7, 'hours').toDate() : null,
    });
    
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

    const { Time_in, Time_out, ...rest } = req.body;
    
    await timekeeping.update({
      ...rest,
      Time_in: Time_in ? moment(Time_in, 'YYYY/MM/DD HH:mm:ss').add(7, 'hours').toDate() : timekeeping.Time_in,
      Time_out: Time_out ? moment(Time_out, 'YYYY/MM/DD HH:mm:ss').add(7, 'hours').toDate() : timekeeping.Time_out,
    });
    
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

export const saveTimekeepingFromMQTT = async (label, timestamp) => {
  try {
    const time = moment(timestamp).format('YYYY/MM/DD HH:mm:ss');

    const staff = await Staff.findOne({
      where: { code: label.trim() }
    });

    const staffShift = await StaffShift.findOne({
      where: { staffID: staff.ID },
      include: [
        {
          model: Shift,
        },
      ],
    });
      
    const shift = staffShift ? staffShift.Shift : null;
    if (!shift) {
      console.log(`Không tìm thấy ca làm việc cho nhân viên ${staff.Fullname}`);
      return;
    }

    let existing = false;
    if (shift.Type_shift === 1) {
      // Day shift: Check for entries on the same day
      existing = await Timekeeping.findOne({
        where: {
          StaffID: staff.ID,
          Time_in: {
            [Op.between]: [
              moment(timestamp, "YYYY/MM/DD HH:mm:ss").startOf('day').add(7, 'hours').toDate(),
              moment(timestamp, "YYYY/MM/DD HH:mm:ss").endOf('day').add(7, 'hours').toDate(),
            ],
          },
        },
      });
    } else if (shift.Type_shift === 2) {
      // Night shift: Check for entries between [Shift.Time_in - 3 hours of previous day] and [0h -> shift.Time_out of same day]
      const currentDate = moment(timestamp, "YYYY/MM/DD HH:mm:ss");
      const shiftTimeIn = moment(shift.Time_in, "HH:mm:ss");
      const shiftTimeOut = moment(shift.Time_out, "HH:mm:ss");
      
      // Calculate the start time (Shift.Time_in - 3 hours of previous day)
      const startTime = moment(currentDate).subtract(1, 'day')
        .set({
          hour: shiftTimeIn.hours() - 3,
          minute: shiftTimeIn.minutes(),
          second: 0
        });
      
      // Calculate the end time (0h -> shift.Time_out of same day)
      const endTime = moment(currentDate)
        .set({
          hour: shiftTimeOut.hours(),
          minute: shiftTimeOut.minutes(),
          second: 0
        });

      existing = await Timekeeping.findOne({
        where: {
          StaffID: staff.ID,
          Time_in: {
            [Op.between]: [
              startTime.add(7, 'hours').toDate(),
              endTime.add(7, 'hours').toDate(),
            ],
          },
        },
      });
    }

    if (!existing) {
      const newEntry = await Timekeeping.create({
        StaffID: staff.ID,
        Time_in: moment(time, 'YYYY/MM/DD HH:mm:ss').add(7, 'hours').toDate(),
        Time_out: null,
      });
      
    } else {
      existing.Time_out = moment(time, 'YYYY/MM/DD HH:mm:ss').add(7, 'hours').toDate();
      const work_date = moment(existing.Time_in, "YYYY/MM/DD HH:mm:ss").add(7, 'hours').format("YYYY-MM-DD");
      await existing.save();
      await insertOrUpdateWorklog(
        existing.StaffID,
        shift,
        work_date,
        existing.Time_in,
        existing.Time_out
      );
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Lỗi khi xử lý dữ liệu từ MQTT" });
  }
};