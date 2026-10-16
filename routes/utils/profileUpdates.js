const profileFields = [
    { route: '/name', requestField: 'txtUserName', userField: 'user_Name' },
    { route: '/numberphone', requestField: 'txtUserNumberPhone', userField: 'user_NumberPhone' },
    { route: '/email', requestField: 'txtUserEmail', userField: 'user_Email' },
    { route: '/password', requestField: 'txtUserPassword', userField: 'user_Password', transform: 'password' },
    { route: '/address', requestField: 'txtUserAddress', userField: 'user_Address' },
];

function registerProfileUpdateRoutes(router, { User, hashPassword }) {
    profileFields.forEach(({ route, requestField, userField, transform }) => {
        router.post(route, async function(req, res) {
            const { user_Id } = req.session;
            if (!user_Id) return;

            try {
                const submittedValue = req.body[requestField];
                const value = transform === 'password'
                    ? await hashPassword(submittedValue)
                    : submittedValue;

                await User.update({ [userField]: value }, {
                    where: { user_ID: user_Id },
                });
                return res.redirect('/updateInfo');
            } catch (error) {
                return res.render('pages/404.ejs');
            }
        });
    });
}

module.exports = registerProfileUpdateRoutes;
