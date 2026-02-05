import Router from'express'
import { userRouter } from './userRouter'
import { productRouter } from './productRouter'

export const allRouter=Router()

allRouter.use('/user',userRouter)
allRouter.use('/product',productRouter)
