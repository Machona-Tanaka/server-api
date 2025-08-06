const pool = require('../config/db');

exports.getPreferences = async (req, res) => {
  try {
    const { account_id } = req.params;
    const [prefs] = await pool.query('SELECT * FROM ActivityPreferences WHERE account_id = ?', [account_id]);
    res.json(prefs[0] || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updatePreferences = async (req, res) => {
  try {
    const { account_id } = req.params;
    const { language_preference, theme_preference, email_notifications_enabled, interests } = req.body;
    
    const [existing] = await pool.query('SELECT * FROM ActivityPreferences WHERE account_id = ?', [account_id]);
    
    if (existing.length > 0) {
      await pool.query(
        'UPDATE ActivityPreferences SET language_preference = ?, theme_preference = ?, email_notifications_enabled = ?, interests = ? WHERE account_id = ?',
        [language_preference, theme_preference, email_notifications_enabled, interests, account_id]
      );
    } else {
      await pool.query(
        'INSERT INTO ActivityPreferences (account_id, language_preference, theme_preference, email_notifications_enabled, interests) VALUES (?, ?, ?, ?, ?)',
        [account_id, language_preference, theme_preference, email_notifications_enabled, interests]
      );
    }
    
    res.json({ message: 'Preferences updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};