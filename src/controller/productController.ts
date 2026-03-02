import { Request, Response } from 'express';
import { uploadToCloudinary } from "../utilites/cloudinary";
import { productModel } from "../models/productModels";
import { Op, WhereOptions, Order } from 'sequelize';

// Define a more flexible type for Sequelize where conditions
type SequelizeWhere = {
  Productname?: {
    [Op.like]: string;
  };
  createdAt?: {
    [Op.gte]?: Date;
    [Op.lte]?: Date;
  };
};

interface ProductQueryOptions {
  where: WhereOptions;
  limit: number;
  offset: number;
  order: Order;
}

interface ProductUpdateBody {
  Productname?: string;
  Image?: string;
  CloudinaryPublicId?: string;
  Sellerid?: number;
}

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract data
    const { Productname, Sellerid } = req.body;
    const file = req.file;

    // Validate input
    if (!file) {
      res.status(400).json({ success: false, message: 'Image is required' });
      return;
    }

    if (!Productname || !Sellerid) {
      res.status(400).json({ success: false, message: 'Product name and seller ID are required' });
      return;
    }

    // Upload to Cloudinary with transformations
    const uploadResult = await uploadToCloudinary(file.buffer, {
      folder: 'products',
      transformation: [
        { width: 1200, height: 800, crop: 'limit' },
        { quality: 'auto:good' }
      ]
    });

    // Save to database
    await productModel.create({
      Productname,
      Image: uploadResult.secure_url,
      CloudinaryPublicId: uploadResult.public_id,
      Sellerid: parseInt(Sellerid, 10)
    });

    // Send response
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
    });

  } catch (error: unknown) {
    console.error('Create product error:', error);

    // Handle specific errors with type checking
    if (error instanceof Error) {
      if (error.message.includes('File too large')) {
        res.status(400).json({ success: false, message: 'File too large. Max 5MB' });
      } else if (error.message.includes('Only images')) {
        res.status(400).json({ success: false, message: 'Only image files allowed' });
      } else if (error.message.includes('Cloudinary')) {
        res.status(500).json({ success: false, message: 'Image upload failed' });
      } else {
        res.status(500).json({ 
          success: false, 
          message: 'Server error',
          ...(process.env.NODE_ENV === 'development' && { error: error.message })
        });
      }
    } else {
      res.status(500).json({ 
        success: false, 
        message: 'Server error'
      });
    }
  }
};

export const getAllProdutsAlter = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const sort = req.query.sort as string || 'createdAt';
    const search = req.query.search as string || '';
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    const sortOrder = "DESC";
    const offset = (page - 1) * limit;
    
    const filter: SequelizeWhere = {};

    if (search) {
      filter.Productname = {
        [Op.like]: `%${search}%`
      };
    }

    if (startDate || endDate) {
      filter.createdAt = {};
    }

    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      if (filter.createdAt) {
        filter.createdAt[Op.gte] = start;
      }
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      if (filter.createdAt) {
        filter.createdAt[Op.lte] = end;
      }
    }
    
    const queryOption: ProductQueryOptions = {
      where: filter as WhereOptions,
      limit: limit,
      offset: offset,
      order: [[sort, sortOrder]]
    };

    const { count: totalCount, rows: products } = await productModel.findAndCountAll(queryOption);

    if (!products || products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No products found"
      });
    }

    res.status(200).json({
      success: true,
      data: products,
      totalCount: totalCount
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export const getAllProduct = async (req: Request, res: Response) => {
  try {
    // Extract query parameters with default values
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const search = req.query.search as string || '';
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    const sortBy = req.query.sortBy as string || 'createdAt';
    
    // Set DESC as default sort order
    const sortOrder = 'DESC';

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions: SequelizeWhere = {};

    // Add search filter for product name
    if (search) {
      whereConditions.Productname = {
        [Op.like]: `%${search}%`
      };
    }

    // Add date filter
    if (startDate || endDate) {
      whereConditions.createdAt = {};
      
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (whereConditions.createdAt) {
          whereConditions.createdAt[Op.gte] = start;
        }
      }
      
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (whereConditions.createdAt) {
          whereConditions.createdAt[Op.lte] = end;
        }
      }
    }

    // Build query option
    const queryOptions: ProductQueryOptions = {
      where: whereConditions as WhereOptions,
      limit: limit,
      offset: offset,
      order: [[sortBy, sortOrder]],
    };

    // Get total count for pagination metadata
    const totalCount = await productModel.count({
      where: whereConditions as WhereOptions
    });

    // Get paginated results
    const products = await productModel.findAll(queryOptions);

    if (!products || products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No products found"
      });
    }

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
      success: true,
      message: "Products retrieved successfully",
      data: products,
      pagination: {
        currentPage: page,
        limit: limit,
        totalItems: totalCount,
        totalPages: totalPages,
        hasNextPage: hasNextPage,
        hasPrevPage: hasPrevPage,
        nextPage: hasNextPage ? page + 1 : null,
        prevPage: hasPrevPage ? page - 1 : null
      },
      filters: {
        search: search,
        startDate: startDate,
        endDate: endDate,
        sortBy: sortBy,
        sortOrder: sortOrder
      }
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData: ProductUpdateBody = req.body;
    
    const [affectedCount] = await productModel.update(updateData, { 
      where: { Id: id } as WhereOptions
    });
     
    if (affectedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or no changes made'
      });
    } 
      
    res.status(200).json({
      success: true,
      message: 'Data updated successfully'
    });

  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });   
  }
};