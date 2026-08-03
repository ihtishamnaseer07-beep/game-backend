import express from 'express';
import { listPaymentGateways, createPaymentGateway, createPaymentIntent } from '../controllers/paymentController.js';

const router = express.Router();

router.get('/', listPaymentGateways);
router.post('/', createPaymentGateway);
router.post('/intent', createPaymentIntent);

export default router;
