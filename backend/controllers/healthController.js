const mongoose = require('mongoose');
const { successResponse } = require('../utils/apiResponse');

const checkHealth = async (req, res) => {
  // Check MongoDB connection status
  const dbStatus = mongoose.connection.readyState;
  // Connection states: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  
  const statusMap = {
    0: 'Disconnected',
    1: 'Connected',
    2: 'Connecting',
    3: 'Disconnecting'
  };

  const data = {
    server: 'Running',
    database: statusMap[dbStatus] || 'Unknown',
    timestamp: new Date().toISOString()
  };

  return successResponse(res, 200, 'Health check passed', data);
};

module.exports = { checkHealth };
