const jwt = require('jsonwebtoken');
const Account = require('../models/accountModel');
require('dotenv').config();

exports.authenticate = async (req, res, next) => {
  try {
    // Check if authorization header exists
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization header missing' });
    }

    // Extract token
    const token = authHeader.replace('Bearer ', '');
    console.log(token);
    if (!token) return res.status(401).json({ error: 'No token provided' });
  

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Authentication error:', err);
    
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    
    res.status(401).json({ error: 'Authentication failed' });
  }
};

exports.authorize =  (roles) => {
  return async (req, res, next) => {
    // Check if user exists (from authenticate middleware)
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Convert single role to array for flexibility
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    req.user = await Account.findById(req.user.id)

    // Check if user has required role
    if (!allowedRoles.includes(req.user.user_role)) {
      return res.status(403).json({ 
        error: `Access denied. Required roles: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
};