const fs = require("fs");
const path = require("path");
const mjml2html = require("mjml");

const getTemplates = async () => {
  const templateDirPath = path.join(process.cwd(), "templates");
  return new Promise((resolve, reject) => {
    fs.readdir(templateDirPath, (err, files) => {
      if (err) reject(err);
      resolve(files.filter((file) => file.endsWith("mjml")).map((file) => file.split(".")[0]));
    });
  });
};

const getTemplate = async (template) => {
  return new Promise((resolve, reject) => {
    try {
      const templatePath = path.join(process.cwd(), "templates", `${template}.mjml`);
      fs.readFile(templatePath, (err, data) => {
        if (data) resolve(data.toString());
        if (err) reject(err);
      });
    } catch (error) {
      if (error) reject(error);
    }
  });
};

const compileMjml = async (template) => {
  const src = await getTemplate(template);
  const templateOutput = path.join(process.cwd(), "templates", "compiled", `${template}.html`);

  return new Promise((resolve, reject) => {
    const { html } = mjml2html(src);
    fs.writeFile(templateOutput, html, { encoding: "utf8" }, (err) => {
      if (err) reject(err);
      resolve(html);
    });
  });
};

module.exports = { getTemplate, getTemplates, compileMjml };
