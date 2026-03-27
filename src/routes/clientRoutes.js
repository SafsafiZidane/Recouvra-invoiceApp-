const express = require("express");
const protectRoute = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/roleMiddleware");

const {CreateClient,
  getClients,
  getClientById,
  updateClient,
  deleteClient} = require('../controllers/clientController')

const router = express.Router();



router.post("/", protectRoute, authorizeRoles("admin","agent","manager"), CreateClient) ;

router.get("/",protectRoute,getClients);

router.get("/:id",protectRoute, getClientById);

router.put("/id",protectRoute, authorizeRoles("admin","manager"), updateClient);

router.delete("/:id",protectRoute, authorizeRoles("admin"), deleteClient);


module.exports = router;