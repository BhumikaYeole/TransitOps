import { JWT_SECRET } from "../config/env.js";
import User from "../models/user.js";
import jwt from "jsonwebtoken"

const authorize = async (req,res,next) => {
    try {
        let token ;

        if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
            token = req.headers.authorization.split(' ')[1]
        }
        if(!token){
            return (
                res.status(401).json({ message : "Unauthorized access"})
            )
        }

        // console.log(token)

        const decoded = jwt.verify(token,JWT_SECRET)

        // console.log(decoded)

        const user = await User.findById(decoded.userId);
        
        // console.log(user)

        if(!user){
            return (
                res.status(401).json({ message : "Unauthorized User"})
            )
        }

        req.user = user;
        
        next()
    } catch (error) {
        res.status(401).json({
            message : "Unauthorized (illegal token) ",
            error : error.message
        })
    }
}

export default authorize
