const express = require('express');

const heroController   = require('../controllers/hero.controller');
const reportController = require('../controllers/report.controller');

const router = express.Router();

//Hero Routes
router.get("/getHeroes", heroController.getHeroes);
router.post("/crateHero", heroController.createHero);
router.get("/getHero/:id", heroController.getHero);
router.put("/updateHero/:id", heroController.updateHero);
router.delete("/deleteHero/:id", heroController.deleteHero);

//Hero Report Routes
router.get("/heroesExcel", reportController.heroesExcel);
router.get("/heroesPdf", reportController.heroesPdf);


router.use((req, res, next) => {
    return res.status(404).json({
        error: "Not Found",
    });
});

module.exports = router;