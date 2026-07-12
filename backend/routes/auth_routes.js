import { Router } from "express";
import { signIn, signOut, signUp } from "../controllers/auth_controller.js";
import loginRateLimitMiddleware from "../middleware/login_rate_limit.js";

const authRouter  = Router();

authRouter.post('/sign-up', signUp)
authRouter.post('/sign-in', loginRateLimitMiddleware, signIn)
authRouter.post('/sign-out', signOut)

export default authRouter