const db = require('../config/db');
const mediaModel = require('./mediaModel');

class Product {

  static async findAll({ search = '', page = 1, limit = 10, filter = 'all' }) {
    const offset = (page - 1) * limit;
    let query = `SELECT  
                    p.id, 
                    p.name, 
                    p.price, 
                    p.discount_rate, 
                    ROUND(AVG(r.rating), 1) AS rating,
                    p.stock AS stock_quantity,
                    p.category, 
                    p.is_new 
                FROM 
                    products AS p 
                LEFT JOIN 
                Reviews AS r ON p.id = r.product_id`;
    let countQuery = `SELECT COUNT(*) as total FROM products as p JOIN Reviews as r ON p.id = r.product_id`;
    const params = [];
    
    // Build WHERE clauses
    const whereClauses = [];
    
    if (search) {
      whereClauses.push(` (name LIKE ? OR description LIKE ?)`);
      params.push(`%${search}%`, `%${search}%`);
    }
    
    if (filter !== 'all') {
      if (filter === 'new') {
          whereClauses.push(`created_at >= NOW() - INTERVAL 7 DAY`);
        } 
        else if (filter === 'low-stock') {
          whereClauses.push(`stock < ?`);
          params.push(5); // Threshold for low stock
        } 
        else if (filter === 'discounted') {
          whereClauses.push(`discount_rate > ?`);
          params.push(0);
        }else if (filter === 'no-discounted') {
          whereClauses.push(`discount_rate = ?`);
          params.push(0);
        }
    }
    
    if (whereClauses.length > 0) {
      const whereStatement = ` WHERE ${whereClauses.join(' AND ')}`;
      query += whereStatement;
      countQuery += whereStatement;
    }
    
    // Add sorting and pagination
    query += ` GROUP BY p.id, p.name, p.price, p.discount_rate, p.stock, p.is_new ORDER BY created_at DESC LIMIT ? OFFSET ? ;`;
    params.push(parseInt(limit), offset);
    console.log(query);
    const [products] = await db.query(query, params);
    const [[{ total }]] = await db.query(countQuery, params.slice(0, -2));
    let productsList  = [];

    // Fetch media for each product
    for (const product of products) {
      const media = await mediaModel.findByContent('product', product.id);
      product.media = media;
      productsList.push(product);
    }
     const [totalLowOnStock] = await db.query(
      `SELECT  COUNT(*) as count FROM products`
    );
    

    return {
      products: productsList,
      total: totalLowOnStock[0].count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(totalLowOnStock[0].count / limit)
    };
  }

  static async findById(id){
    const [result] = await db.query(
            `SELECT p.id, 
                    p.name, 
                    p.price, p.description, 
                    p.discount_rate,
                    p.stock AS stock_quantity,
                    p.category,
                    p.is_new
             FROM products as p WHERE id = ${id}`
    );

    if (result.length === 0) {
      throw new Error('Product not found');
    }
    // Fetch media for the product
    const media = await mediaModel.findByContent('product', id);
    

    // Replace backslashes with forward slashes for all image URLs
    media.forEach(img => {
      img.url = img.file_path.replace(/\\/g, '/');
    });
    result[0].media = media;
    return {result: result};
  }

  static async getStats() {
    const [totalProducts] = await db.query(
      `SELECT COUNT(*) as count FROM products`
    );

    const [lowonstock] = await db.query(
      `SELECT  id, name, stock AS stock_quantity, price FROM products WHERE stock < 10 ORDER BY stock ASC;`
    );

    const [totalLowOnStock] = await db.query(
      `SELECT  COUNT(*) as count FROM products WHERE stock < 10`
    );
    
     const [newArrivals] = await db.query(
      `SELECT  COUNT(*) as count FROM 
            products
        WHERE 
            created_at >= NOW() - INTERVAL 7 DAY
        ORDER BY 
            created_at DESC;`
    );
    
    const [newArrivalsStock] = await db.query(
          `SELECT   id, 
                    name, 
                    price, 
                    discount_rate, 
                    stock AS stock_quantity 
            FROM 
                products
            WHERE 
                created_at >= NOW() - INTERVAL 7 DAY
            ORDER BY 
                created_at DESC;`
        );

    const [categories] = await db.query(
      `SELECT category, COUNT(*) as count FROM products GROUP BY category`
    );

    const [overall_avg_rating] = await db.query(
          `SELECT 
              ROUND(AVG(rating), 2) AS count
          FROM 
              Reviews;
          `
          );

    const [latestProducts] = await db.query(
      `SELECT id, name, price FROM products ORDER BY created_at DESC LIMIT 5`
    );
    
    return {
      totalProducts: totalProducts[0].count,
      lowStockItems: totalLowOnStock[0].count,
      newArrivals: newArrivals[0].count,
      averageRating: overall_avg_rating [0].count,
      lowonstock,
      newArrivalsStock,
      categories,
      latest: latestProducts
    };
  }

  static async count(){
    const [result] = await db.query(
      `SELECT COUNT(*) as count FROM products`
    );
    return result[0].count;
  }

  static async getProductsFrontEnd({ search = '', page = 1, limit = 10 , filter = 'all' }) {
    let Query = ` GROUP BY p.id, p.name, p.price, p.discount_rate, p.stock , p.is_new, p.category ORDER BY created_at DESC LIMIT ? OFFSET ? ;`;
    let searchQuery = `Where (p.name LIKE @search or p.description LIKE @search or p.category LIKE @search)`;
    searchQuery = searchQuery.replace('@search', `'%${search}%'`);
    const offset = (page - 1) * limit;
    let queryFilter = '';
    console.log('Filter:', filter);
    if (filter === 'latest') {
      queryFilter = `AND p.created_at >= NOW() - INTERVAL 7 DAY`;
    } else if (filter.toLowerCase() === 'discount') {
      queryFilter = `AND p.discount_rate > 0.00`;
    } else if (filter.toLowerCase() === 'popular') {
      queryFilter = `AND rating > 0`;
    }

    const [products] = await db.query(
      `SELECT p.id, p.name, p.price, p.discount_rate, p.stock , p.is_new, p.category, Avg(r.rating) as rating
       FROM products AS p LEFT JOIN Reviews AS r ON p.id = r.product_id ${searchQuery + ' ' + queryFilter + ' ' + Query}`, [limit, offset]
    );
   



    // Fetch media for each product
    for (const product of products) {
      product.images = await mediaModel.findImagesByContent('product', product.id);
      if (product.images && product.images .length > 0) {
            const images = [];
            for (const item of product.images) {
                images.push(item.url);
             }
            product.images = images;
        }

      product.price = parseFloat(product.price);
      if (!product.rating){
        product.rating = 0; // Set default rating if not available
      }
      if (product.discount_rate > 0){
        product.discount = product.price - (product.price * (product.discount_rate / 100));
      } else {
        product.discount = 0;
      }
    }
    const [total] = await db.query(
      `SELECT  COUNT(*) as count FROM products`
    );
    const totalPages = Math.ceil(total[0].count / limit);

    return {
      products,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages
    };;
  }

  static async delete(id) {
    try {
      const [result] = await db.query(
        `DELETE FROM products WHERE id = ?`,
        [id]
      );
      await mediaModel.delete('product', id);
    } catch (error) {
      console.error('Error deleting product:', error);
    }
    return result.affectedRows > 0;
  }

  static async update(id, data) {
    const validFields = ['name', 'description', 'price', 'stock', 'category', 'discount_rate', 'is_new'];
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
      `UPDATE products SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
    
    return result.affectedRows > 0;
  }

  static async createProduct(data) {
    const [result] = await db.query(
      `INSERT INTO products (name, description, price, discount_rate, stock, is_new, category)
      VALUES (?, ?, ?, ?, ?, ${Boolean(data.is_new)? 1 : 0}, ?)`,
      [data.name, data.description, data.price, data.discount_rate, data.stock, data.category]
    );
    
    const images = data.image_file || [];
    const imagesList = [];
    console.log('Creating product with images:', data);
    for (const image of images) {
      const img =await mediaModel.create({
        contentType: 'product',
        contentId: result.insertId,
        filePath: image.path,
        fileType: 'image',
        isPrimary: image.isPrimary || false
      });
      imagesList.push(img);
    }
    return { id: result.insertId, ...data, images: imagesList };
  }
}

module.exports = Product;