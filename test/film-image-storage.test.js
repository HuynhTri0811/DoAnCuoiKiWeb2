const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const FilmImageStorage = require('../src/infrastructure/storage/FilmImageStorage');

test('film image storage validates, moves, and removes uploads', async t => {
    const directory = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'film-storage-'));
    t.after(() => fs.promises.rm(directory, { recursive: true, force: true }));
    const storage = new FilmImageStorage(directory);
    await assert.rejects(storage.save(null), /required/);
    const unsupported = path.join(directory, 'unsupported.tmp');
    await fs.promises.writeFile(unsupported, 'x');
    await assert.rejects(storage.save({ path: unsupported, name: 'cover.bmp' }), /Unsupported/);
    const uploadPath = path.join(directory, 'upload.tmp');
    await fs.promises.writeFile(uploadPath, 'image');
    const publicPath = await storage.save({ path: uploadPath, name: 'cover.PNG' });
    assert.match(publicPath, /^\/public\/image\/film-.*\.png$/);
    assert.equal(await fs.promises.readFile(path.join(directory, path.basename(publicPath)), 'utf8'), 'image');
    await storage.removeSaved(publicPath);
    await storage.remove({ path: unsupported });
    await storage.remove(undefined);
    await storage.removeSaved(null);
    await assert.rejects(fs.promises.stat(path.join(directory, path.basename(publicPath))), { code: 'ENOENT' });
});

test('film image storage parses multipart data and deletes failed uploads', async t => {
    const directory = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'film-form-'));
    t.after(() => fs.promises.rm(directory, { recursive: true, force: true }));
    let receivedOptions;
    const uploaded = path.join(directory, 'partial.tmp');
    await fs.promises.writeFile(uploaded, 'partial');
    class FakeForm {
        constructor(options) { receivedOptions = options; }
        parse(_req, callback) { callback(new Error('parse failed'), {}, { image: { path: uploaded } }); }
    }
    const storage = new FilmImageStorage(directory, { IncomingForm: FakeForm });
    await assert.rejects(storage.parseForm({}), /parse failed/);
    assert.equal(receivedOptions.keepExtensions, true);
    await new Promise(resolve => setTimeout(resolve, 10));
    await assert.rejects(fs.promises.stat(uploaded), { code: 'ENOENT' });

    class SuccessfulForm {
        parse(_req, callback) { callback(null, { name: 'F' }, { image: { size: 1 } }); }
    }
    const result = await new FilmImageStorage(directory, { IncomingForm: SuccessfulForm }).parseForm({});
    assert.deepEqual(result, { fields: { name: 'F' }, files: { image: { size: 1 } } });
});
