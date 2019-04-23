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
                message: 'Where is Warcraft III Execution?',
                validate(input) {
                    return fs.existsSync(input) ? true : 'Need Warcraft III';
                }
            },
            {
                type: 'list',
                name: 'WE_PATH',
                message: 'Where is World Editor Execution',
                choices(answers) {
                    const gameDir = path.dirname(answers.GAME_PATH);
                    return fs
                        .readdirSync(gameDir)
                        .filter(f => path.extname(f).toLowerCase() === '.exe')
                        .filter(f => f.match(/editor/i))
                        .filter(f => fs.statSync(path.join(gameDir, f)).isFile())
                        .map(f => ({ name: f, value: path.join(gameDir, f) }));
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
                .forEach(prompt => this.config.set(prompt.name, props[prompt.name]));

            this.config.save();
        });
    }

    writing() {
        const copy = (to, from) =>
            this.fs.copy(this.templatePath(from || to), this.destinationPath(path.join(this.outputPath, to)));

        const copyTpl = (to, from) =>
            this.fs.copyTpl(
                this.templatePath(from || to),
                this.destinationPath(path.join(this.outputPath, to)),
                this.context
            );

        copy('map.w3x');
        copy('src');
        copy('.editorconfig', '_.editorconfig');
        copy('.gitignore', '_.gitignore');
        copyTpl('warcraft.json');
    }

    install() {
        process.chdir(this.outputPath);

        // this.installDependencies({
        //     npm: true,
        //     bower: false
        // });
    }

    end() {
        this.spawnCommand('git', ['init', '--quiet']);
    }
};
