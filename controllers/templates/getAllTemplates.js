const { getTemplates } = require("./utils");

module.exports = async (req, res) => {
  const templates = await getTemplates();
  res.send(templates);
};
