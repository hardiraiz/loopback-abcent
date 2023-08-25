'use strict';

const app = require('../../server/server');
const env = require('dotenv').config().parsed;


const startWorkingTime = async (attendanceTime) => {
    const [hours, minutes, seconds] = env.START_WORKING_TIME.split(':');
    const workingTime = new Date(attendanceTime);
    workingTime.setUTCHours(hours, minutes, seconds);
    return workingTime;
}

module.exports = {
  startWorkingTime
};

