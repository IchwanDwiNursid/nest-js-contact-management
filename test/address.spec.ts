import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { TestService } from './test.service';
import { TestModule } from './test.module';

describe('Contact Controller', () => {
  let app: INestApplication;
  let testService: TestService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TestModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    testService = app.get(TestService);
  });

  describe('POST /api/contacts/contactId/adressess', () => {
    beforeEach(async () => {
      await testService.deleteAddress();
      await testService.deleteContact();
      await testService.deleteUser();

      await testService.createUser();
      await testService.createContact();
    });

    it('should be rejected if request invalid', async () => {
      const contact = await testService.getContact();

      const response = await request(app.getHttpServer())
        .post('/api/contacts/' + contact.id + 1 + '/addresses')
        .set('x-token', 'test')
        .send({
          street: 'test',
          city: 'test',
          state: 'test',
          country: 'test',
          zip_code: '',
        })
        .set('x-token', 'test');

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should be able to create address', async () => {
      const contact = await testService.getContact();

      const response = await request(app.getHttpServer())
        .post(`/api/contacts/${contact.id}/addresses`)
        .send({
          street: 'jl.test',
          city: 'test',
          province: 'test',
          country: 'test',
          postal_code: 'test123',
        })
        .set('x-token', 'test');

      expect(response.status).toBe(200);
      expect(response.body.data.street).toBe('jl.test');
    });
  });

  describe('GET /api/contacts/contactId/adressess/addressId', () => {
    beforeEach(async () => {
      await testService.deleteAddress();
      await testService.deleteContact();
      await testService.deleteUser();

      await testService.createUser();
      await testService.createContact();
      await testService.createAddress();
    });

    it('should be rejected if request invalid', async () => {
      const contact = await testService.getContact();
      const address = await testService.getAddress();

      const response = await request(app.getHttpServer())
        .get('/api/contacts/' + contact.id + '/addresses/' + address.id + 1)
        .set('x-token', 'test');

      expect(response.status).toBe(404);
      expect(response.body.errors).toBeDefined();
    });

    it('should be able  to get address', async () => {
      const contact = await testService.getContact();
      const address = await testService.getAddress();

      const response = await request(app.getHttpServer())
        .get('/api/contacts/' + contact.id + '/addresses/' + address.id)
        .set('x-token', 'test');

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(address.id);
    });
  });

  describe('PUT /api/contacts/contactId/adressess/addressId', () => {
    beforeEach(async () => {
      await testService.deleteAddress();
      await testService.deleteContact();
      await testService.deleteUser();

      await testService.createUser();
      await testService.createContact();
      await testService.createAddress();
    });

    it('should be rejected if addres id invalid', async () => {
      const contact = await testService.getContact();
      const address = await testService.getAddress();
      const response = await request(app.getHttpServer())
        .put(`/api/contacts/${contact.id}/addresses/${address.id + 1}`)
        .set('x-token', 'test')
        .send({
          street: 'test lagi',
          city: 'test lagi',
          province: 'test lagi',
          country: 'test',
          postal_code: 'test lagi',
        })
        .set('x-token', 'test');

      expect(response.status).toBe(404);
      expect(response.body.errors).toBeDefined();
    });

    it('should be able to update address', async () => {
      const contact = await testService.getContact();
      const address = await testService.getAddress();

      const response = await request(app.getHttpServer())
        .put(`/api/contacts/${contact.id}/addresses/${address.id}`)
        .send({
          street: 'test',
          city: 'test',
          province: 'test',
          country: 'test',
          postal_code: 'test-more',
        })
        .set('x-token', 'test');

      console.log(response.body);

      expect(response.status).toBe(200);
      expect(response.body.data.street).toBe('test');
    });
  });

  describe('DELETE /api/contacts/contactId/adressess/addressId', () => {
    beforeEach(async () => {
      await testService.deleteAddress();
      await testService.deleteContact();
      await testService.deleteUser();

      await testService.createUser();
      await testService.createContact();
      await testService.createAddress();
    });

    it('should be rejected if addres id invalid', async () => {
      const contact = await testService.getContact();
      const address = await testService.getAddress();
      const response = await request(app.getHttpServer())
        .delete(`/api/contacts/${contact.id}/addresses/${address.id + 1}`)
        .set('x-token', 'test');

      expect(response.status).toBe(404);
      expect(response.body.errors).toBeDefined();
    });

    it('should be able to  delete address', async () => {
      const contact = await testService.getContact();
      const address = await testService.getAddress();

      const response = await request(app.getHttpServer())
        .delete(`/api/contacts/${contact.id}/addresses/${address.id}`)
        .set('x-token', 'test');

      console.log(response.body);

      expect(response.status).toBe(200);
      expect(response.body.data).toBe('Address Was Deleted');
    });
  });

  describe('GET /api/contacts/contactId/adressess', () => {
    beforeEach(async () => {
      await testService.deleteAddress();
      await testService.deleteContact();
      await testService.deleteUser();

      await testService.createUser();
      await testService.createContact();
      await testService.createAddress();
    });

    it('should be able to get contacts', async () => {
      const contact = await testService.getContact();
      const response = await request(app.getHttpServer())
        .get(`/api/contacts/${contact.id}/addresses/`)
        .set('x-token', 'test');

      expect(response.status).toBe(200);
    });

    it('should be able to  delete address', async () => {
      const contact = await testService.getContact();
      const address = await testService.getAddress();

      const response = await request(app.getHttpServer())
        .get(`/api/contacts/${contact.id}/addresses/${address.id + 1}`)
        .set('x-token', 'test');

      console.log(response.body);

      expect(response.status).toBe(404);
      expect(response.body.errors).toBeDefined();
    });
  });
});
