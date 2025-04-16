import { NextRequest, NextResponse } from "next/server"
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
  try {
    // Read the SQL file
    const sqlFilePath = path.join(process.cwd(), 'add-verification-requests.sql');
    
    if (!fs.existsSync(sqlFilePath)) {
      return NextResponse.json({ 
        error: "Migration file not found",
        message: "The add-verification-requests.sql file was not found."
      }, { status: 404 });
    }
    
    const sql = fs.readFileSync(sqlFilePath, 'utf-8');
    
    return NextResponse.json({ 
      message: "Migration script found", 
      sql: sql
    });
  } catch (error) {
    console.error("Error reading migration file:", error);
    return NextResponse.json({ error: "Failed to read migration file" }, { status: 500 });
  }
}