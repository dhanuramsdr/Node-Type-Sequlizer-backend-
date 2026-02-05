import { dbConnection } from '../db/dbConnection';
import fs from 'fs';
import path from 'path';

// IMPORT YOUR MODELS HERE ⬇️
import '../models/userModels';
import '../models/Roles';
import '../models/userRoles';

export const autoMigrateAndSeed = async () => {
  console.log('Starting migration...');
  
  await dbConnection.authenticate();
  await dbConnection.sync({ alter: true });
  
  await seedFromCSV();
  
  console.log('Migration completed');
};

async function seedFromCSV() {
  const csvPath = path.join(process.cwd(), 'src', 'DataSeed', 'CSV');
  const metaPath = path.join(process.cwd(), 'src', 'DataSeed', 'CsvOrderExe.json');
  
  // Skip if no metadata
  if (!fs.existsSync(metaPath)) {
    console.log('No metadata file');
    return;
  }
  
  // Read metadata
  const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
  const files = meta.csvFiles;
  
  // Process each file
  for (const file of files) {
    const filePath = path.join(csvPath, file.fileName);
    
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${file.fileName}`);
      continue;
    }
    
    await processCSV(file.fileName, filePath);
  }
  
  console.log('CSV seeding done');
}

async function processCSV(fileName: string, filePath: string) {
  try {
    // Read and parse CSV
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.trim().split('\n');
    const headers = lines[0].split(',');
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      const row: any = {};
      
      headers.forEach((h, idx) => {
        row[h.trim()] = values[idx]?.trim() || '';
      });
      
      data.push(row);
    }
    
    if (data.length === 0) return;
    
    // Get model name
    let modelName = fileName.replace('.csv', '');
    if (modelName.includes('.')) {
      modelName = modelName.split('.')[1];
    }
    
    // Capitalize first letter
    modelName = modelName.charAt(0).toUpperCase() + modelName.slice(1);
    
    // Debug: Check available models
    console.log('Available models:', Object.keys(dbConnection.models));
    
    // Find model
    const Model = dbConnection.models[modelName];
    if (!Model) {
      console.log(`Model ${modelName} not found in:`, Object.keys(dbConnection.models));
      return;
    }
    
    // Insert if empty
    const count = await Model.count();
    if (count === 0) {
      await Model.bulkCreate(data);
      console.log(`Seeded ${data.length} rows to ${modelName}`);
    } else {
      console.log(`${modelName} already has ${count} records`);
    }
    
  } catch (error) {
    console.log(`Error with ${fileName}:`, error);
  }
}