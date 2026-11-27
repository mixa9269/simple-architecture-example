import { Router } from 'express';
import { logIn } from '~/tasks/logIn';
import { sendResult } from './sendResult';

export const authRoutes = Router();

// POST /api/login { email } → LoginAnswer
authRoutes.post('/', (req, res) => {
  const email = typeof req.body?.email === 'string' ? req.body.email : '';
  sendResult(res, logIn(email));
});
