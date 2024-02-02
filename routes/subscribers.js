const router = require("express").Router();
const {
  addSubscriber,
  deleteSubscriber,
  getSubscriber,
  unsubSubscriber,
  updateSubscriber,
  getAllSubscribers,
  tagSubscriber,
  addSubscriberCsv,
} = require("../controllers/subscribers");

const multer = require("multer");
const upload = multer({ dest: "tmp/csv/" });

router.route("/").post(addSubscriber).get(getAllSubscribers);
router.route("/csv").post(upload.single("file"), addSubscriberCsv);
router.route("/:id").get(getSubscriber);
router.route("/:id/update").put(updateSubscriber);
router.route("/:id/delete").delete(deleteSubscriber);
router.route("/:id/unsub").post(unsubSubscriber);
router.route("/:id/tag").patch(tagSubscriber);

module.exports = router;
