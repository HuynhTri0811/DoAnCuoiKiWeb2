/**
 * Detach Sequelize instances from the application layer. Read repositories expose
 * plain data records; write repositories translate application attributes into
 * Sequelize column names at the adapter boundary.
 */
function toPlainRecord(record) {
    if (record == null || typeof record !== 'object') return record;
    if (Array.isArray(record)) return record.map(toPlainRecord);
    if (record instanceof Date) return new Date(record.getTime());

    const values = record.dataValues && typeof record.dataValues === 'object'
        ? record.dataValues
        : record;
    const result = {};
    for (const [key, value] of Object.entries(values)) {
        if (key === '_previousDataValues' || key === '_options' || key === '_changed') continue;
        result[key] = toPlainRecord(value);
    }
    return result;
}

function toPlainRecords(records) {
    return (records || []).map(toPlainRecord);
}

module.exports = { toPlainRecord, toPlainRecords };
