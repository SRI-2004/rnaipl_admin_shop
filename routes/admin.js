const express = require('express');
const Admin = require('../models/admin_details');
const bcrypt = require('bcrypt');
const ItemPosition = require('../models/eligibility')
const { verifyToken, isAdmin } = require('../utils/middleware');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { Op } = require('sequelize');

router.post('/signup', async (req, res) => {
  const { Emp_Id, Card_No, Password } = req.body;

  try {
    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(Password, 10);

    // Create the new admin with the hashed password
    const newAdmin = await Admin.create({
      Emp_Id,
      Card_No,
      Password: hashedPassword
    });

    res.status(201).json(newAdmin);
  } catch (error) {
    console.error('Error creating new admin:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  const { Emp_Id, Password } = req.body;

  try {
    // Find admin by Code
    const admin = await Admin.findOne({ where: { Emp_Id } });

    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    // Validate password
    const isMatch = await bcrypt.compare(Password, admin.Password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create JWT payload
    const payload = {
      admin: {
        Card_No: admin.Card_No,
        Emp_Id: admin.Emp_Id
        // Add additional fields as needed
      }
    };

    // Sign JWT
    jwt.sign(
      payload,
      process.env.JWT_SECRET, // Replace with your own secret key for signing JWT
      { expiresIn: '1h'}, // Token expiration time
      (err, token) => {
        if (err) throw err;
        
        res.json({ 
          token: token,
          Name: admin.Name,
          ContactNo: admin.ContactNo,
          Emp_Id: admin.Emp_Id 
        });
      }
    );

  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});





router.post('/add_item', verifyToken, async (req, res) => {
  const { item_name, item_type, gender, positions, departments } = req.body;

  try {
    if (!Array.isArray(positions) || positions.length === 0) {
      return res.status(400).json({ error: 'Positions must be a non-empty array' });
    }

    const genders = gender === 'MaleFemale' ? ['Male', 'Female'] : [gender];
    const newItemPositions = [];

    for (const gender of genders) {
      for (const department of departments) {
        for (const position of positions) {
          newItemPositions.push({ item_name, item_type, gender, department, position });
        }
      }
    }

    // Check for existing records
    const existingItems = await ItemPosition.findAll({
      where: {
        [Op.or]: newItemPositions.map(item => ({
          item_name: item.item_name,
          item_type: item.item_type,
          gender: item.gender,
          department: item.department,
          position: item.position,
        })),
      },
    });

    // Filter out existing items from newItemPositions
    const existingItemsSet = new Set(existingItems.map(item => JSON.stringify({
      item_name: item.item_name,
      item_type: item.item_type,
      gender: item.gender,
      department: item.department,
      position: item.position,
    })));

    const filteredNewItemPositions = newItemPositions.filter(item => 
      !existingItemsSet.has(JSON.stringify(item))
    );

    // Perform bulk insert for non-existing records
    if (filteredNewItemPositions.length > 0) {
      const createdItemPositions = await ItemPosition.bulkCreate(filteredNewItemPositions);
      res.status(201).json(createdItemPositions);
    } else {
      res.status(200).json({ message: 'All items already exist' });
    }
  } catch (error) {
    console.error('Error creating item positions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



module.exports = router;

