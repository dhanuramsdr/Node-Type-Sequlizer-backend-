import { DataTypes } from "sequelize";
import { dbConnection } from "../db/dbConnection";


export const userRoleModel=dbConnection.define(
    'userRole',
    {
        Id:{
            type:DataTypes.INTEGER,
            autoIncrement:true,
            primaryKey:true
        },
        userId:{
            type:DataTypes.INTEGER,
            allowNull:false,
        references:{
                model:'Users',
                key:'Id'
            }
            
        },
        roleId:{
            type:DataTypes.INTEGER,
            allowNull:false,
            references:{
                model:'Role',
                key:'Id'
            }

        }        
    },
    {
        tableName:'userRole',
        timestamps:true
    }
)