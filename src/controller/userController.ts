import {Request,Response} from 'express'
import { Autherequest, userinterface, userinterfaceLogin } from '../interface/userInterface'
import { userModel } from '../models/userModels';
import { comparePassword } from '../utilites/passwordUtility';
import { generateToken } from '../utilites/jwtUtility';
import { Op } from 'sequelize';
import { userRoleModel } from '../models/userRoles';

export const regiseterUser=async(req:Request,res:Response):Promise<void>=>{
 try {
    const { name, email, password, roleId }: userinterface = req.body;    
    // Create User
    const result = await userModel.create({
      Name: name, 
      Email: email,
      Password: password
    });    
    const userId = result.dataValues?.Id 
    // Create User-Role association
    const resultRole = await userRoleModel.create({
      userId: userId,  // This is likely undefined/null
      roleId: roleId
    });
    
    console.log("resultRole", resultRole.toJSON());
    
    res.status(201).json({
      message: "User registered successfully",
      userId: userId,
      roleId: roleId
    });

  } catch (error) {
    console.log("FULL ERROR:", error);
    res.status(500).json({
      message: "internal error",
      error: error
    });
  }
}
export const loginUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password }: userinterfaceLogin = req.body;

           
        if (!email || !password) {
            res.status(400).json({ message: "Email and password are required" });
            return;
        }

        console.log(email,password);
        

        const user = await userModel.findOne({ where: { Email: email } });

        if (!user) {
            res.status(401).json({ message: "Invalid credentials - User not found" });
            return;
        }

        // ✅ Get the user as plain object
        const userData = user.get({ plain: true }) ;
        
        // ✅ Debug: log what fields are available
        console.log('User data fields:', Object.keys(userData));
        console.log('User ID:', userData.Id, 'Type:', typeof userData.Id);
        console.log('User email:', userData.Email);
        console.log('Password exists:', !!userData.Password);
        
        const verifypassword = await comparePassword(password, userData.Password);
        
        if (!verifypassword) {
            res.status(401).json({ message: "Invalid credentials - Wrong password" });
            return;
        }
        
        // ✅ Pass the correct ID field (probably userData.Id, not userData.userId)
        const token = await generateToken(userData.Id, userData.Email);
        
        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: userData.Id,
                name: userData.Name,
                email: userData.Email
            }
        });

    } catch (error) {
        console.error('Login error details:', error);
        res.status(500).json({
            message: "Internal server error",
        });
    }
}

export const  getUserDetails=async(req:Autherequest,res:Response)=>{
try {
    const userid=req.user?.userid;
    console.log(userid);
    
    const result=await userModel.findByPk(userid,{attributes:['name','email']});
     if (!result) {
            res.status(401).json({ message: "Invalid credentials - User not found" });
            return;
        } 
        res.status(200).json({ message: "user found",result });
            return;

} catch (error) {
    console.error('Login error details:', error);
        res.status(500).json({
            message: "Internal server error",
        });
}
}

export const getAlluserDetails=async(req:Request,res:Response)=>{
    try {
        const page=Number(req.query.page)
        const limit=Number(req.query.limit)
        const search=req.query.search as string
        console.log(page,limit,search);
        
        const where=search ? {
            Name:{[Op.like]:`%${search}%` }
        }:{};

        console.log(where);
        

        const users=await userModel.findAndCountAll({
            where,
            limit,
            offset:(page-1)*limit,
            order:[['createdAt','DESC']]
        });

        console.log(users);
        

        if(!users){
            res.status(404).json({
                message:'users data not found'
            })
        }

         res.status(200).json({
            total: users.count,
            data: users.rows
        });


    } catch (error) {
    console.log(error);
    
        res.status(500).json({ error: 'Server error' });

    }
}



