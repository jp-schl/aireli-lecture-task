import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { PlatformUser } from "@enterprise-commerce/core/platform/types"
import { createUser } from "../models/User"

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required." });
      return;
    }

    // Create the user in the database
    const newUser = await createUser(email, password);

    // Generate a JWT token (optional, for immediate login) 
    const token = jwt.sign(
      {id: newUser.id, email: newUser.email },
      process.env.JWT_SECRET || 'default_secret', // make sure to set JWT_SECRET in your environment
      { expiresIn: '1h' }
    );

    // Send success response
    res.status(201).json({
      message: "User registered successfully",
      user: {email: newUser.email },
      token
    });
  } catch (error: any) {
    console.error("Error registering user:", error); // log the full error
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};