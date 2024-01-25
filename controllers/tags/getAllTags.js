const db = require("../../db");

module.exports = async (req, res) => {
  const exists = await db.query(`SELECT * FROM tags`);
  if (exists.rowCount < 1) {
    return res.send([]);
  }
  return res.send(exists.rows);
};
