import { NextFunction, Response } from 'express'
import { Logger } from 'winston'
import { validationResult } from 'express-validator'
import { JwtPayload } from 'jsonwebtoken'
import { RegisterUserRequest } from '../types'
import { UserService } from '../services/UserService'
import { AppDataSource } from '../config/data-source'
import { RefreshToken } from '../entity/RefreshToken'
import { TokenService } from '../services/TokenService'

export class AuthController {
  constructor(
    private userService: UserService,
    private logger: Logger,
    private tokenService: TokenService
  ) {}

  async register(req: RegisterUserRequest, res: Response, next: NextFunction) {
    const result = validationResult(req)

    // Validation
    if (!result.isEmpty()) {
      res.status(400).json({ errors: result.array() })
      return
    }

    const { firstName, lastName, email, password } = req.body

    this.logger.debug('New request to register a user', {
      firstName,
      lastName,
      email,
      password: '******'
    })

    try {
      const createdUser = await this.userService.create({
        firstName,
        lastName,
        email,
        password
      })

      this.logger.info('User has been registered', { id: createdUser.id })

      const payload: JwtPayload = {
        sub: String(createdUser.id),
        role: createdUser.role
      }

      const accessToken = this.tokenService.generateAccessToken(payload)

      // Persist the refresh token
      const MS_IN_YEAR = 1000 * 60 * 60 * 24 * 365
      const refreshTokenRepository = AppDataSource.getRepository(RefreshToken)
      const newRefreshToken = await refreshTokenRepository.save({
        user: createdUser,
        expiresAt: new Date(Date.now() + MS_IN_YEAR)
      })

      const refreshToken = this.tokenService.generateRefreshToken({
        ...payload,
        id: String(newRefreshToken.id)
      })

      res.cookie('accessToken', accessToken, {
        domain: 'localhost',
        sameSite: 'strict',
        maxAge: 60 * 60 * 1000, // 1hr
        httpOnly: true
      })

      res.cookie('refreshToken', refreshToken, {
        domain: 'localhost',
        sameSite: 'strict',
        maxAge: 365 * 24 * 60 * 60 * 1000, // 1yr
        httpOnly: true
      })

      res.status(201).json({ id: createdUser.id })
    } catch (error) {
      next(error)
      return
    }
  }
}
