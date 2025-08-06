const pool = require('../config/db');

exports.getAllUpdates = async (req, res) => {
  try {
    const [updates] = await pool.query('SELECT * FROM OtherUpdates ORDER BY posted_date DESC');
    res.json(updates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUpdateById = async (req, res) => {
  try {
    const { id } = req.params;
    const [update] = await pool.query('SELECT * FROM OtherUpdates WHERE id = ?', [id]);
    
    if (update.length === 0) return res.status(404).json({ error: 'Update not found' });
    res.json(update[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createUpdate = async (req, res) => {
  try {
    const { title, update_type, posted_date, related_entity } = req.body;
    const [result] = await pool.query(
      'INSERT INTO OtherUpdates (title, update_type, posted_date, related_entity) VALUES (?, ?, ?, ?)',
      [title, update_type, posted_date, related_entity]
    );
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query(
      'UPDATE OtherUpdates SET ? WHERE id = ?',
      [req.body, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Update not found' });
    res.json({ message: 'Update updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM OtherUpdates WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Update not found' });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};