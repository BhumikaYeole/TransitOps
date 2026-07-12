import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required : [true , "Username is required"],
        trim : true,
        minLength : 1,
        maxLength : 50,
    },
    email : {
        type : String,
        required : [true, "Email is required"],
        trim : true,
        unique : true,
        lowercase : true,
        match : [/\S+@\S+\.\S+/, 'Please fill a valid email address']
    },
    password : {
        type : String,
        required : [true, "Please enter password"],
        minLength : 6,
    },
    role : {
        type : String,
        enum : ['Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst', 'Driver'],
        required : [true, "Please select a role"],
        trim : true,
        default : 'Driver'
    },
    failedLoginAttempts : {
        type : Number,
        default : 0
    },
    isLocked : {
        type : Boolean,
        default : false
    },
    lockUntil : {
        type : Date,
        default : null
    }
} ,
    {
        timestamps : true
    }
)

const User = mongoose.model('User',userSchema)

export default User