import db from '../db.js';

export interface AuditLogData {
  userId: number;
  action: string;
  entityType: string;
  entityId?: string | number;
  description: string;
  oldData?: any;
  newData?: any;
}

export class AuditService {
  /**
   * Records an audit log entry
   */
  static async log(data: AuditLogData): Promise<void> {
    try {
      await db('audit_logs').insert({
        user_id: data.userId,
        action: data.action,
        entity_type: data.entityType,
        entity_id: data.entityId ? String(data.entityId) : null,
        description: data.description,
        old_data: data.oldData ? JSON.stringify(data.oldData) : null,
        new_data: data.newData ? JSON.stringify(data.newData) : null
      });
    } catch (error) {
      console.error('Failed to save audit log:', error);
    }
  }

  /**
   * Fetches audit logs with human-readable formatting
   */
  static async getLogs(limit: number = 100, offset: number = 0) {
    return await db('audit_logs as a')
      .leftJoin('users as u', 'a.user_id', 'u.id')
      .select('a.*', 'u.name as user_name')
      .orderBy('a.created_at', 'desc')
      .limit(limit)
      .offset(offset);
  }
}
