import request from 'supertest'
import app from '../../src/app'
import { User } from '../../src/entity/User'
import { DataSource } from 'typeorm'
import { AppDataSource } from '../../src/config/data-source'
import { truncateTables } from '../utils'
import { Roles } from '../../src/constants'

describe('POST /auth/register', () => {
  let connection: DataSource

  beforeAll(async () => {
    connection = await AppDataSource.initialize()
  })

  beforeEach(async () => {
    await connection.dropDatabase()
    await connection.synchronize()
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
      expect(users[0].firstName).toBe(userData.firstName)
      expect(users[0].lastName).toBe(userData.lastName)
      expect(users[0].email).toBe(userData.email)
      expect(users[0].password).toBe(userData.password)
    })

    // it.todo('should return an id of the created user')
    it('should return an id of the created user', async () => {
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
      expect(response.body).toHaveProperty('id')
      const userRepository = connection.getRepository(User)
      const users = await userRepository.find()
      expect((response.body as Record<string, string>).id).toBe(users[0].id)
    })

    it('should assign a customer role', async () => {
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
      expect(users[0]).toHaveProperty('role')
      expect(users[0].role).toBe(Roles.CUSTOMER)
    })
  })

  // sad path
  describe('Fields are missing', () => {})
})
