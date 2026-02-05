import { Sequelize } from "sequelize";
import dot from 'dotenv';

dot.config()

export const dbConnection = new Sequelize(
    process.env.DB_NAME as string,
    process.env.DB_USER as string,
    process.env.DB_PASSWORD as string,
    {       
        host: process.env.DB_HOST as string,
        port: parseInt(process.env.DB_PORT || '5432'),
        dialect: 'postgres',
        logging: false,
        
        // ADD THIS SSL CONFIGURATION FOR AWS RDS
        dialectOptions: {
            ssl: {
                require: true,           // AWS RDS requires SSL
                rejectUnauthorized: false // For self-signed certificates
            }
        },
        
        pool: {
            max: 5,
            min: 0,
            acquire: 3000,
            idle: 1000
        },
        define: {
            timestamps: true,
            paranoid: false,
            underscored: false,
            freezeTableName: true
        }
    }
);