import { DataTypes, Model, Optional } from "sequelize";
import { dbConnection } from "../db/dbConnection";
import { hashPassword } from "../utilites/passwordUtility";

// Define User attributes interface
interface UserAttributes {
  Id: number;
  Name: string;
  Email: string;
  Password: string;
}

// Define creation attributes (Id is optional for creation)
interface UserCreationAttributes extends Optional<UserAttributes, 'Id'> {}

// Use the built-in Model type without overriding changed
export type UserInstance = Model<UserAttributes, UserCreationAttributes> & UserAttributes;

export const userModel = dbConnection.define<UserInstance>(
  "Users",
  {
    Id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    Name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Please provide the name"
        },
      }
    },
    Email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Please provide the email"
        },
        len: [2, 50],
        isEmail: {
          msg: "Please provide a valid email"
        }
      }
    },
    Password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Please provide the password"
        },
        len: {
          args: [6, 100],
          msg: "Password must be at least 6 characters long"
        }
      }
    }
  },
  {
    tableName: 'Users',
    indexes: [
      {
        name: 'id_user_name',
        fields: ['Name']
      }
    ],
    hooks: {
      beforeCreate: async (user: UserInstance) => {
        console.log('Before create - Raw password:', user.Password);
        if (user.Password) {
          const hashedPassword = await hashPassword(user.Password);
          console.log('After hash:', hashedPassword);
          user.Password = hashedPassword;
        }
      },
      beforeUpdate: async (user: UserInstance) => {
        // Check if password was changed
        const changedFields = user.changed();
        if (changedFields && Array.isArray(changedFields) && changedFields.includes('Password')) {
          console.log('Updating password');
          if (user.Password) {
            user.Password = await hashPassword(user.Password);
          }
        }
      }
    }
  }
);

export type { UserAttributes, UserCreationAttributes };