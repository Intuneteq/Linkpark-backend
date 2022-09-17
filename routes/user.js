const express = require('express');
const router = express.Router();
const {getAllUsers, getUser, deleteUser} = require('../controllers/userController');

router.get('/', getAllUsers);
router.delete('/', deleteUser);
router.route('/:id')
    .get(getUser);

module.exports = router;