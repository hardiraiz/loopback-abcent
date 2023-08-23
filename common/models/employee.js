'use strict';

module.exports = function(Employee) {

    // controller mengambil list user
    Employee.list = async () => {
        try {
            const employees = await Employee.find({
                fields: { id: true, fullname: true, email: true }
            });
            return employees;
        } catch (error) {
            throw error;
        }
    };

    // route mengambil list user
    Employee.remoteMethod('list', {
        returns: { arg: 'employess', type: 'array', root: true },
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
            res.status(error. statusCode || 500);
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

};