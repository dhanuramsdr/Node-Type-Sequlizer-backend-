import {    Router} from 'express'
import { uploadSingle } from '../utilites/multerutilit'
import { createProduct, getAllProduct, getAllProdutsAlter, updatedate } from '../controller/productController'

export const productRouter=Router()

productRouter.route("/addproduct").post(uploadSingle,createProduct)
productRouter.route("/allproduct").get(getAllProduct)
productRouter.route("/allproductalter").get(getAllProdutsAlter)

productRouter.route("/updatedata/:id").put(updatedate)

