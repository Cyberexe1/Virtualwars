import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { sendAlertConfirmation } from '../services/emailService';
import { ApiError } from '../types';

const router = Router();

const AlertSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
});

/**
 * POST /api/alerts/subscribe
 * Sends an election alert confirmation email via Nodemailer.
 * No auth required — anyone can subscribe.
 */
router.post('/subscribe', async (req: Request, res: Response): Promise<void> => {
  const parseResult = AlertSchema.safeParse(req.body);

  if (!parseResult.success) {
    const error: ApiError = {
      error: parseResult.error.errors[0]?.message ?? 'Invalid email address',
      code: 'alerts/invalid-email',
    };
    res.status(400).json(error);
    return;
  }

  const { email } = parseResult.data;

  try {
    await sendAlertConfirmation(email);
    res.json({
      success: true,
      message: `Election alerts activated! A confirmation email has been sent to ${email}.`,
    });
  } catch (err) {
    console.error('[Alerts] Email send failed:', err);
    const error: ApiError = {
      error: 'Failed to send alert email. Please check your email address and try again.',
      code: 'alerts/send-failed',
    };
    res.status(500).json(error);
  }
});

export default router;
