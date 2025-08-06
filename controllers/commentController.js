const pool = require('../config/db');

exports.getComments = async (req, res) => {
  try {
    const { target_type, target_id } = req.query;
    let query = 'SELECT * FROM Comments';
    const params = [];
    
    if (target_type && target_id) {
      query += ' WHERE target_type = ? AND target_id = ?';
      params.push(target_type, target_id);
    }
    
    const [comments] = await pool.query(query, params);
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createComment = async (req, res) => {
  try {
    const { user_id, target_type, target_id, comment_text } = req.body;
    const [result] = await pool.query(
      'INSERT INTO Comments (user_id, target_type, target_id, comment_text) VALUES (?, ?, ?, ?)',
      [user_id, target_type, target_id, comment_text]
    );
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment_text } = req.body;
    const [result] = await pool.query(
      'UPDATE Comments SET comment_text = ? WHERE id = ?',
      [comment_text, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Comment not found' });
    res.json({ message: 'Comment updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM Comments WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Comment not found' });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.likeComment = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query(
      'UPDATE Comments SET like_count = like_count + 1, is_liked = TRUE WHERE id = ?',
      [id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Comment not found' });
    res.json({ message: 'Comment liked' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};