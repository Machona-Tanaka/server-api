// models/Media.js
const pool = require('../config/db');

class Media {
  static async create({ contentType, contentId, filePath, fileType, isPrimary = false }) {
    // If setting as primary, first unset any existing primary media for this content
    if (isPrimary) {
      await pool.query(
        'UPDATE media SET is_primary = FALSE WHERE content_type = ? AND content_id = ?',
        [contentType, contentId]
      );
    }
    
    const [result] = await pool.query(
      'INSERT INTO media (content_type, content_id, file_path, file_type, is_primary) VALUES (?, ?, ?, ?, ?)',
      [contentType, contentId, filePath, fileType, isPrimary]
    );
    return result.insertId;
  }

  static async delete(mediaId, productId) {
    const [media] = await pool.query(
      'SELECT file_path FROM media WHERE id = ? AND content_id = ?',
      [mediaId, productId]
    );
    
    if (media.length === 0) return false;
    
    await pool.query('DELETE FROM media WHERE id = ?', [mediaId]);
    return media[0].file_path; // Return file path for cleanup
  }

  static async findByContent(contentType, contentId) {
    const [media] = await pool.query(
      'SELECT * FROM media WHERE content_type = ? AND content_id = ? ORDER BY is_primary DESC, created_at DESC',
      [contentType, contentId]
    );
    return media;
  }


  static async findImagesByContent(contentType, contentId) {
    const [media] = await pool.query(
      'SELECT file_path FROM media WHERE content_type = ? AND content_id = ? ORDER BY is_primary DESC, created_at DESC',
      [contentType, contentId]
    );

    for (const item of media) {
      item.url = item.file_path.replace(/\\/g, '/');
      delete item.file_path;
    }

    return media;
  }
}

module.exports = Media;