

const express = require('express');
const bodyParser = require('body-parser');
const employeeRouter = require('./routes/employee');
const adminRouter = require('./routes/admin');
const supplyRouter = require('./routes/supply');
const db = require('./utils/db'); // Import the db.js file
require('dotenv').config();

// Create Express app
const app = express();

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use('/admin', adminRouter);
app.use('/supply', supplyRouter);
app.use('/employee', employeeRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
