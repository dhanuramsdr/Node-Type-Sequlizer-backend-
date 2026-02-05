import { DataTypes } from "sequelize";
import { dbConnection } from "../db/dbConnection";
import { hashPassword } from "../utilites/passwordUtility";
import { userModelInterface } from "../interface/userInterface";


export const userModel=dbConnection.define(
    "Users",
    {
        Id:{
            type:DataTypes.INTEGER,
            autoIncrement:true,
            primaryKey:true
        },
        Name:{
            type:DataTypes.STRING,
            allowNull:false,
            validate:{
                 notEmpty: {
          msg:"please provide the name"
        },
                
            }
        },
        Email:{
            type:DataTypes.STRING,
            allowNull:false,
            validate:{
 notEmpty: {
          msg:"please provide the name"
        },                len:[2,50],
            }
        },
        Password:{
            type:DataTypes.STRING,
            allowNull:false,
            validate:{
                 notEmpty: {
          msg:"please provide the name"
        },
            }
        }
    },
    // In userModel.js, add logging to hooks:
{
    tableName:'Users',
    indexes:[
        {
            name:'id_user_name',
            fields:['Name']
        }
    ],
    hooks: {
        beforeCreate: async (user: any) => {
            console.log('Before create - Raw password:', user.Password);
            user.Password = await hashPassword(user.Password);
            console.log('After hash:', user.Password);
        },
        beforeUpdate: async (user: any) => {
            if (user.changed("Password")) {
                console.log('Updating password');
                user.Password = await hashPassword(user.Password);
            }
        }
    }
}
)