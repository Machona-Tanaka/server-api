const pool = require('../config/db');

class Article {
  static async findAll() {
    const [articles] = await pool.query(`
      SELECT a.*, ac.name as category_name 
      FROM Articles a
      LEFT JOIN ArticleCategory ac ON a.category_id = ac.id
    `);
    return articles;
  }

  static async find(search){
    const [articles] = await pool.query(`
      SELECT a.*, ac.name as category_name 
      FROM Articles a
      LEFT JOIN ArticleCategory ac ON a.category_id = ac.id
      WHERE a.title LIKE ? OR a.excerpt LIKE ?
    `, [`%${search}%`, `%${search}%`]);
    return articles;
  }

  static async findById(id) {
    const [article] = await pool.query(`
      SELECT a.*, ac.name as category_name 
      FROM Articles a
      LEFT JOIN ArticleCategory ac ON a.category_id = ac.id
      WHERE a.id = ?
    `, [id]);
    return article[0];
  }

  static async create(articleData) {
    const [result] = await pool.query('INSERT INTO Articles SET ?', articleData);
    return { id: result.insertId, ...articleData };
  }

  static async update(id, articleData) {
    const [result] = await pool.query('UPDATE Articles SET ? WHERE id = ?', [articleData, id]);
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await pool.query('DELETE FROM Articles WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  static async getCategories() {
    const [categories] = await pool.query('SELECT * FROM ArticleCategory');
    return categories;
  }
}

module.exports = Article;