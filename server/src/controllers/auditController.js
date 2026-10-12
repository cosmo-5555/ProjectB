import AuditLog from '../models/AuditLog.js';

// @desc    Get audit logs
// @route   GET /api/audit
// @access  Private (Admin only)
export const getAuditLogs = async (req, res, next) => {
  try {
    const { action, entity, page = 1, limit = 20 } = req.query;

    const query = {};
    if (action) query.action = action;
    if (entity) query.entity = entity;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .sort('-createdAt')
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      total,
      count: logs.length,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      logs,
    });
  } catch (error) {
    next(error);
  }
};
