// const pool = require('../config/db');

// class Podcast {
//   static async findAll() {
//     const [podcasts] = await pool.query(`
//       SELECT p.*, pc.name as category_name 
//       FROM Podcast p
//       LEFT JOIN PodcastCategory pc ON p.category_id = pc.id
//     `);
//     return podcasts;
//   }

//   static async findById(id) {
//     const [podcast] = await pool.query('SELECT * FROM Podcast WHERE id = ?', [id]);
//     return podcast[0];
//   }

//   static async create(podcastData) {
//     const { title, host, duration, release_date, image_url, category_id, description, video_url } = podcastData;
//     const [result] = await pool.query(
//       'INSERT INTO Podcast (title, host, duration, release_date, image_url, category_id, description, video_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
//       [title, host, duration, release_date, image_url, category_id, description, video_url]
//     );
//     return { id: result.insertId, ...podcastData };
//   }

//   static async update(id, podcastData) {
//     const { title, host, duration, release_date, image_url, category_id, description, video_url } = podcastData;
//     const [result] = await pool.query(
//       'UPDATE Podcast SET title = ?, host = ?, duration = ?, release_date = ?, image_url = ?, category_id = ?, description = ?, video_url = ? WHERE id = ?',
//       [title, host, duration, release_date, image_url, category_id, description, video_url, id]
//     );
//     return result.affectedRows > 0;
//   }

//   static async delete(id) {
//     const [result] = await pool.query('DELETE FROM Podcast WHERE id = ?', [id]);
//     return result.affectedRows > 0;
//   }

//   static async getCategories() {
//     const [categories] = await pool.query('SELECT * FROM PodcastCategory');
//     return categories;
//   }


//   static async incrementViews(id) {
//     const [result] = await pool.query(
//       'UPDATE Podcast SET views = views + 1 WHERE id = ?',
//       [id]
//     );
//     return result.affectedRows > 0;
//   }

//   static async toggleFeatured(id) {
//     const [podcast] = await pool.query('SELECT is_featured FROM Podcast WHERE id = ?', [id]);
//     if (podcast.length === 0) return false;
    
//     const newStatus = !podcast[0].is_featured;
//     await pool.query('UPDATE Podcast SET is_featured = ? WHERE id = ?', [newStatus, id]);
//     return newStatus;
//   }


// }

// module.exports = Podcast;

const db = require('../config/db');

class Podcast {
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

  static async getStats() {
    const [latest] = await db.query(
      `SELECT id, title, thumbnail_url, duration FROM podcasts 
       ORDER BY publish_date DESC LIMIT 5`
    );
    
    const [categories] = await db.query(
      `SELECT category, COUNT(*) as count FROM podcasts GROUP BY category`
    );
    
    const [[{ total }]] = await db.query(`SELECT COUNT(*) as total FROM podcasts`);
    
    return { total, latest, categories };
  }

  static async delete(id) {
    const [result] = await db.query(`DELETE FROM podcasts WHERE id = ?`, [id]);
    return result.affectedRows > 0;
  }

  static async update(id, data) {
    const validFields = ['title', 'description', 'author', 'thumbnail_url', 
                        'video_url', 'category', 'is_published'];
    const updates = [];
    const values = [];
    
    validFields.forEach(field => {
      if (data[field] !== undefined) {
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