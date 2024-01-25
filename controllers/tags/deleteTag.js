const db = require("../../db");
const { BadRequest } = require("../../errors/statusErrors");

module.exports = async (req, res) => {
  const { id } = req.params;
  const exists = await db.query(`SELECT * FROM tags WHERE tag_id = $1`, [id]);
  if (exists.rowCount < 1) {
    throw new BadRequest(`No tag exists by id ${id}`);
  }
  const deleted = await db.query(`DELETE FROM tags WHERE tag_id = $1`, [id]);
  if (deleted.rowCount < 1) {
    throw new Error(`Something went wrong on the server. Contact the administrator`);
  }
  return res.send(deleted.rows[0]);
};
