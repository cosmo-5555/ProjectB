import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import Invoice from '../models/Invoice.js';
import Medicine from '../models/Medicine.js';
import LabRequest from '../models/LabRequest.js';
import AuditLog from '../models/AuditLog.js';

// @desc    Get dashboard metrics & real-time analytics
// @route   GET /api/dashboard/stats
// @access  Private (Admin, Doctor, Staff)
export const getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const endOfToday = new Date(today.setHours(23, 59, 59, 999));

    // Parallel aggregations for speed
    const [
      totalPatients,
      totalDoctors,
      todayAppointmentsCount,
      pendingAppointmentsCount,
      completedAppointmentsCount,
      revenueAggregation,
      lowStockMedsCount,
      pendingLabOrdersCount,
      recentActivities,
    ] = await Promise.all([
      Patient.countDocuments(),
      Doctor.countDocuments({ isAvailable: true }),
      Appointment.countDocuments({
        appointmentDate: { $gte: startOfToday, $lte: endOfToday },
      }),
      Appointment.countDocuments({ status: 'Scheduled' }),
      Appointment.countDocuments({ status: 'Completed' }),
      Invoice.aggregate([
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$paidAmount' },
            totalPendingBilling: { $sum: '$balanceDue' },
            invoicesCount: { $sum: 1 },
          },
        },
      ]),
      Medicine.countDocuments({
        isActive: true,
        $expr: { $lte: ['$stockQuantity', '$reorderLevel'] },
      }),
      LabRequest.countDocuments({ status: { $in: ['Requested', 'Sample Collected', 'In Testing'] } }),
      AuditLog.find().sort('-createdAt').limit(8).select('action entity entityId userName userRole createdAt details'),
    ]);

    // Monthly revenue trend (last 6 months aggregation)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyRevenue = await Invoice.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          revenue: { $sum: '$paidAmount' },
          billed: { $sum: '$totalAmount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Appointments by status
    const appointmentsByStatus = await Appointment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Department-wise appointment distribution
    const appointmentsByDept = await Appointment.aggregate([
      {
        $lookup: {
          from: 'doctors',
          localField: 'doctor',
          foreignField: '_id',
          as: 'doctorInfo',
        },
      },
      { $unwind: '$doctorInfo' },
      {
        $group: {
          _id: '$doctorInfo.specialization',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 6 },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalPatients,
        activeDoctors: totalDoctors,
        todayAppointments: todayAppointmentsCount,
        pendingAppointments: pendingAppointmentsCount,
        completedAppointments: completedAppointmentsCount,
        totalRevenue: revenueAggregation[0]?.totalRevenue || 0,
        pendingBilling: revenueAggregation[0]?.totalPendingBilling || 0,
        lowStockMedicines: lowStockMedsCount,
        pendingLabOrders: pendingLabOrdersCount,
      },
      charts: {
        monthlyRevenue,
        appointmentsByStatus,
        appointmentsByDept,
      },
      recentActivities,
    });
  } catch (error) {
    next(error);
  }
};
