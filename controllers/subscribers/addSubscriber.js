const db = require("../../db");
const { BadRequest } = require("../../errors/statusErrors");

module.exports = async (req, res) => {
  const { email, name, department, engagementStatus } = req.body;

  const exists = await db.query(`SELECT * FROM subscribers WHERE email = $1;`, [email]);
  if (exists.rowCount > 0) {
    throw new BadRequest(`${email} is already subscribed`);
  }
  const subscribed = await db.query(
    `INSERT INTO subscribers (name, email, department, engagement_status) VALUES($1, $2, $3, $4) RETURNING email;`,
    [name, email, department, engagementStatus]
  );
  if (subscribed.rowCount > 0) {
    return res.json({ msg: `${email} has been subscribed` });
  }
};
