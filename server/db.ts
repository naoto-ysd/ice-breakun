import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface User {
  id: number
  name: string
  email: string
  created_at?: string
  updated_at?: string
}

export class UserRepository {
  async getAllUsers(): Promise<User[]> {
    return await prisma.user.findMany({
      orderBy: { id: 'asc' }
    })
  }

  async createUser(name: string, email: string): Promise<User> {
    try {
      return await prisma.user.create({
        data: { name, email }
      })
    } catch (error: any) {
      if (error.code === 'P2002') {
        const err = new Error('Email already exists')
        ;(err as any).code = 'UNIQUE_VIOLATION'
        throw err
      }
      throw error
    }
  }

  async getUserById(id: number): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { id }
    })
  }

  async updateUser(id: number, data: { name?: string; email?: string }): Promise<User> {
    try {
      return await prisma.user.update({
        where: { id },
        data
      })
    } catch (error: any) {
      if (error.code === 'P2002') {
        const err = new Error('Email already exists')
        ;(err as any).code = 'UNIQUE_VIOLATION'
        throw err
      }
      if (error.code === 'P2025') {
        const err = new Error('User not found')
        ;(err as any).code = 'NOT_FOUND'
        throw err
      }
      throw error
    }
  }

  async deleteUser(id: number): Promise<void> {
    try {
      await prisma.user.delete({
        where: { id }
      })
    } catch (error: any) {
      if (error.code === 'P2025') {
        const err = new Error('User not found')
        ;(err as any).code = 'NOT_FOUND'
        throw err
      }
      throw error
    }
  }
}

export const userRepository = new UserRepository()
