#!/usr/bin/env node
/**
 * @File   : pack.js
 * @Author : Dencer (tdaddon@163.com)
 * @Link   : https://dengsir.github.io
 * @Date   : 4/17/2019, 4:26:53 PM
 */

require('warcraft-pack').run(
    process.env.npm_package_config_MAP_PKG_PATH,
    `_${process.env.npm_package_config_MAP_PKG_PATH}`
);
