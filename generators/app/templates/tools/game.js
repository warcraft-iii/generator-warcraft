#!/usr/bin/env node
/**
 * @File   : game.js
 * @Author : Dencer (tdaddon@163.com)
 * @Link   : https://dengsir.github.io
 * @Date   : 4/17/2019, 3:19:12 PM
 */

const path = require('path');
const cp = require('mz/child_process');
const fs = require('mz/fs');

async function getDocPath() {
    let result = (await cp.exec(
        `reg query "HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\User Shell Folders" /v Personal`
    )).toString();

    let m = result.match(/Personal\s+REG_EXPAND_SZ\s+([^\r\n]+)/);
    if (!m) {
        return;
    }
    return m[1].replace(/%([^%]+)%/g, (_, x)=> {
        return process.env[x];
    });
}

async function main() {
    const fileName = `_${process.env.npm_package_config_MAP_PKG_PATH}`;
    const target = path.join(await getDocPath(), 'Warcraft III/Maps/Test', fileName);
    const exec = path.join(
        process.env.npm_package_config_GAME_PATH,
        process.env.npm_package_config_GAME_BUILD,
        process.env.npm_package_config_GAME_EXE
    );
    const cmdLines = process.env.npm_package_config_GAME_CMDLINE
        ? process.env.npm_package_config_GAME_CMDLINE.split(' ')
        : [];

    await fs.copyFile(fileName, target);
    cp.spawn(exec, [...cmdLines, '-loadfile', target], {
        detached: true
    });
    process.exit(0);
}

main();
