const pool = require('../config/db');

exports.getSecuritySettings = async (req, res) => {
  try {
    const { account_id } = req.params;
    const [settings] = await pool.query(
      'SELECT * FROM SecurityCompliance WHERE account_id = ?',
      [account_id]
    );
    res.json(settings[0] || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateSecuritySettings = async (req, res) => {
  try {
    const { account_id } = req.params;
    const { two_factor_enabled, consent_given, data_retention_period, gdpr_compliance_status } = req.body;
    
    const [existing] = await pool.query(
      'SELECT * FROM SecurityCompliance WHERE account_id = ?',
      [account_id]
    );
    
    if (existing.length > 0) {
      await pool.query(
        'UPDATE SecurityCompliance SET two_factor_enabled = ?, consent_given = ?, data_retention_period = ?, gdpr_compliance_status = ? WHERE account_id = ?',
        [two_factor_enabled, consent_given, data_retention_period, gdpr_compliance_status, account_id]
      );
    } else {
      await pool.query(
        'INSERT INTO SecurityCompliance (account_id, two_factor_enabled, consent_given, data_retention_period, gdpr_compliance_status) VALUES (?, ?, ?, ?, ?)',
        [account_id, two_factor_enabled, consent_given, data_retention_period, gdpr_compliance_status]
      );
    }
    
    res.json({ message: 'Security settings updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.setSecurityQuestions = async (req, res) => {
  try {
    const { account_id } = req.params;
    const { security_questions } = req.body;
    
    const [existing] = await pool.query(
      'SELECT * FROM SecurityCompliance WHERE account_id = ?',
      [account_id]
    );
    
    if (existing.length > 0) {
      await pool.query(
        'UPDATE SecurityCompliance SET security_questions = ? WHERE account_id = ?',
        [JSON.stringify(security_questions), account_id]
      );
    } else {
      await pool.query(
        'INSERT INTO SecurityCompliance (account_id, security_questions) VALUES (?, ?)',
        [account_id, JSON.stringify(security_questions)]
      );
    }
    
    res.json({ message: 'Security questions updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};