
import mongoose from "mongoose";
import User from '../models/user.js'
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken'
import { JWT_SECRET,JWT_EXPIRES_IN } from "../config/env.js";


export const signUp = async(req,res,next) => {
    const session = await mongoose.startSession()

    session.startTransaction()
    try {

        const {name, email, password, role} = req.body

        // check for existing user
         const existingUser = await User.findOne({ email })

        if(existingUser) {
            const error = new Error("User already exists")
            error.statusCode = 409;
            throw error;
        }

        // hash password 
        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(password, salt)

        const newUsers = await User.create([{name, email, password : hashPassword, role}] ,{session})

        const token = jwt.sign({userId : newUsers[0]._id}, JWT_SECRET, { expiresIn : JWT_EXPIRES_IN})
        
        await session.commitTransaction()
        session.endSession()
        
        res.status(201).json({
            success : true,
            message : "User created successfully",
            data : {
                token,
                user :  newUsers[0]
            }
        })
    } catch (error) {
        await session.abortTransaction()
        session.endSession()
        next(error)
    }

}

export const signIn = async (req,res,next) => {
    
    try {
        const { email, password, role} = req.body
        const user = await User.findOne({email})

        if(!user){
            const error = new Error("User does not exist")
            error.statusCode = 404
            throw error;
        }

        // Check if user account is locked
        if(user.isLocked) {
            if(user.lockUntil && new Date() < user.lockUntil) {
                const error = new Error("Account is locked due to multiple failed login attempts. Please try again later.")
                error.statusCode = 429
                throw error
            } else {
                // Unlock if lock time has expired
                await User.findByIdAndUpdate(user._id, {
                    isLocked: false,
                    failedLoginAttempts: 0,
                    lockUntil: null
                })
            }
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)

        if(!isPasswordValid){
            // Increment failed attempts
            user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1

            // Lock account after 5 failed attempts
            if(user.failedLoginAttempts >= 5) {
                user.isLocked = true
                user.lockUntil = new Date(Date.now() + 1 * 60 * 1000) // Lock for 1 minute
                await user.save()
                const error = new Error("Account locked due to 5 failed login attempts. Please try again in a minute.")
                error.statusCode = 429
                throw error
            }

            await user.save()
            const error = new Error(`Password does not match. ${5 - user.failedLoginAttempts} attempts remaining.`)
            error.statusCode = 401
            throw error
        } 

        // Reset failed attempts on successful login
        await User.findByIdAndUpdate(user._id, {
            failedLoginAttempts: 0,
            isLocked: false,
            lockUntil: null
        })

        const token = jwt.sign({user : user._id} , JWT_SECRET, {expiresIn : JWT_EXPIRES_IN})

        res.status(200).json({
            status : true,
            message : "Signed-in successfully",
            data : {
                token,
                user ,
            }
        })   
    } 
    catch (error) {
        next(error)
    }
}
export const signOut = async (req,res,next) => {
    try {
        res.status(200).json({
        success: true,
        message: "Signed out successfully. Please clear your token on client-side."
    });
    } catch (error) {
        next(error)
    }
}
