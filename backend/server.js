import express from "express"
import { PORT } from "./config/env.js"
import connectToDatabase from "./database/mongodb.js"
import cookieParser from "cookie-parser"

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({extended : false}))


app.get("/", (req,res) => {
    res.send("TransitOps running")
})

app.listen(PORT, async () => {
    console.log(`TransitOps running at http://localhost:${PORT}`)
    await connectToDatabase()
})

export default app;