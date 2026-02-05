import { DataTypes } from "sequelize";
import { dbConnection } from "../db/dbConnection";

export const productModel=dbConnection.define(
"Product",
{
    Id:{
     type:DataTypes.INTEGER,
     autoIncrement:true,
     primaryKey:true
    },
    Productname:{
        type:DataTypes.STRING,
        allowNull:false
    },
    CloudinaryPublicId:{
        type:DataTypes.STRING,
        allowNull:false,
        defaultValue:""
    },
    Image:{
        type:DataTypes.STRING,
        allowNull:false,
        defaultValue:""
    },
    Sellerid:{
        type:DataTypes.INTEGER,
        allowNull:false,
        references:{
            model:'Users',
            key:'Id'
        },
    }
},{
    tableName:"Product",
    timestamps:true,
    indexes:[
        { 
            name:'idx_productname',
            fields:['Productname']
        }
    ]
}
)