const config = require('./config.js');
const recursive = require('recursive-readdir');
const path = require('path');
const fs = require('fs').promises;
const IntentionStorage = require('intention-storage');
const mm = require('music-metadata');

const resultsFile = path.resolve(__dirname, 'results.json');

async function readTags(filename) {
    const mdata = await mm.parseFile(filename);
    const data = mdata.common;
    if ((data.artist == null) || (data.artist == '') ||
        (data.title == null) || (data.title == '')) return null;
    const genre = data.genre.join(',').toLowerCase();
    console.log(genre);
    return {
        artist: data.artist.toLowerCase().trim(),
        title: data.title.toLowerCase().trim(),
        filename: filename,
        genre: genre
    }
}

function getLanguage(word) {
    const testRuReg = /[а-я]+/i;
    const match = testRuReg.exec(word);
    if (match == null) return 'en';
    return 'ru';
}

function createArtist(entities, artist) {
    const lang = getLanguage(artist);
    entities[artist] = {
        words: {},
        songs: [],
        type: 'type',
        key: IntentionStorage.generateUUID(),
        value: artist,
        kind: 'artist',
        name: {
            general: 'Music',
            en: 'Music',
            ru: 'Музыка'
        },
    };
    entities[artist].words[lang] = artist;
}

function addSong(entities, data) {
    const lang = getLanguage(data.title);
    const tobj = {};
    tobj[lang] = data.title;
    let gobj = undefined;
    if (data.genre != null) {
        if (config.genres[data.genre] != null) {
            gobj = config.genres[data.genre];
        }
        else {
            gobj = {};
            const gLang = getLanguage(data.genre);
            gobj[gLang] = data.genre;
        }
    }

    const song = {
        filename: data.filename,
        words: tobj,
        genre: gobj
    };
    addSongToIndex(entities[data.artist].songs, song);
    return song;
}



function checkValid(name) {
    let mname = name.trim().toLowerCase();
    if ((mname == '') || (mname == null)) return null;
    const digitalExp = /^\d+$/;
    let match = digitalExp.exec(mname);
    if (match != null) return null;
    const nonReadExp = /[\[\]+()]+/;
    match = nonReadExp.exec(mname);
    if (match != null)
        return null;
    return mname;
}

function getFromPath(filename) {
    const parsers = config.fileNameParsers;
    const pf = path.parse(filename);
    for (let parser of parsers) {
        try {
            const reg = new RegExp(parser.regExp, 'i');
            const match = reg.exec(pf.name);
            if (match == null) continue;
            const fields = parser.fields;
            const res = {};
            for (let i = 1; i < match.length; i++) {
                const name = fields[i - 1];
                res[name] = checkValid(match[i]);
            }
            if (res.artist == null) {
                const ppf = path.parse(pf.dir);
                res.artist = checkValid(ppf.name);
            }
            res.filename = filename;
            if (res.artist == null) throw new Error(`Invalid artist ${filename}`);
            if (res.title == null) throw new Error(`Invalid title ${filename}`);
            console.log(`${res.artist} - ${res.title} - ${res.filename}`);
            return res;
        } catch (e) {
            console.log(e);
        }
    }
}

function addSongToIndex(songs, song) {
    const index = songs.findIndex(s => s.filename == song.filename);
    if (index == -1) {
        songs.push(song);
        return;
    }
    songs[index] = song;
}

function getName(entity) {
    if (typeof(entity) == 'string') return entity;
    if (entity == null) throw new Error('entity is null');
    if (entity.name != null) return entity.name;
    if (entity.en != null) return entity.en;
    const ent = Object.entries(entity);
    if (ent.length == 0) throw new Error('entity has no name');
    return ent[0];
}

function addGenre(genres, song) {
    if (song.genre != null) {
        const name = getName(song.genre);
        if (name == null) {
            console.log(song.genre);
            return;
        }
        if (genres[name] == null)
            genres[name] = {
                words: song.genre,
                type: 'type',
                value: name,
                kind: "genre",
                songs: [],
                name: {
                    general: 'Music',
                    en: 'Music',
                    ru: 'Музыка'
                }
            };
        else {
            addSongToIndex(genres[name].songs, song);
        }
    }
}

function buildGenres(entities) {
    const genres = {};
    for (const key in entities) {
        if (!entities.hasOwnProperty(key)) continue;
        const entity = entities[key];
        for (const song of entity.songs) {
            addGenre(genres, song);
        }
    }
    return genres;
}

async function processFiles(results, files) {
    for (let file of files) {
        try {
            console.log(file);
            let data = await readTags(file);
            if (data == null) data = getFromPath(file);
            if (data == null) throw new Error('not found');
            if (results.entities[data.artist] == null)
                createArtist(results.entities, data.artist);
            const song = addSong(results.entities, data);
            delete results.errors[file];
        } catch (e) {
            if (e.code == "ENOENT") {
                delete results.errors[file];
                continue;
            }
            results.errors[file] = file;
        }
    }
}

async function search(directory, results) {
    function ignore(file, stats) {
        if (stats.isDirectory()) {
            const sfile = results.dirs[file];
            if ((sfile == null) || (sfile.time < stats.mtimeMs)) {
                results.dirs[file] = {
                    name: file,
                    time: stats.mtimeMs
                };
                return false;
            }
            return true;
        }
        const pi = path.parse(file);
        const exts = config.extensions;
        const index = exts.indexOf(pi.ext);
        return index == -1;
    }

    return new Promise((resolve) => {
        recursive(directory, [ignore], async function (err, files) {
            await processFiles(results, files);
            resolve(results);
        });
    });
}

exports.load = async () => {
    try {
        const buf = await fs.readFile(resultsFile);
        const js = buf.toString();
        return JSON.parse(js);
    } catch (e) {
        return { entities: {}, errors: {}, dirs: {} };
    }
};


exports.build = async () => {
    console.log('Build started');
    const results = await exports.load();
    for (let mDir of config.directories) {
        try {
            await search(mDir, results);
            await processFiles(results, Object.values(results.errors))
        } catch (e) {
            console.log(e);
        }
    }
    results.taskKey = (results.taskKey == null) ? IntentionStorage.generateUUID() : results.taskKey;
    results.genres = buildGenres(results.entities);
    const buf = JSON.stringify(results);
    await fs.writeFile(resultsFile, buf);
    console.log('Build finished');
    console.log('See results.json');
    return results;
};