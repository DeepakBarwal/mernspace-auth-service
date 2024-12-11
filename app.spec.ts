import app from './src/app'
import { calculateDiscount } from './src/uils'
import request from 'supertest'

describe('App', () => {
  it('should return correct disc amt', () => {
    const disc = calculateDiscount(100, 10)
    expect(disc).toBe('$10')
  })

  it('should return 200 status code', async () => {
    const response = await request(app).get('/').send()
    expect(response.statusCode).toBe(200)
  })
})
