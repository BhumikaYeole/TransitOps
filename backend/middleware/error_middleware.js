const errorMiddleware = (err,req,res,next) => {
        let error = {...err}

        error.message = err.message

        console.log(err)

        // bad objectId
        if(err.name === 'CastError'){
            const message = "Resourse not found"
            error = new Error(message);
            error.statusCode = 404;
        }        

        // duplicate key
        if(err.code === 11000){
            const message = "Duplicate field value entered";
            error = new Error(message);
            error.statusCode = 400
        }
        
        // validation error
        if(err.name === 'ValidationError'){
            const message = Object.values(err.errors).map(val => val.message)
            error = new Error(message.join(', '));
            error.statusCode = 400
        }
        
        res.status(error.statusCode || 500).json( { success : false , error : error.message || 'server error'})
}

export default errorMiddleware