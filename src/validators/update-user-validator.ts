import { checkSchema } from 'express-validator'
import { LimitedUserData } from '../types'

export default checkSchema({
  firstName: {
    errorMessage: 'First name is required!',
    notEmpty: true,
    trim: true
  },
  lastName: {
    errorMessage: 'Last name is required!',
    notEmpty: true,
    trim: true
  },
  email: {
    errorMessage: 'Email is required!',
    notEmpty: true,
    trim: true,
    isEmail: {
      errorMessage: 'Email should be a valid email'
    }
  },
  role: {
    errorMessage: 'Role is required!',
    notEmpty: true,
    trim: true
  },
  tenantId: {
    errorMessage: 'Tenant id is required!',
    trim: true,
    custom: {
      options: (value: string, { req }) => {
        const role = (req.body as LimitedUserData)?.role
        if (role === 'admin') {
          return true
        } else {
          return !!value
        }
      }
    }
  }
})
