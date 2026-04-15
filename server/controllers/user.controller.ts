import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import db from '../db.js';
import { AuditService } from '../services/audit.service.js';

export const getUsers = async (req: any, res: Response) => {
  try {
    const query = db('users').select('id', 'name', 'email', 'team', 'role', 'status');

    if (req.user.role === 'admin') {
      query.whereNot('role', 'super_admin');
    }

    const users = await query;
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const createUser = async (req: any, res: Response) => {
  const { name, email, password, team, role, status } = req.body;
  
  if (!name || !email || !password || !team) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (req.user.role === 'admin' && role === 'super_admin') {
     return res.status(403).json({ error: 'Admins cannot create Super Admin accounts' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [id] = await db('users').insert({
      name,
      email,
      password: hashedPassword,
      team,
      role: role || 'user',
      status: status || 'Active'
    });

    await AuditService.log({
      userId: req.user.id,
      action: 'CREATE_USER',
      entityType: 'user',
      entityId: id,
      description: `Membuat user baru: ${name} (${role || 'user'})`,
      newData: { name, email, team, role, status }
    });

    res.status(201).json({ success: true, id });
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE' || error.code === '23505') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Failed to create user: ' + error.message });
  }
};

export const updateUser = async (req: any, res: Response) => {
  const userId = req.params.id;
  const { name, email, team, role, status, password } = req.body;

  try {
    const targetUser = await db('users').where({ id: userId }).first();
    if (!targetUser) return res.status(404).json({ error: 'User not found' });
    
    if (targetUser.role === 'super_admin' && req.user.role === 'admin') {
      return res.status(403).json({ error: 'Admins cannot modify Super Admin accounts' });
    }

    const updateData: any = { name, email, team, role, status };
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    await db('users').where({ id: userId }).update(updateData);

    await AuditService.log({
      userId: req.user.id,
      action: 'UPDATE_USER',
      entityType: 'user',
      entityId: userId,
      description: `Mengubah profil user: ${targetUser.name}. Role: ${targetUser.role} -> ${role}, Status: ${targetUser.status} -> ${status}`,
      oldData: targetUser,
      newData: updateData
    });

    res.json({ success: true });
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE' || error.code === '23505') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Failed to update user: ' + error.message });
  }
};

export const deleteUser = async (req: any, res: Response) => {
  const userId = req.params.id;
  try {
    const targetUser = await db('users').where({ id: userId }).first();
    if (!targetUser) return res.status(404).json({ error: 'User not found' });

    if (targetUser.role === 'super_admin' && req.user.role === 'admin') {
      return res.status(403).json({ error: 'Admins cannot delete Super Admin accounts' });
    }

    await db('users').where({ id: userId }).del();
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete user: ' + error.message });
  }
};

export const updateUserStatus = async (req: any, res: Response) => {
  const userId = req.params.id;
  const { status } = req.body;

  if (!status || !['Active', 'Inactive'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status. Must be Active or Inactive.' });
  }

  try {
    const targetUser = await db('users').where({ id: userId }).first();
    if (!targetUser) return res.status(404).json({ error: 'User not found' });
    
    if (targetUser.role === 'super_admin' && req.user.role === 'admin') {
      return res.status(403).json({ error: 'Admins cannot modify Super Admin accounts' });
    }

    await db('users').where({ id: userId }).update({ status });

    await AuditService.log({
      userId: req.user.id,
      action: 'UPDATE_USER_STATUS',
      entityType: 'user',
      entityId: userId,
      description: `Mengubah status user ${targetUser.name} menjadi ${status}`,
      oldData: { status: targetUser.status },
      newData: { status }
    });

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update status: ' + error.message });
  }
};
