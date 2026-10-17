const test = require('node:test');
const assert = require('node:assert/strict');
const { toPlainRecord, toPlainRecords } = require('../src/infrastructure/persistence/sequelize/toPlainRecord');
const FilmRepository = require('../src/infrastructure/persistence/sequelize/FilmRepository');

test('persistence mapper detaches Sequelize rows and recursively maps associations', () => {
    const associatedFilm = { dataValues: { film_ID: 7, film_Name: 'Film' }, _options: { secret: true } };
    const cinema = { dataValues: { cinema_ID: 4, Film: associatedFilm } };
    const mapped = toPlainRecord(cinema);
    assert.deepEqual(mapped, { cinema_ID: 4, Film: { film_ID: 7, film_Name: 'Film' } });
    assert.notEqual(mapped, cinema);
    assert.notEqual(mapped.Film, associatedFilm);
    assert.deepEqual(toPlainRecords([cinema]), [mapped]);
    assert.equal(toPlainRecord(null), null);
});

test('film repository returns detached records rather than Sequelize instances', async () => {
    const instance = { dataValues: { film_ID: 9, film_Name: 'Film' }, save() {} };
    const repository = new FilmRepository({ findAll: async () => [instance] });
    const [film] = await repository.listAll();
    assert.deepEqual(film, { film_ID: 9, film_Name: 'Film' });
    assert.notEqual(film, instance);
    assert.equal(film.save, undefined);
});
