import { PlatformAccessToken, PlatformUserCreateInput, PlatformUser } from '@enterprise-commerce/core/platform/types';
import axios from 'axios';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const registerUser = async (input: PlatformUserCreateInput): Promise<Pick<PlatformUser, "id"> | null> => {
  try {
    const { data } = await axios.post('http://localhost:3001/auth/register', {
      email: input.email,
      password: input.password
    });

    // data should return the created user: { id, email }
    return data.user;
  } catch (error) {
    console.error("Error registering user:", error);
    return null;
  }
};

const loginUser = async (input: PlatformUserCreateInput) => {
  try {
    // 1️⃣ Send credentials to backend
    const { data } = await axios.post("http://localhost:3001/auth/login", {
      email: input.email,
      password: input.password,
    });

    // data should be: { user: { id, email }, accessToken, expiresAt }
    const user = data.user;

    // 2️⃣ Generate JWT token for frontend if needed
    const accessToken = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || "no_key_set",
      { expiresIn: "1h" }
    );
    const expiresAt = new Date(Date.now() + 3600 * 1000).toISOString();

    return { accessToken, expiresAt };
  } catch (error) {
    console.error("Login failed:", error);
    return null;
  }
};

const getUser = async (accessToken: string): Promise<PlatformUser | undefined | null> => {
  try {
    if(accessToken != "") {
      const { data } = await axios.get('http://localhost:3001/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return data.user;
    } else {
      return null
    }
  } catch (error) {
    console.error(error);
    // Handle error
    return null;
  }
};

export default {
  registerUser,
  loginUser,
  getUser
};