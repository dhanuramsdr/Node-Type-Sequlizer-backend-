import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import { Autherequest } from '../interface/userInterface'
import { NextFunction,Response } from 'express'
dotenv.config()
const jwtecreate=process.env.JWT_SECRET 

export const generateToken=async(userid:number,email:string):Promise<string>=>{
    if(!jwtecreate){
throw new Error ("no secreatekey found")
    }
    const token= jwt.sign({
        userid,
        email
    },jwtecreate,{expiresIn:'24h'})    
    return token
}

export const verifyToken=(req:Autherequest,res:Response,next:NextFunction):void=>{
 try {
        const Authheader=req.headers.authorization 
        console.log('Authheader',Authheader);
        

        if(!Authheader||!Authheader.startsWith('Bearer ') ){
            throw new Error ('no token found')
        }

        const token=Authheader.substring(7)
          if(!token){
            console.log('token is not valied');
           res.status(401).json({message:'Access token is required'})
            return;
        }
        const verifyTokens=jwt.verify(token,jwtecreate!)as{
          email:string,
          userid:number,
          role:string
        }
        if(!verifyTokens){
            res.status(404).json({
                message:'not a valied token'
            })
        }
        console.log('verifyTokens',verifyTokens);
        
        req.user=verifyTokens
        next()
 } catch (error) {
    console.log(error);
    
    res.status(500).json({
           message:'error for generate token',
            error
    })
 }

}


export const authRole=(role:string)=>{
    return(req:Autherequest,res:Response,next:NextFunction)=>{
        try {
            if(!req.user){
        return res.status(401).json({ message: 'User not authenticated' });
        }
        if(req.user.role!==role){
             return res.status(403).json({ 
          message: `Access denied. Required role: ${role}` 
        });
        }
        next()

        } catch (error) {
       console.error('Role check error:', error);
      return res.status(500).json({ message: 'Internal server error' });   
        }
    }
}