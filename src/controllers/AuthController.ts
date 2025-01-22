import { NextFunction, Response } from 'express'
import { Logger } from 'winston'
import { validationResult } from 'express-validator'
import { JwtPayload } from 'jsonwebtoken'
import { AuthRequest, RegisterUserRequest } from '../types'
import { UserService } from '../services/UserService'
import { TokenService } from '../services/TokenService'
import createHttpError from 'http-errors'
import { CredentialService } from '../services/CredentialService'
import { Roles } from '../constants'

export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly logger: Logger,
    private readonly tokenService: TokenService,
    private readonly credentialService: CredentialService
  ) {}

  async register(req: RegisterUserRequest, res: Response, next: NextFunction) {
    const result = validationResult(req)

    // Validation
    if (!result.isEmpty()) {
      return next(createHttpError(400, result.array()[0].msg as string))
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
        password,
        role: Roles.CUSTOMER
      })

      this.logger.info('User has been registered', { id: createdUser.id })

      const payload: JwtPayload = {
        sub: String(createdUser.id),
        role: createdUser.role
      }

      const accessToken = this.tokenService.generateAccessToken(payload)

      // Persist the refresh token
      const newRefreshToken =
        await this.tokenService.persistRefreshToken(createdUser)

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

  async login(req: RegisterUserRequest, res: Response, next: NextFunction) {
    const result = validationResult(req)

    // Validation
    if (!result.isEmpty()) {
      return next(createHttpError(400, result.array()[0].msg as string))
    }

    const { email, password } = req.body

    this.logger.debug('New request to login a user', {
      email,
      password: '******'
    })

    // Check if username (email) exists in database
    // Compare password
    // Generate tokens
    // Add tokens to Cookies
    // Return the response (id)

    try {
      const user = await this.userService.findByEmailWithPassword(email)

      if (!user) {
        const error = createHttpError(400, 'Email or password does not match.')
        next(error)
        return
      }

      const passwordMatch = await this.credentialService.comparePassword(
        password,
        user.password
      )

      if (!passwordMatch) {
        const error = createHttpError(400, 'Email or password does not match.')
        next(error)
        return
      }

      const payload: JwtPayload = {
        sub: String(user.id),
        role: user.role
      }

      const accessToken = this.tokenService.generateAccessToken(payload)

      // Persist the refresh token
      const newRefreshToken = await this.tokenService.persistRefreshToken(user)

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

      this.logger.info('User has been logged in', { id: user.id })

      res.status(200).json({ id: user.id })
    } catch (error) {
      next(error)
      return
    }
  }

  async self(req: AuthRequest, res: Response) {
    const user = await this.userService.findById(Number(req.auth.sub))
    res.json({ ...user, password: undefined })
  }

  async refresh(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const payload: JwtPayload = {
        sub: req.auth.sub,
        role: req.auth.role
      }

      const accessToken = this.tokenService.generateAccessToken(payload)

      const user = await this.userService.findById(Number(req.auth.sub))

      if (!user) {
        const error = createHttpError(
          400,
          'User with this token could not be found'
        )
        next(error)
        return
      }

      // Persist the refresh token
      const newRefreshToken = await this.tokenService.persistRefreshToken(user)

      // delete old/current refresh token from database
      await this.tokenService.deleteRefreshToken(Number(req.auth.id))

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

      this.logger.info('User has been logged in', { id: user.id })

      res.json({ id: user.id })
    } catch (error) {
      next(error)
      return
    }
  }

  async logout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await this.tokenService.deleteRefreshToken(Number(req.auth.id))
      this.logger.info('Refresh token has been deleted', { id: req.auth.id })
      this.logger.info('User has been logged out', { id: req.auth.sub })

      res.clearCookie('accessToken')
      res.clearCookie('refreshToken')
      res.json({})
    } catch (error) {
      next(error)
      return
    }
  }
}
