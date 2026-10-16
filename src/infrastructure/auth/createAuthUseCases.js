const UserRepository = require('../persistence/sequelize/UserRepository');
const AuthenticateUser = require('../../application/auth/AuthenticateUser');
const RegisterUser = require('../../application/auth/RegisterUser');
const ConfirmRegistration = require('../../application/auth/ConfirmRegistration');
const RequestPasswordReset = require('../../application/auth/RequestPasswordReset');
const VerifyPasswordResetCode = require('../../application/auth/VerifyPasswordResetCode');
const ResetPassword = require('../../application/auth/ResetPassword');

function createAuthUseCases({ User, comparePassword, hashPassword, sendEmail, generateCode }) {
    const users = new UserRepository(User);

    return {
        authenticateUser: new AuthenticateUser({ users, verifyPassword: comparePassword }),
        registerUser: new RegisterUser({ users, hashPassword, sendEmail, generateCode }),
        confirmRegistration: new ConfirmRegistration({ users }),
        requestPasswordReset: new RequestPasswordReset({ users, sendEmail, generateCode }),
        verifyPasswordResetCode: new VerifyPasswordResetCode({ users }),
        resetPassword: new ResetPassword({ users, hashPassword }),
    };
}

module.exports = createAuthUseCases;
