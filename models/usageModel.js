const pool = require('../config/db');

class UsageMetrics {
  static async findByAccountId(account_id) {
    const [metrics] = await pool.query(
      'SELECT * FROM UsageMetrics WHERE account_id = ?',
      [account_id]
    );
    return metrics[0];
  }

  static async recordLogin(account_id, device_type, location) {
    const existing = await this.findByAccountId(account_id);
    if (existing) {
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
    return true;
  }

  static async addTimeSpent(account_id, minutes) {
    const existing = await this.findByAccountId(account_id);
    if (existing) {
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
    return true;
  }
}

module.exports = UsageMetrics;