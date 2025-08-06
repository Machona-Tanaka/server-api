const pool = require('../config/db');

class Review {
  static async findByProductId(product_id) {
    const [reviews] = await pool.query(
      'SELECT * FROM Reviews WHERE product_id = ?',
      [product_id]
    );
    return reviews;
  }

  static async create(reviewData) {
    const [result] = await pool.query('INSERT INTO Reviews SET ?', reviewData);
    
    // Update product average rating
    await this.updateProductRating(reviewData.product_id);
    
    return { id: result.insertId, ...reviewData };
  }

  static async update(id, reviewData) {
    const [review] = await pool.query('SELECT product_id FROM Reviews WHERE id = ?', [id]);
    if (review.length === 0) return false;
    
    const [result] = await pool.query('UPDATE Reviews SET ? WHERE id = ?', [reviewData, id]);
    
    // Update product average rating
    await this.updateProductRating(review[0].product_id);
    
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [review] = await pool.query('SELECT product_id FROM Reviews WHERE id = ?', [id]);
    if (review.length === 0) return false;
    
    const [result] = await pool.query('DELETE FROM Reviews WHERE id = ?', [id]);
    
    // Update product average rating
    await this.updateProductRating(review[0].product_id);
    
    return result.affectedRows > 0;
  }

  static async updateProductRating(product_id) {
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
}

module.exports = Review;