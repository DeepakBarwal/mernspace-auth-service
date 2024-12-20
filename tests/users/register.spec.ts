import request from 'supertest'
import app from '../../src/app'
import { User } from '../../src/entity/User'
import { DataSource } from 'typeorm'
import { AppDataSource } from '../../src/config/data-source'
import { Roles } from '../../src/constants'
import { isJwt } from '../utils'
import { RefreshToken } from '../../src/entity/RefreshToken'

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
        password: 'password'
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
        password: 'password'
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
        password: 'password'
      }

      // Act
      await request(app).post('/auth/register').send(userData)

      // Assert
      const userRepository = connection.getRepository(User)
      const users = await userRepository.find()
      expect(users).toHaveLength(1)
      expect(users[0].firstName).toBe(userData.firstName)
      expect(users[0].lastName).toBe(userData.lastName)
      expect(users[0].email).toBe(userData.email)
    })

    // it.todo('should return an id of the created user')
    it('should return an id of the created user', async () => {
      // Arrange
      const userData = {
        firstName: 'Deepak',
        lastName: 'Barwal',
        email: 'deepak@mern.space',
        password: 'password'
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
        password: 'password'
      }

      // Act
      await request(app).post('/auth/register').send(userData)

      // Assert
      const userRepository = connection.getRepository(User)
      const users = await userRepository.find()
      expect(users[0]).toHaveProperty('role')
      expect(users[0].role).toBe(Roles.CUSTOMER)
    })

    it('should store the hashed password in the database', async () => {
      // Arrange
      const userData = {
        firstName: 'Deepak',
        lastName: 'Barwal',
        email: 'deepak@mern.space',
        password: 'password'
      }

      // Act
      await request(app).post('/auth/register').send(userData)

      // Assert
      const userRepository = connection.getRepository(User)
      const users = await userRepository.find()
      expect(users[0].password).not.toBe(userData.password)
      expect(users[0].password).toHaveLength(60)
      expect(users[0].password).toMatch(/^\$2b\$\d+\$/)
    })

    it('should return 400 status code if email already exists', async () => {
      // Arrange
      const userData = {
        firstName: 'Deepak',
        lastName: 'Barwal',
        email: 'deepak@mern.space',
        password: 'password'
      }

      const userRepository = connection.getRepository(User)
      await userRepository.save({ ...userData, role: Roles.CUSTOMER })

      // Act
      const response = await request(app).post('/auth/register').send(userData)
      const users = await userRepository.find()

      // Assert
      expect(response.statusCode).toBe(400)
      expect(users).toHaveLength(1)
    })

    it('should return the access token and refresh token inside a cookie', async () => {
      // Arrange
      const userData = {
        firstName: 'Deepak',
        lastName: 'Barwal',
        email: 'deepak@mern.space',
        password: 'password'
      }

      // Act
      const response = await request(app).post('/auth/register').send(userData)

      // Assert
      let accessToken: string | null = null
      let refreshToken: string | null = null
      const cookies = (response.headers['set-cookie'] || []) as string[]

      cookies.forEach((cookie: string) => {
        if (cookie.startsWith('accessToken=')) {
          accessToken = cookie.split(';')[0].split('=')[1]
        }

        if (cookie.startsWith('refreshToken=')) {
          refreshToken = cookie.split(';')[0].split('=')[1]
        }
      })

      expect(accessToken).not.toBeNull()
      expect(refreshToken).not.toBeNull()

      expect(isJwt(accessToken)).toBeTruthy()
      expect(isJwt(refreshToken)).toBeTruthy()
    })

    it('should store the refresh token in the database', async () => {
      // Arrange
      const userData = {
        firstName: 'Deepak',
        lastName: 'Barwal',
        email: 'deepak@mern.space',
        password: 'password'
      }

      // Act
      const response = await request(app).post('/auth/register').send(userData)

      // Assert
      const refreshTokenRepo = connection.getRepository(RefreshToken)
      const refreshTokens = await refreshTokenRepo.find()
      expect(refreshTokens).toHaveLength(1)

      const tokens = await refreshTokenRepo
        .createQueryBuilder('refreshToken')
        .where('refreshToken.userId = :userId', {
          userId: (response.body as Record<string, string>).id
        })
        .getMany()
      expect(tokens).toHaveLength(1)
    })
  })

  // sad path
  describe('Fields are missing', () => {
    it('should return 400 status code if email field is missing', async () => {
      // Arrange
      const userData = {
        firstName: 'Deepak',
        lastName: 'Barwal',
        email: '',
        password: 'password'
      }

      // Act
      const response = await request(app).post('/auth/register').send(userData)

      // Assert
      expect(response.statusCode).toBe(400)
      const userRepository = connection.getRepository(User)
      const users = await userRepository.find()
      expect(users).toHaveLength(0)
    })

    it('should return 400 status code if firstName is missing', async () => {
      // Arrange
      const userData = {
        firstName: '',
        lastName: 'Barwal',
        email: 'deepak@mern.space',
        password: 'password'
      }

      // Act
      const response = await request(app).post('/auth/register').send(userData)

      // Assert
      expect(response.statusCode).toBe(400)
      const userRepository = connection.getRepository(User)
      const users = await userRepository.find()
      expect(users).toHaveLength(0)
    })

    it('should return 400 status code if lastName is missing', async () => {
      // Arrange
      const userData = {
        firstName: 'Deepak',
        lastName: '',
        email: 'deepak@mern.space',
        password: 'password'
      }

      // Act
      const response = await request(app).post('/auth/register').send(userData)

      // Assert
      expect(response.statusCode).toBe(400)
      const userRepository = connection.getRepository(User)
      const users = await userRepository.find()
      expect(users).toHaveLength(0)
    })

    it('should return 400 status code if password is missing', async () => {
      // Arrange
      const userData = {
        firstName: 'Deepak',
        lastName: 'Barwal',
        email: 'deepak@mern.space',
        password: ''
      }

      // Act
      const response = await request(app).post('/auth/register').send(userData)

      // Assert
      expect(response.statusCode).toBe(400)
      const userRepository = connection.getRepository(User)
      const users = await userRepository.find()
      expect(users).toHaveLength(0)
    })
  })

  describe('Fields are not in proper format', () => {
    it('should trim the email field', async () => {
      // Arrange
      const userData = {
        firstName: 'Deepak',
        lastName: 'Barwal',
        email: ' deepak@mern.space ',
        password: 'password'
      }

      // Act
      await request(app).post('/auth/register').send(userData)

      // Assert
      const userRepository = connection.getRepository(User)
      const users = await userRepository.find()
      const user = users[0]
      expect(user.email).toBe('deepak@mern.space')
    })

    it('should return 400 status code if email is not a valid email', async () => {
      // Arrange
      const userData = {
        firstName: 'Deepak',
        lastName: 'Barwal',
        email: 'deepak_barwal.space',
        password: 'password'
      }

      // Act
      const response = await request(app).post('/auth/register').send(userData)

      // Assert
      expect(response.statusCode).toBe(400)
      const userRepository = connection.getRepository(User)
      const users = await userRepository.find()
      expect(users).toHaveLength(0)
    })

    it('should return 400 status code if password length is less than 8 characters', async () => {
      // Arrange
      const userData = {
        firstName: 'Deepak',
        lastName: 'Barwal',
        email: 'deepak@mern.space',
        password: '1234'
      }

      // Act
      const response = await request(app).post('/auth/register').send(userData)

      // Assert
      expect(response.statusCode).toBe(400)
      const userRepository = connection.getRepository(User)
      const users = await userRepository.find()
      expect(users).toHaveLength(0)
    })

    it('should return an array of error messages if email is missing', async () => {
      // Arrange
      const userData = {
        firstName: 'Deepak',
        lastName: 'Barwal',
        email: '',
        password: 'password'
      }

      // Act
      const response = await request(app).post('/auth/register').send(userData)

      // Assert
      expect(response.statusCode).toBe(400)
      expect(response.body).toHaveProperty('errors')
      expect(
        (response.body as Record<string, string>).errors.length
      ).toBeGreaterThan(0)
    })
  })
})
