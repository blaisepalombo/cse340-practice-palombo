import bcrypt from 'bcrypt';
import db from '../db.js';

const findUserByEmail = async (email) => {
  const sql = `
    SELECT id, name, email, password, created_at
    FROM users
    WHERE LOWER(email) = LOWER($1)
    LIMIT 1
  `;

  const result = await db.query(sql, [email]);

  return result.rows[0] || null;
};

const verifyPassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

export { findUserByEmail, verifyPassword };