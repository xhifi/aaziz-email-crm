const db = require("../../db");
const { BadRequest } = require("../../errors/statusErrors");

module.exports = async (req, res) => {
  const { id } = req.params;
  const exists = await db.query(`SELECT subscriber_id FROM subscribers WHERE subscriber_id = $1`, [id]);
  if (exists.rowCount < 1) {
    throw new BadRequest(`${id} doesn't exist in the system`);
  }
  const deleted = await db.query(`DELETE FROM subscribers WHERE subscriber_id = $1 RETURNING subscriber_id`, [id]);
  if (deleted.rowCount < 1) {
    throw new Error(`Something went wrong while deleting ${id}. Contact the administrator.`);
  }
  return res.send(`${deleted.rows[0].subscriber_id} has been deleted from the system`);
};
