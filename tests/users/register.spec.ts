import request from 'supertest'
import app from '../../src/app'
import { User } from '../../src/entity/User'
import { DataSource } from 'typeorm'
import { AppDataSource } from '../../src/config/data-source'
import { truncateTables } from '../utils'

describe('POST /auth/register', () => {
  let connection: DataSource

  beforeAll(async () => {
    connection = await AppDataSource.initialize()
  })

  beforeEach(async () => {
    // Database truncate
    await truncateTables(connection)
  })

  afterAll(async () => {
    await connection.destroy()
  })

  // happy path
  describe('Given all fields', () => {
    it('should return 201 status code', async () => {
      // AAA formula - Arrange, Act, Assert
      // Arrange
      const userData = {
        firstName: 'Deepak',
        lastName: 'Barwal',
        email: 'deepak@mern.space',
        password: 'secret'
      }

      // Act
      const response = await request(app).post('/auth/register').send(userData)

      // Assert
      expect(response.statusCode).toBe(201)
    })

    it('should return valid json response', async () => {
      // Arrange
      const userData = {
        firstName: 'Deepak',
        lastName: 'Barwal',
        email: 'deepak@mern.space',
        password: 'secret'
      }

      // Act
      const response = await request(app).post('/auth/register').send(userData)

      // Assert application/json
      expect(
        (response.headers as Record<string, string>)['content-type']
      ).toEqual(expect.stringContaining('json'))
    })

    it('should persist the user in the database', async () => {
      // Arrange
      const userData = {
        firstName: 'Deepak',
        lastName: 'Barwal',
        email: 'deepak@mern.space',
        password: 'secret'
      }

      // Act
      const response = await request(app).post('/auth/register').send(userData)

      // Assert
      const userRepository = connection.getRepository(User)
      const users = await userRepository.find()
      expect(users).toHaveLength(1)
    })
  })

  // sad path
  describe('Fields are missing', () => {})
})
