const db = require("../../db");

module.exports = async (req, res) => {
  const { tag } = req.body;
  const exists = await db.query(`SELECT * FROM tags WHERE tag_name = $1`, [tag]);
  if (exists.rowCount > 0) {
    return res.send(exists.rows[0]);
  }
  const created = await db.query(`INSERT INTO tags (tag_name) VALUES ($1) RETURNING *`, [tag]);
  if (created.rowCount < 1) {
    throw new Error(`Something went wrong while creating the tag. Contact administrator`);
  }
  return res.send(created.rows[0]);
};
