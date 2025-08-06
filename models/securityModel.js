const pool = require('../config/db');

class SecurityCompliance {
  static async findByAccountId(account_id) {
    const [settings] = await pool.query(
      'SELECT * FROM SecurityCompliance WHERE account_id = ?',
      [account_id]
    );
    return settings[0];
  }

  static async updateOrCreate(account_id, settings) {
    const existing = await this.findByAccountId(account_id);
    if (existing) {
      await pool.query(
        'UPDATE SecurityCompliance SET ? WHERE account_id = ?',
        [settings, account_id]
      );
    } else {
      await pool.query(
        'INSERT INTO SecurityCompliance SET ?',
        [{ account_id, ...settings }]
      );
    }
    return true;
  }

  static async setSecurityQuestions(account_id, questions) {
    return this.updateOrCreate(account_id, { security_questions: JSON.stringify(questions) });
  }
}

module.exports = SecurityCompliance;