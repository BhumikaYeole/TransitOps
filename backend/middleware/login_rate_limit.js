import User from "../models/user.js";

const loginRateLimitMiddleware = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return next();
        }

        // Find user to check lock status
        const user = await User.findOne({ email });

        if (user) {
            // Check if account is currently locked
            if (user.isLocked && user.lockUntil) {
                const now = new Date();
                
                if (now < user.lockUntil) {
                    const remainingTime = Math.ceil((user.lockUntil - now) / 60000); // minutes
                    return res.status(429).json({
                        success: false,
                        message: `Account is locked. Please try again in ${remainingTime} minutes.`,
                        remainingLockTime: remainingTime
                    });
                } else {
                    // Unlock if lock time has expired
                    await User.findByIdAndUpdate(user._id, {
                        isLocked: false,
                        failedLoginAttempts: 0,
                        lockUntil: null
                    });
                }
            }
        }

        next();
    } catch (error) {
        console.error("Login rate limit error:", error);
        next(error);
    }
};

export default loginRateLimitMiddleware;
