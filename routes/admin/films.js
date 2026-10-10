const router = require('./utils/createRouter')();
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const formidable = require('formidable');
const { Film } = require('./utils/models');

const imageDirectory = path.join(__dirname, '../../public/image');
const allowedImageExtensions = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp']);

async function parseFilmForm(req) {
    await fs.promises.mkdir(imageDirectory, { recursive: true });
    return new Promise((resolve, reject) => {
        const form = new formidable.IncomingForm({
            uploadDir: imageDirectory,
            keepExtensions: true,
            maxFileSize: 10 * 1024 * 1024,
        });
        form.parse(req, (error, fields, files) => {
            if (error) {
                const uploads = Object.values(files || {}).flat();
                uploads.forEach(upload => {
                    if (upload && upload.path) fs.promises.unlink(upload.path).catch(() => {});
                });
                return reject(error);
            }
            resolve({ fields, files });
        });
    });
}

function getSingleValue(value) {
    return Array.isArray(value) ? value[0] : value;
}

async function saveFilmImage(upload) {
    if (!upload || !upload.path || !upload.name) {
        throw new Error('A film image is required.');
    }

    const extension = path.extname(upload.name).toLowerCase();
    if (!allowedImageExtensions.has(extension)) {
        throw new Error('Unsupported film image type.');
    }

    await fs.promises.mkdir(imageDirectory, { recursive: true });
    const filename = `film-${Date.now()}-${crypto.randomBytes(6).toString('hex')}${extension}`;
    const destination = path.join(imageDirectory, filename);
    await fs.promises.rename(upload.path, destination);
    return `/public/image/${filename}`;
}

async function removeTemporaryUpload(upload) {
    if (!upload || !upload.path) return;
    await fs.promises.unlink(upload.path).catch(() => {});
}

router.get('/update/film/', async function(req, res) {
    if (!req.session || !req.session.Admin) return res.redirect('/');

    const filmAll = await Film.findAll({ order: [['film_ID', 'ASC']] });
    res.render('admin.ejs', { filmAll });
});

router.post('/update/film/:id', async function(req, res) {
    if (!req.session || !req.session.Admin) return res.redirect('/');

    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.render('404NotFound.ejs');

    let upload;
    let imagePath;
    try {
        const { fields, files } = await parseFilmForm(req);
        upload = getSingleValue(files.txtFilmImage);
        const filmName = getSingleValue(fields.txtFilmName);
        if (typeof filmName !== 'string' || !filmName.trim()) {
            throw new Error('Film name is required.');
        }
        const updates = { film_Name: filmName.trim() };
        if (upload && upload.size > 0) {
            imagePath = await saveFilmImage(upload);
            updates.film_Image = imagePath;
        } else {
            await removeTemporaryUpload(upload);
        }

        const [updatedCount] = await Film.update(updates, { where: { film_ID: id } });
        if (!updatedCount) {
            if (imagePath) await fs.promises.unlink(path.join(imageDirectory, path.basename(imagePath))).catch(() => {});
            return res.render('404NotFound.ejs');
        }
        return res.redirect('/admin/update/film/');
    } catch (error) {
        await removeTemporaryUpload(upload);
        if (imagePath) await fs.promises.unlink(path.join(imageDirectory, path.basename(imagePath))).catch(() => {});
        console.error('Unable to update film:', error);
        return res.render('404NotFound.ejs');
    }
});

router.post('/delete/film/:id', async function(req, res) {
    if (!req.session || !req.session.Admin) return res.redirect('/');

    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.render('404NotFound.ejs');
    try {
        await Film.destroy({ where: { film_ID: id } });
        return res.redirect('/admin/update/film/');
    } catch (error) {
        console.error('Unable to delete film:', error);
        return res.render('404NotFound.ejs');
    }
});

router.post('/create/film/', async function(req, res) {
    if (!req.session || !req.session.Admin) return res.redirect('/');

    let upload;
    let imagePath;
    try {
        const { fields, files } = await parseFilmForm(req);
        upload = getSingleValue(files.txtFilmImage);
        const filmName = getSingleValue(fields.txtFilmName);
        const releaseDate = getSingleValue(fields.txtFilmDatePublic);
        const duration = Number(getSingleValue(fields.txtFilmTime));
        if (typeof filmName !== 'string' || !filmName.trim()
            || !releaseDate || Number.isNaN(Date.parse(releaseDate))
            || !Number.isInteger(duration) || duration <= 0) {
            throw new Error('Film details are invalid.');
        }
        imagePath = await saveFilmImage(upload);

        await Film.create({
            film_Name: filmName.trim(),
            film_Image: imagePath,
            film_DatePublic: releaseDate,
            film_Time: duration,
        });
        return res.redirect('/admin/update/film/');
    } catch (error) {
        await removeTemporaryUpload(upload);
        if (imagePath) await fs.promises.unlink(path.join(imageDirectory, path.basename(imagePath))).catch(() => {});
        console.error('Unable to create film:', error);
        return res.render('404NotFound.ejs');
    }
});

router.get('/create/film/', function(req, res) {
    if (!req.session || !req.session.Admin) return res.redirect('/');
    return res.redirect('/admin/update/film/');
});

module.exports = router;
