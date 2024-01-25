const db = require("../../db");

module.exports = async (req, res) => {
  const all = await db.query(`SELECT * FROM subscriber_tags_view`);
  if (all.rowCount === 0) {
    return res.send([]);
  }
  return res.send([...all.rows]);
};
