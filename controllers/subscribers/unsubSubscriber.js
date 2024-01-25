const pool = require("../../db");
const { Forbidden, BadRequest } = require("../../errors/statusErrors");

module.exports = async (req, res) => {
  const id = req.params.id;
  const isUnsubscribed = await pool.query(`SELECT subscribed FROM subscribers WHERE subscriber_id = $1`, [id]);

  if (isUnsubscribed.rowCount < 1) {
    throw new Forbidden(`${id} is not in system`);
  }
  if (!isUnsubscribed.rows[0].subscribed) {
    throw new BadRequest(`${id} is already not subscribed`);
  }

  const unsubscribe = await pool.query(`UPDATE subscribers SET subscribed = FALSE where subscriber_id = $1 RETURNING email`, [id]);
  if (unsubscribe.rowCount > 0) {
    return res.status(200).json({ msg: `${unsubscribe.rows[0].email} has been unsubscribed` });
  }
  throw new BadRequest();
};
