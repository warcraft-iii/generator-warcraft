/**
 * @File   : utils.js
 * @Author : DengSir (tdaddon@163.com)
 * @Link   : https://dengsir.github.io
 * @Date   : 4/15/2019, 3:17:14 PM
 */

async function _walk(p, r) {
    const path = require('path');
    const fs = require('mz/fs');

    for (let file of await fs.readdir(p)) {
        file = path.join(p, file);

        let stats = await fs.lstat(file);
        if (stats.isDirectory()) {
            await _walk(file, r);
        } else {
            r.push(file);
        }
    }
    return r;
}

function walk(p) {
    return _walk(p, []);
}

async function getSystemFolder(key) {
    const cp = require('mz/child_process');

    let result = (await cp.exec(
        `reg query "HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\User Shell Folders" /v "${key}"`
    )).toString();

    let m = result.match(new RegExp(`${key}\\s+REG_EXPAND_SZ\\s+([^\\r\\n]+)`));
    if (!m) {
        return;
    }
    return m[1];
}

module.exports = {
    walk,
    getSystemFolder
};
