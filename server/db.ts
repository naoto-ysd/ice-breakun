import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface User {
  id: number
  name: string
  email: string
  created_at?: Date
  updated_at?: Date
}

export interface Message {
  id: number
  content: string
  user_id: number
  user?: User
  created_at?: Date
  updated_at?: Date
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
          ; (err as any).code = 'UNIQUE_VIOLATION'
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
          ; (err as any).code = 'UNIQUE_VIOLATION'
        throw err
      }
      if (error.code === 'P2025') {
        const err = new Error('User not found')
          ; (err as any).code = 'NOT_FOUND'
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
          ; (err as any).code = 'NOT_FOUND'
        throw err
      }
      throw error
    }
  }
}

export class MessageRepository {
  async getAllMessages(): Promise<Message[]> {
    return await prisma.message.findMany({
      include: {
        user: true
      },
      orderBy: { created_at: 'desc' }
    })
  }

  async getMessageById(id: number): Promise<Message | null> {
    return await prisma.message.findUnique({
      where: { id },
      include: {
        user: true
      }
    })
  }

  async createMessage(content: string, user_id: number): Promise<Message> {
    try {
      return await prisma.message.create({
        data: { content, user_id },
        include: {
          user: true
        }
      })
    } catch (error: any) {
      if (error.code === 'P2003') {
        const err = new Error('User not found')
          ; (err as any).code = 'FOREIGN_KEY_VIOLATION'
        throw err
      }
      throw error
    }
  }

  async updateMessage(id: number, content: string): Promise<Message> {
    try {
      return await prisma.message.update({
        where: { id },
        data: { content },
        include: {
          user: true
        }
      })
    } catch (error: any) {
      if (error.code === 'P2025') {
        const err = new Error('Message not found')
          ; (err as any).code = 'NOT_FOUND'
        throw err
      }
      throw error
    }
  }

  async deleteMessage(id: number): Promise<void> {
    try {
      await prisma.message.delete({
        where: { id }
      })
    } catch (error: any) {
      if (error.code === 'P2025') {
        const err = new Error('Message not found')
          ; (err as any).code = 'NOT_FOUND'
        throw err
      }
      throw error
    }
  }

  async getMessagesByUserId(user_id: number): Promise<Message[]> {
    return await prisma.message.findMany({
      where: { user_id },
      include: {
        user: true
      },
      orderBy: { created_at: 'desc' }
    })
  }
}

export const userRepository = new UserRepository()
export const messageRepository = new MessageRepository()
