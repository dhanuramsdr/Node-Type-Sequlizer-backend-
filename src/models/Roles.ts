import { DataTypes } from "sequelize";
import { dbConnection } from "../db/dbConnection";

export const roleModel=dbConnection.define(
    "Role",
    {
        Id:{
            type:DataTypes.INTEGER,
            autoIncrement:true,
            primaryKey:true
        },
        Name:{
            type:DataTypes.ENUM('User','Admin','Seller'),
            allowNull:false,
            validate:{
                isIn:{
                    args:[['User','Admin','Seller']],
                    msg: "Role must be either user, admin, or seller"
                }
            }
                    
        }
    },{
        tableName:'Role',
        timestamps:true
    }
);

