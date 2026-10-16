class ManageFilms {
    constructor({ films, imageStorage }) {
        this.films = films;
        this.imageStorage = imageStorage;
    }

    list() { return this.films.listAll(); }

    async update(id, { name, image }) {
        if (!Number.isInteger(id) || id <= 0) throw new Error('Invalid film ID.');
        let imagePath;
        try {
            if (typeof name !== 'string' || !name.trim()) throw new Error('Film name is required.');
            const attributes = { film_Name: name.trim() };
            if (image && image.size > 0) imagePath = await this.imageStorage.save(image);
            else await this.imageStorage.remove(image);
            if (imagePath) attributes.film_Image = imagePath;
            const [count] = await this.films.update(id, attributes);
            if (!count) throw new Error('Film was not found.');
            return { updated: true };
        } catch (error) {
            await this.imageStorage.remove(image);
            await this.imageStorage.removeSaved(imagePath);
            throw error;
        }
    }

    async create({ name, releaseDate, duration, image }) {
        let imagePath;
        try {
            if (typeof name !== 'string' || !name.trim() || !releaseDate
                || Number.isNaN(Date.parse(releaseDate)) || !Number.isInteger(duration) || duration <= 0) {
                throw new Error('Film details are invalid.');
            }
            imagePath = await this.imageStorage.save(image);
            await this.films.create({
                film_Name: name.trim(),
                film_Image: imagePath,
                film_DatePublic: releaseDate,
                film_Time: duration,
            });
            return { created: true };
        } catch (error) {
            await this.imageStorage.remove(image);
            await this.imageStorage.removeSaved(imagePath);
            throw error;
        }
    }

    async delete(id) {
        if (!Number.isInteger(id) || id <= 0) throw new Error('Invalid film ID.');
        return this.films.delete(id);
    }
}

module.exports = ManageFilms;
