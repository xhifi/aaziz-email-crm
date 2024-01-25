const { Forbidden } = require("../../errors/statusErrors");
const db = require("../../db");

module.exports = async (req, res) => {
  const { id } = req.params;
  const exists = await db.query(`SELECT * FROM subscriber_tags_view WHERE subscriber_id = $1`, [id]);
  if (exists.rowCount < 1) {
    throw new Forbidden(`${id} doesn't exist in the system`);
  }
  return res.send({ ...exists.rows[0] });
};
