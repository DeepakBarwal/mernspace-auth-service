import { Brackets, Repository } from 'typeorm'
import { User } from '../entity/User'
import { LimitedUserData, UserData, UserQueryParams } from '../types'
import createHttpError from 'http-errors'
import bcrypt from 'bcryptjs'

export class UserService {
  constructor(private readonly userRepository: Repository<User>) {}

  async create({
    firstName,
    lastName,
    email,
    password,
    role,
    tenantId
  }: UserData) {
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
        role,
        tenantId
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

  async findByEmailWithPassword(email: string) {
    const user = await this.userRepository.findOne({
      where: {
        email: email
      },
      select: ['id', 'firstName', 'lastName', 'email', 'role', 'password']
    })
    return user
  }

  async findById(id: number) {
    return await this.userRepository.findOne({
      where: {
        id
      },
      relations: {
        tenant: true
      }
    })
  }

  async update(userId: number, { firstName, lastName, role }: LimitedUserData) {
    try {
      return await this.userRepository.update(userId, {
        firstName,
        lastName,
        role
      })
    } catch (err) {
      const error = createHttpError(
        500,
        'Failed to update the user in the database'
      )
      throw error
    }
  }

  async getAll(validatedQuery: UserQueryParams) {
    const queryBuilder = this.userRepository.createQueryBuilder('user')

    if (validatedQuery.q) {
      const searchTerm = `%${validatedQuery.q}%`
      queryBuilder.where(
        new Brackets(qb => {
          qb.where("CONCAT(user.firstName, ' ', user.lastName) ILike :q", {
            q: searchTerm
          }).orWhere('user.email ILike :q', { q: searchTerm })
        })
      )
    }

    if (validatedQuery.role) {
      queryBuilder.andWhere('user.role = :role', { role: validatedQuery.role })
    }

    const result = await queryBuilder
      .leftJoinAndSelect('user.tenant', 'tenant')
      .skip((validatedQuery.currentPage - 1) * validatedQuery.perPage)
      .take(validatedQuery.perPage)
      .orderBy('user.id', 'DESC')
      .getManyAndCount()

    return result
  }

  async deleteById(userId: number) {
    return await this.userRepository.delete(userId)
  }
}
