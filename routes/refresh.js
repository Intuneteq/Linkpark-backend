const express = require('express');
const router = express.Router();
const refreshToken = require('../controllers/refreshController');

router.get('/', refreshToken.handleRefreshToken);

module.exports = router;