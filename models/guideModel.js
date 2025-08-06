const pool = require('../config/db');

class Guide {
  static async findAll() {
    const [guides] = await pool.query(`
      SELECT g.*, gc.name as category_name 
      FROM PodGuide g
      LEFT JOIN GuideCategory gc ON g.category_id = gc.id
    `);
    return guides;
  }

  static async findById(id) {
    const [guide] = await pool.query(`
      SELECT g.*, gc.name as category_name 
      FROM PodGuide g
      LEFT JOIN GuideCategory gc ON g.category_id = gc.id
      WHERE g.id = ?
    `, [id]);
    return guide[0];
  }

  static async create(guideData) {
    const [result] = await pool.query('INSERT INTO PodGuide SET ?', guideData);
    return { id: result.insertId, ...guideData };
  }

  static async update(id, guideData) {
    const [result] = await pool.query('UPDATE PodGuide SET ? WHERE id = ?', [guideData, id]);
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await pool.query('DELETE FROM PodGuide WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  static async getCategories() {
    const [categories] = await pool.query('SELECT * FROM GuideCategory');
    return categories;
  }

  static async incrementDownloads(id) {
    const [result] = await pool.query(
      'UPDATE PodGuide SET downloads = downloads + 1 WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = Guide;