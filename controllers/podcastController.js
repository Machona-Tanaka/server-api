const Podcast = require('../models/podcastModel');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const unlinkAsync = promisify(fs.unlink);

exports.createPodcast = async (req, res) => {
  try {
    // Validate required fields
    const requiredFields = ['title', 'description', 'author', 'videoSrc', 'duration', 'category'];
  
    for (const field of requiredFields) {
      if (!req.body[field]) {
        // If there's an uploaded file but validation fails, clean it up
        if (req.file) {
          await unlinkAsync(req.file.path);
        }
        return res.status(400).json({
          success: false,
          error: `${field} is required`
        });
      }
    }

    // // Validate image file was uploaded if required
    // if (!req.file) {
    //   return res.status(400).json({
    //     success: false,
    //     error: 'Podcast image is required'
    //   });
    // }

    // In your controller
    if (req.fileValidationError) {
      return res.status(400).json({ error: req.fileValidationError });
    }

    console.log(req.body);


    // Prepare podcast data
    const podcastData = {
      title: req.body.title,
      description: req.body.description,
      author: req.body.author,
      image: req.body.image.replace(/\\/g, '/'), // Convert Windows paths to forward slashes
      videoSrc: req.body.videoSrc,
      embeddedLink: req.body.embeddedLink || generateEmbedLink(req.body.videoSrc),
      duration: parseInt(req.body.duration) || 0,
      resolution: req.body.resolution || '1080p',
      category: req.body.category,
      is_published: req.body.is_published === 'true' || req.body.is_published === true
    };

    // Create podcast
    const newPodcast = await Podcast.createPodcast(podcastData);

    // Success response
    res.status(201).json({
      success: true,
      data: {
        ...newPodcast,
        // Return public URL if using cloud storage
        imageUrl: `${req.protocol}://${req.get('host')}/${newPodcast.image}`
      }
    });

  } catch (error) {
    // Clean up uploaded file if error occurs
    if (req.file) {
      try {
        await unlinkAsync(req.file.path);
      } catch (unlinkError) {
        console.error('Failed to clean up uploaded file:', unlinkError);
      }
    }
    console.log('Error message: ', error.message);
    // Error response
    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

exports.updateImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { image } = req.body;
    console.log(image);
    // Validate required fields
    if (!image) {
      return res.status(400).json({
        success: false,
        error: 'Image is required'
      });
    }

    // Find the podcast first to get the current image
    const podcast = await Podcast.findById(id);
    if (!podcast) {
      return res.status(404).json({
        success: false,
        error: 'Podcast not found'
      });
    }

    // Delete old image if it exists
    if (podcast.image) {
      const imagePath = path.join(__dirname, '..', podcast.image);
      
      // Check if file exists before trying to delete
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath); // Delete the file
      }
    }

    // Update with new image
    const updatedPodcast = await Podcast.updateImage(
      id,
      image
    );

    res.json({ 
      success: true,
      data: image
    });

  } catch (error) {
    console.error('Error updating image:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// Helper function to generate embed link from video URL
function generateEmbedLink(videoUrl) {
  if (!videoUrl) return null;
  
  // Example for YouTube URLs
  if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
    const videoId = videoUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return videoId ? `https://www.youtube.com/embed/${videoId[1]}` : null;
  }
  
  // Add other video providers as needed
  return videoUrl;
}

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

exports.getPodcastById = async (req, res) => {
  try {
    const podcast = await Podcast.findById(req.params.id);
    if (!podcast) {
      return res.status(404).json({
        success: false,
        error: 'Podcast not found'
      });
    }
    res.json({
      success: true,
      podcast: podcast
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.getCount = async (req, res) => {
  try {
    const count = await Podcast.getCount();
    res.json({
      success: true,
      count
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

    // Find the podcast first to get the current image
    const podcast = await Podcast.findById(req.params.id);
    if (!podcast) {
      return res.status(404).json({
        success: false,
        error: 'Podcast not found'
      });
    }

    // Delete old image if it exists
    if (podcast.image) {
      const imagePath = path.join(__dirname, '..', podcast.image);
      // Check if file exists before trying to delete
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath); // Delete the file
      }
    }

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