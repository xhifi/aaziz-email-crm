const router = require("express").Router();

const {
  getTemplate,
  getAllTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  compileTemplate,
} = require("../controllers/templates");

router.route("/").get(getAllTemplates).post(createTemplate);
router.route("/:template").get(getTemplate).post(compileTemplate);
router.route("/:template/update").patch(updateTemplate);
router.route("/:template/deleteTemplate").delete(deleteTemplate);

module.exports = router;
