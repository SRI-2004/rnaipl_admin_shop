const express = require('express');
const SupplyDetails = require('../models/supply_details');
const EmployeeDetails = require('../models/employee_details'); // Import EmployeeDetails model
const { verifyToken } = require('../utils/middleware');
const router = express.Router();
require('dotenv').config();
// POST request to add cloth supply details
router.post('/',  async (req, res) => {
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
          item_size: item_size[i],
          item_name: item_name[i],
          Emp_Id
        }
      });

      if (existingSupply) {
        // If it exists, increment the count
        existingSupply.Count += 1;
        await existingSupply.save();
        newSupplies.push(existingSupply);
      } else {
        // If it doesn't exist, create a new supply record with count = 1
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

module.exports = router;
