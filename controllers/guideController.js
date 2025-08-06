const pool = require('../config/db');

exports.getAllGuides = async (req, res) => {
  try {
    const [guides] = await pool.query(`
      SELECT g.*, gc.name as category_name 
      FROM PodGuide g
      LEFT JOIN GuideCategory gc ON g.category_id = gc.id
    `);
    res.json(guides);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getGuideById = async (req, res) => {
  try {
    const { id } = req.params;
    const [guide] = await pool.query(`
      SELECT g.*, gc.name as category_name 
      FROM PodGuide g
      LEFT JOIN GuideCategory gc ON g.category_id = gc.id
      WHERE g.id = ?
    `, [id]);
    
    if (guide.length === 0) return res.status(404).json({ error: 'Guide not found' });
    res.json(guide[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createGuide = async (req, res) => {
  try {
    const { title, author, description, image_url, format, pages, category_id } = req.body;
    const [result] = await pool.query(
      'INSERT INTO PodGuide SET ?',
      { title, author, description, image_url, format, pages, category_id }
    );
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateGuide = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query(
      'UPDATE PodGuide SET ? WHERE id = ?',
      [req.body, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Guide not found' });
    res.json({ message: 'Guide updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteGuide = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM PodGuide WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Guide not found' });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getGuideCategories = async (req, res) => {
  try {
    const [categories] = await pool.query('SELECT * FROM GuideCategory');
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.incrementDownloads = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query(
      'UPDATE PodGuide SET downloads = downloads + 1 WHERE id = ?',
      [id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Guide not found' });
    res.json({ message: 'Download count incremented' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};