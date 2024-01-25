const db = require("../../db");
const { BadRequest } = require("../../errors/statusErrors");

module.exports = async (req, res) => {
  const { name, email, department, engagementStatus } = req.body;
  const exists = await db.query(`SELECT email FROM subscribers WHERE email = $1`, [email]);
  if (exists.rowCount < 1) {
    throw new BadRequest(`${email} doesn't exist in the system`);
  }
  const existingData = exists.rows[0];
  const toUpdate = {
    name: name || existingData.name,
    department: department || existingData.department,
    engagementStatus: engagementStatus || existingData.engagement_status,
  };

  const updated = await db.query(`UPDATE subscribers SET name = $1, department = $2, engagement_status = $3 RETURNING *`, [
    toUpdate.name,
    toUpdate.department,
    toUpdate.existingData,
  ]);
  if (updated.rowCount < 1) {
    throw new Error(`Something went wrong while updating. Contact the administrator.`);
  }
  return res.send(updated.rows[0]);
};
