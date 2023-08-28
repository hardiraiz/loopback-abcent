'use strict';

module.exports = function(Employee) {

    // controller mengambil list user
    Employee.list = async () => {
        try {
            const employees = await Employee.find({
                fields: { id: true, fullname: true, email: true }
            });
            
            return {
                status: true,
                message: 'SUCCESS_GET_LIST_EMPLOYEES',
                employees
            };
        } catch (error) {
            throw error;
        }
    };

    // route mengambil list user
    Employee.remoteMethod('list', {
        returns: { arg: 'result', type: 'object', root: true },
        http: { verb: 'get', path: '/list' }
    });

    // controller ambil current user yang sedang login
    Employee.detail = async (options) => {
        try {
            const userId = options.accessToken.userId;
            // console.log("options: ", options);
            // console.log("options current user: ", options.currentUser);
            // console.log("options current user id: ", options.currentUser.id);
            // console.log("user id: ", userId);
            const employee = await Employee.findOne({ where: { id: userId } });
            return employee;
            
        } catch (error) {
            throw error;
        }
    }

    // route mengambil current user yang sedang login
    Employee.remoteMethod('detail', {
        accepts: [
            { arg: 'options', type: 'object', http: 'optionsFromRequest' }
        ],
        returns: { arg: 'employee', type: 'object', root: true }, 
        http: { verb: 'get', path: '/' }
    });

    // controller ambil detail user by path parameter
    Employee.getUserDetail = async (userId) => {
        try {
            const employee = await Employee.findOne({ where: { id: userId } });
            return employee;
        } catch (error) {
            throw error;
        }
    }

    // route ambil detail user by path parameter
    Employee.remoteMethod('getUserDetail', {
        accepts: { arg: 'userId', type: 'string', root: true, required: true, http: { source: 'path' }},
        returns: { arg: 'employee', type: 'object', root: true },
        http: { verb: 'get', path: '/:userId' }
    });

    // controller update data user
    Employee.updateUser = async (userId, body, res, req) => {
        try {
            // Cara 1
            // const employee = await Employee.findById(userId);
            // employee.fullname = body.fullname;

            // const result = await employee.save()
            // console.log("Result: ", result);
            // return result;

            // Cara 2
            const employee = await Employee.findById(userId);
            if (!employee) { 
                res.status(404);
                return {
                    status: false,
                    message: "USER_NOT_FOUND"
                }
            };  

            const result = await employee.updateAttributes(req.body);
            res.status(200).json({
                status: true,
                message: "SUCCESS_UPDATE_DATA_USER",
                id: result.id,
                fullname: result.fullname
            });

        } catch (error) {
            res.status(error.statusCode || 500);
            return {
                status: false,
                message: error.message
            }
        }
    };
    
    // route update data user
    Employee.remoteMethod('updateUser', {
        accepts: [
            { arg: 'userId', type: 'string', root: true, required: true, http: { source: 'path' }},
            { arg: 'body', type: 'object', root: true, required: true, http: { source: 'body' }},
            { arg: 'res', type: 'object', http: { source: 'res' }},
            { arg: 'req', type: 'object', http: { source: 'req' }}
        ],
        returns: { arg: 'result', type: 'object', root: true },
        http: { verb: 'put', path: '/:userId' }
    });

    // controller delete data employee
    Employee.deleteUser = async (userId, req, res) => {
        try {
            console.log("path param from req: ", req.params.userId);
            console.log("path param: ", userId);
    
            const result = await Employee.destroyById(userId);
            if (result.count === 0) {
                res.status(404);
                return {
                    status: false,
                    message: 'USER_NOT_FOUND'
                }
            };
            
            res.status(200).json({
                status: 'true',
                message: 'SUCCESS_DELETE_USER',
                id: userId
            });    
        } catch (error) {
            res.status(error.statusCode || 500);
            return {
                status: false,
                message: error.message
            }
        }
    }

    // route delete data employee
    Employee.remoteMethod('deleteUser', {
        accepts: [
            { arg: 'userId', type: 'string', root: true, required: true, http: { source: 'path' }},
            { arg: 'req', type: 'object', http: { source: 'req' }},
            { arg: 'res', type: 'object', http: { source: 'res' }}
        ],
        returns: { arg: 'result', type: 'object', root: true },
        http: { verb: 'delete', path: '/:userId' }
    });

    // controller to get employee with list attendance
    Employee.attendances = async (req, res) => {
        try {
            // const userId = req.accessToken.userId;
            // console.log("User ID: ", userId);
            // const employee = await Employee.findById()

            const employees = await Employee.find({
                where: {},
                fields: ['id', 'fullname'],
                include: [
                    {
                        relation: 'attendances',
                        scope: {
                            fields: ['checkInTime', 'checkOutTime']
                        },
                        order: 'checkInTime DESC'
                    },
                    {
                        relation: 'permits',
                        scope: {
                            fields: ['permitInfo', 'permitType']
                        },
                        order: 'startDate DESC'
                    }
                ]
            });

            return {
                status: true,
                message: 'SUCCESS_GET_USER_ATTENDANCES',
                employees
            }
        } catch (error) {
            res.status(error.statusCode || 500);
            return {
                status: false,
                message: error.message
            }
        }
    };

    // route get employee with list attendance
    Employee.remoteMethod('attendances', {
        accepts: [
            { arg: 'req', type: 'object', http: { source: 'req' }},
            { arg: 'res', type: 'object', http: { source: 'res' }}
        ],
        returns: { arg: 'result', type: 'object', root: true },
        http: { verb: 'get', path: '/attendances' }
    });

    // controller only for manager limit by acl
    Employee.onlyManager = async (req, res) => {
        try {
            res.status(200);
            return {
                status: true,
                message: 'YOURE_A_MANAGER'
            }
        } catch (error) {
            res.status(error.statusCode || 500);
            return {
                status: false,
                message: 'FAILED_TO_CHECK_USER_ROLE: ' + error.message
            }
        }
    };

    // route only for manager limit by acl
    Employee.remoteMethod('onlyManager', {
        accepts: [
            { arg: 'req', type: 'object', http: { source: 'req' }},
            { arg: 'res', type: 'object', http: { source: 'res' }}
        ],
        returns: { arg: 'result', type: 'object', root: true },
        http: { verb: 'get', path: '/manager-only' }
    });


    // route only for manager limit by route
    // lebih simple menerapkan user role dan access melalui acl
    // ini hanya percobaan
    Employee.onlyManager2 = async (req, res) => {
        try {
            const RoleMapping = Employee.app.models.RoleMapping;

            const userId = req.accessToken && req.accessToken.userId;
            const roleMapping = await RoleMapping.findOne({ 
                where: { principalId: userId },
                fields: { principalId: 'userId', roleId: 'roleId' },
                include: {
                    relation: 'role',
                    scope: {
                        where: { id: '${roleId}' },
                        fileds: ['name']
                    }
                } 
            });

            if (!roleMapping || !roleMapping.role.name === 'manager') {
                res.status(401);
                return {
                    status: false,
                    message: 'YOU_DONT_HAVE_ACCESS'
                }
            }

            const employee = await Employee.findById(userId);
            res.status(200);
            return {
                status: true,
                message: 'SUCCESS_GET_YOUR_PROFILE',
                employee
            }
        } catch (error) {
            res.status(error.statusCode || 500);
            return {
                status: false,
                message: 'FAILED_TO_CHECK_USER_ROLE: ' + error.message
            }
        }
    }

    // route only for manager limit by route doesnt work
    Employee.remoteMethod('onlyManager2', {
        http: { verb: 'get', path: '/manager-only-2' },
        roles: ['manager'],
        accepts: [
            { arg: 'req', type: 'object', http: { source: 'req' }},
            { arg: 'res', type: 'object', http: { source: 'res' }}
        ],
        returns: { arg: 'result', type: 'object', root: true }
    });

};
