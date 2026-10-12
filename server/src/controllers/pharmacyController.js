import Medicine from '../models/Medicine.js';
import { logAudit } from '../middleware/audit.js';

// @desc    Get medicines list with search, stock alerts, expiry alerts
// @route   GET /api/pharmacy
// @access  Private
export const getMedicines = async (req, res, next) => {
  try {
    const { search, category, lowStock, expiringSoon, page = 1, limit = 15 } = req.query;

    const query = { isActive: true };

    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [{ name: regex }, { genericName: regex }, { code: regex }, { batchNumber: regex }];
    }

    if (category) {
      query.category = category;
    }

    // Low stock filter (stockQuantity <= reorderLevel)
    if (lowStock === 'true') {
      query.$expr = { $lte: ['$stockQuantity', '$reorderLevel'] };
    }

    // Expiring within next 60 days
    if (expiringSoon === 'true') {
      const today = new Date();
      const sixtyDaysFromNow = new Date();
      sixtyDaysFromNow.setDate(today.getDate() + 60);
      query.expiryDate = { $lte: sixtyDaysFromNow };
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Medicine.countDocuments(query);
    const medicines = await Medicine.find(query)
      .sort('name')
      .skip(skip)
      .limit(limitNum);

    // Calculate inventory metrics
    const [totalStock, lowStockCount, expiringCount] = await Promise.all([
      Medicine.aggregate([{ $match: { isActive: true } }, { $group: { _id: null, totalQty: { $sum: '$stockQuantity' }, totalValue: { $sum: { $multiply: ['$stockQuantity', '$unitPrice'] } } } }]),
      Medicine.countDocuments({ isActive: true, $expr: { $lte: ['$stockQuantity', '$reorderLevel'] } }),
      Medicine.countDocuments({
        isActive: true,
        expiryDate: { $lte: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) },
      }),
    ]);

    res.status(200).json({
      success: true,
      total,
      count: medicines.length,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      inventorySummary: {
        totalItems: total,
        totalQuantity: totalStock[0]?.totalQty || 0,
        totalInventoryValue: totalStock[0]?.totalValue || 0,
        lowStockAlerts: lowStockCount,
        expiringSoonAlerts: expiringCount,
      },
      medicines,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add new medicine to inventory
// @route   POST /api/pharmacy
// @access  Private (Admin, Pharmacist)
export const createMedicine = async (req, res, next) => {
  try {
    const { name, genericName, category, dosageForm, strength, manufacturer, batchNumber, unitPrice, stockQuantity, reorderLevel, expiryDate, locationRack } = req.body;

    const count = await Medicine.countDocuments();
    const code = `MED-${String(count + 1).padStart(4, '0')}`;

    const medicine = await Medicine.create({
      code,
      name,
      genericName,
      category,
      dosageForm,
      strength,
      manufacturer,
      batchNumber,
      unitPrice,
      stockQuantity,
      reorderLevel,
      expiryDate,
      locationRack,
    });

    await logAudit({
      action: 'CREATE',
      entity: 'Medicine',
      entityId: medicine._id,
      req,
      details: { name: medicine.name, code: medicine.code, initialStock: stockQuantity },
    });

    res.status(201).json({
      success: true,
      message: 'Medicine added to inventory successfully',
      medicine,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update medicine
// @route   PUT /api/pharmacy/:id
// @access  Private (Admin, Pharmacist)
export const updateMedicine = async (req, res, next) => {
  try {
    const medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!medicine) {
      return res.status(404).json({ success: false, message: 'Medicine not found' });
    }

    await logAudit({
      action: 'UPDATE',
      entity: 'Medicine',
      entityId: medicine._id,
      req,
      details: { name: medicine.name, code: medicine.code },
    });

    res.status(200).json({
      success: true,
      message: 'Medicine updated successfully',
      medicine,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Dispense medicine (decrease stock)
// @route   POST /api/pharmacy/:id/dispense
// @access  Private (Admin, Pharmacist)
export const dispenseMedicine = async (req, res, next) => {
  try {
    const { quantity, patientName, prescriptionRef } = req.body;
    const qtyToDispense = Number(quantity);

    if (!qtyToDispense || qtyToDispense <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid quantity to dispense' });
    }

    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
      return res.status(404).json({ success: false, message: 'Medicine not found' });
    }

    if (medicine.stockQuantity < qtyToDispense) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Current stock is ${medicine.stockQuantity}, requested ${qtyToDispense}`,
      });
    }

    medicine.stockQuantity -= qtyToDispense;
    await medicine.save();

    await logAudit({
      action: 'DISPENSE',
      entity: 'Medicine',
      entityId: medicine._id,
      req,
      details: {
        medicineName: medicine.name,
        quantityDispensed: qtyToDispense,
        remainingStock: medicine.stockQuantity,
        patientName,
        prescriptionRef,
      },
    });

    res.status(200).json({
      success: true,
      message: `${qtyToDispense} units of ${medicine.name} dispensed successfully`,
      medicine,
    });
  } catch (error) {
    next(error);
  }
};
