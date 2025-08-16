#!/usr/bin/env node
/**
 * Script to enable API versioning on all routes
 * This script helps identify API routes that need versioning
 */

import { readdir, readFile } from 'fs/promises'
import { join } from 'path'

async function findApiRoutes(dir: string, routes: string[] = []): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true })
  
  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    
    if (entry.isDirectory()) {
      await findApiRoutes(fullPath, routes)
    } else if (entry.name === 'route.ts' || entry.name === 'route.js') {
      routes.push(fullPath)
    }
  }
  
  return routes
}

async function checkVersioning(filePath: string): Promise<boolean> {
  const content = await readFile(filePath, 'utf-8')
  return content.includes('withAPIVersioning') || content.includes('createVersionedHandler')
}

async function main() {
  const apiDir = join(process.cwd(), 'src/app/api')
  
  console.log('🔍 Scanning for API routes...\n')
  
  try {
    const routes = await findApiRoutes(apiDir)
    const versionedRoutes: string[] = []
    const unversionedRoutes: string[] = []
    
    for (const route of routes) {
      const hasVersioning = await checkVersioning(route)
      const relativePath = route.replace(process.cwd() + '/', '')
      
      if (hasVersioning) {
        versionedRoutes.push(relativePath)
      } else {
        unversionedRoutes.push(relativePath)
      }
    }
    
    console.log(`✅ Versioned Routes (${versionedRoutes.length}):\n`)
    versionedRoutes.forEach(route => console.log(`  ✓ ${route}`))
    
    console.log(`\n❌ Unversioned Routes (${unversionedRoutes.length}):\n`)
    unversionedRoutes.forEach(route => console.log(`  ✗ ${route}`))
    
    console.log('\n📊 Summary:')
    console.log(`  Total routes: ${routes.length}`)
    console.log(`  Versioned: ${versionedRoutes.length} (${Math.round(versionedRoutes.length / routes.length * 100)}%)`)
    console.log(`  Unversioned: ${unversionedRoutes.length} (${Math.round(unversionedRoutes.length / routes.length * 100)}%)`)
    
    if (unversionedRoutes.length > 0) {
      console.log('\n💡 To enable versioning on unversioned routes:')
      console.log('  1. Import: import { withAPIVersioning } from "@/lib/api/with-versioning"')
      console.log('  2. Rename exports: export async function GET() → async function getHandler()')
      console.log('  3. Export with versioning: export const GET = withAPIVersioning(getHandler)')
    }
    
  } catch (error) {
    console.error('Error scanning routes:', error)
    process.exit(1)
  }
}

main()