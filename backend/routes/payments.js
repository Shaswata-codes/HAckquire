const express = require('express');
const router = express.Router();
const { getPayments, matchPayment, unmatchPayment, getReconciliation } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/reconciliation', getReconciliation);
router.get('/', getPayments);
router.put('/:id/match', matchPayment);
router.put('/:id/unmatch', unmatchPayment);

module.exports = router;
