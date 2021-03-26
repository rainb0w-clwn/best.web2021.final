const db = require('./db');

const getActions = async () => {
  const records = await db('action').select('action.*').whereRaw(`
    action.type = 'user'
  `);
  return records;
};

module.exports = {
  getActions,
};
