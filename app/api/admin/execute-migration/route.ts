import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
  try {
    // Read the SQL file (this works only in development mode)
    const sqlFilePath = path.join(process.cwd(), 'add-verification-requests.sql');
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
      message: "Migration executed", 
      results 
    });
  } catch (error) {
    console.error("Error executing migration:", error);
    return NextResponse.json({ error: "Failed to execute migration" }, { status: 500 });
  }
}