const express = require('express');
const router = express.Router();
const tradeController = require('../controllers/tradeController');
const auth = require('../middleware/auth');

// Barcha yo'nalishlar 'auth' middleware bilan himoyalangan
router.get('/', auth, tradeController.getTrades);
router.post('/', auth, tradeController.createTrade);
router.put('/:id', auth, tradeController.updateTrade);
router.delete('/:id', auth, tradeController.deleteTrade);

module.exports = router;