import Database from 'better-sqlite3'
import { existsSync, mkdirSync } from 'fs'
import { dirname } from 'path'

const dbPath = process.env.DATABASE_PATH || './data/ice_breakun.db'
const dbDir = dirname(dbPath)

if (!existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true })
}

const db = new Database(dbPath)

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`)

const insertSampleData = db.prepare(`
  INSERT OR IGNORE INTO users (name, email) VALUES (?, ?)
`)

insertSampleData.run('Alice', 'alice@example.com')
insertSampleData.run('Bob', 'bob@example.com')
insertSampleData.run('Charlie', 'charlie@example.com')
insertSampleData.run('Diana', 'diana@example.com')

export interface User {
  id: number
  name: string
  email: string
  created_at?: string
  updated_at?: string
}

export class UserRepository {
  private getAllStmt = db.prepare('SELECT * FROM users ORDER BY id')
  private createStmt = db.prepare('INSERT INTO users (name, email) VALUES (?, ?) RETURNING *')
  private getByIdStmt = db.prepare('SELECT * FROM users WHERE id = ?')

  async getAllUsers(): Promise<User[]> {
    return this.getAllStmt.all() as User[]
  }

  async createUser(name: string, email: string): Promise<User> {
    try {
      return this.createStmt.get(name, email) as User
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        const err = new Error('Email already exists')
        ;(err as any).code = 'UNIQUE_VIOLATION'
        throw err
      }
      throw error
    }
  }

  async getUserById(id: number): Promise<User | null> {
    return this.getByIdStmt.get(id) as User || null
  }
}

export const userRepository = new UserRepository()
