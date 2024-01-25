const router = require("express").Router();
const { createTag, getAllTags, deleteTag } = require("../controllers/tags");

router.route("/").post(createTag).get(getAllTags);
router.route("/:id").delete(deleteTag);

module.exports = router;
