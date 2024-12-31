import express, {
  type Request,
  type Response,
  type NextFunction
} from 'express'

const router = express.Router()

router.post('/', (req, res) => {
  res.status(201).json()
})

export default router
