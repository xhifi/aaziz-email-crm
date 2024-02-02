const fs = require("fs/promises");
const path = require("path");
const db = require("../../db");
const { z } = require("zod");

const tagSchema = z.string().min(1);
const subscriberSchema = z.object({
  name: z.string(),
  email: z.string().refine((value) => /\S+@\S+\.\S+/.test(value), {
    message: "Invalid email format",
  }),
  engagement_status: z.enum(["engaged", "disengaged", "potential"], {
    message: "Invalid engagement status",
  }),
  department: z.enum(["01", "02", "04", "payroll"], {
    message: "Invalid department",
  }),
  title: z.string(),
  tags: z.array(tagSchema),
});

const parseCsv = async (file) => {
  const filePath = path.join(process.cwd(), file);
  const csvStr = (await fs.readFile(filePath, { encoding: "utf8" }))
    .toString()
    .split("\r\n")
    .map((line) => line.split("\t"));
  const header = csvStr[0];
  const body = csvStr.splice(1, csvStr.length);

  const resultArray = [];

  for (let i = 0; i < body.length; i++) {
    const row = body[i];

    if (row[0] !== "") {
      const resultObject = {
        name: row[0],
        email: row[1] || null,
        engagement_status: row[2] || null,
        department: row[3] || null,
        title: row[4] || null,
        tags: row[5]
          ? row[5]
              .replace(/["]/g, "")
              .split(", ")
              .map((tag) => tag.trim())
          : [],
      };

      resultArray.push(resultObject);
    }
  }
  const tags = [
    ...new Set([
      ...resultArray
        .map((contact) => {
          return contact.tags;
        })
        .flat(),
    ]),
  ];

  const contacts = structuredClone(resultArray);
  const safeParse = contacts.map((row) => {
    try {
      subscriberSchema.parse(row);
      return { ...row, process: true };
    } catch (error) {
      const errors = { [error.issues.map((issue) => issue.path.map((v) => v))]: [error.issues.map((issue) => issue.message)] };
      return { ...row, process: false, errors };
    }
  });

  fs.unlink(file);

  return { header, body, parse: resultArray, tags, safeParse };
};

module.exports = async (req, res) => {
  const queryResult = [];
  const query = `INSERT INTO subscribers (name, email, engagement_status, department, tags) VALUES ($1, $2, $3, $4, $5)`;
  const results = [];

  const { safeParse, parse, tags } = await parseCsv(req.file.path);

  const processedTags = await Promise.all(
    tags.map(async (tag) => {
      const exists = await db.query(`SELECT * FROM tags WHERE tag_name = $1`, [tag]);

      if (exists.rowCount < 1) {
        const insert = await db.query(`INSERT INTO TAGS(tag_name) VALUES($1) RETURNING *`, [tag]);
        return { tag, id: insert.rows[0].tag_id };
      }
      return { tag, id: exists.rows[0].tag_id };
    })
  );

  const toCreate = safeParse.filter((object) => object.process === true);
  if (toCreate.length === 0) {
    return res.status(502).send({ processed: 0, safeParse });
  }

  let createResult = [];

  for (let i = 0; i < safeParse.length; i++) {
    if (!safeParse[i].process) {
      createResult.push({ ...safeParse[i], created: false, updated: false, errored: true });
      continue;
    }
    const exists = await db.query(`SELECT * FROM subscribers WHERE email = $1`, [safeParse[i].email]);
    if (exists.rowCount > 0) {
      try {
        const updated = await db.query(
          `UPDATE subscribers SET name = $1, title = $2, engagement_status = $3, department = $4 WHERE email = $5 RETURNING *`,
          [safeParse[i].name, safeParse[i].title, safeParse[i].engagement_status, safeParse[i].department, safeParse[i].email]
        );

        const tagged = await Promise.all(
          safeParse[i].tags.map(async (tag) => {
            const subscriberTagExists = await db.query(`SELECT * FROM subscriber_tags WHERE subscriber_id = $1 AND tag_id = $2`, [
              updated.rows[0].subscriber_id,
              processedTags.find((t) => t.tag === tag).id,
            ]);
            if (subscriberTagExists.rowCount < 1) {
              const tagUpdated = await db.query(`INSERT INTO subscriber_tags (subscriber_id, tag_id) VALUES ($1, $2) RETURNING *`, [
                updated.rows[0].subscriber_id,
                processedTags.find((t) => t.tag === tag).id,
              ]);
              return tagUpdated.rows[0];
            }
          })
        );
        createResult.push({ ...safeParse[i], tagged, updated: true, created: false, errored: false });

        continue;
      } catch (error) {
        createResult.push({ ...safeParse[i], updated: false, created: false, errored: error.message });
      }
    }
    try {
      const created = await db.query(
        `INSERT INTO subscribers (name, title, email, engagement_status, department ) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [safeParse[i].name, safeParse[i].title, safeParse[i].email, safeParse[i].engagement_status, safeParse[i].department]
      );
      const tagged = await Promise.all(
        safeParse[i].tags.map(async (tag) => {
          const subscriberTagExists = await db.query(`SELECT * FROM subscriber_tags WHERE subscriber_id = $1 AND tag_id = $2`, [
            created.rows[0].subscriber_id,
            processedTags.find((t) => t.tag === tag).id,
          ]);
          if (subscriberTagExists.rowCount < 1) {
            const tagUpdated = await db.query(`INSERT INTO subscriber_tags (subscriber_id, tag_id) VALUES ($1, $2) RETURNING *`, [
              created.rows[0].subscriber_id,
              processedTags.find((t) => t.tag === tag).id,
            ]);
            return tagUpdated.rows[0];
          }
        })
      );
      createResult.push({ ...safeParse[i], tagged, updated: false, created: true, errored: false });
    } catch (error) {
      if (error) {
        createResult.push({ ...safeParse[i], errored: error.message });
      }
    }
  }

  return res.send(createResult);
};
