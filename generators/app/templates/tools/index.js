/**
 * @File   : index.js
 * @Author : DengSir (tdaddon@163.com)
 * @Link   : https://dengsir.github.io
 * @Date   : 4/15/2019, 3:29:39 PM
 */

'use strict';

const fs = require('mz/fs');
const cp = require('mz/child_process');
const path = require('path');
const utils = require('./lib/utils');
const config = require('../warcraft.json');
class App {
    constructor() {
        const program = require('commander')
            .version('1.0')
            .description('Welcome!');

        program
            .command('rungame')
            .option('-m, --merge', 'Merge scripts')
            .option('-p, --pack', 'Pack map')
            .action(cmd => this.onActionRunGame(cmd))
            .alias('run');

        program
            .command('worldeditor')
            .action(cmd => this.onActionWorldEditor(cmd))
            .alias('we');

        program
            .command('mergescript')
            .action(cmd => this.onActionMergeScripts(cmd))
            .alias('merge');

        program
            .command('packmap')
            .option('-m, --merge', 'Merge scripts')
            .action(cmd => this.onActionPackMap(cmd))
            .alias('pack');

        program.parse(process.argv);
    }

    async onActionRunGame(cmd) {
        if (cmd.merge) {
            await this.runMergeScripts();
        }
        if (cmd.pack) {
            await this.runPackMap();
        }
        this.runGame();
    }

    async onActionWorldEditor() {
        this.runWorldEditor();
    }

    async onActionMergeScripts() {
        this.runMergeScripts();
    }

    async onActionPackMap(cmd) {
        if (cmd.merge) {
            await this.runMergeScripts();
        }
        this.runPackMap();
    }

    async runMergeScripts() {
        const EXT_LUA = '.lua';
        const SOURCE_PATH = 'src';
        const WAR3MAP_LUA = 'war3map' + EXT_LUA;

        await fs.writeFile(
            path.join(config.map_folder, WAR3MAP_LUA),
            [
                await fs.readFile(path.join(SOURCE_PATH, WAR3MAP_LUA)),
                ...(await Promise.all(
                    (await utils.walk(SOURCE_PATH))
                        .filter(file => path.extname(file) === EXT_LUA)
                        .filter(file => path.basename(file) !== WAR3MAP_LUA)
                        .filter(file => !path.basename(file).startsWith('@'))
                        .map(async file => {
                            const name = path
                                .relative(SOURCE_PATH, file)
                                .replace(new RegExp(EXT_LUA + '$'), '')
                                .replace(/[\\\/]+/g, '.');

                            const body = await fs.readFile(file, { encoding: 'utf-8' });

                            return `_PRELOADED['${name}']=[==========[${body}]==========]`;
                        })
                ))
            ].join('\n\n')
        );
    }

    async runPackMap() {
        const storm = require('./lib/JStormLib');
        const file = config.file_name;

        if (await fs.exists(file)) {
            await fs.unlink(file);
        }

        const files = await utils.walk(config.map_folder);
        const archive = await storm.create(file, 0x00100000 | 0x00200000, files.length);

        for (const file of files) {
            await archive.writeFile(
                await fs.readFile(file),
                path.relative(config.map_folder, file),
                0,
                0x00000200,
                0x02 | 0x08
            );
        }
    }

    async runGame() {
        const file = config.file_name;
        const target = path.join(await utils.getSystemFolder('Personal'), 'Warcraft III/Maps/Test', file);
        const exec = path.join(config.game_path, config.build, config.warcraft);

        await fs.copyFile(file, target);
        cp.spawn(exec, ['-locale', 'enUS', '-windowmode', 'windowed', '-loadfile', target], {
            detached: true
        });
        process.exit(0);
    }

    async runWorldEditor() {
        const map_path = path.resolve(path.join(config.map_folder, 'war3map.w3i'));
        const we_path = path.join(config.game_path, config.build, config.world_editor);

        cp.spawn(we_path, ['-locale', 'enUS', '-loadfile', map_path], {
            detached: true
        });
        process.exit(0);
    }
}

new App();
