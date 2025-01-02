import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { Config } from './index'

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: Config.DB_HOST,
  port: Number(Config.DB_PORT),
  username: Config.DB_USERNAME,
  password: Config.DB_PASSWORD,
  database: Config.DB_NAME,
  // Don't ever use this in prod. Always keep false.
  synchronize: false,
  // npm run migration:generate -- .\src\migration\migration -d .\src\config\data-source.ts
  // npm run migration:run -- -d .\src\config\data-source.ts
  logging: false,
  entities: ['src/entity/*.{ts,js}'],
  migrations: ['src/migration/*.{ts,js}'],
  subscribers: [],
  ssl: {
    rejectUnauthorized: false
  },
  extra: {
    ssl: {
      rejectUnauthorized: false
    }
  }
})
