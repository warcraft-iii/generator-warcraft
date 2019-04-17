'use strict';
const Generator = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');
const path = require('path');
const os = require('os');
const fs = require('fs');

module.exports = class extends Generator {
    initializing() {
        this.log(yosay('Welcome to the Warcraft III map generator!'));
    }

    prompting() {
        const prompts = [
            {
                type: 'input',
                name: 'PKG_NAME',
                message: 'What`s your package name?',
                validate(input) {
                    if (input.trim() === '') {
                        return 'Can`t empty';
                    }
                    return !fs.existsSync(input) ? true : `${input} exists.`;
                }
            },
            {
                type: 'input',
                name: 'GAME_PATH',
                message: 'Warcraft III Game Path',
                validate(input) {
                    return fs.existsSync(input) ? true : 'Need Warcraft III';
                }
            },
            {
                type: 'list',
                name: 'GAME_BUILD',
                message: 'Warcraft III build',
                choices(answers) {
                    return fs
                        .readdirSync(answers.GAME_PATH)
                        .filter(f => f.match(/[86|64]/))
                        .filter(f =>
                            fs
                                .statSync(path.join(answers.GAME_PATH, f))
                                .isDirectory()
                        );
                }
            },
            {
                type: 'list',
                name: 'GAME_EXE',
                message: 'Warcraft III Execution',
                default: 'Warcraft III.exe',
                choices(answers) {
                    const gameDir = path.join(
                        answers.GAME_PATH,
                        answers.GAME_BUILD
                    );
                    return fs
                        .readdirSync(gameDir)
                        .filter(f => path.extname(f).toLowerCase() === '.exe')
                        .filter(f => f.match(/warcraft/i))
                        .filter(f =>
                            fs.statSync(path.join(gameDir, f)).isFile()
                        );
                }
            },
            {
                type: 'list',
                name: 'WE_EXE',
                message: 'Warcraft III World Editor Execution',
                default: 'World Editor.exe',
                choices(answers) {
                    const gameDir = path.join(
                        answers.GAME_PATH,
                        answers.GAME_BUILD
                    );
                    return fs
                        .readdirSync(gameDir)
                        .filter(f => path.extname(f).toLowerCase() === '.exe')
                        .filter(f => f.match(/editor/i))
                        .filter(f =>
                            fs.statSync(path.join(gameDir, f)).isFile()
                        );
                }
            }
        ];

        prompts.forEach(prompt => {
            prompt.old_default = prompt.default;
            prompt.default = this.config.get(prompt.name) || prompt.old_default;
        });

        return this.prompt(prompts).then(props => {
            this.context = props;
            this.outputPath = this.context.PKG_NAME;

            prompts
                .filter(prompt => prompt.name !== 'PKG_NAME')
                .filter(
                    prompt =>
                        props[prompt.name] &&
                        props[prompt.name] !== prompt.old_default &&
                        props[prompt.name] !== prompt.default
                )
                .forEach(prompt =>
                    this.config.set(prompt.name, props[prompt.name])
                );

            this.config.save();
        });
    }

    writing() {
        const convert = f => f.replace(/^\./g, '_.');
        const copy = f =>
            this.fs.copy(
                this.templatePath(convert(f)),
                this.destinationPath(path.join(this.outputPath, f))
            );

        const copyTpl = f =>
            this.fs.copyTpl(
                this.templatePath(convert(f)),
                this.destinationPath(path.join(this.outputPath, f)),
                this.context
            );

        copy('map.w3x');
        copy('src');
        copy('tools');
        copy('.editorconfig');
        copy('.gitignore');
        copyTpl('package.json');
    }

    install() {
        process.chdir(this.outputPath);

        this.installDependencies({
            npm: true,
            bower: false
        });
    }

    end() {
        this.spawnCommand('git', ['init', '--quiet']);
    }
};
