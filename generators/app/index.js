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
                name: 'name',
                message: 'What`s your package name?'
            },
            {
                type: 'input',
                name: 'game_path',
                message: 'Warcraft III Game Path'
            },
            {
                type: 'list',
                name: 'build',
                message: 'Warcraft III build',
                choices: ['x86_64', 'x86']
            },
            {
                type: 'input',
                name: 'warcraft',
                message: 'Warcraft III Execution',
                default: 'Warcraft III.exe'
            },
            {
                type: 'input',
                name: 'world_editor',
                message: 'Warcraft III World Editor Execution',
                default: 'World Editor.exe'
            }
        ];

        return this.prompt(prompts).then(props => {
            this.context = props;
        });
    }

    writing() {
        const copy = f =>
            this.fs.copy(
                this.templatePath(f.replace(/^\./g, '_')),
                this.destinationPath(path.join(this.context.name, f))
            );

        const copyTpl = f =>
            this.fs.copyTpl(
                this.templatePath(f.replace(/^\./g, '_')),
                this.destinationPath(path.join(this.context.name, f)),
                this.context
            );

        copy('map.w3x');
        copy('src');
        copy('tools');
        copy('.editorconfig');
        copy('.gitignore');
        copyTpl('package.json');
        copyTpl('warcraft.json');
    }

    install() {
        process.chdir(this.context.name);

        this.installDependencies({
            npm: true,
            bower: false
        });
    }

    end() {
        this.spawnCommand('git', ['init', '--quiet']);
    }
};
