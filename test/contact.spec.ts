import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { Logger } from 'winston';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { TestService } from './test.service';
import { TestModule } from './test.module';

describe('Contact Controller', () => {
  let app: INestApplication;
  let logger: Logger;
  let testService: TestService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TestModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    logger = app.get(WINSTON_MODULE_PROVIDER);
    testService = app.get(TestService);
  });

  describe('POST /api/contacts', () => {
    beforeEach(async () => {
      await testService.deleteContact();
      await testService.deleteUser();

      await testService.createUser();
    });

    it('should be rejected if request invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/contacts')
        .set('x-token', 'test')
        .send({
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should be to create contacts', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/contacts')
        .set('x-token', 'test')
        .send({
          first_name: 'test',
          last_name: 'dolar',
          email: 'test@gmail.com',
          phone: 'test',
        });

      console.log(
        ` ===========================> ${JSON.stringify(response.body.data)}`,
      );

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBeDefined();
    });
  });

  describe('GET /api/contacts/contactId', () => {
    beforeEach(async () => {
      await testService.deleteContact();
      await testService.deleteUser();

      await testService.createUser();
      await testService.createContact();
    });

    it('should be rejected if request invalid', async () => {
      const contact = await testService.getContact();

      const response = await request(app.getHttpServer())
        .post('/api/contacts/' + contact.id + 1)
        .set('x-token', 'test');

      expect(response.status).toBe(404);
      expect(response.body.errors).toBeDefined();
    });

    it('should be able to get contact', async () => {
      const contact = await testService.getContact();

      const response = await request(app.getHttpServer())
        .get(`/api/contacts/${contact.id}`)
        .set('x-token', 'test');

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(contact.id);
    });
  });

  describe('PUT /api/contacts/contactId', () => {
    beforeEach(async () => {
      await testService.deleteContact();
      await testService.deleteUser();

      await testService.createUser();
      await testService.createContact();
    });

    it('should be rejected if request invalid', async () => {
      const contact = await testService.getContact();

      const response = await request(app.getHttpServer())
        .put('/api/contacts/' + contact.id)
        .set('x-token', 'test')
        .send({
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should be able to update contact', async () => {
      const contact = await testService.getContact();

      const response = await request(app.getHttpServer())
        .put(`/api/contacts/${contact.id}`)
        .set('x-token', 'test')
        .send({
          first_name: 'test-update',
          last_name: 'test-update',
          email: 'test-update@gmail.com',
          phone: 'test-update',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.first_name).toBe('test-update');
    });
  });

  describe('DELETE /api/contacts/contactId', () => {
    beforeEach(async () => {
      await testService.deleteContact();
      await testService.deleteUser();

      await testService.createUser();
      await testService.createContact();
    });

    it('should not able to delete contact', async () => {
      const contact = await testService.getContact();

      const response = await request(app.getHttpServer())
        .delete('/api/contacts/' + contact.id + 1)
        .set('x-token', 'test');

      expect(response.status).toBe(404);
      expect(response.body.errors).toBeDefined();
    });

    it('should be able delete contact', async () => {
      const contact = await testService.getContact();

      const response = await request(app.getHttpServer())
        .delete(`/api/contacts/${contact.id}`)
        .set('x-token', 'test');

      expect(response.status).toBe(200);
      expect(response.body.data).toBe('Contact Was Deleted');
    });
  });

  describe('GET /api/contacts/?', () => {
    beforeEach(async () => {
      await testService.deleteContact();
      await testService.deleteUser();

      await testService.createUser();
      await testService.createContact();
    });

    it('should be able to search contact', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/contacts/')
        .set('x-token', 'test');
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
    });

    it('should be able to search contact by name', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/contacts?name=tes')
        .set('x-token', 'test');
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
    });

    it('should be able to search contact by phone', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/contacts?phone=909')
        .set('x-token', 'test');
      logger.info(`==============>${JSON.stringify(response)}`);
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
    });
  });
});
