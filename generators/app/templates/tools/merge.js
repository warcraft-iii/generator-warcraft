#!/usr/bin/env node
/**
 * @File   : merge.js
 * @Author : Dencer (tdaddon@163.com)
 * @Link   : https://dengsir.github.io
 * @Date   : 4/17/2019, 4:26:45 PM
 */

module.exports = require('warcraft-mergescripts').run(
    'src',
    `${process.env.npm_package_config_MAP_PKG_PATH}/war3map.lua`
);
