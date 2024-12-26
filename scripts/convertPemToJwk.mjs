import fs from 'fs'
import path from 'path'
import rsaPemToJwk from 'rsa-pem-to-jwk'

const privateKey = fs.readFileSync(path.join('./certs/private.pem'))

const jwk = rsaPemToJwk(
  privateKey,
  {
    use: 'sig'
  },
  'public'
)

console.log(jwk)
