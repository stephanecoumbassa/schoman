import { Router } from 'express';
import { 
  register, 
  login, 
  getProfile, 
  refreshAccessToken, 
  revokeToken, 
  revokeAllTokens 
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authenticate, getProfile);
router.post('/refresh', refreshAccessToken);
router.post('/revoke', authenticate, revokeToken);
router.post('/revoke-all', authenticate, revokeAllTokens);

export default router;
