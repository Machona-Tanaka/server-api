const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const db = require('./config/db');
const path = require('path');

// Serve static files from the "public" directory
app.use('/uploads', express.static('uploads'));


// Initialize database connection
db.getConnection()
  .then(() => console.log('Database connected successfully'))
  

// Import routes
const accountRoutes = require('./routes/accountRoutes');
const activityRoutes = require('./routes/activityRoutes');
const articleRoutes = require('./routes/articleRoutes');
const commentRoutes = require('./routes/commentRoutes');
const guideRoutes = require('./routes/guideRoutes');
const podcastRoutes = require('./routes/podcastRoutes');
const productRoutes = require('./routes/productRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const securityRoutes = require('./routes/securityRoutes');
const updateRoutes = require('./routes/updateRoutes');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/accounts', accountRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/guides', guideRoutes);
app.use('/api/podcasts', podcastRoutes);
app.use('/api/products', productRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/updates', updateRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;