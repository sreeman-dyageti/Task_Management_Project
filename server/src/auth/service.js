import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { query } from "../../db/db.js";

// Register User
export const userRegistration = async ({ f_name, l_name, email, password}) => {
    // for email
  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await query(
    "SELECT user_id FROM users WHERE email = $1",
    [normalizedEmail]
  );

  if (existingUser.rows.length > 0) {
    return {
      success: false,
      message: "Email already registered.",
    };
  }
// hash the password 
  const passwordHash = await bcrypt.hash(password, 10);

  const result = await query(`INSERT INTO users (f_name, l_name, email, password) VALUES ($1,$2,$3,$4) RETURNING user_id, f_name, l_name, email,role`,
    [f_name, l_name, normalizedEmail, passwordHash ]);

  return {
    success: true,
    user: result.rows[0],
  };
};

// Login User
export const userLogin = async ({ email, password,}) => {
  const normalizedEmail = email.trim().toLowerCase();

  const result = await query( `SELECT * FROM users WHERE email = $1`, [normalizedEmail]);

  if (result.rows.length === 0) {
    return {
      success: false,
      message: "Invalid email or password",
    };
  }

  const user = result.rows[0];

  const isMatch = await bcrypt.compare(
    password,
    user.password
  );

  if (!isMatch) {
    return {
      success: false,
      message: "Invalid email or password",
    };
  }

//   jwt token
  const token = jwt.sign(
    {
      user_id: user.user_id,
      email: user.email,
      role:user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );

  return {
    success: true,
    token,
    user: {
      user_id: user.user_id,
      f_name: user.f_name,
      l_name: user.l_name,
      email: user.email,
      role:user.role
    },
  };
};