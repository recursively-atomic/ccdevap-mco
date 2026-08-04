const request = require('supertest');
const app = require('../../../server');

const {
    createUser,
    readUserByEmail,
    readLastUserNumber
} = require('../../controllers/userController');

jest.mock('../../controllers/userController', () => ({
    createUser: jest.fn(),
    readUser: jest.fn(),
    readUserByEmail: jest.fn(),
    readLastUserNumber: jest.fn(),
    readUsers: jest.fn(),
    updateUser: jest.fn(),
    updatePassword: jest.fn()
}));

jest.mock('../../controllers/auditController', () => ({
    createAudit: jest.fn()
}));

beforeEach(() => {
    jest.clearAllMocks();
});

describe('User Authentication', () => {
    test('Successful registration', async () => {
        readUserByEmail.mockResolvedValue(null);

        readLastUserNumber.mockResolvedValue({
            userNumber: 1000
        });

        createUser.mockResolvedValue({
            userNumber: 1001,
            emailAddress: 'jest@test.com',
            role: 'user'
        });

        const response = await request(app)
            .post('/register')
            .send({
                'email-address': 'jest@test.com',
                password: 'Password1!',
                'first-name': 'Jest',
                'last-name': 'User'
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
    });

    test('Successful login', async () => {
        readUserByEmail.mockResolvedValue({
            userNumber: 1001,
            emailAddress: 'jest@test.com',
            password: 'Password1!',
            role: 'user'
        });

        const response = await request(app)
            .post('/login')
            .send({
                'email-address': 'jest@test.com',
                password: 'Password1!'
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
    });

    test('Failed Login', async () => {
        readUserByEmail.mockResolvedValue({
            userNumber: 1001,
            emailAddress: 'jest@test.com',
            password: 'Password1!',
            role: 'user'
        });

        const response = await request(app)
            .post('/login')
            .send({
                'email-address': 'jest@test.com',
                password: 'WrongPassword'
            });

        expect(response.statusCode).toBe(401);
        expect(response.body.success).toBe(false);
    });
});