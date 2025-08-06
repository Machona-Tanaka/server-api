const pool = require('../config/db');

exports.getUserMetrics = async (req, res) => {
  try {
    const { account_id } = req.params;
    const [metrics] = await pool.query(
      'SELECT * FROM UsageMetrics WHERE account_id = ?',
      [account_id]
    );
    res.json(metrics[0] || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.recordActivity = async (req, res) => {
  try {
    const { account_id } = req.params;
    const { device_type, location } = req.body;
    
    const [existing] = await pool.query(
      'SELECT * FROM UsageMetrics WHERE account_id = ?',
      [account_id]
    );
    
    if (existing.length > 0) {
      await pool.query(
        'UPDATE UsageMetrics SET login_count = login_count + 1, last_activity = CURRENT_TIMESTAMP, device_type = ?, location = ? WHERE account_id = ?',
        [device_type, location, account_id]
      );
    } else {
      await pool.query(
        'INSERT INTO UsageMetrics (account_id, login_count, last_activity, device_type, location) VALUES (?, 1, CURRENT_TIMESTAMP, ?, ?)',
        [account_id, device_type, location]
      );
    }
    
    res.json({ message: 'Activity recorded' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateTimeSpent = async (req, res) => {
  try {
    const { account_id } = req.params;
    const { minutes } = req.body;
    
    if (!Number.isInteger(minutes) || minutes <= 0) {
      return res.status(400).json({ error: 'Invalid minutes value' });
    }
    
    const [existing] = await pool.query(
      'SELECT * FROM UsageMetrics WHERE account_id = ?',
      [account_id]
    );
    
    if (existing.length > 0) {
      await pool.query(
        'UPDATE UsageMetrics SET total_time_spent = total_time_spent + ? WHERE account_id = ?',
        [minutes, account_id]
      );
    } else {
      await pool.query(
        'INSERT INTO UsageMetrics (account_id, total_time_spent) VALUES (?, ?)',
        [account_id, minutes]
      );
    }
    
    res.json({ message: 'Time spent updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};