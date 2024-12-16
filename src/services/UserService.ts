import { Repository } from 'typeorm'
import { User } from '../entity/User'
import { UserData } from '../types'
import createHttpError from 'http-errors'
import { Roles } from '../constants'

export class UserService {
  constructor(private userRepository: Repository<User>) {}

  async create({ firstName, lastName, email, password }: UserData) {
    try {
      const createdUser = await this.userRepository.save({
        firstName,
        lastName,
        email,
        password,
        role: Roles.CUSTOMER
      })
      return createdUser
    } catch (error) {
      const customError = createHttpError(
        500,
        'Failed to store the data in the database'
      )
      throw customError
    }
  }
}