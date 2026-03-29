const express = require("express");
const protectRoute = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");

const {CreateClient,
  getClients,
  getClientById,
  updateClient,
  deleteClient} = require('../controllers/client.controller');
const validate = require("../middlewares/validation.middleware");
const { updateClientSchema, createClientSchema } = require("../validators/client.validator");

const router = express.Router();



router.post("/", protectRoute,validate(createClientSchema), authorizeRoles("admin","agent","manager"), CreateClient) ;

router.get("/",protectRoute,getClients);

router.get("/:id",protectRoute, getClientById);

router.put("/:id",protectRoute,validate(updateClientSchema), authorizeRoles("admin","manager"), updateClient);

router.delete("/:id",protectRoute, authorizeRoles("admin"), deleteClient);


module.exports = router;