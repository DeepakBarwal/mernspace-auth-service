import express, { Request, Response, NextFunction } from 'express'
import authenticate from '../middlewares/authenticate'
import { canAccess } from '../middlewares/canAccess'
import { Roles } from '../constants'
import createUserValidator from '../validators/create-user-validator'
import { UserController } from '../controllers/UserController'
import { UserService } from '../services/UserService'
import { AppDataSource } from '../config/data-source'
import { User } from '../entity/User'
import updateUserValidator from '../validators/update-user-validator'
import { UpdateUserRequest } from '../types'
import logger from '../config/logger'
import listUsersVaidator from '../validators/list-users-validator'

const router = express.Router()

const userRepository = AppDataSource.getRepository(User)
const userService = new UserService(userRepository)
const userController = new UserController(userService, logger)

router.post(
  '/',
  authenticate,
  canAccess([Roles.ADMIN]),
  createUserValidator,
  (req: Request, res: Response, next: NextFunction) =>
    userController.create(req, res, next)
)

router.patch(
  '/:id',
  authenticate,
  canAccess([Roles.ADMIN]),
  updateUserValidator,
  (req: UpdateUserRequest, res: Response, next: NextFunction) =>
    userController.update(req, res, next)
)

router.get(
  '/',
  authenticate,
  canAccess([Roles.ADMIN]),
  listUsersVaidator,
  (req: Request, res: Response, next: NextFunction) =>
    userController.getAll(req, res, next)
)

router.get('/:id', authenticate, canAccess([Roles.ADMIN]), (req, res, next) =>
  userController.getOne(req, res, next)
)

router.delete(
  '/:id',
  authenticate,
  canAccess([Roles.ADMIN]),
  (req, res, next) => userController.destroy(req, res, next)
)

export default router
