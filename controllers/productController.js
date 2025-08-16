const Product = require('../models/productModel');
const Media = require('../models/mediaModel');
const fs = require('fs');
const path = require('path');

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.findAll();
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createProduct = async (req, res) => {
  try {

    const data = req.body;
    data.image_file = req.files.map(file => ({
      name: file.filename,
      path: file.path
    }));

    const product = await Product.createProduct(data);

    res.status(201).json({
      success: true,
      product: {
        ...product,
        images: product.images
      }
    });
  } catch (error) {
    console.error('Error creating product:', error);
    console.error('Request body:', req.body);
    console.error('Uploaded files:', req.files);
    // Clean up uploaded files if error occurs
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        fs.unlinkSync(file.path);
      });
    }
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getProductById = async (req, res) =>{
  try {
      const id = req.params.id;
      const {result} = await Product.findById(id);
      
      console.log(result);
      res.json({
        success: true,
        product: result[0]
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
}

exports.getProducts = async (req, res) => {
  try {
    const { search = '', page = 1, limit = 10, filter = 'all' } = req.query;
    
    const result = await Product.findAll({
      search,
      page: parseInt(page),
      limit: parseInt(limit),
      filter
    });
    console.log(result.products)

    res.json({
      success: true,
      data: result.products,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.getProductStats = async (req, res) => {
  try {
    const stats = await Product.getStats();
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

exports.uploadImages = async (req, res) => {
  try {
    const productId = req.params.productId;
    const files = req.files;
    
    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files uploaded'
      });
    }

    const mediaIds = [];
    try {
      for (const file of files) {
        const mediaId = await Media.create({
          contentType: 'product',
          contentId: productId,
          filePath: file.path,
          fileType: file.mimetype,
          isPrimary: false
        });
        mediaIds.push(mediaId);
      }
    } catch (error) {
      // Clean up any uploaded files if error occurs
      files.forEach(file => {
        fs.unlinkSync(file.path);
      });
      throw error;
    }

    res.json({
      success: true,
      mediaIds
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

exports.deleteProduct = async (req, res) => {
  try {
    const success = await Product.delete(req.params.id);
    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
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

exports.deleteImage = async (req, res) => {
  try {
    const { productId, imageId } = req.params;
    const filePath = await Media.delete(imageId, productId);
    if (!filePath) {
      return res.status(404).json({
        success: false,
        error: 'Image not found'
      });
    }
    // If deletion was successful, remove the file from the filesystem
    fs.unlinkSync(filePath);
    res.json({ success: true, message: 'Image deleted successfully' });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const success = await Product.update(req.params.id, req.body);
    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
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

exports.countProducts = async (req, res) => {
  try {
    const count = await Product.count();
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

exports.getProductsFrontEnd = async (req, res) => {
  try {


    const { search = '', page = 1, limit = 10, filter = 'all' } = req.query;
    
    const products = await Product.getProductsFrontEnd({
      search,
      page: parseInt(page),
      limit: parseInt(limit),
      filter
    });
    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
