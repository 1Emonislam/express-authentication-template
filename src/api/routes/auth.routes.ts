import express from 'express';
import { changePasswordHandler, forgetPasswordHandler, loginHandler, registerHandler, resetPasswordHandler } from '../controllers/auth.controllers';
const router = express.Router();
router.post('/login', loginHandler)
router.post('/register', registerHandler)
router.patch('/change-password', changePasswordHandler)
router.post('/forget-password', forgetPasswordHandler)
router.post('/reset-password/:token', resetPasswordHandler)

export default router;