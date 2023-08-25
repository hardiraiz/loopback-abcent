

module.exports = function(app) {
    const { Employee, Role, RoleMapping } = app.models;

    async function findOrCreateManagerRole() {
      try {
        let managerRole = await Role.findOne({ where: { name: 'manager' } });
        if (!managerRole) {
          managerRole = await Role.create({ name: 'manager' });
        }
        return managerRole;
      } catch (error) {
        throw error;
      }
    }

    async function addManagerRoleToEmployee(userData) {
      try {
        const [employee, created] = await Employee.findOrCreate(
          { where: { email: userData.email } },
          userData
        );
        
        if (created) {
          console.log('Employee baru berhasil dibuat:', employee);
        }
        
        if (employee) {
          const managerRole = await findOrCreateManagerRole();
          const roleMapping = await RoleMapping.findOne({ where: { principalId: employee.id, roleId: managerRole.id }});
          
          if (!roleMapping) {
            const principal = await managerRole.principals.create({
              principalType: RoleMapping.USER,
              principalId: employee.id
            });
            console.log('Created principal: ', principal);
          }
        }
        
      } catch (error) {
        console.error(error);
      }
    }

    addManagerRoleToEmployee({
      username: 'manager1',
      fullname: 'This is manager 1',
      email: 'manager1@test.com',
      password: 'test'
    });
      
}