const express = require('express');
const SupplyDetails = require('../models/supply_details');
const EmployeeDetails = require('../models/employee_details'); // Import EmployeeDetails model
const { verifyToken } = require('../utils/middleware');
const router = express.Router();
require('dotenv').config();
// POST request to add cloth supply details
router.post('/add_supply', verifyToken,  async (req, res) => {
  const { item_type, item_size, item_name, Card_No, Emp_Id } = req.body;

  try {
    // Check if the employee exists
    const employee = await EmployeeDetails.findOne({ where: { Emp_Id } });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const Name = employee.Name;
    const Gender = employee.Gender;
    const Department = employee.Department;
    const Department_Contact = employee.ContactNo;

    // Ensure that all item arrays are of the same length
    if (item_type.length !== item_size.length || item_type.length !== item_name.length) {
      return res.status(400).json({ error: 'All item arrays must have the same length' });
    }

    const newSupplies = [];

    for (let i = 0; i < item_type.length; i++) {
      // Check if the item already exists for the employee
      const existingSupply = await SupplyDetails.findOne({
        where: {
          item_type: item_type[i],
          item_name: item_name[i],
          Emp_Id
        }
      });

      if (existingSupply) {
        if (existingSupply.item_size === item_size[i]) {
          // If all three values are the same, ignore this item
          continue;
        } else {
          // If it exists and only item_size is different, update the item size to the new value
          existingSupply.item_size = item_size[i];
          await existingSupply.save();
          newSupplies.push(existingSupply);
        }
      } else {
        // If it doesn't exist, create a new supply record
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
    const accountSid = process.env.TWILIO_SID;  // Replace with your Twilio Account SID
    const authToken = process.env.TWILIO_AUTH_TOKEN;  // Replace with your Twilio Auth Token
    const client = require('twilio')(accountSid, authToken);

    client.messages
      .create({
        body: messageBody,
        from: process.env.TWILIO_WHATSAPP_NO, // Your Twilio WhatsApp number
        to: `whatsapp:+91${employee.ContactNo}` // Concatenated with +91 for India
      })
      .then(message => console.log(message.sid))
      .catch(error => console.error('Error sending WhatsApp message:', error));

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


