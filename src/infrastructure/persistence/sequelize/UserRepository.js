const Account = require('../../../domain/user/Account');

class UserRepository {
    constructor(UserModel) {
        this.User = UserModel;
    }

    findByEmail(email) {
        return this.User.findOne({ where: { user_Email: email } }).then(toAccount);
    }

    findById(id) {
        return this.User.findOne({ where: { user_ID: id } }).then(toAccount);
    }

    findByPhone(phone) {
        return this.User.findOne({ where: { user_NumberPhone: phone } }).then(toAccount);
    }

    findByEmailAndCode(email, code) {
        return this.User.findOne({ where: { user_Email: email, user_Code: code } }).then(toAccount);
    }

    create(attributes) {
        return this.User.create({
            user_Email: attributes.email,
            user_Password: attributes.passwordHash,
            user_Name: attributes.name,
            user_NumberPhone: attributes.phone,
            user_Address: attributes.address,
            user_Code: attributes.verificationCode,
        }).then(toAccount);
    }

    confirmEmail(email) {
        return this.User.update({ accept_User: true }, { where: { user_Email: email } });
    }

    setVerificationCode(email, code) {
        return this.User.update({ user_Code: code }, { where: { user_Email: email } });
    }

    updatePassword(email, passwordHash) {
        return this.User.update({ user_Password: passwordHash }, { where: { user_Email: email } });
    }
}

function toAccount(record) {
    if (!record) return null;
    const user = record.dataValues || record;
    return new Account({
        id: user.user_ID,
        email: user.user_Email,
        passwordHash: user.user_Password,
        name: user.user_Name,
        phone: user.user_NumberPhone,
        address: user.user_Address,
        verificationCode: user.user_Code,
        emailConfirmed: user.accept_User,
    });
}

module.exports = UserRepository;
