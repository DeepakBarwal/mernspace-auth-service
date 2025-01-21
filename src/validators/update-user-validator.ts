import { checkSchema } from 'express-validator'

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
    notEmpty: true,
    trim: true
  }
})
