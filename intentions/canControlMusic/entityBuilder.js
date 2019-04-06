const config = require('./config.js');
const recursive = require('recursive-readdir');
const path = require('path');
const nodeID3 = require('node-id3');
const fs = require('fs').promises;

const resultsFile = path.resolve(__dirname, 'results.json');

function readTags(filename) {
    return new Promise((resolve, reject) => {
        nodeID3.read(filename, function (err, data) {
            if (err != null) return reject(err);
            if (data == false) return resolve(null);
            if ((data.artist == null) || (data.artist == '') ||
                (data.title == null) || (data.title == '')) return resolve(null);
            data.genre = (data.genre != null) ? data.genre.toLowerCase() : null;
            console.log(data.genre);
            return resolve({
                artist: data.artist.toLowerCase(),
                title: data.title.toLowerCase(),
                filename: filename,
                genre: data.genre
            });
        });
    });
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
        value: 'artist',
        name: {
            name: 'Music',
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

    entities[data.artist].songs.push({
        filename: data.filename,
        words: tobj,
        genre: gobj
    });
}



function checkValid(name) {
    let mname = name.trim().toLowerCase();
    if ((mname == '') || (mname == null)) return null;
    const digitalExp = /^\d+$/;
    let match = digitalExp.exec(mname);
    if (match != null) return null;
    const nonReadExp = /[\[\]\-+()]+/;
    match = nonReadExp.exec(mname);
    if (match != null) return null;
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

async function processFiles(results, files) {
    for (let file of files) {
        try {
            console.log(file);
            let data = await readTags(file);
            if (data == null) data = getFromPath(file);
            if (data == null) throw new Error('not found');
            if (results.entities[data.artist] == null)
                createArtist(results.entities, data.artist);
            addSong(results.entities, data);
            delete results.errors[file];
        } catch (e) {
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
    const buf = JSON.stringify(results);
    await fs.writeFile(resultsFile, buf);
    console.log('Build finished');
    console.log('See results.json');
    return results;
};