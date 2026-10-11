const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ejs = require('ejs');
const { loadWithMocks } = require('./support/route-test-helpers');

const projectRoot = path.resolve(__dirname, '..');
const viewsRoot = path.join(projectRoot, 'views');

function listFiles(directory, extension) {
    return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
        const fullPath = path.join(directory, entry.name);
        if (entry.isDirectory()) return listFiles(fullPath, extension);
        return entry.name.endsWith(extension) ? [fullPath] : [];
    });
}

test('every EJS template compiles and each legacy include points to a file', () => {
    const templates = listFiles(viewsRoot, '.ejs');
    assert.ok(templates.length > 0);

    for (const filename of templates) {
        const source = fs.readFileSync(filename, 'utf8');
        assert.doesNotThrow(
            () => ejs.compile(source, { filename }),
            `Template failed to compile: ${path.relative(projectRoot, filename)}`,
        );

        for (const match of source.matchAll(/<%\s*include\s+([^\s%]+)/g)) {
            const includePath = path.resolve(path.dirname(filename), match[1]);
            assert.ok(
                fs.existsSync(includePath),
                `Missing include ${match[1]} in ${path.relative(projectRoot, filename)}`,
            );
        }
    }
});

test('every literal route render target exists under views', () => {
    const routeFiles = listFiles(path.join(projectRoot, 'routes'), '.js');
    const renderPattern = /res\.render\(\s*['"]([^'"]+\.ejs)['"]/g;

    for (const filename of routeFiles) {
        const source = fs.readFileSync(filename, 'utf8');
        for (const match of source.matchAll(renderPattern)) {
            const target = path.join(viewsRoot, match[1]);
            assert.ok(
                fs.existsSync(target),
                `Missing render target ${match[1]} in ${path.relative(projectRoot, filename)}`,
            );
        }
    }
});

test('film model exposes the fields used by the application', () => {
    const Film = require('../models/Film');
    for (const field of [
        'film_ID', 'film_Name', 'film_DatePublic', 'film_Image',
        'film_Time', 'film_ViewCount', 'film_Public', 'film_Content',
    ]) {
        assert.ok(Film.rawAttributes[field], `Missing film field ${field}`);
    }
});

test('user model requires a unique email and stores account confirmation state', () => {
    const User = require('../models/User');

    assert.equal(User.rawAttributes.user_Email.allowNull, false);
    assert.equal(User.rawAttributes.user_Email.unique, true);
    assert.ok(User.rawAttributes.user_Password);
    assert.ok(User.rawAttributes.accept_User);
    assert.equal(User.rawAttributes.accept_User.defaultValue, false);
});

test('showtime and cinema models expose their scheduling fields', () => {
    const Cinema = require('../models/Cinema');
    const Cineplex = require('../models/Cineplex');
    const TimeShow = require('../models/TimeShow');
    const CinemaTimeShow = require('../models/CinemaTimeShow');

    for (const field of ['cinema_ID', 'cinema_Name', 'cinema_Type', 'cinema_Length', 'cinema_Width']) {
        assert.ok(Cinema.rawAttributes[field], `Missing cinema field ${field}`);
    }
    for (const field of ['timeShow_ID', 'timeShow_Start', 'timeShow_End']) {
        assert.ok(TimeShow.rawAttributes[field], `Missing timeshow field ${field}`);
    }
    for (const field of ['cineplex_ID', 'cineplex_Name', 'cineplex_Adress']) {
        assert.ok(Cineplex.rawAttributes[field], `Missing cineplex field ${field}`);
    }
    for (const field of ['cinemaTimeShow_ID', 'cinemaTimeShow_Date', 'timeShow_ID', 'film_ID', 'cinema_ID']) {
        assert.ok(CinemaTimeShow.rawAttributes[field], `Missing schedule field ${field}`);
    }
});

test('ticket model exposes booking, seat, and price fields', () => {
    const Ticket = require('../models/Ticket');
    for (const field of ['ticket_ID', 'ticket_Num', 'ticket_ChairType', 'ticket_Chair', 'ticket_TotalMoney']) {
        assert.ok(Ticket.rawAttributes[field], `Missing ticket field ${field}`);
    }
});

test('email service sends the requested message through its configured transport', async () => {
    let transportOptions;
    let sentMessage;
    const nodemailer = {
        createTransport(options) {
            transportOptions = options;
            return {
                sendMail: async message => {
                    sentMessage = message;
                    return { messageId: 'test-message' };
                },
            };
        },
    };
    const sendEmail = loadWithMocks('models/email.js', { nodemailer });

    const result = await sendEmail('person@example.com', 'Subject', 'Plain text', '<p>HTML</p>');

    assert.equal(transportOptions.host, 'smtp.gmail.com');
    assert.equal(sentMessage.to, 'person@example.com');
    assert.equal(sentMessage.subject, 'Subject');
    assert.equal(sentMessage.text, 'Plain text');
    assert.equal(sentMessage.html, '<p>HTML</p>');
    assert.equal(result.messageId, 'test-message');
});

test('ticket and schedule models retain their declared associations', () => {
    const Cinema = require('../models/Cinema');
    const CinemaTimeShow = require('../models/CinemaTimeShow');
    const Ticket = require('../models/Ticket');

    assert.ok(Cinema.associations.Cineplex);
    assert.ok(CinemaTimeShow.associations.Cinema);
    assert.ok(CinemaTimeShow.associations.Film);
    assert.ok(CinemaTimeShow.associations.TimeShow);
    assert.ok(Ticket.associations.User);
    assert.ok(Ticket.associations.CinemaTimeShow);
});
