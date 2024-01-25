const router = require("express").Router();
const {
  addSubscriber,
  deleteSubscriber,
  getSubscriber,
  unsubSubscriber,
  updateSubscriber,
  getAllSubscribers,
  tagSubscriber,
} = require("../controllers/subscribers");

router.route("/").post(addSubscriber).get(getAllSubscribers);
router.route("/:id").get(getSubscriber);
router.route("/:id/update").put(updateSubscriber);
router.route("/:id/delete").delete(deleteSubscriber);
router.route("/:id/unsub").post(unsubSubscriber);
router.route("/:id/tag").patch(tagSubscriber);

module.exports = router;
