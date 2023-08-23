'use strict';


module.exports = function(Test) {
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
