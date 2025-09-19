import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';

/**
 * 扩展激活函数
 * @param context 扩展上下文
 */
export function activate(context: vscode.ExtensionContext) {
    console.log('自定义Python脚本扩展已激活');

    const scriptManager = new ScriptManager(context);
    
    // 注册基础命令
    const commands = [
        vscode.commands.registerCommand('customScripts.openScriptsFolder', () => {
            scriptManager.openScriptsFolder();
        }),
        vscode.commands.registerCommand('customScripts.refreshScripts', () => {
            scriptManager.refreshScripts();
        }),
        vscode.commands.registerCommand('customScripts.addNewScript', () => {
            scriptManager.addNewScript();
        }),
        vscode.commands.registerCommand('customScripts.runScript', () => {
            scriptManager.showScriptPicker();
        })
    ];

    context.subscriptions.push(...commands);

    // 初始化脚本管理器
    scriptManager.initialize();
}

/**
 * 扩展停用函数
 */
export function deactivate() {
    console.log('自定义Python脚本扩展已停用');
}

/**
 * 脚本管理器类
 */
class ScriptManager {
    private context: vscode.ExtensionContext;
    private scriptsPath: string;
    private scriptCommands: vscode.Disposable[] = [];

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.scriptsPath = this.getScriptsPath();
    }

    /**
     * 初始化脚本管理器
     */
    public initialize() {
        this.ensureScriptsDirectory();
        this.refreshScripts();
        
        // 监听配置变化
        const configWatcher = vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('customScripts')) {
                this.scriptsPath = this.getScriptsPath();
                this.refreshScripts();
            }
        });
        
        this.context.subscriptions.push(configWatcher);
    }

    /**
     * 获取脚本存放路径
     */
    private getScriptsPath(): string {
        const config = vscode.workspace.getConfiguration('customScripts');
        const customPath = config.get<string>('scriptsPath');
        
        if (customPath && customPath.trim()) {
            return path.resolve(customPath);
        }
        
        return path.join(this.context.globalStorageUri.fsPath, 'scripts');
    }

    /**
     * 确保脚本目录存在
     */
    private ensureScriptsDirectory() {
        if (!fs.existsSync(this.scriptsPath)) {
            fs.mkdirSync(this.scriptsPath, { recursive: true });
            this.createExampleScript();
        }
    }

    /**
     * 创建示例脚本
     */
    private createExampleScript() {
        const exampleScript = `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
示例Python脚本
这是一个简单的示例脚本，展示如何在VSCode中使用自定义脚本功能
"""

import sys
import os
from datetime import datetime

def main():
    """主函数"""
    print("=== 自定义Python脚本示例 ===")
    print(f"执行时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"当前工作目录: {os.getcwd()}")
    print(f"Python版本: {sys.version}")
    print("脚本执行成功！")
    
    # 如果有命令行参数，打印出来
    if len(sys.argv) > 1:
        print(f"接收到的参数: {sys.argv[1:]}")
    
    # 列出当前目录的文件
    try:
        files = os.listdir('.')
        print(f"当前目录文件数量: {len(files)}")
        if files:
            print("前5个文件:")
            for file in files[:5]:
                print(f"  - {file}")
    except Exception as e:
        print(f"读取目录失败: {e}")

if __name__ == "__main__":
    main()
`;
        
        const examplePath = path.join(this.scriptsPath, 'example.py');
        fs.writeFileSync(examplePath, exampleScript, 'utf8');
    }

    /**
     * 刷新脚本列表
     */
    public refreshScripts() {
        // 清理之前注册的脚本命令
        this.scriptCommands.forEach(cmd => cmd.dispose());
        this.scriptCommands = [];

        if (!fs.existsSync(this.scriptsPath)) {
            vscode.window.showWarningMessage('脚本目录不存在，正在创建...');
            this.ensureScriptsDirectory();
            return;
        }

        // 扫描Python脚本文件
        const scripts = fs.readdirSync(this.scriptsPath)
            .filter(file => file.endsWith('.py') && fs.statSync(path.join(this.scriptsPath, file)).isFile())
            .sort();

        // 为每个脚本注册命令
        scripts.forEach(script => {
            const scriptName = path.basename(script, '.py');
            const commandId = `customScripts.run.${scriptName}`;
            
            // 注册执行命令
            const command = vscode.commands.registerCommand(commandId, () => {
                this.executeScript(script);
            });
            
            this.scriptCommands.push(command);
            this.context.subscriptions.push(command);
        });

        const message = scripts.length > 0 
            ? `已刷新 ${scripts.length} 个Python脚本: ${scripts.map(s => path.basename(s, '.py')).join(', ')}`
            : '未找到Python脚本文件';
            
        vscode.window.showInformationMessage(message);
    }

    /**
     * 执行Python脚本
     */
    private executeScript(scriptName: string) {
        const scriptPath = path.join(this.scriptsPath, scriptName);
        
        if (!fs.existsSync(scriptPath)) {
            vscode.window.showErrorMessage(`脚本文件不存在: ${scriptName}`);
            return;
        }

        const config = vscode.workspace.getConfiguration('customScripts');
        const pythonPath = config.get<string>('pythonPath') || 'python3';

        // 获取当前工作目录
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        const cwd = workspaceFolder ? workspaceFolder.uri.fsPath : process.cwd();

        // 创建输出通道
        const scriptDisplayName = path.basename(scriptName, '.py');
        const outputChannel = vscode.window.createOutputChannel(`🐍 ${scriptDisplayName}`);
        outputChannel.show();
        
        outputChannel.appendLine(`执行脚本: ${scriptName}`);
        outputChannel.appendLine(`脚本路径: ${scriptPath}`);
        outputChannel.appendLine(`工作目录: ${cwd}`);
        outputChannel.appendLine(`Python路径: ${pythonPath}`);
        outputChannel.appendLine(`执行时间: ${new Date().toLocaleString()}`);
        outputChannel.appendLine('='.repeat(60));

        // 显示执行开始消息
        vscode.window.showInformationMessage(`正在执行脚本: ${scriptDisplayName}...`);

        // 执行脚本
        const command = `"${pythonPath}" "${scriptPath}"`;
        const startTime = Date.now();
        
        exec(command, { cwd, timeout: 30000 }, (error, stdout, stderr) => {
            const duration = Date.now() - startTime;
            
            if (error) {
                outputChannel.appendLine(`❌ 执行错误 (耗时: ${duration}ms):`);
                outputChannel.appendLine(error.message);
                vscode.window.showErrorMessage(`脚本执行失败: ${error.message}`);
                return;
            }

            if (stderr) {
                outputChannel.appendLine(`⚠️  错误输出:`);
                outputChannel.appendLine(stderr);
            }

            if (stdout) {
                outputChannel.appendLine(`📄 标准输出:`);
                outputChannel.appendLine(stdout);
            }

            outputChannel.appendLine('='.repeat(60));
            outputChannel.appendLine(`✅ 脚本执行完成 (耗时: ${duration}ms)`);
            
            vscode.window.showInformationMessage(`脚本 ${scriptDisplayName} 执行完成 (${duration}ms)`);
        });
    }

    /**
     * 打开脚本文件夹
     */
    public openScriptsFolder() {
        this.ensureScriptsDirectory();
        
        // 在新窗口中打开脚本文件夹
        const uri = vscode.Uri.file(this.scriptsPath);
        vscode.commands.executeCommand('vscode.openFolder', uri, { forceNewWindow: true });
        
        vscode.window.showInformationMessage(`已打开脚本文件夹: ${this.scriptsPath}`);
    }

    /**
     * 显示脚本选择器
     */
    public async showScriptPicker() {
        if (!fs.existsSync(this.scriptsPath)) {
            vscode.window.showWarningMessage('脚本目录不存在，正在创建...');
            this.ensureScriptsDirectory();
            return;
        }

        // 扫描Python脚本文件
        const scripts = fs.readdirSync(this.scriptsPath)
            .filter(file => file.endsWith('.py') && fs.statSync(path.join(this.scriptsPath, file)).isFile())
            .sort();

        if (scripts.length === 0) {
            const action = await vscode.window.showInformationMessage(
                '未找到Python脚本文件，是否创建一个新脚本？',
                '创建脚本',
                '打开脚本文件夹'
            );
            
            if (action === '创建脚本') {
                this.addNewScript();
            } else if (action === '打开脚本文件夹') {
                this.openScriptsFolder();
            }
            return;
        }

        // 创建快速选择项
        const quickPickItems = scripts.map(script => {
            const scriptName = path.basename(script, '.py');
            const scriptPath = path.join(this.scriptsPath, script);
            const stats = fs.statSync(scriptPath);
            
            return {
                label: `🐍 ${scriptName}`,
                description: script,
                detail: `修改时间: ${stats.mtime.toLocaleString()}`,
                script: script
            };
        });

        // 显示快速选择
        const selected = await vscode.window.showQuickPick(quickPickItems, {
            placeHolder: '选择要执行的Python脚本',
            matchOnDescription: true,
            matchOnDetail: true
        });

        if (selected) {
            this.executeScript(selected.script);
        }
    }

    /**
     * 添加新脚本
     */
    public async addNewScript() {
        const scriptName = await vscode.window.showInputBox({
            prompt: '请输入脚本名称（不需要.py后缀）',
            placeHolder: 'my_script',
            validateInput: (value) => {
                if (!value || !value.trim()) {
                    return '脚本名称不能为空';
                }
                if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value.trim())) {
                    return '脚本名称只能包含字母、数字和下划线，且不能以数字开头';
                }
                return null;
            }
        });

        if (!scriptName) {
            return;
        }

        const fileName = scriptName.endsWith('.py') ? scriptName : `${scriptName}.py`;
        const scriptPath = path.join(this.scriptsPath, fileName);

        if (fs.existsSync(scriptPath)) {
            const overwrite = await vscode.window.showWarningMessage(
                '脚本文件已存在，是否覆盖？',
                '覆盖',
                '取消'
            );
            if (overwrite !== '覆盖') {
                return;
            }
        }

        // 创建新脚本模板
        const template = `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
${scriptName} - 自定义Python脚本
创建时间: ${new Date().toLocaleString()}
"""

import sys
import os
from datetime import datetime

def main():
    """主函数 - 在这里添加你的代码"""
    print(f"执行脚本: {scriptName}")
    print(f"执行时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"当前目录: {os.getcwd()}")
    
    # TODO: 在这里添加你的代码逻辑
    print("脚本执行完成！")

if __name__ == "__main__":
    main()
`;

        try {
            this.ensureScriptsDirectory();
            fs.writeFileSync(scriptPath, template, 'utf8');
            
            // 打开新创建的脚本文件
            const document = await vscode.workspace.openTextDocument(scriptPath);
            await vscode.window.showTextDocument(document);
            
            // 刷新脚本列表
            this.refreshScripts();
            
            vscode.window.showInformationMessage(`脚本 ${fileName} 创建成功！`);
        } catch (error) {
            vscode.window.showErrorMessage(`创建脚本失败: ${error}`);
        }
    }
}