const pool = require('../config/db');

class Account {

  static async getAllUsers(){
    const [users] =  await pool.query('SELECT id, username as name, email , phone , user_role as role, account_status as isActive FROM Account Where id != 1');
    return users;
  }

  static async getCountUsers(){
    const [count] = await pool.query('SELECT count(*) as `count` FROM Account Where id != 1');
    return count[0];
  }

  static async findByEmail(username) {
    const [account] = await pool.query('SELECT * FROM Account WHERE email = ?', [username]);
    return account[0];
  }

  static async findById(id) {
    const [account] = await pool.query('SELECT id,email,username,user_role,phone,password_hash,profile_image,account_status,created_at,last_login,last_password_change,is_verified FROM Account WHERE id = ?', [id]);
    return account[0];
  }

  static async create({ username, password_hash, email, phone }) {
    const [result] = await pool.query(
      'INSERT INTO Account (username, password_hash, email, phone, user_role) VALUES (?, ?, ?, ?, ?)',
      [username, password_hash, email, phone, 'user']
    );
    return { id: result.insertId, username };
  }

  static async adminCreate({ username, password_hash, email, phone, user_role, account_status}){
    const [result] = await pool.query(
      `INSERT INTO Account (username, password_hash, email, phone, user_role, account_status) VALUES (?, ?, ?, ?, ?, ${account_status?1:0})`,
      [username, password_hash, email, phone,user_role]
    );
    return { id: result.insertId, username };
  }

  static async update(id, updateData) {
    const { username, passwordHash } = updateData;
    let updateFields = [];
    let queryParams = [];
    
    if (username) {
      updateFields.push('username = ?');
      queryParams.push(username);
    }
    
    if (passwordHash) {
      updateFields.push('password_hash = ?');
      queryParams.push(passwordHash);
      updateFields.push('last_password_change = CURRENT_TIMESTAMP');
    }
    
    if (updateFields.length === 0) {
      return false;
    }
    
    queryParams.push(id);
    
    const query = `UPDATE Account SET ${updateFields.join(', ')} WHERE id = ?`;
    const [result] = await pool.query(query, queryParams);
    return result.affectedRows > 0;
  }

  static async adminUpdate(id, updateData) {
      const {
        email,
        username,
        user_role,
        phone,
        password_hash,
        profile_image,
        account_status,
        created_at,
        last_login,
        is_verified
      } = updateData;

      let updateFields = [];
      let queryParams = [];

      if (email) {
        updateFields.push('email = ?');
        queryParams.push(email);
      }

      if (username) {
        updateFields.push('username = ?');
        queryParams.push(username);
      }

      if (user_role) {
        updateFields.push('user_role = ?');
        queryParams.push(user_role);
      }

      if (phone) {
        updateFields.push('phone = ?');
        queryParams.push(phone);
      }

      if (password_hash) {
        updateFields.push('password_hash = ?');
        password_hash 
        queryParams.push(password_hash);
        updateFields.push('last_password_change = CURRENT_TIMESTAMP');
      }

      if (profile_image) {
        updateFields.push('profile_image = ?');
        queryParams.push(profile_image);
      }

      if (typeof account_status != 'undefined') {
        updateFields.push(`account_status = ${account_status}`);
      }

      // created_at and last_login are usually system managed, skip unless explicitly updating
      if (created_at) {
        updateFields.push('created_at = ?');
        queryParams.push(created_at);
      }

      if (last_login) {
        updateFields.push('last_login = ?');
        queryParams.push(last_login);
      }

      if (typeof is_verified !== 'undefined') {
        updateFields.push('is_verified = ?');
        queryParams.push(is_verified);
      }

      if (updateFields.length === 0) {
        return false;
      }

      queryParams.push(id); // Don't forget this for WHERE clause

    
      const query = `UPDATE Account SET ${updateFields.join(', ')} WHERE id = ?`;
      const [result] = await pool.query(query, queryParams);
      return result.affectedRows > 0;
  }

  static async updateLastLogin(id) {
    const [result] = await pool.query(
      'UPDATE Account SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  static async updatePassword({userId, password_hash}){
    const [result] = await pool.query(
      `UPDATE Account SET password_hash ='${password_hash}' , last_password_change = CURRENT_TIMESTAMP WHERE id = '${userId}';`
    )
    return result.affectedRows > 0
  }

  static async deleteUser(userId){
    const result = await pool.query(`DELETE FROM Account WHERE id = ${userId}`);
    return result.affectedRows > 0;
  }
}

module.exports = Account;