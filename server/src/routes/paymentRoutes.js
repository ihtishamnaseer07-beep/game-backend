import express from 'express';
import { body } from 'express-validator';
import {
	listPaymentGateways,
	createPaymentGateway,
	createPaymentIntent,
	createDepositRequest,
	createWithdrawalRequest,
	listMyPaymentRequests,
	listPaymentRequestsForAdmin,
	approvePaymentRequest,
	rejectPaymentRequest,
} from '../controllers/paymentController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';

const router = express.Router();

router.get('/', listPaymentGateways);
router.post('/', createPaymentGateway);
router.post('/intent', createPaymentIntent);
router.get('/requests/me', authenticate, listMyPaymentRequests);
router.post(
	'/requests/deposit',
	authenticate,
	[body('amount').isFloat({ min: 100 }), body('gateway').notEmpty(), body('transactionId').notEmpty()],
	validateRequest,
	createDepositRequest
);
router.post(
	'/requests/withdrawal',
	authenticate,
	[body('amount').isFloat({ min: 500 }), body('gateway').notEmpty(), body('accountTitle').notEmpty(), body('accountNumber').notEmpty()],
	validateRequest,
	createWithdrawalRequest
);
router.get('/admin/requests', authenticate, authorize(['admin']), listPaymentRequestsForAdmin);
router.post('/admin/requests/:id/approve', authenticate, authorize(['admin']), approvePaymentRequest);
router.post('/admin/requests/:id/reject', authenticate, authorize(['admin']), rejectPaymentRequest);

export default router;
