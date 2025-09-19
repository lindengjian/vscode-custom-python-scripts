# 自定义Python脚本 VSCode扩展

这是一个VSCode扩展，允许您在右键菜单中添加自定义Python脚本，并快速执行它们。

## 功能特性

- 🐍 在右键菜单中添加"自定义脚本"子菜单
- ➕ 快速创建新的Python脚本
- 🔄 自动扫描和刷新脚本列表
- 📁 一键打开脚本文件夹
- 🚀 快速选择和执行Python脚本
- 📊 实时显示脚本执行结果和错误信息
- ⚙️ 可配置的Python解释器路径和脚本存放路径

## 安装方法

1. 下载 `.vsix` 扩展文件
2. 在VSCode中按 `Cmd+Shift+P` (Mac) 或 `Ctrl+Shift+P` (Windows/Linux)
3. 输入 "Extensions: Install from VSIX..."
4. 选择下载的 `.vsix` 文件
5. 重启VSCode以激活扩展

或者使用命令行安装：
```bash
code --install-extension custom-python-scripts-1.0.0.vsix
```

## 使用方法

### 1. 使用右键菜单

1. 在文件资源管理器或编辑器中右键点击
2. 选择 "🐍 自定义脚本" 子菜单
3. 选择以下选项之一：
   - **🐍 运行Python脚本**: 显示脚本选择器，选择要执行的脚本
   - **➕ 添加新脚本**: 创建一个新的Python脚本
   - **📁 打开脚本文件夹**: 在新窗口中打开脚本存放文件夹
   - **🔄 刷新脚本列表**: 重新扫描脚本文件夹

### 2. 使用命令面板

按 `Ctrl+Shift+P` (Windows/Linux) 或 `Cmd+Shift+P` (Mac) 打开命令面板，然后输入：

- `自定义脚本: 运行Python脚本`
- `自定义脚本: 添加新脚本`
- `自定义脚本: 打开脚本文件夹`
- `自定义脚本: 刷新脚本列表`

## 配置选项

在VSCode设置中，您可以配置以下选项：

### `customScripts.scriptsPath`
- **类型**: `string`
- **默认值**: `""` (使用扩展默认路径)
- **描述**: 自定义脚本存放路径。留空则使用扩展的默认全局存储路径。

### `customScripts.pythonPath`
- **类型**: `string`
- **默认值**: `"python3"`
- **描述**: Python解释器路径。可以是系统PATH中的命令，也可以是完整路径。

## 脚本模板

当您创建新脚本时，会自动生成以下模板：

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
script_name - 自定义Python脚本
创建时间: 2024-01-01 12:00:00
"""

import sys
import os
from datetime import datetime

def main():
    """主函数 - 在这里添加你的代码"""
    print(f"执行脚本: script_name")
    print(f"执行时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"当前目录: {os.getcwd()}")
    
    # TODO: 在这里添加你的代码逻辑
    print("脚本执行完成！")

if __name__ == "__main__":
    main()
```

## 脚本执行环境

- **工作目录**: 当前VSCode工作区的根目录
- **超时时间**: 30秒
- **输出显示**: 在专用的输出通道中显示执行结果
- **错误处理**: 自动捕获和显示执行错误

## 故障排除

### 脚本执行失败

1. 检查Python解释器路径是否正确
2. 确认脚本文件语法正确
3. 查看输出通道中的详细错误信息

### 找不到脚本

1. 使用"刷新脚本列表"命令
2. 检查脚本文件夹路径配置
3. 确认脚本文件以 `.py` 结尾

### 权限问题

1. 确保对脚本文件夹有读写权限
2. 检查Python解释器的执行权限

## 许可证

MIT License