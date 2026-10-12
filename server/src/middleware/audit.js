import AuditLog from '../models/AuditLog.js';

export const logAudit = async ({
  action,
  entity,
  entityId = '',
  req = null,
  details = {},
  performedBy = null,
  userName = 'System',
  userRole = 'system',
}) => {
  try {
    let resolvedUserId = performedBy;
    let resolvedUserName = userName;
    let resolvedUserRole = userRole;
    let ip = '';
    let ua = '';

    if (req) {
      if (req.user) {
        resolvedUserId = req.user._id;
        resolvedUserName = req.user.name;
        resolvedUserRole = req.user.role;
      }
      ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';
      ua = req.headers['user-agent'] || '';
    }

    await AuditLog.create({
      action,
      entity,
      entityId: String(entityId),
      performedBy: resolvedUserId,
      userName: resolvedUserName,
      userRole: resolvedUserRole,
      details,
      ipAddress: ip,
      userAgent: ua,
    });
  } catch (err) {
    // Non-blocking log error
    console.error('Audit Logging Error:', err.message);
  }
};
