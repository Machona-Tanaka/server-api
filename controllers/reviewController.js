const pool = require('../config/db');

exports.getProductReviews = async (req, res) => {
  try {
    const { product_id } = req.params;
    const [reviews] = await pool.query(
      'SELECT * FROM Reviews WHERE product_id = ?',
      [product_id]
    );
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createReview = async (req, res) => {
  try {
    const { product_id, user_id, review_text, rating, verified_purchase } = req.body;
    
    // Validate rating
    if (rating < 0 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 0 and 5' });
    }
    
    const [result] = await pool.query(
      'INSERT INTO Reviews (product_id, user_id, review_text, rating, verified_purchase) VALUES (?, ?, ?, ?, ?)',
      [product_id, user_id, review_text, rating, verified_purchase]
    );
    
    // Update product average rating
    await updateProductRating(product_id);
    
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { review_text, rating } = req.body;
    
    if (rating && (rating < 0 || rating > 5)) {
      return res.status(400).json({ error: 'Rating must be between 0 and 5' });
    }
    
    const [review] = await pool.query('SELECT product_id FROM Reviews WHERE id = ?', [id]);
    if (review.length === 0) return res.status(404).json({ error: 'Review not found' });
    
    const [result] = await pool.query(
      'UPDATE Reviews SET review_text = ?, rating = ? WHERE id = ?',
      [review_text, rating, id]
    );
    
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Review not found' });
    
    // Update product average rating
    await updateProductRating(review[0].product_id);
    
    res.json({ message: 'Review updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const [review] = await pool.query('SELECT product_id FROM Reviews WHERE id = ?', [id]);
    if (review.length === 0) return res.status(404).json({ error: 'Review not found' });
    
    const [result] = await pool.query('DELETE FROM Reviews WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Review not found' });
    
    // Update product average rating
    await updateProductRating(review[0].product_id);
    
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

async function updateProductRating(product_id) {
  const [avgResult] = await pool.query(
    'SELECT AVG(rating) as avg_rating FROM Reviews WHERE product_id = ?',
    [product_id]
  );
  const avgRating = avgResult[0].avg_rating || 0;
  
  await pool.query(
    'UPDATE Products SET rating = ? WHERE id = ?',
    [avgRating, product_id]
  );
}