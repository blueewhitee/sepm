import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
  try {
    // Allow specifying a migration file via query param
    const url = new URL(req.url);
    const migrationFile = url.searchParams.get('file') || 'add-verification-link-column.sql';
    
    // Read the SQL file
    const sqlFilePath = path.join(process.cwd(), migrationFile);
    
    if (!fs.existsSync(sqlFilePath)) {
      return NextResponse.json({ 
        error: "Migration file not found",
        message: `The ${migrationFile} file was not found.`
      }, { status: 404 });
    }
    
    const sql = fs.readFileSync(sqlFilePath, 'utf-8');
    
    // Split by semicolons to execute multiple statements
    const sqlStatements = sql
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);
    
    const results = [];
    
    // Execute each SQL statement
    for (const statement of sqlStatements) {
      try {
        const { data, error } = await supabase.rpc('pg_execute', { 
          query: statement + ';' 
        });
        
        if (error) {
          results.push({ statement, success: false, error });
        } else {
          results.push({ statement, success: true });
        }
      } catch (err) {
        results.push({ statement, success: false, error: err });
      }
    }
    
    return NextResponse.json({ 
      message: `Migration ${migrationFile} executed`, 
      results 
    });
  } catch (error) {
    console.error("Error executing migration:", error);
    return NextResponse.json({ error: "Failed to execute migration" }, { status: 500 });
  }
}