const pool = require('../config/db');
const Article = require('../models/articleModel')

exports.getAllArticles = async (req, res) => {
  try {
    const [articles] = await pool.query(`
      SELECT a.*, ac.name as category_name 
      FROM Articles a
      LEFT JOIN ArticleCategory ac ON a.category_id = ac.id
    `);
    res.json(articles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.searchArticles = async (req, res) => {
  try {
    const { search } = req.query;
    if (!search) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    const articles = await Article.find(search);
    res.json(articles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

exports.getArticleById = async (req, res) => {
  try {
    const { id } = req.params;
    const [article] = await pool.query(`
      SELECT a.*, ac.name as category_name 
      FROM Articles a
      LEFT JOIN ArticleCategory ac ON a.category_id = ac.id
      WHERE a.id = ?
    `, [id]);
    
    if (article.length === 0) return res.status(404).json({ error: 'Article not found' });
    res.json(article[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createArticle = async (req, res) => {
  try {
    const { title, author, excerpt, image_url, read_time, publish_date, category_id } = req.body;
    const [result] = await pool.query(
      'INSERT INTO Articles SET ?',
      { title, author, excerpt, image_url, read_time, publish_date, category_id }
    );
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query(
      'UPDATE Articles SET ? WHERE id = ?',
      [req.body, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Article not found' });
    res.json({ message: 'Article updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM Articles WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Article not found' });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getArticleCategories = async (req, res) => {
  try {
    const [categories] = await pool.query('SELECT * FROM ArticleCategory');
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};