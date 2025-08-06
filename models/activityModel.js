const pool = require('../config/db');

class ActivityPreferences {
  static async findByAccountId(account_id) {
    const [prefs] = await pool.query('SELECT * FROM ActivityPreferences WHERE account_id = ?', [account_id]);
    return prefs[0];
  }

  static async updateOrCreate(account_id, preferences) {
    const existing = await this.findByAccountId(account_id);
    if (existing) {
      await pool.query(
        'UPDATE ActivityPreferences SET ? WHERE account_id = ?',
        [preferences, account_id]
      );
    } else {
      await pool.query(
        'INSERT INTO ActivityPreferences SET ?',
        [{ account_id, ...preferences }]
      );
    }
    return true;
  }
}

module.exports = ActivityPreferences;