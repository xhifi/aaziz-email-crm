const { compileMjml, getTemplate } = require("./utils");

module.exports = async (req, res) => {
  const { template } = req.params;
  const compiled = await compileMjml(template);

  return res.send(compiled);
};
