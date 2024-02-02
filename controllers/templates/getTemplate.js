const { getTemplate } = require("./utils");

module.exports = async (req, res) => {
  const { template } = req.params;

  const mjml = await getTemplate(template);

  return res.send(mjml);
};
