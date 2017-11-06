import * as vscode from 'vscode';

let outInfoChannel: vscode.OutputChannel;
let outLogChannel: vscode.OutputChannel;
const logLevel = <string>vscode.workspace.getConfiguration('arma-dev').get('logLevel');

function getInfoChannel() {
    if (outInfoChannel === undefined) {
         outInfoChannel = vscode.window.createOutputChannel('Arma Dev Log');
    }
    return outInfoChannel;
}

function getLogChannel() {
    if (outLogChannel === undefined) {
         outLogChannel = vscode.window.createOutputChannel('Arma Dev Log');
    }
    return outLogChannel;
}

export function logError(error: any) {
    getLogChannel().appendLine(`[Error-${getTimeAndms()}] ${error.toString()}`.replace(/(\r\n|\n|\r)/gm, ''));
    getLogChannel().show();
    vscode.window.showErrorMessage('There was an error, please view details in the \'Arma Dev Log\' output window');
}

export function logInfo(message: string) {
    if (logLevel === 'Info' || logLevel === 'Debug') {
        getLogChannel().appendLine(`[Info -${getTimeAndms()}] ${message}`);
        getLogChannel().show();
    }
}

export function logDebug(message: string) {
    if (logLevel === 'Debug') {
        getLogChannel().appendLine(`[Debug-${getTimeAndms()}] ${message}`);
    }
}

function getTimeAndms(): string {
    const time = new Date();
    return ('0' + time.getHours()).slice(-2)   + ':' +
    ('0' + time.getMinutes()).slice(-2) + ':' +
    ('0' + time.getSeconds()).slice(-2) + '.' +
    ('00' + time.getMilliseconds()).slice(-3);
}

export function showInfo(message: string) {
    getInfoChannel().clear();
    getInfoChannel().appendLine(message);
    getInfoChannel().show();
}