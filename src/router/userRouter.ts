import Router from 'express'
import { getAlluserDetails, getUserDetails, loginUser, regiseterUser } from '../controller/userController'
import { verifyToken } from '../utilites/jwtUtility'

export const userRouter=Router()

userRouter.route('/register').post(regiseterUser)
userRouter.route('/login').post(loginUser)
userRouter.route('/getuserdetails').get(verifyToken,getUserDetails)
userRouter.route('/getalluserdetails').get(verifyToken,getAlluserDetails)


