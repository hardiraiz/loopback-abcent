'use strict';

const app = require('../../server/server');

const checkInTimeExist = async (userId, checkInTime) => {
    const Attendance = app.models.Attendance;   
    const startOfDay = new Date(checkInTime);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(checkInTime);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const attendance = await Attendance.findOne({ 
    where: {
        and: [
            { userId },
            { checkInTime: { gte: startOfDay } },
            { checkInTime: { lte: endOfDay }}
        ]
    }
    });

    if (attendance) { return true; }
    return false;
}

module.exports = {
  checkInTimeExist: checkInTimeExist
};

