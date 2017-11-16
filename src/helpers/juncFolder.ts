import * as vscode from 'vscode';
import * as path from 'path';
import { spawn, exec, spawnSync } from 'child_process';
import * as fs from 'fs';
import * as logger from '../logger';

import { getSteamPath } from './getSteamPath';
import { getPrefixFromFile } from './armaTools';

import { ArmaDev } from '../armadev';
import { ArmaConfig } from '../models';

const Arma3Folder = path.join('steamapps', 'common', 'Arma 3');
let workingDir: string = vscode.workspace.workspaceFolders[0].uri.fsPath;

export async function createJuncFolders(removePbo: boolean): Promise<void> {
    let steamPath = await getSteamPath();
    if (steamPath === undefined) return;

    let armaFullPath = path.join(steamPath, Arma3Folder);
    let config = ArmaDev.Self.Config;

    return new Promise<void>((resolve, reject) => {
        let success = true;

        try {
            config.clientDirs.forEach((value) => {
                let prefixPbo = getPrefixFromFile(value);
                if (!prefixPbo) throw 'No prefix file found or defined for ' + value;

                if (!prefixPbo.match(/x\\[\w_]+/)) {
                    vscode.window.showWarningMessage('Arma 3: Code Live requires a strict prefix format. Example: x\\your_addonname');
                    throw 'A proper PREFIX (x\\your_addonname) is required for ' + value;
                }

                let devPath = path.join(armaFullPath, prefixPbo);
                let devDir = path.dirname(devPath);
                let devMemoryName = path.basename(devPath);

                logger.logDebug('Create developer environment: ' + devDir);
                spawnSync('cmd', ['/c', 'mkdir', devDir]);

                if (isJuncFolder( path.join(armaFullPath, prefixPbo))) return;

                logger.logDebug('Create symlink refering to ' + value);
                let p = spawnSync('cmd', ['/c', 'mklink', '/J', devMemoryName, path.join(workingDir, value)], { cwd: devDir });
                if (p.error) throw 'Something went wrong while creating symlink for ' + value;
                logger.logInfo( p.output.join(' ') );
            });
            resolve();
        } catch (e) {
            reject(e);
        }
    });
}

export async function clearJuncFolders(): Promise<void> {
    let steamPath = await getSteamPath();
    if (steamPath === undefined) return;

    let armaFullPath = path.join(steamPath, Arma3Folder);
    let config = ArmaDev.Self.Config;

    return new Promise<void>((resolve, reject) => {
        try {
            config.clientDirs.forEach((value) => {
                let prefixPbo = getPrefixFromFile(value);
                if (!prefixPbo) return;

                let devPath = path.join(armaFullPath, prefixPbo);
                if (!isJuncFolder(devPath)) return;

                let p = spawnSync('cmd', ['/c', 'rmdir', devPath]);
                if (p.error) throw 'Something went wrong removing symlink for ' + value;
                logger.logInfo( 'Symlink removed for ' + value );
            });
            resolve();
        } catch (e) {
            reject(e);
        }
    });
}

function isJuncFolder(pathToCheck: string): boolean {
    if (!fs.existsSync(pathToCheck)) return false;
    let stat = fs.lstatSync(pathToCheck);
    return stat.isSymbolicLink();
}

