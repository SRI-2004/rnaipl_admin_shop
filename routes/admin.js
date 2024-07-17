const express = require('express');
const Admin = require('../models/admin_details');
const bcrypt = require('bcrypt');
const ItemPosition = require('../models/eligibility')
const { verifyToken, isAdmin } = require('../utils/middleware');
const jwt = require('jsonwebtoken');
const router = express.Router();

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
      { expiresIn: '1m '}, // Token expiration time
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );

  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



router.post('/add_item', async (req, res) => {
  const { item_name, item_type, gender, positions, departments } = req.body; // Expecting positions to be an array

  try {
    if (!Array.isArray(positions) || positions.length === 0) {
      return res.status(400).json({ error: 'Positions must be a non-empty array' });
    }

    const newItemPositions = [];

    const genders = gender === 'MaleFemale' ? ['Male', 'Female'] : [gender];

    for (const gender of genders) {
      for(const department of departments){
        for (const position of positions) {
          const newItemPosition = await ItemPosition.create({ item_name, item_type, gender, department, position });
          newItemPositions.push(newItemPosition);
        }
      }
    }

    res.status(201).json(newItemPositions);
  } catch (error) {
    console.error('Error creating item positions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


module.exports = router;

