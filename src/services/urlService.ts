import { UrlMapping } from "../types/types";
import { promises as fs } from "fs";
import path from "path";
import { generateRandomCode } from "../utils/utils";

const STORAGE_FILE = path.join(__dirname, "../../data/urls.json");

//Ensure the data directory exists
async function ensureDataDirectory(): Promise<void> {
  const dataDir = path.dirname(STORAGE_FILE);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

//Read all URL mappings from JSON file
//This is done and saved in the mapping state to ensure
//and cut down on file I/O operations
async function readFromFile(): Promise<UrlMapping[]> {
  try {
    await ensureDataDirectory();
    const data = await fs.readFile(STORAGE_FILE, 'utf-8');
    const mappings: UrlMapping[] = JSON.parse(data);
    console.log(`Read ${mappings.length} URL mappings from file`);
    return mappings;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      console.log('No existing data file found, creating initial file');
      return [];
    } else {
      console.error('Error reading URL mappings from file:', error);
      throw error;
    }
  }
}

//Write URL mappings to JSON file
async function writeToFile(mappings: UrlMapping[]): Promise<void> {
  try {
    await ensureDataDirectory();
    const data = JSON.stringify(mappings, null, 2);
    await fs.writeFile(STORAGE_FILE, data, 'utf-8');
    console.log(`Wrote ${mappings.length} URL mappings to file`);
  } catch (error) {
    console.error('Error writing URL mappings to file:', error);
    throw error;
  }
}

//Generate a unique code that doesn't already exist
async function generateUniqueCode(): Promise<string> {
  const mappings = await readFromFile();
  let code: string;
  let attempts = 0;
  const maxAttempts = 20;
  
  do {
    code = generateRandomCode();
    attempts++;
    
    if (attempts > maxAttempts) {
      throw new Error('Failed to generate unique code after maximum attempts');
    }
  } while (mappings.some(mapping => mapping.shortenedCode === code));
  
  return code;
}

//Create a new URL mapping
export async function createUrlMapping(originalUrl: string): Promise<UrlMapping> {
  const mappings = await readFromFile();

  // Check if URL already exists
  const existing = mappings.find(m => m.originalUrl === originalUrl);
  if (existing) {
    console.log(`URL already exists with code: ${existing.shortenedCode}`);
    return existing;
  }

  // Otherwise create new mapping
  const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
  const shortenedCode = await generateUniqueCode();
  
  const mapping: UrlMapping = {
    id,
    originalUrl,
    shortenedCode,
    createdAt: new Date()
  };

  mappings.push(mapping);
  await writeToFile(mappings);

  return mapping;
}


// Get URL mapping by shortened code
export async function getUrlMappingByCode(code: string): Promise<UrlMapping | null> {
  const mappings = await readFromFile();
  return mappings.find(m => m.shortenedCode === code) || null;
}

