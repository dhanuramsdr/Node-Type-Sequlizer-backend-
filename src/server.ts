import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { allRouter } from './router/allRouter'
dotenv.config()

const app = express()



app.use(cors())

// 2. Body parsers BEFORE routes
app.use(express.json())  
app.use(express.urlencoded({ extended: true })) // ← Also add this

// 3. Routes AFTER body parsers
app.use("/api/v1", allRouter)

const startServer = async () => {
    try {
        app.listen(process.env.PORT, (err) => {
            if (err) {
                console.log(err);
            }
            console.log('server start');
        })
    } catch (error) {
        console.log(error);
    }
}

startServer()
