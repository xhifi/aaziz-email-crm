const db = require("../../db");
const { NotFound, BadRequest } = require("../../errors/statusErrors");

module.exports = async (req, res) => {
  const { id } = req.params;
  const { tag } = req.body;
  const userExists = await db.query(`SELECT * FROM subscribers WHERE subscriber_id = $1`, [id]);
  if (userExists.rowCount < 1) {
    throw new NotFound(`No subscriber exists with id ${id}`);
  }
  let tagData;
  tagData = await db.query(`SELECT * FROM tags WHERE tag_name = $1`, [tag]);
  if (tagData.rowCount < 1) {
    const tagCreated = await db.query(`INSERT INTO TAGS (tag_name) VALUES ($1) RETURNING *`, [tag]);
    tagData = tagCreated;
  }

  const tagged = await db.query(`INSERT INTO subscriber_tags (subscriber_id, tag_id) VALUES($1, $2)`, [
    userExists.rows[0].subscriber_id,
    tagData.rows[0].tag_id,
  ]);
  if (tagged.rowCount < 1) {
    throw new Error(`Something went wrong while attaching the created tag ${tagData.rows[0].tag_name} to ${userExists.rows[0].email}`);
  }
  return res.send(`${userExists.rows[0].email} has been tagged with "${tagData.rows[0].tag_name}"`);
};
