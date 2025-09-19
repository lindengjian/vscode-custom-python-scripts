#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
example.py - 示例Python脚本
创建时间: 2024-01-01 12:00:00
描述: 这是一个示例脚本，展示如何在VSCode扩展中使用自定义Python脚本
"""

import sys
import os
import platform
from datetime import datetime

def show_system_info():
    """显示系统信息"""
    print("=" * 50)
    print("🖥️  系统信息")
    print("=" * 50)
    print(f"操作系统: {platform.system()} {platform.release()}")
    print(f"Python版本: {sys.version}")
    print(f"当前时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"当前用户: {os.getenv('USER', 'Unknown')}")
    print()

def show_directory_info():
    """显示当前目录信息"""
    print("=" * 50)
    print("📁 当前目录信息")
    print("=" * 50)
    current_dir = os.getcwd()
    print(f"当前目录: {current_dir}")
    
    try:
        files = os.listdir(current_dir)
        print(f"文件数量: {len(files)}")
        
        if files:
            print("\n📄 文件列表:")
            for i, file in enumerate(sorted(files)[:10], 1):  # 只显示前10个文件
                file_path = os.path.join(current_dir, file)
                if os.path.isdir(file_path):
                    print(f"  {i:2d}. 📁 {file}/")
                else:
                    size = os.path.getsize(file_path)
                    print(f"  {i:2d}. 📄 {file} ({size} bytes)")
            
            if len(files) > 10:
                print(f"  ... 还有 {len(files) - 10} 个文件")
        else:
            print("目录为空")
    except PermissionError:
        print("❌ 没有权限访问当前目录")
    except Exception as e:
        print(f"❌ 读取目录时出错: {e}")
    print()

def process_arguments():
    """处理命令行参数"""
    print("=" * 50)
    print("⚙️  命令行参数")
    print("=" * 50)
    
    if len(sys.argv) > 1:
        print(f"参数数量: {len(sys.argv) - 1}")
        for i, arg in enumerate(sys.argv[1:], 1):
            print(f"  参数 {i}: {arg}")
    else:
        print("没有提供命令行参数")
    print()

def demonstrate_features():
    """演示一些Python特性"""
    print("=" * 50)
    print("🐍 Python特性演示")
    print("=" * 50)
    
    # 列表推导式
    numbers = [i**2 for i in range(1, 6)]
    print(f"平方数列表: {numbers}")
    
    # 字典操作
    info = {
        "脚本名称": "example.py",
        "语言": "Python",
        "版本": "3.11+",
        "用途": "VSCode扩展示例"
    }
    
    print("\n📋 脚本信息:")
    for key, value in info.items():
        print(f"  {key}: {value}")
    
    # 简单计算
    import math
    pi_value = math.pi
    print(f"\n🔢 数学计算:")
    print(f"  π 的值: {pi_value:.6f}")
    print(f"  π 的平方根: {math.sqrt(pi_value):.6f}")
    print()

def main():
    """主函数"""
    print("🚀 VSCode自定义Python脚本示例")
    print(f"执行时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    try:
        show_system_info()
        show_directory_info()
        process_arguments()
        demonstrate_features()
        
        print("=" * 50)
        print("✅ 脚本执行完成！")
        print("=" * 50)
        print("💡 提示: 你可以修改这个脚本或创建新的脚本来实现自己的功能")
        
    except KeyboardInterrupt:
        print("\n⚠️  脚本被用户中断")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ 脚本执行出错: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()