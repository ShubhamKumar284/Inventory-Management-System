const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Get dashboard summary metrics
// @route   GET /api/dashboard/summary
// @access  Private
const getSummary = async (req, res, next) => {
  try {
    const today = new Date();
    const next30Days = new Date();
    next30Days.setDate(today.getDate() + 30);

    const summaryPipeline = [
      { $match: { status: 'ACTIVE' } },
      {
        $facet: {
          totals: [
            {
              $group: {
                _id: null,
                totalProducts: { $sum: 1 },
                totalUnits: { $sum: "$quantity" },
                totalValue: { $sum: { $multiply: ["$quantity", "$unitCost"] } }
              }
            }
          ],
          lowStock: [
            { $match: { $expr: { $lte: ["$quantity", "$minimumStock"] }, quantity: { $gt: 0 } } },
            { $count: "count" }
          ],
          outOfStock: [
            { $match: { quantity: 0 } },
            { $count: "count" }
          ],
          expiring: [
            { $match: { expiryDate: { $gte: today, $lte: next30Days }, quantity: { $gt: 0 } } },
            { $count: "count" }
          ]
        }
      },
      {
        $project: {
          totalProducts: { $arrayElemAt: ["$totals.totalProducts", 0] },
          totalUnits: { $arrayElemAt: ["$totals.totalUnits", 0] },
          totalValue: { $arrayElemAt: ["$totals.totalValue", 0] },
          lowStockCount: { $arrayElemAt: ["$lowStock.count", 0] },
          outOfStockCount: { $arrayElemAt: ["$outOfStock.count", 0] },
          expiringCount: { $arrayElemAt: ["$expiring.count", 0] }
        }
      }
    ];

    const result = await Product.aggregate(summaryPipeline);
    const summary = result[0] || {};

    return successResponse(res, 200, 'Dashboard summary retrieved', {
      totalProducts: summary.totalProducts || 0,
      totalUnits: summary.totalUnits || 0,
      totalValue: summary.totalValue || 0,
      lowStockCount: summary.lowStockCount || 0,
      outOfStockCount: summary.outOfStockCount || 0,
      expiringCount: summary.expiringCount || 0
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get stock movement trends grouped by date
// @route   GET /api/dashboard/stock-trends
// @access  Private
const getStockTrends = async (req, res, next) => {
  try {
    const pipeline = [
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
            type: "$type"
          },
          totalQuantity: { $sum: "$quantity" }
        }
      },
      {
        $group: {
          _id: "$_id.date",
          movements: {
            $push: {
              k: "$_id.type", // 'IN' or 'OUT'
              v: "$totalQuantity"
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          stats: { $arrayToObject: "$movements" }
        }
      },
      {
        $sort: { date: 1 } // Ascending chronological order
      }
    ];

    const trends = await StockMovement.aggregate(pipeline);

    // Normalize output so every day has IN and OUT defaults to 0
    const normalizedTrends = trends.map(t => ({
      date: t.date,
      in: t.stats.IN || 0,
      out: t.stats.OUT || 0
    }));

    return successResponse(res, 200, 'Stock trends retrieved', normalizedTrends);
  } catch (error) {
    next(error);
  }
};

// @desc    Get inventory distribution by category
// @route   GET /api/dashboard/category-distribution
// @access  Private
const getCategoryDistribution = async (req, res, next) => {
  try {
    const pipeline = [
      { $match: { status: 'ACTIVE' } },
      {
        $group: {
          _id: "$categoryId",
          totalProducts: { $sum: 1 },
          totalUnits: { $sum: "$quantity" },
          totalValue: { $sum: { $multiply: ["$quantity", "$unitCost"] } }
        }
      },
      {
        // Join with the Categories collection to get the actual category name
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "categoryDetails"
        }
      },
      {
        $project: {
          _id: 0,
          categoryId: "$_id",
          name: { $ifNull: [{ $arrayElemAt: ["$categoryDetails.name", 0] }, "Uncategorized"] },
          totalProducts: 1,
          totalUnits: 1,
          totalValue: 1
        }
      },
      { $sort: { totalValue: -1 } } // Sort by most valuable category first
    ];

    const distribution = await Product.aggregate(pipeline);
    return successResponse(res, 200, 'Category distribution retrieved', distribution);
  } catch (error) {
    next(error);
  }
};

// @desc    Get recent stock movements
// @route   GET /api/dashboard/recent-movements
// @access  Private
const getRecentMovements = async (req, res, next) => {
  try {
    // For simple fetching, standard Mongoose populate is appropriate and cleaner than $lookup
    const movements = await StockMovement.find()
      .populate('productId', 'name sku')
      .populate('performedBy', 'name')
      .sort('-timestamp')
      .limit(10)
      .lean();
      
    return successResponse(res, 200, 'Recent movements retrieved', movements);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSummary,
  getStockTrends,
  getCategoryDistribution,
  getRecentMovements
};
