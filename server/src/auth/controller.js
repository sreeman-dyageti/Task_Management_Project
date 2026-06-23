import validator from "validator";
import {  userRegistration, userLogin} from "./service.js";

// Register
export const register = async ( req,res) => {
  try {
    const {f_name,l_name,email, password} = req.body;

    if (!f_name?.trim() || !l_name?.trim()) {
      return res.status(400).json({
        error:
          "First name and last name are required!!",
      });
    }

    if (!email?.trim() || !password?.trim()) {
      return res.status(400).json({
        error:
          "Email and password are required!!",
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        error: "Invalid email",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error:
          "Password must be at least 8 characters!!",
      });
    }

    const result =
      await userRegistration({ f_name, l_name,  email, password });

    if (!result.success) {
      return res.status(400).json({
        error: result.message,
      });
    }

    return res.status(201).json({
      success: true,
      message:
        "User registered successfully",
      user: result.user,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

// Login
export const login = async (req,res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password?.trim()) {
      return res.status(400).json({
        error:
          "Email and password are required!!",
      });
    }

    const result = await userLogin({ email, password});

    if (!result.success) {
      return res.status(401).json({
        error: result.message,
      });
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

// Protected Route
export const profile = async ( req, res) => {
  return res.status(200).json({
    message: "Profile accessed",
    user: req.user,
  });
};