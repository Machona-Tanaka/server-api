// const pool = require('../config/db');
// const podCast = require('../models/podcastModel');


// // Get all podcasts
// exports.getAllPodcasts = async (req, res) => {
//   try {
//     const [podcasts] = await pool.query(`
//       SELECT p.*, pc.name as category_name 
//       FROM Podcast p
//       LEFT JOIN PodcastCategory pc ON p.category_id = pc.id
//     `);
//     res.json(podcasts);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Failed to fetch podcasts' });
//   }
// };

// // Get podcast by ID
// exports.getPodcastById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const [podcast] = await pool.query('SELECT * FROM Podcast WHERE id = ?', [id]);
    
//     if (podcast.length === 0) {
//       return res.status(404).json({ error: 'Podcast not found' });
//     }
    
//     res.json(podcast[0]);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Failed to fetch podcast' });
//   }
// };

// // Create podcast
// exports.createPodcast = async (req, res) => {
//   try {
//     const { title, host, duration, release_date, image_url, category_id, description, video_url } = req.body;
    
//     const [result] = await pool.query(
//       'INSERT INTO Podcast (title, host, duration, release_date, image_url, category_id, description, video_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
//       [title, host, duration, release_date, image_url, category_id, description, video_url]
//     );
    
//     res.status(201).json({ id: result.insertId, ...req.body });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Failed to create podcast' });
//   }
// };

// // Update podcast
// exports.updatePodcast = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { title, host, duration, release_date, image_url, category_id, description, video_url } = req.body;
    
//     const [result] = await pool.query(
//       'UPDATE Podcast SET title = ?, host = ?, duration = ?, release_date = ?, image_url = ?, category_id = ?, description = ?, video_url = ? WHERE id = ?',
//       [title, host, duration, release_date, image_url, category_id, description, video_url, id]
//     );
    
//     if (result.affectedRows === 0) {
//       return res.status(404).json({ error: 'Podcast not found' });
//     }
    
//     res.json({ id, ...req.body });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Failed to update podcast' });
//   }
// };

// // Delete podcast
// exports.deletePodcast = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const [result] = await pool.query('DELETE FROM Podcast WHERE id = ?', [id]);
    
//     if (result.affectedRows === 0) {
//       return res.status(404).json({ error: 'Podcast not found' });
//     }
    
//     res.status(204).end();
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Failed to delete podcast' });
//   }
// };

// // Get podcast categories
// exports.getPodcastCategories = async (req, res) => {
//   try {
//     const [categories] = await pool.query('SELECT * FROM PodcastCategory');
//     res.json(categories);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Failed to fetch podcast categories' });
//   }
// };


// // get podcasts by search
// exports.getPodcastsBySearch = async (req, res) => {
//   try {
//     const { search } = req.query;
//     const [podcasts] = await pool.query(`
//       SELECT p.*, pc.name as category_name 
//       FROM Podcast p
//       LEFT JOIN PodcastCategory pc ON p.category_id = pc.id
//       WHERE p.title LIKE ? OR p.description LIKE ?
//     `, [`%${search}%`, `%${search}%`]);
    
//     res.json(podcasts);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Failed to search podcasts' });
//   }
// };

// // Increment views for a podcast
// exports.incrementViews = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const [result] = await pool.query(
//       'UPDATE Podcast SET views = views + 1 WHERE id = ?',
//       [id]
//     );
//     if (result.affectedRows === 0) return res.status(404).json({ error: 'Podcast not found' });
//     res.json({ message: 'View count incremented' });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // Toggle featured status for a podcast
// exports.toggleFeatured = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const [podcast] = await pool.query('SELECT is_featured FROM Podcast WHERE id = ?', [id]);
//     if (podcast.length === 0) return res.status(404).json({ error: 'Podcast not found' });
    
//     const newStatus = !podcast[0].is_featured;
//     await pool.query('UPDATE Podcast SET is_featured = ? WHERE id = ?', [newStatus, id]);
    
//     res.json({ is_featured: newStatus });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };


const Podcast = require('../models/podcastModel');

exports.getPodcasts = async (req, res) => {
  try {
    const result = await Podcast.findAll({
      search: req.query.search || '',
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10
    });
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.getPodcastStats = async (req, res) => {
  try {
    const stats = await Podcast.getStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.deletePodcast = async (req, res) => {
  try {
    const success = await Podcast.delete(req.params.id);
    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Podcast not found'
      });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.updatePodcast = async (req, res) => {
  try {
    const success = await Podcast.update(req.params.id, req.body);
    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Podcast not found'
      });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

exports.getVideoStream = async (req, res) => {
  try {
    const videoData = await Podcast.getVideoStreamUrl(req.params.id);
    if (!videoData) {
      return res.status(404).json({
        success: false,
        error: 'Podcast not found'
      });
    }
    res.json({
      success: true,
      data: videoData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};