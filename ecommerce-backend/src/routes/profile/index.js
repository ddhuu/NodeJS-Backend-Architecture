"use strict";

const express = require("express");
const router = express.Router();
const { profile, profiles } = require("../../controllers/profile.controller");
const { grantAccess } = require("../../middewares/rbac");

// admin

router.get("/viewAny", grantAccess("readAny", "profile"), profiles);

// shop

router.get("/viewOwn", grantAccess("readOwn", "profile"), profile);

module.exports = router;
