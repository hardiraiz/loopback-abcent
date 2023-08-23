'use strict';

const { emailExist } = require("../utils/emailExist");

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
    Attendance.createAttendance = async (options, body, res) => {
        try {
            const userId = options.accessToken.userId;
            const checkInTime = new Date(body.checkInTime);
            const statusCheckIn = 'onTime';

            const attendance = await Attendance.create({
                userId: userId,
                checkInTime: checkInTime,
                absentState: statusCheckIn
            });

            if (!attendance) {
                throw Object.assign(new Error('CHECK_IN_TIME_FAILED_TO_RECORD'), {
                    statusCode: error.statusCode || 500,
                });
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
            throw Object.assign(new Error(error.message), {
                statusCode: error.statusCode || 500,
            });
        }
    };

    // route create attendance
    Attendance.remoteMethod('createAttendance', {
        accepts: [
            { arg: 'options', type: 'object', http: 'optionsFromRequest' },
            { arg: 'body', type: 'object', root: true, required: true, http: { source: 'body' }},
            { arg: 'res', type: 'object', http: { source: 'res' }}
        ],
        returns: { arg: 'result', type: 'object', root: true },
        http: { verb: 'post', path: '/' }
    });

    // route cek email exist
    Attendance.emailCheck = async (email) => {
        try {
            // console.log("Email: ", email);
            const isEmailExist = await emailExist(email);
            if (isEmailExist) {
                throw { message: 'EMAIL_EXIST', statusCode: 400 }
            }

            return {
                status: true,
                message: 'SUCCESS_CHECK_EMAIL',
                isEmailExist: isEmailExist
                // email: email
            }
        } catch (error) {
            throw { message: error.message, statusCode: error.statusCode || 500 }
        }
    };

    Attendance.remoteMethod('emailCheck', {
        accepts: [
            { arg: 'email', type: 'string', root: true, required: true, http: { source: 'query' }}, 
        ],
        returns: { arg: 'result', type: 'object', root: true },
        http: { verb: 'get', path: '/emailCheck' }
    });


};
