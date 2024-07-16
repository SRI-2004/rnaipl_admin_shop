const express = require('express');
const EmployeeDetails = require('../models/employee_details');
const SupplyDetails = require('../models/supply_details')
const ItemPosition = require('../models/eligibility')
const { verifyToken, isAdmin } = require('../utils/middleware');
const router = express.Router();


// GET request to fetch employee details by card_id
router.get('/get_details',  async (req, res) => {
  const Card_No = req.query.Card_No;

  try {
    // Find employee by card_id
    const employee = await EmployeeDetails.findOne({ where: { Card_No: Card_No } });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Find all supply records for the employee
    const supplies = await SupplyDetails.findAll({ where: { Card_No: Card_No } });
    
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
        department: employee.Department
      }
    });
    

    if(!items){
      return res.status(404).json({ error: 'Not eligible for any item' });
    }
    // Extract item names from the results
    const itemNames = items.map(item => ({
      Item_Type: item.item_type,
      Item_Name: item.item_name
  }));

    // Map supplies to include default values if empty
    const supplyDetails = supplies.length > 0 ? supplies : [defaultItem];

    // Format supply details for response
    const formattedSupplies = supplyDetails.map(supply => ({
      Item_Type: supply.item_type || defaultItem.item_type,
      Item_Name: supply.item_name || defaultItem.item_name,
      Item_Size: supply.item_size || defaultItem.item_size
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
      // Supplies: formattedSupplies,
      itemNames: itemNames // Array of supply items
    });
  } catch (error) {
    console.error('Error fetching employee details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/create_employee',  async (req, res) => {
  const { Emp_Id, Card_No, Name, Gender, Department, Position, Section, ContactNo } = req.body;

  try {
    const newEmployee = await EmployeeDetails.create({ Emp_Id, Card_No, Name, Gender, Department,Position, Section, ContactNo });
    res.status(201).json(newEmployee);
  } catch (error) {
    console.error('Error creating new employee:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

