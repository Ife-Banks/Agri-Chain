import { Injectable } from '@nestjs/common';

@Injectable()
export class DatabaseService {
  // TypeORM DataSource is available via @InjectRepository or @InjectDataSource
  // in consuming services. This service exists for shared DB utilities
  // (e.g., health checks, migrations, seed scripts).
}
