import request from 'supertest'
import app from '../../src/app'

describe('POST /auth/register', () => {
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
    })
  })

  // sad path
  describe('Fields are missing', () => {})
})
