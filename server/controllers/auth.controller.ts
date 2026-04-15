import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../db.js';

const JWT_SECRET = process.env.JWT_SECRET;

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  
  try {
    const user = await db('users').where({ email }).first();

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (user.status !== 'Active') {
      return res.status(403).json({ error: 'Account is inactive via admin' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      if (!JWT_SECRET) {
        return res.status(500).json({ error: 'Server configuration error' });
      }

      const { password: _, ...userData } = user;
      const token = jwt.sign({ 
        id: user.id, 
        role: user.role, 
        email: user.email,
        team: user.team 
      }, JWT_SECRET, { expiresIn: '8h' });
      
      res.json({ token, user: userData });
    } else {
      res.status(401).json({ error: 'Invalid email or password' });
    }
  } catch (error) {
    // Log handled globally
    res.status(500).json({ error: 'Failed to process login' });
  }
};

export const changePassword = async (req: any, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current and new password are required' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters' });
  }
  try {
    const user = await db('users').where({ id: req.user.id }).first();
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Password lama salah' });

    const hashed = await bcrypt.hash(newPassword, 10);
    await db('users').where({ id: req.user.id }).update({ password: hashed });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to change password: ' + error.message });
  }
};
export const getMe = async (req: any, res: Response) => {
  try {
    const user = await db('users').where({ id: req.user.id }).first();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const { password: _, ...userData } = user;
    res.json(userData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};
