const Employee = require('../models/employee');


const emailExist = async (email) => {
    console.log("Model Employee: ", Employee);
    const employee = await Employee.findOne({ where: { email } });
    console.log("Employee: ", employee);
    if (!employee) { return true };
    return false;
}

module.exports = {
    emailExist
}
