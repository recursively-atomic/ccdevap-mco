const request = require('supertest');
const server = require('../../server');

const { createUser, readUserByEmail, readLastUserNumber } = require('../controllers/userController');
const { createAudit } = require('../controllers/auditController');

jest.mock('../controllers/userController', () => ({
    createUser: jest.fn(),
    readUserByEmail: jest.fn(),
    readLastUserNumber: jest.fn(),
}));

jest.mock('../controllers/auditController', () => ({
    createAudit: jest.fn()
}));

beforeEach(() => {
    jest.clearAllMocks();
});

describe('User Authentication', () => {
    test('Successful Registration', async () => {
        readUserByEmail.mockResolvedValue();
        readLastUserNumber.mockResolvedValue({ userNumber: 1000 });
        createUser.mockResolvedValue({ userNumber: 1001 });

        const response = await request(server)
            .post('/register')
            .send({
                'email-address': 'jest@test.com',
                'password': 'JestPa5$wrd',
                'first-name': 'Jest',
                'last-name': 'User'
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
    });

    test('Failed Registration (Duplicate E-Mail)', async () => {
        readUserByEmail.mockResolvedValue({ emailAddress: 'jest@test.com', });

        const response = await request(server)
            .post('/register')
            .send({
                'email-address': 'jest@test.com',
                'password': 'JestPa5$wrd',
                'first-name': 'Jest',
                'last-name': 'User'
            });

        expect(response.statusCode).toBe(409);
        expect(response.body.success).toBe(false);
    });

    test('Successful Login', async () => {
        readUserByEmail.mockResolvedValue({
            emailAddress: 'jest@test.com',
            password: 'JestPa5$wrd',
            role: 'user'
        });

        const response = await request(server)
            .post('/login')
            .send({
                'email-address': 'jest@test.com',
                'password': 'JestPa5$wrd'
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
    });

    test('Failed Login (Incorrect Password)', async () => {
        readUserByEmail.mockResolvedValue({
            emailAddress: 'jest@test.com',
            password: 'JestPa5$wrd',
            role: 'user'
        });

        const response = await request(server)
            .post('/login')
            .send({
                'email-address': 'jest@test.com',
                'password': 'Wr0ngPa5$word'
            });

        expect(response.statusCode).toBe(401);
        expect(response.body.success).toBe(false);
    });
});