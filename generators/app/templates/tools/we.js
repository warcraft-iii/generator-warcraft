#!/usr/bin/env node
/**
 * @File   : we.js
 * @Author : Dencer (tdaddon@163.com)
 * @Link   : https://dengsir.github.io
 * @Date   : 4/17/2019, 4:09:59 PM
 */

const path = require('path');
const cp = require('mz/child_process');

async function main() {
    const target = path.resolve(path.join(process.env.npm_package_config_MAP_PKG_PATH, 'war3map.w3i'));
    const exec = path.join(
        process.env.npm_package_config_GAME_PATH,
        process.env.npm_package_config_GAME_BUILD,
        process.env.npm_package_config_WE_EXE
    );
    const cmdLines = process.env.npm_package_config_WE_CMDLINE
        ? process.env.npm_package_config_WE_CMDLINE.split(' ')
        : [];

    cp.spawn(exec, [...cmdLines, '-loadfile', target], {
        detached: true
    });
    process.exit(0);
}

main();
