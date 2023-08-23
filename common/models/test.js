'use strict';


module.exports = function(Test) {
    Test.testList = async (options, res) => {
        try {
            const result = await Test.find();
            const userId = options.accessToken.userId;
            res.status(200).json({
                status: true,
                message: 'SUCCESS_GET_TEST',
                userId,
                result
            });
        } catch (error) {
            throw { message: error.message, statusCode: error.statusCode || 500 }
        }
    }

    Test.remoteMethod('testList', {
        accepts: [
            { arg: 'options', type: 'object', http: 'optionsFromRequest' },
            { arg: 'res', type: 'object', http: { source: 'res' }}
        ],
        returns: { arg: 'result', type: 'object', root: true },
        http: { verb: 'get', path: '/test-list' }
    });

    Test.internalJs = async () => {
        try {
            const result = await Test.callJs();
            return result;
        } catch (error) {
            throw { message: error.message, statusCode: error.statusCode || 500 }
        }
    };

    Test.remoteMethod('internalJs', {
        returns: { arg: 'result', type: 'object', root: true },
        http: { verb: 'get', path: '/internal-js' }
    });

    Test.callJs = async () => {
        try {
            return {
                status: true,
                message: 'SUCCESS_CALL_EXTERNAL_JS'
            }
        } catch (error) {
            throw { message: error.message, statusCode: error.statusCode || 500 }
        }
    }
}
