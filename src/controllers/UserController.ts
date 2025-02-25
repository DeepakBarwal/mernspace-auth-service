import { Request, Response, NextFunction } from 'express'
import { UserService } from '../services/UserService'
import { CreateUserRequest, UpdateUserRequest, UserQueryParams } from '../types'
import { Logger } from 'winston'
import { matchedData, validationResult } from 'express-validator'
import createHttpError from 'http-errors'

export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly logger: Logger
  ) {}

  async create(req: CreateUserRequest, res: Response, next: NextFunction) {
    const result = validationResult(req)

    // Validation
    if (!result.isEmpty()) {
      return next(createHttpError(400, result.array()[0].msg as string))
    }

    const { firstName, lastName, email, password, tenantId, role } = req.body
    try {
      const user = await this.userService.create({
        firstName,
        lastName,
        email,
        password,
        role,
        tenantId
      })
      res.status(201).json({ id: user.id })
    } catch (error) {
      next(error)
    }
  }

  async update(req: UpdateUserRequest, res: Response, next: NextFunction) {
    // In our project: We are not allowing user to change the email id since it is used as username
    // In our project: We are not allowing admin user to change others password

    const result = validationResult(req)

    // Validation
    if (!result.isEmpty()) {
      return next(createHttpError(400, result.array()[0].msg as string))
    }

    const { firstName, lastName, role, email, tenantId } = req.body
    const userId = req.params.id

    if (isNaN(Number(userId))) {
      next(createHttpError(400, 'Invalid url param.'))
      return
    }

    this.logger.debug('Request for updating a user', req.body)

    try {
      await this.userService.update(Number(userId), {
        firstName,
        lastName,
        email,
        role,
        tenantId
      })

      this.logger.info('User has been updated', { id: userId })

      res.json({ id: Number(userId) })
    } catch (err) {
      next(err)
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    const validatedQuery: UserQueryParams = matchedData(req, {
      onlyValidData: true
    })

    try {
      const [users, count] = await this.userService.getAll(validatedQuery)

      this.logger.info('All users have been fetched')
      res.json({
        currentPage: validatedQuery.currentPage,
        perPage: validatedQuery.perPage,
        total: count,
        data: users
      })
    } catch (err) {
      next(err)
    }
  }

  async getOne(req: Request, res: Response, next: NextFunction) {
    const userId = req.params.id

    if (isNaN(Number(userId))) {
      next(createHttpError(400, 'Invalid url param.'))
      return
    }

    try {
      const user = await this.userService.findById(Number(userId))

      if (!user) {
        next(createHttpError(400, 'User does not exist.'))
        return
      }

      this.logger.info('User has been fetched', { id: user.id })
      res.json(user)
    } catch (err) {
      next(err)
    }
  }

  async destroy(req: Request, res: Response, next: NextFunction) {
    const userId = req.params.id

    if (isNaN(Number(userId))) {
      next(createHttpError(400, 'Invalid url param.'))
      return
    }

    try {
      await this.userService.deleteById(Number(userId))

      this.logger.info('User has been deleted', {
        id: Number(userId)
      })
      res.json({ id: Number(userId) })
    } catch (err) {
      next(err)
    }
  }
}
