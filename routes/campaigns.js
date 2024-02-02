const router = require("express").Router();
const { getCampaign, getAllCampaigns, createCampaign, editCampaign, deleteCampaign, archiveCampaign } = require("../controllers/campaigns");

router.route("/").get(getAllCampaigns).post(createCampaign);
router.route("/:id").get(getCampaign);
router.route("/:id/edit").put(editCampaign);
router.route("/:id/delete").delete(deleteCampaign);
router.route("/:id/archive").patch(archiveCampaign);

module.exports = router;
