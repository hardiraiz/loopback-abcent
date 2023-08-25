'use strict';


const moment = require('moment');
const attendanceExist = require('../utils/attendanceExist');
const startWorkingTime = require('../utils/startWorkingTime');


module.exports = function(Attendance) {

    // controller list attendance user login
    Attendance.list = async (options) => {
        try {
            const userId = options.accessToken.userId;
            const attendances = await Attendance.find({
                where: { userId },
                order: 'checkInTime DESC',
                fields: ['id', 'checkInTime', 'checkOutTime', 'absentState']
            });

            return {
                status: true,
                message: 'SUCCESS_GET_ATTENDANCE',
                attendances
            };

        } catch (error) {
            throw Object.assign(new Error(error.message), {
                statusCode: error.statusCode || 500,
            });
        }
    };

    // route list attendance user login
    Attendance.remoteMethod('list', {
        accepts: [
            { arg: 'options', type: 'object', http: 'optionsFromRequest' }
        ],
        returns: { arg: 'result', type: 'object', root: true },
        http: { verb: 'get', path: '/' }
    });

    // controller create attendance
    Attendance.createAttendance = async (body, req, res) => {
        try {
            const userId = req.accessToken.userId;
            
            if (!body.checkInTime) {
                res.status(404);
                return {
                    status: false,
                    message: 'CHECK_IN_TIME_IS_REQUIRED'
                }
            }
            
            if (!moment(body.checkInTime).isValid()) {
                res.status(400);
                return {
                    status: false,
                    message: 'INVALID_CHECK_IN_TIME'
                }
            }

            const isCheckInExist = await attendanceExist.checkInTimeExist(userId, body.checkInTime);
            if (isCheckInExist) {
                res.status(400);
                return {
                    status: false,
                    message: 'CHECK_IN_TIME_ALREADY_EXIST'
                }
            }
            
            const checkInTime = new Date(body.checkInTime);
            const startTime = await startWorkingTime.startWorkingTime(body.checkInTime);

            const statusCheckIn = startTime > checkInTime ? 'onTime' : 'late';

            const attendance = await Attendance.create({
                userId: userId,
                checkInTime: checkInTime,
                absentState: statusCheckIn
            });

            if (!attendance) {
                res.status(error.statusCode || 400);
                return {
                    status: false,
                    message: 'CHECK_IN_TIME_FAILED_TO_RECORD'
                }
            }

            res.status(201).json({
                status: true,
                message: 'CHECK_IN_SUCCESS',
                attendance: {
                    id: attendance.id,
                    checkInTime: attendance.checkInTime,
                    checkOutTime: attendance.checkOutTime,
                    absentState: attendance.absentState
                }
            });

        } catch (error) {
            res.status(error.statusCode || 500);
            return {
                status: false,
                message: error.message
            }
        }
    };

    // route create attendance
    Attendance.remoteMethod('createAttendance', {
        accepts: [
            { arg: 'body', type: 'object', root: true, required: true, http: { source: 'body' }},
            { arg: 'req', type: 'object', http: { source: 'req' }},
            { arg: 'res', type: 'object', http: { source: 'res' }}
        ],
        returns: { arg: 'result', type: 'object', root: true },
        http: { verb: 'post', path: '/' }
    });

    // controller update attendance
    Attendance.updateAttendance = async (body, attendanceId, req, res) => {
        try {
            if (!attendanceId) {
                res.status(404);
                return { status: false, message: 'ATTENDANCE_ID_IS_REQUIRED' };
            }
    
            if (!body.checkOutTime) {
                res.status(404);
                return { status: false, message: 'CHECK_OUT_TIME_IS_REQUIRED' };
            }
    
            if (!moment(body.checkOutTime).isValid()) {
                res.status(400);
                return { status: false, message: 'INVALID_CHECK_OUT_TIME' };
            }
    
            const attendance = await Attendance.findById(attendanceId);

            if (!attendance) {
                res.status(404);
                return { status: false, message: 'ATTENDANCE_NOT_FOUND' };
            }

            if (attendance.checkOutTime) {
                res.status(400);
                return { status: false, message: 'CHECK_OUT_TIME_ALREADY_EXIST' };
            }
    
            const startDay = new Date(attendance.checkInTime);
            const endDay = new Date(body.checkOutTime);
    
            if (endDay < startDay) {
                res.status(400);
                return { status: false, message: 'CHECK_OUT_TIME_CANT_LESS_THAN_CHECK_IN_TIME' };
            }
    
            const isSameDay = startDay.getUTCDate() === endDay.getUTCDate()
                        && startDay.getUTCMonth() === endDay.getUTCMonth()
                        && startDay.getUTCFullYear() === endDay.getUTCFullYear();
    
            if (!isSameDay) {
                res.status(400);
                return { status: false, message: 'CHECK_OUT_TIME_NOT_IN_SAME_DAY' }
            }
    
            const checkOutTime = new Date(body.checkOutTime);
            attendance.checkOutTime = checkOutTime;
            
            const updateAttendance = await attendance.save();
    
            if (!updateAttendance) {
                res.status(400);
                return { status: false, message: 'ATTENDANCE_UPDATE_FAILED' };
            }
    
            res.status(200).json({
                status: true,
                message: 'SUCCESS_UPDATE_ATTENDANCE',
                attendance: {
                    id: attendance._id,
                    checkInTime: attendance.checkInTime,
                    checkOutTime: attendance.checkOutTime,
                    absentState: attendance.absentState
                }
            });

        } catch (error) {
            res.status(error.statusCode || 500);
            return { status: false, message: error.message };
        }
    }

    Attendance.remoteMethod('updateAttendance', {
        accepts: [
            { arg: 'body', type: 'object', root: true, required: true, http: { source: 'body' }}, 
            { arg: 'attendanceId', type: 'string', root: true, required: true, http: { source: 'path' }}, 
            { arg: 'req', type: 'object', http: { source: 'req' }}, 
            { arg: 'res', type: 'object', http: { source: 'res' }}
        ],
        returns: { arg: 'result', type: 'object', root: true },
        http: { verb: 'put', path: '/:attendanceId' }
    });

    // controller check email
    Attendance.emailCheck = async (email, res) => {
        try {
            const Employee = Attendance.app.models.Employee;

            const employee = await Employee.findOne({ where: { email } });
            if (employee) {
                res.status(400);
                return {
                    status: false,
                    message: 'EMAIL_IS_EXIST'
                };
            }

            return {
                status: true,
                message: 'NEW_EMAIL_DETECTED'
            }
        } catch (error) {
            throw Object.assign(new Error(error.message), {
                statusCode: 500,
            });
        }
    };
    
    // route cek email exist
    Attendance.remoteMethod('emailCheck', {
        accepts: [
            { arg: 'email', type: 'string', root: true, required: true, http: { source: 'query' }}, 
            { arg: 'res', type: 'object', http: { source: 'res' }}, 
        ],
        returns: { arg: 'result', type: 'object', root: true },
        http: { verb: 'get', path: '/emailCheck' }
    });

};
