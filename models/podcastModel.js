
const db = require('../config/db');

class Podcast {

  static async createPodcast(data) {
    const { title, description, author, image, videoSrc, embeddedLink, duration, resolution, category, is_published } = data;
    const [result] = await db.query(
      `INSERT INTO podcasts (title, description, author, image, videoSrc, embeddedLink, duration, resolution, category, is_published)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description, author, image, videoSrc, embeddedLink, duration, resolution, category, is_published]
    );
    return { id: result.insertId, ...data };
  }

  static async findAll({ search = '', page = 1, limit = 10 }) {
    const offset = (page - 1) * limit;
    let query = `SELECT * FROM podcasts`;
    let countQuery = `SELECT COUNT(*) as total FROM podcasts`;
    const params = [];
    
    if (search) {
      query += ` WHERE title LIKE ? OR description LIKE ? OR author LIKE ?`;
      countQuery += ` WHERE title LIKE ? OR description LIKE ? OR author LIKE ?`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    query += ` ORDER BY publish_date DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);
    
    const [podcasts] = await db.query(query, params);
    const [[{ total }]] = await db.query(countQuery, params.slice(0, -2));
    
    return {
      podcasts,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    };
  }

  static async findById(id) {
    const [[podcast]] = await db.query(`SELECT * FROM podcasts WHERE id = ?`, [id]);
    return podcast;
  }

  static async updateImage(id, image) {
    const [result] = await db.query(
      `UPDATE podcasts SET image = ? WHERE id = ?`,
      [image, id]
    );
    return result.affectedRows > 0;
  }

  static async getStats() {
    const [latest] = await db.query(
      `SELECT id, title, image, duration FROM podcasts`
    );
    
    const [categories] = await db.query(
      `SELECT category, COUNT(*) as count FROM podcasts GROUP BY category`
    );
    
    const [[{ totalPodcasts }]] = await db.query(`SELECT COUNT(*) as totalPodcasts FROM podcasts`);

    const [[{ averageViews }]] = await db.query(`SELECT AVG(views) as averageViews FROM podcasts`);

    const [[{ averageDuration }]] = await db.query(`SELECT AVG(duration) as averageDuration FROM podcasts`);

    return { totalPodcasts: parseInt(totalPodcasts), averageViews: parseInt(averageViews), latest, categories, averageDuration: parseFloat(averageDuration) };
  }

  static async getCount() {
    const [[{count}]] = await db.query(`SELECT COUNT(*) as count FROM podcasts`);
    return count;
  }

  static async delete(id) {
    const [result] = await db.query(`DELETE FROM podcasts WHERE id = ?`, [id]);
    return result.affectedRows > 0;
  }

  static async update(id, data) {
    const validFields = ['title', 'description', 'author', 'embeddedLink', 
                        'videoSrc', 'category', 'duration', 'is_published', 'publish_date'  ];
    const updates = [];
    const values = [];
    
    validFields.forEach(field => {
      if (field == 'is_published') {
        updates.push(`${field} = ?`);
        values.push(data[field] === 'true' ? 1 : 0);
      } else if (field == 'publish_date') {
        updates.push(`${field} = ?`);
        values.push(data[field] ? new Date(data[field]) : null);
      } else if (data[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(data[field]);
      }
    });
    
    if (updates.length === 0) {
      throw new Error('No valid fields to update');
    }
    
    values.push(id);
    
    const [result] = await db.query(
      `UPDATE podcasts SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
    
    return result.affectedRows > 0;
  }

  static async getVideoStreamUrl(id) {
    const [[podcast]] = await db.query(
      `SELECT video_url, duration FROM podcasts WHERE id = ?`,
      [id]
    );
    return podcast;
  }
}

module.exports = Podcast;