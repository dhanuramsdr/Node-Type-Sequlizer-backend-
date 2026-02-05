import { InferAttributes, InferCreationAttributes, Model } from "sequelize"
import { Request } from "express"
export interface Autherequest extends Request{
user?:{
userid:number,
email:string,
role:string
}
}

export interface  userModelInterface extends Model<InferAttributes<userModelInterface>,InferCreationAttributes<userModelInterface>>{
    Name:string,
    Email:string,
    Password:string
}

//user
export interface userinterface{
    name:string,
    email:string,
    password:string,
    roleId:number
}

export interface userinterfaceLogin{
    email:string,
    password:string
}

export interface AllUserResponse {
  id: number;
  name: string;
  email: string;
  age?: number;
  role?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Paginations{
    page:number;
    limit:number;
    total:number;
    search:string
}

