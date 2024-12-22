import { Repository } from 'typeorm'
import { User } from '../entity/User'
import { UserData } from '../types'
import createHttpError from 'http-errors'
import { Roles } from '../constants'
import bcrypt from 'bcrypt'

export class UserService {
  constructor(private userRepository: Repository<User>) {}

  async create({ firstName, lastName, email, password }: UserData) {
    // check if user already exists with same email
    const user = await this.userRepository.findOne({
      where: { email: email }
    })

    if (user) {
      const err = createHttpError(400, 'Email already exists!')
      throw err
    }

    // Hash the password
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    try {
      const createdUser = await this.userRepository.save({
        firstName,
        lastName,
        email,
        password: hashedPassword,
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

  async findByEmail(email: string) {
    const user = await this.userRepository.findOne({
      where: {
        email: email
      }
    })
    return user
  }
}
