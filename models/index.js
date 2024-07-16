const sequelize = require('./sequelize');
const EmployeeDetails = require('./models/employee_details');
const Admin = require('./models/admin_details');
const SupplyDetails = require('./models/supply_details');

sequelize.sync({ index: true }) 
  .then(() => {
    console.log('Database & tables created!');
  })
  .catch(err => {
    console.error('Unable to create the database:', err);
  });
