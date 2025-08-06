const pool = require('../config/db');

class Comment {
  static async findByTarget(target_type, target_id) {
    const [comments] = await pool.query(
      'SELECT * FROM Comments WHERE target_type = ? AND target_id = ?',
      [target_type, target_id]
    );
    return comments;
  }

  static async create(commentData) {
    const [result] = await pool.query('INSERT INTO Comments SET ?', commentData);
    return { id: result.insertId, ...commentData };
  }

  static async update(id, commentData) {
    const [result] = await pool.query('UPDATE Comments SET ? WHERE id = ?', [commentData, id]);
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await pool.query('DELETE FROM Comments WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  static async like(id) {
    const [result] = await pool.query(
      'UPDATE Comments SET like_count = like_count + 1, is_liked = TRUE WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = Comment;