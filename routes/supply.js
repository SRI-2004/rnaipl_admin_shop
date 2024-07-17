const express = require('express');
const router = express.Router();
const SupplyDetails = require('../models/supply_details');
const EmployeeDetails = require('../models/employee_details');
const { verifyToken } = require('../utils/middleware');
require('dotenv').config();
const { Op } = require('sequelize');
const sendWhatsAppMessage = require('../services/whatsapp');


// POST request to add cloth supply details
router.post('/add_supply', async (req, res) => {
  const { item_type, item_size, item_name, Card_No, Emp_Id } = req.body;

  try {
    // Check if the employee exists
    const employee = await EmployeeDetails.findOne({ where: { Emp_Id } });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const { Name, Gender, Department, ContactNo: Department_Contact } = employee;

    // Ensure that all item arrays are of the same length
    if (item_type.length !== item_size.length || item_type.length !== item_name.length) {
      return res.status(400).json({ error: 'All item arrays must have the same length' });
    }

    const newSupplies = [];
    const suppliesToCheck = item_type.map((type, i) => ({
      item_type: type,
      item_name: item_name[i],
      Emp_Id
    }));

    // Check existing supplies in a single query
    const existingSupplies = await SupplyDetails.findAll({
      where: {
        [Op.or]: suppliesToCheck
      }
    });

    const existingSuppliesMap = new Map();
    existingSupplies.forEach(supply => {
      existingSuppliesMap.set(`${supply.item_type}-${supply.item_name}-${supply.Emp_Id}`, supply);
    });

    for (let i = 0; i < item_type.length; i++) {
      const key = `${item_type[i]}-${item_name[i]}-${Emp_Id}`;
      const existingSupply = existingSuppliesMap.get(key);

      if (existingSupply) {
        if (existingSupply.item_size === item_size[i]) {
          continue; // Ignore if all three values are the same
        } else {
          // Update item size if it exists and only item_size is different
          existingSupply.item_size = item_size[i];
          await existingSupply.save();
          newSupplies.push(existingSupply);
        }
      } else {
        // Create new supply record if it doesn't exist
        const newSupply = await SupplyDetails.create({
          item_type: item_type[i],
          item_size: item_size[i],
          item_name: item_name[i],
          Card_No,
          Name,
          Gender,
          Department_Contact,
          Emp_Id,
          Count: 1 // Assuming count is a field in your model
        });
        newSupplies.push(newSupply);
      }
    }

    // Construct the message body for WhatsApp
    const itemDetailsMessage = newSupplies.map(supply => `${supply.item_name} \n (Type: ${supply.item_type}, Size: ${supply.item_size})`).join('\n');
    const messageBody = `Greetings from RNAIPL Admin Store!!\n\nHey ${Name},\nEmployee_ID : ${Emp_Id}\n\nYour Order has been received. Below is your order confirmation:\n\n${itemDetailsMessage}\n\n`;

    // Send WhatsApp message
    sendWhatsAppMessage(employee, messageBody);

    res.status(201).json(newSupplies);
  } catch (error) {
    console.error('Error creating cloth supply:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



router.get('/get_supply', async (req, res) => {
  try {
    // Fetch all supply items from the SupplyDetails table
    const supplies = await SupplyDetails.findAll();

    // Check if there are any supply items
    if (supplies.length === 0) {
      return res.status(404).json({ error: 'No supply items found' });
    }

    // Format the supply items for the response
    const formattedSupplies = supplies.map(supply => ({
      Item_Type: supply.item_type,
      Item_Name: supply.item_name,
      Item_Size: supply.item_size,
      Card_No: supply.Card_No,
      Name: supply.Name,
      Gender: supply.Gender,
      Department_Contact: supply.Department_Contact,
      Emp_Id: supply.Emp_Id,
    }));

    // Return the formatted supply items
    res.json(formattedSupplies);
  } catch (error) {
    console.error('Error fetching supply items:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;


