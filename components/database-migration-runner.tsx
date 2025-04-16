"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, Database, AlertCircle, CheckCircle } from "lucide-react"

const MIGRATION_FILES = [
  { name: "Add Verification Link Column", value: "add-verification-link-column.sql" },
  { name: "Add Verification Requests Table", value: "add-verification-requests.sql" },
  { name: "Create Verification Triggers", value: "create-verification-trigger.sql" },
  { name: "Update Verification Types", value: "update-verification-types.sql" },
  { name: "Consolidate Verification Columns", value: "consolidate-verification-columns.sql" }
];

export default function DatabaseMigrationRunner() {
  const [selectedMigration, setSelectedMigration] = useState("add-verification-link-column.sql")
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleRunMigration = async () => {
    setIsRunning(true)
    setResults(null)
    setError(null)
    
    try {
      const response = await fetch(`/api/admin/run-migration?file=${selectedMigration}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to run migration")
      }
      
      setResults(data)
    } catch (err: any) {
      console.error("Error running migration:", err)
      setError(err.message || "Failed to run migration")
    } finally {
      setIsRunning(false)
    }
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Database Migrations</CardTitle>
        <CardDescription>Run database migrations to update schema</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Migration</label>
          <Select 
            value={selectedMigration} 
            onValueChange={setSelectedMigration}
            disabled={isRunning}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a migration file" />
            </SelectTrigger>
            <SelectContent>
              {MIGRATION_FILES.map((file) => (
                <SelectItem key={file.value} value={file.value}>
                  {file.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {results && (
          <div className="space-y-3 mt-4">
            <p className="text-sm font-medium">Results:</p>
            <div className="border rounded-md p-3 bg-muted/20">
              <p className="text-sm mb-2">{results.message}</p>
              <div className="space-y-2">
                {results.results?.map((result: any, index: number) => (
                  <div key={index} className="text-xs border-t pt-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={result.success ? "outline" : "destructive"} className={result.success ? "bg-green-100 text-green-800" : ""}>
                        {result.success ? (
                          <CheckCircle className="mr-1 h-3 w-3" />
                        ) : (
                          <AlertCircle className="mr-1 h-3 w-3" />
                        )}
                        {result.success ? "Success" : "Failed"}
                      </Badge>
                    </div>
                    <div className="mt-1 text-muted-foreground">
                      SQL: <span className="font-mono">{result.statement.substring(0, 50)}...</span>
                    </div>
                    {!result.success && (
                      <div className="mt-1 text-xs text-red-500">
                        {JSON.stringify(result.error)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleRunMigration} 
          disabled={isRunning || !selectedMigration}
          className="w-full"
        >
          {isRunning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running Migration...
            </>
          ) : (
            <>
              <Database className="mr-2 h-4 w-4" />
              Run Migration
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}