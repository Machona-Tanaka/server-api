const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const Account = require('../models/accountModel');


require('dotenv').config();



// Register a new account
exports.register = async (req, res) => {
  try {
    const { username, password, email, phone } = req.body;

    // Check if username exists
    const existingUser = await Account.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create account
    const newAccount = await Account.create({ username, password_hash: passwordHash , email, phone });

    // Generate JWT token
    const token = jwt.sign({ id: newAccount.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Respond with account details and token
    res.status(201).json({
      id: newAccount.id,
      username: newAccount.username,
      token
    });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to register account' });
  }
};

// Login to account
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await Account.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    

    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('User found:', user);
    // Update last login
    await Account.updateLastLogin(user.id);

    // Generate JWT token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.json({
      id: user.id,
      username: user.username,
      role: user.user_role,
      avatar: user.profile_image,
      token,
      success: true});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to login' });
  }
};

// Changing Password
exports.changePassword = async (req, res) =>{
  const { userId, password, newPassword } = req.body;
  try{
    const user = await Account.findById(userId);
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    console.log({ userId, password });
    if (!isMatch){
       return res.status(401).json({ error: 'Invalid credentials' });
    }
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(newPassword, salt);
    console.log(userId);
    await Account.updatePassword({userId, password_hash});

    res.json({
      success: true
    })

  } catch (err){
    console.error(err);
    res.status(500).json({ error: 'Failed to change Password' });
  }
}

// Get account details
exports.getAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const account = await Account.findById(id);

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    res.json(account);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch account' });
  }
};

// Update account
exports.updateAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password } = req.body;

    let updateData = {};

    if (username) {
      updateData.username = username;
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      updateData.password_hash = passwordHash;
      updateData.last_password_change = new Date();
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const updated = await Account.updateById(id, updateData);

    if (!updated) {
      return res.status(404).json({ error: 'Account not found' });
    }

    res.json({ id, message: 'Account updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update account' });
  }
};

exports.adminUpdateAccount = async ( req, res) => {
  try {
    const { userId } = req.params;
    const id = userId;
    const { email,
        username,
        user_role,
        phone,
        newPassword,
        profile_image,
        account_status} = req.body;

  console.log({ email,
        username,
        user_role,
        phone,
        newPassword,
        profile_image,
        account_status})

  let password_hash;
  if (newPassword){
      const salt = await bcrypt.genSalt(10);
      password_hash = await bcrypt.hash(newPassword, salt);
  }

  const updated = await Account.adminUpdate( id, { email, username, user_role, phone, password_hash, profile_image, account_status} );

  if (!updated) {
        return res.status(404).json({ error: 'Account not found' });
      }

    res.json({ id, message: 'Account updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update account' });
  }

}


exports.getAllUsers = async (req, res) => {
  try {

    const users = await Account.getAllUsers();
   if (!users) {
      return res.status(404).json({ error: 'Account not found' });
    }

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch user accounts' });
  
  } 
};

exports.countUsers = async (req, res) => { 
 try{
    const users = await Account.getCountUsers();
    if (!users){
      return res.status(404).json({error: 'There are no Accounts yet'});
    }
    res.json(users);
 }
  catch (error){
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch user accounts' });
  }
}

exports.adminRegister = async (req, res) =>{

  try {
    const { username, password, email, phone, user_role , isActive} = req.body;

    // Check if username exists
    const existingUser = await Account.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create account
    const newAccount = await Account.create({ username, password_hash: passwordHash , email, phone, user_role, account_status: isActive});
    // Respond with account details and token
    res.status(201).json({
      id: newAccount.id,
      username: newAccount.username,
    });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to register account' });
  }
}

exports.deleteUser = async (req, res) => {
  try {
    // 1. Validate request parameters
    const userId = req.params.id;
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID format'
      });
    }

    // 2. Check if user exists
    const user = await Account.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // 3. Prevent self-deletion (optional security measure)
    if (req.user.id === userId) {
      return res.status(403).json({
        success: false,
        error: 'You cannot delete your own account'
      });
    }

    // 4. Check admin permissions (if your system has roles)
    if (req.user.user_role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized: Admin privileges required'
      });
    }

    // 5. Perform deletion
    await Account.deleteUser(userId);

    // 6. Log the action (recommended for audit trail)
    console.log(`User ${userId} deleted by admin ${req.user.id}`);

    // 7. Send success response
    res.status(200).json({
      success: true,
      data: {
        message: 'User deleted successfully',
        deletedUserId: userId
      }
    });

  } catch (err) {
    // Handle specific error types
    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID format'
      });
    }

    // Handle database errors
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Database operation failed'
      });
    }

    // Generic error handler
    console.error('Error deleting user:', err);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};