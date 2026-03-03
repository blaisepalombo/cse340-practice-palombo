import bcrypt from 'bcrypt';
import db from '../db.js';

const findUserByEmail = async (email) => {
  const query = `
    SELECT
      users.id,
      users.name,
      users.email,
      users.password,
      users.created_at,
      users.role_id,
      roles.role_name AS "roleName"
    FROM users
    INNER JOIN roles ON users.role_id = roles.id
    WHERE LOWER(users.email) = LOWER($1)
    LIMIT 1
  `;
  const result = await db.query(query, [email]);
  return result.rows[0] || null;
};

const findUserByIdWithRole = async (id) => {
  const query = `
    SELECT
      users.id,
      users.name,
      users.email,
      users.created_at,
      users.role_id,
      roles.role_name AS "roleName"
    FROM users
    INNER JOIN roles ON users.role_id = roles.id
    WHERE users.id = $1
    LIMIT 1
  `;
  const result = await db.query(query, [id]);
  return result.rows[0] || null;
};

const verifyPassword = async (plainPassword, hashedPassword) => {
  return bcrypt.compare(plainPassword, hashedPassword);
};

export { findUserByEmail, findUserByIdWithRole, verifyPassword };