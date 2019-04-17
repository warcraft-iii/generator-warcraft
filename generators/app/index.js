'use strict';
const Generator = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');
const path = require('path');

module.exports = class extends Generator {
    initializing() {
        this.log(yosay('Welcome to the Warcraft III map generator!'));
    }

    prompting() {
        const prompts = [
            {
                type: 'input',
                name: 'PKG_NAME',
                message: 'What`s your package name?'
            },
            {
                type: 'input',
                name: 'GAME_PATH',
                message: 'Warcraft III Game Path'
            },
            {
                type: 'list',
                name: 'GAME_BUILD',
                message: 'Warcraft III build',
                choices: ['x86_64', 'x86']
            },
            {
                type: 'input',
                name: 'GAME_EXE',
                message: 'Warcraft III Execution',
                default: 'Warcraft III.exe'
            },
            {
                type: 'input',
                name: 'WE_EXE',
                message: 'Warcraft III World Editor Execution',
                default: 'World Editor.exe'
            }
        ];

        return this.prompt(prompts).then(props => {
            this.context = props;
            this.outputPath = this.context.PKG_NAME;
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
