
export const allowRoles = (...roles) =>{
    return (req, res, next) => {
        if(!roles.includes(req.user.role)){
            return res.status(403).json({
                message : "You do not have permission to access this resource"
            })
        }
    }
}

export const allowRole = (role) =>{
    return (req, res, next) => {
        if(req.user.role !== role) {
            return res.status(403).json({
                message : `${role}` + " role is required to access this resource"
            })
        }
    }
}