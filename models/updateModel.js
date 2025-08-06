const pool = require('../config/db');

class OtherUpdate {
  static async findAll() {
    const [updates] = await pool.query('SELECT * FROM OtherUpdates ORDER BY posted_date DESC');
    return updates;
  }

  static async findById(id) {
    const [update] = await pool.query('SELECT * FROM OtherUpdates WHERE id = ?', [id]);
    return update[0];
  }

  static async create(updateData) {
    const [result] = await pool.query('INSERT INTO OtherUpdates SET ?', updateData);
    return { id: result.insertId, ...updateData };
  }

  static async update(id, updateData) {
    const [result] = await pool.query('UPDATE OtherUpdates SET ? WHERE id = ?', [updateData, id]);
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await pool.query('DELETE FROM OtherUpdates WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = OtherUpdate;