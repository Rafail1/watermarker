var fs = require('fs');
var exec = require('child_process').exec;
const MyBuffer = require('buffer-shims');
var iconv = require('iconv-lite');
var legacy = require('legacy-encoding');

const path = require('path');
const walk = function (dir, done) {
    let results = [];

    fs.readdir(dir, function (err, list) {
        if (err) return done(err);
        let pending = list.length;
        if (!pending) return done(null, results);
        list.forEach(function (file) {
            file = path.resolve(dir, file);
            fs.stat(file, function (err, stat) {
                if (stat && stat.isDirectory()) {

                    walk(file, function (err, res) {
                        results = results.concat(res);
                        if (!--pending) done(null, results);
                    });
                } else {
                    results.push(file);
                    if (!--pending) done(null, results);
                }
            });
        });
    });
};

walk('./photos', async function(err, results) {
    if (err) throw err;
    for(const i in results) {

        let item = results[i];
        if(item.indexOf('.db') !== -1 && item.indexOf('.zip') !== -1) {
            continue;
        }

        const path = item.replace(/\/[^/]*$/g, '').replace('photos/', 'result/');
        if(!fs.existsSync(path)) {
            fs.mkdirSync(path, { recursive: true });
        }
        var command = [
            'composite',
            '-gravity', 'southeast',
            '-geometry', '+30+40',
            '-quality', 100,
            './watermark.png',
            `'${item}'`,
            `'${item.replace('photos/', 'result/')}'`
    ];

        await exec(command.join(' '));
    }
});