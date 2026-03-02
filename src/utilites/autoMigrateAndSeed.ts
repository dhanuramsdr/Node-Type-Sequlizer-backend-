import { dbConnection } from '../db/dbConnection';
import fs from 'fs';
import path from 'path';
import { Model, ModelStatic, Optional } from 'sequelize';

// IMPORT YOUR MODELS HERE ⬇️
import '../models/userModels';
import '../models/Roles';
import '../models/userRoles';

interface CsvFile {
  fileName: string;
  order?: number;
}

interface CsvMetadata {
  csvFiles: CsvFile[];
}

// Define specific types for each model's data
interface UserData {
  Name: string;
  Email: string;
  Password: string;
  [key: string]: string;
}

interface RoleData {
  name: string;
  description: string;
  [key: string]: string;
}

interface UserRoleData {
  userId: string;
  roleId: string;
  [key: string]: string;
}

// Model-specific data transformers with proper return types
const transformUserData = (row: Record<string, string>): UserData => ({
  Name: row.Name || row.name || '',
  Email: row.Email || row.email || '',
  Password: row.Password || row.password || ''
});

const transformRoleData = (row: Record<string, string>): RoleData => ({
  name: row.name || row.Name || '',
  description: row.description || row.Description || ''
});

const transformUserRoleData = (row: Record<string, string>): UserRoleData => ({
  userId: row.userId || row.UserId || row.user_id || '',
  roleId: row.roleId || row.RoleId || row.role_id || ''
});

// Define transformer type
type DataTransformer = (row: Record<string, string>) => Record<string, string | number | boolean>;

// Map model names to transformers
const transformers: Record<string, DataTransformer> = {
  Users: transformUserData,
  Roles: transformRoleData,
  UserRoles: transformUserRoleData
};

export const autoMigrateAndSeed = async (): Promise<void> => {
  console.log('🚀 Starting migration...');
  
  try {
    await dbConnection.authenticate();
    console.log('✅ Database connection established');
    
    await dbConnection.sync({ alter: true });
    console.log('✅ Database sync completed');
    
    await seedFromCSV();
    
    console.log('✅ Migration completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

async function seedFromCSV(): Promise<void> {
  const csvPath = path.join(process.cwd(), 'src', 'DataSeed', 'CSV');
  const metaPath = path.join(process.cwd(), 'src', 'DataSeed', 'CsvOrderExe.json');
  
  // Skip if no metadata
  if (!fs.existsSync(metaPath)) {
    console.log('⚠️ No metadata file found, skipping CSV seeding');
    return;
  }
  
  // Check if CSV directory exists
  if (!fs.existsSync(csvPath)) {
    console.log(`⚠️ CSV directory not found at ${csvPath}`);
    return;
  }
  
  try {
    // Read metadata with proper typing
    const metaContent = fs.readFileSync(metaPath, 'utf8');
    const meta: CsvMetadata = JSON.parse(metaContent);
    const files = meta.csvFiles || [];
    
    if (files.length === 0) {
      console.log('⚠️ No CSV files specified in metadata');
      return;
    }
    
    console.log(`📁 Found ${files.length} CSV files to process`);
    
    // Process each file
    for (const file of files) {
      const filePath = path.join(csvPath, file.fileName);
      
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️ File not found: ${file.fileName}`);
        continue;
      }
      
      await processCSV(file.fileName, filePath);
    }
    
    console.log('✅ CSV seeding completed');
  } catch (error) {
    console.error('❌ Error reading metadata:', error);
  }
}

async function processCSV(fileName: string, filePath: string): Promise<void> {
  try {
    console.log(`📄 Processing ${fileName}...`);
    
    // Read and parse CSV
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.trim().split('\n');
    
    if (lines.length < 2) {
      console.log(`⚠️ ${fileName} has no data rows`);
      return;
    }
    
    const headers = lines[0].split(',').map(header => header.trim());
    const data: Record<string, string>[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue; // Skip empty lines
      
      // Handle quoted values properly (simple version)
      const values = line.split(',').map(value => value.trim());
      const row: Record<string, string> = {};
      
      headers.forEach((header, idx) => {
        row[header] = values[idx]?.trim() || '';
      });
      
      data.push(row);
    }
    
    if (data.length === 0) {
      console.log(`⚠️ No valid data found in ${fileName}`);
      return;
    }
    
    // Get model name from filename
    let modelName = fileName.replace('.csv', '');
    
    // Handle patterns like "01.users.csv" or "01-users.csv" or "01_users.csv"
    const match = modelName.match(/\d+[-_]?(.+)/);
    if (match && match[1]) {
      modelName = match[1];
    }
    
    // Remove any remaining numbers or special characters at the beginning
    modelName = modelName.replace(/^[\d-_]+/, '');
    
    // Convert to PascalCase (first letter uppercase, rest as is)
    modelName = modelName.charAt(0).toUpperCase() + modelName.slice(1);
    
    console.log(`🔍 Looking for model: ${modelName}`);
    console.log('📋 Available models:', Object.keys(dbConnection.models));
    
    // Find model with proper typing
    const Model = dbConnection.models[modelName] as ModelStatic<Model> | undefined;
    
    if (!Model) {
      console.log(`❌ Model ${modelName} not found`);
      console.log('💡 Available models:', Object.keys(dbConnection.models).join(', '));
      return;
    }
    
    // Check if table is empty
    const count = await Model.count();
    
    if (count === 0) {
      console.log(`📊 Inserting ${data.length} records into ${modelName}...`);
      
      // Transform data using the appropriate transformer if available
      const transformer = transformers[modelName];
      let dataToInsert: Record<string, any>[];
      
      if (transformer) {
        dataToInsert = data.map(row => transformer(row));
        console.log(`🔄 Transformed data for ${modelName} model`);
      } else {
        // If no transformer, use the data as is
        dataToInsert = data;
        console.log(`⚠️ No transformer found for ${modelName}, using raw data`);
      }
      
      // Insert data
      await Model.bulkCreate(dataToInsert, {
        validate: true,
        logging: false // Set to true if you want to see SQL queries
      });
      
      console.log(`✅ Seeded ${data.length} rows to ${modelName}`);
    } else {
      console.log(`⏭️ ${modelName} already has ${count} records, skipping`);
    }
    
  } catch (error) {
    console.error(`❌ Error with ${fileName}:`, error);
    // Log more details about the error
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Stack:', error.stack);
    }
  }
}