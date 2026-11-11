import { Router } from 'express';
import { Pool } from 'pg';
import { StudentRepository } from './student.repository';
import { StudentService } from './student.service';
import { StudentController } from './student.controller';

export function createStudentRouter(pool: Pool): Router {
  const router = Router();
  const repo = new StudentRepository(pool);
  const service = new StudentService(repo);
  const controller = new StudentController(service);

  router.post('/api/students', controller.register);
  router.post('/api/students/bulk', controller.bulkImport);
  router.get('/api/students', controller.list);
  router.get('/api/students/:id/history', controller.getHistory);
  router.patch('/api/students/:id', controller.update);

  return router;
}
