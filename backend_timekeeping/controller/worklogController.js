import Worklog from "../models/Worklog.js";
import Staff from "../models/Staff.js";
import Shift from "../models/Shift.js";
import StaffShift from "../models/StaffShift.js";
import { Op } from "sequelize";
import Timekeeping from "../models/Timekeeping.js";

export const insertOrUpdateWorklog = async (staff_id, date, time_in, time_out) => {
  try {
    const work_date = date;

    const staffShift = await StaffShift.findOne({
      where: { staffID: staff_id },

      include: [
        {
          model: Shift,
          where: {
            Start_date: {
              [Op.lte]: date,
            },
          },
        },
      ],
    });

    const shift = staffShift ? staffShift.Shift : null;

    const shift_time_in = shift ? shift.Time_in : null;
    const shift_time_out = shift ? shift.Time_out : null;
    const shift_total_time = shift ? shift.Total_time : null;
    let valid_work_hours = 0;

    if (shift_time_in && shift_time_out) {
      const actual_time_in = time_in > shift_time_in ? time_in : shift_time_in;
      const actual_time_out = time_out < shift_time_out ? time_out : shift_time_out;


      if (actual_time_out > actual_time_in) {
        const diffInMilliseconds = new Date(`1970-01-01T${actual_time_out}Z`) - new Date(`1970-01-01T${actual_time_in}Z`);
        valid_work_hours = diffInMilliseconds / (1000 * 60 * 60); // Convert milliseconds to hours
      }
    }

    let work_unit = valid_work_hours / shift_total_time; // Assuming work_unit is a fraction of total shift time
    const existingWorklog = await Worklog.findOne({
      where: {
        staffID: staff_id,
        work_date: work_date,
      },
    });

    if (existingWorklog) {
      // Update the existing worklog
      await Worklog.update(
        {
          time_in: time_in,
          time_out: time_out,
          working_hours: valid_work_hours,
          work_unit: work_unit,
        },
        {
          where: {
            id: existingWorklog.ID,
          },
        }
      );
    } else {
      // Insert a new worklog
      await Worklog.create({
        staffID: staff_id,
        work_date: work_date,
        time_in: time_in,
        time_out: time_out,
        working_hours: valid_work_hours,
        work_unit: work_unit,
        shiftID: shift.ID
      });
    }

  } catch (err) {
    console.error("insertWorklog error:", err.message);
  }
};

// export const getWorklogsByStaffId = async (req, res) => {
//   try {
//     const { staffId } = req.params;
//     const { year, month } = req.query;

//     // Validate staffId
//     if (!staffId) {
//       return res.status(400).json({
//         success: false,
//         message: "Staff ID is required"
//       });
//     }

//     // Check if staff exists
//     const staff = await Staff.findByPk(staffId);
//     if (!staff) {
//       return res.status(404).json({
//         success: false,
//         message: "Staff not found"
//       });
//     }

//     // Build date filter
//     let dateFilter = {};
//     if (year && month) {
//       // If both year and month are provided, filter by specific month
//       const startDate = new Date(year, month - 1, 1); // month is 0-indexed in JS
//       const endDate = new Date(year, month, 0); // Last day of the month

//       dateFilter = {
//         work_date: {
//           [Op.between]: [startDate, endDate]
//         }
//       };
//     } else if (year) {
//       // If only year is provided, filter by entire year
//       const startDate = new Date(year, 0, 1);
//       const endDate = new Date(year, 11, 31);

//       dateFilter = {
//         work_date: {
//           [Op.between]: [startDate, endDate]
//         }
//       };
//     }

//     // Query worklogs with filters
//     const worklogs = await Worklog.findAll({
//       where: {
//         staffID: staffId,
//         ...dateFilter
//       },
//       include: [
//         {
//           model: Shift,
//           attributes: ['ID', 'Name', 'Time_in', 'Time_out']
//         }
//       ],
//       order: [['work_date', 'DESC']]
//     });

//     // Format the response to match the database structure
//     const formattedWorklogs = worklogs.map(log => ({
//       id: log.ID,
//       staffID: log.staffID,
//       work_date: log.work_date,
//       shiftID: log.shiftID,
//       working_hours: log.working_hours,
//       work_unit: log.work_unit,
//       note: log.note,
//       created_at: log.created_at,
//       updated_at: log.updated_at,
//       shift: log.Shift ? {
//         id: log.Shift.ID,
//         name: log.Shift.Name,
//         time_in: log.Shift.Time_in,
//         time_out: log.Shift.Time_out
//       } : null
//     }));

//     return res.status(200).json({
//       success: true,
//       data: formattedWorklogs
//     });

//   } catch (error) {
//     console.error("Error in getWorklogsByStaffId:", error);
//     return res.status(500).json({
//       success: false,
//       message: `Server error: ${error.message}`
//     });
//   }
// };


export const getWorklogsByStaffId = async (req, res) => {
  try {
    const { staffId } = req.params;
    const { year, month } = req.query;

    if (!staffId) {
      return res.status(400).json({
        success: false,
        message: "Staff ID is required"
      });
    }

    const staff = await Staff.findByPk(staffId);
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff not found"
      });
    }

    let dateFilter = {};
    if (year && month) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      dateFilter = {
        work_date: { [Op.between]: [startDate, endDate] }
      };
    } else if (year) {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31);
      dateFilter = {
        work_date: { [Op.between]: [startDate, endDate] }
      };
    }

    // Lấy worklogs
    const worklogs = await Worklog.findAll({
      where: {
        staffID: staffId,
        ...dateFilter
      },
      include: [
        {
          model: Shift,
          attributes: ['ID', 'Name', 'Time_in', 'Time_out']
        }
      ],
      order: [['work_date', 'DESC']]
    });

    // Lấy toàn bộ Timekeeping trong khoảng thời gian cần
    const timekeepings = await Timekeeping.findAll({
      where: {
        StaffID: staffId
      }
    });

    // Format response
    const formattedWorklogs = worklogs.map(log => {
      const timeRecord = timekeepings.find(tk =>
        new Date(tk.Date).toISOString().slice(0, 10) === log.work_date
      );

      return {
        id: log.ID,
        staffID: log.staffID,
        work_date: log.work_date,
        shiftID: log.shiftID,
        working_hours: log.working_hours,
        work_unit: log.work_unit,
        note: log.note,
        created_at: log.created_at,
        updated_at: log.updated_at,
        shift: log.Shift ? {
          id: log.Shift.ID,
          name: log.Shift.Name,
          time_in: log.Shift.Time_in,
          time_out: log.Shift.Time_out
        } : null,
        checkin: timeRecord?.Time_in || null,
        checkout: timeRecord?.Time_out || null
      };
    });

    return res.status(200).json({
      success: true,
      data: formattedWorklogs
    });

  } catch (error) {
    console.error("Error in getWorklogsByStaffId:", error);
    return res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`
    });
  }
};