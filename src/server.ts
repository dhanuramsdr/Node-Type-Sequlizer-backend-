import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { allRouter } from './router/allRouter'
dotenv.config()

const app = express()



app.use(cors())

app.use(express.json())  
app.use(express.urlencoded({ extended: true })) 


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
