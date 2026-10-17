const Account = require('../../../domain/user/Account');

class UserRepository {
    /** Lưu model người dùng để thực hiện các truy vấn tài khoản. */
    constructor(UserModel) {
        this.User = UserModel;
    }

    /** Tìm tài khoản theo email. */
    findByEmail(email) {
        return this.User.findOne({ where: { user_Email: email } }).then(toAccount);
    }

    /** Tìm tài khoản theo mã. */
    findById(id) {
        return this.User.findOne({ where: { user_ID: id } }).then(toAccount);
    }

    /** Tìm tài khoản theo số điện thoại. */
    findByPhone(phone) {
        return this.User.findOne({ where: { user_NumberPhone: phone } }).then(toAccount);
    }

    /** Tìm tài khoản khớp email và mã xác minh. */
    findByEmailAndCode(email, code) {
        return this.User.findOne({ where: { user_Email: email, user_Code: code } }).then(toAccount);
    }

    /** Tạo tài khoản mới và chuyển kết quả thành thực thể Account. */
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

    /** Đánh dấu email của tài khoản là đã xác nhận. */
    confirmEmail(email) {
        return this.User.update({ accept_User: true }, { where: { user_Email: email } });
    }

    /** Gán mã xác minh mới cho tài khoản. */
    setVerificationCode(email, code) {
        return this.User.update({ user_Code: code }, { where: { user_Email: email } });
    }

    /** Cập nhật mật khẩu đã mã hóa theo email. */
    updatePassword(email, passwordHash) {
        return this.User.update({ user_Password: passwordHash }, { where: { user_Email: email } });
    }
}

/** Chuyển bản ghi người dùng thành thực thể Account. */
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
