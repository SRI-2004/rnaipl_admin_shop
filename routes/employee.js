const express = require('express');
const EmployeeDetails = require('../models/employee_details');
const SupplyDetails = require('../models/supply_details')
const ItemPosition = require('../models/eligibility')
const { verifyToken, isAdmin } = require('../utils/middleware');
const router = express.Router();


// GET request to fetch employee details by card_id
router.get('/get_details',verifyToken, async (req, res) => {
  const { Emp_Id, Card_No } = req.query;

  try {
    let employee;
    if (Emp_Id) {
      // Find employee by Emp_Id
      employee = await EmployeeDetails.findOne({ where: { Emp_Id } });
    } else if (Card_No) {
      // Find employee by Card_No
      employee = await EmployeeDetails.findOne({ where: { Card_No } });
    } else {
      return res.status(400).json({ error: 'Please provide either Emp_Id or Card_No' });
    }

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Find all supply records for the employee
    const supplies = await SupplyDetails.findAll({ where: { Emp_Id: employee.Emp_Id } });

    // Default values if no supplies are found
    const defaultItem = {
      item_type: 'Default',
      item_name: 'Default',
      item_size: 'Default'
    };
    const position = employee.Position;
    const gender = employee.Gender;
    const department = employee.Department;
    const items = await ItemPosition.findAll({
      where: {
        position: position,
        gender: gender,
        department: department
      }
    });

    if (!items) {
      return res.status(404).json({ error: 'Not eligible for any item' });
    }

    // Extract item names from the results
    const itemNames = items.map(item => ({
      Item_Type: item.item_type,
      Item_Name: item.item_name
    }));


    // Return employee details along with supply details
    res.json({
      SNo: employee.SNo,
      Code: employee.Emp_Id,
      No: employee.Card_No,
      Name: employee.Name,
      Gender: employee.Gender,
      Department: employee.Department,
      Position: employee.Position,
      Section: employee.Section,
      ContactNo: employee.ContactNo,
      ItemNames: itemNames // Array of supply items
    });
  } catch (error) {
    console.error('Error fetching employee details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/create_employee',verifyToken,  async (req, res) => {
  const { Emp_Id, Card_No, Name, Gender, Department, Position, Section, ContactNo } = req.body;

  try {
    const newEmployee = await EmployeeDetails.create({ Emp_Id, Card_No, Name, Gender, Department,Position, Section, ContactNo });
    res.status(201).json(newEmployee);
  } catch (error) {
    console.error('Error creating new employee:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


router.post('/delete_employee', verifyToken,async (req, res) => {
  const { Emp_Id, Card_No } = req.body;

  try {
    console.log(req.user)
    // Verify the Card_No in the request with the one in the token
    if (req.user.admin.Card_No !== Card_No) {
      return res.status(404).json({ error: 'Invalid Card_No' });
    }

    // Find the employee
    const employee = await EmployeeDetails.findOne({ where: { Emp_Id } });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Delete related supply details
    await SupplyDetails.destroy({ where: { Emp_Id } });

    // Delete the employee
    await EmployeeDetails.destroy({ where: { Emp_Id } });

    res.status(200).json({ message: 'Employee and related supply details deleted successfully' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

