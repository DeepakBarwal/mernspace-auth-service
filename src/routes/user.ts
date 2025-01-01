import express, { Request, Response, NextFunction } from 'express'
import authenticate from '../middlewares/authenticate'
import { canAccess } from '../middlewares/canAccess'
import { Roles } from '../constants'
import tenantValidator from '../validators/tenant-validator'
import { UserController } from '../controllers/UserController'
import { UserService } from '../services/UserService'
import { AppDataSource } from '../config/data-source'
import { User } from '../entity/User'

const router = express.Router()

const userRepository = AppDataSource.getRepository(User)
const userService = new UserService(userRepository)
const userController = new UserController(userService)

router.post(
  '/',
  authenticate,
  canAccess([Roles.ADMIN]),
  tenantValidator,
  (req: Request, res: Response, next: NextFunction) =>
    userController.create(req, res, next)
)

export default router
