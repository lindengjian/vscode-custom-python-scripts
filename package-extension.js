#!/usr/bin/env node

/**
 * 符合VSCode标准的扩展打包脚本
 * 生成正确的.vsix文件结构
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 开始打包VSCode扩展...');

try {
    // 检查必要文件是否存在
    const requiredFiles = [
        'package.json',
        'out/extension.js',
        '.vscodeignore'
    ];
    
    for (const file of requiredFiles) {
        if (!fs.existsSync(file)) {
            throw new Error(`缺少必要文件: ${file}`);
        }
    }
    
    console.log('✅ 必要文件检查通过');
    
    // 读取package.json获取扩展信息
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const extensionName = `${packageJson.name}-${packageJson.version}.vsix`;
    
    console.log(`📦 准备打包: ${extensionName}`);
    
    // 创建临时目录
    const tempDir = path.join(__dirname, 'temp-vsix-package');
    if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true });
    }
    fs.mkdirSync(tempDir);
    
    // 创建extension目录
    const extensionDir = path.join(tempDir, 'extension');
    fs.mkdirSync(extensionDir);
    
    // 复制扩展文件到extension目录
    const filesToCopy = [
        'package.json',
        'README.md',
        '.vscodeignore',
        'out/',
        'scripts/'
    ];
    
    for (const file of filesToCopy) {
        if (fs.existsSync(file)) {
            const destPath = path.join(extensionDir, file);
            if (fs.statSync(file).isDirectory()) {
                fs.mkdirSync(destPath, { recursive: true });
                copyDir(file, destPath);
            } else {
                fs.copyFileSync(file, destPath);
            }
            console.log(`📄 已复制: ${file}`);
        }
    }
    
    // 创建[Content_Types].xml文件
    const contentTypesXml = `<?xml version="1.0" encoding="utf-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
    <Default Extension="json" ContentType="application/json" />
    <Default Extension="vsixmanifest" ContentType="text/xml" />
    <Default Extension="js" ContentType="application/javascript" />
    <Default Extension="map" ContentType="application/json" />
    <Default Extension="md" ContentType="text/markdown" />
    <Default Extension="py" ContentType="text/x-python" />
    <Default Extension="vscodeignore" ContentType="text/plain" />
</Types>`;
    
    fs.writeFileSync(path.join(tempDir, '[Content_Types].xml'), contentTypesXml);
    console.log('📄 已创建: [Content_Types].xml');
    
    // 创建extension.vsixmanifest文件
    const vsixManifest = `<?xml version="1.0" encoding="utf-8"?>
<PackageManifest Version="2.0.0" xmlns="http://schemas.microsoft.com/developer/vsx-schema/2011" xmlns:d="http://schemas.microsoft.com/developer/vsx-schema-design/2011">
    <Metadata>
        <Identity Language="en-US" Id="${packageJson.name}" Version="${packageJson.version}" Publisher="${packageJson.publisher || 'custom-scripts'}" />
        <DisplayName>${packageJson.displayName || packageJson.name}</DisplayName>
        <Description xml:space="preserve">${packageJson.description || ''}</Description>
        <Tags>${(packageJson.keywords || []).join(',')}</Tags>
        <Categories>${(packageJson.categories || ['Other']).join(',')}</Categories>
        <GalleryFlags>Public</GalleryFlags>
        <Badges></Badges>
        <Properties>
            <Property Id="Microsoft.VisualStudio.Code.Engine" Value="${packageJson.engines.vscode}" />
            <Property Id="Microsoft.VisualStudio.Code.ExtensionDependencies" Value="" />
            <Property Id="Microsoft.VisualStudio.Code.ExtensionPack" Value="" />
            <Property Id="Microsoft.VisualStudio.Code.ExtensionKind" Value="ui,workspace" />
            <Property Id="Microsoft.VisualStudio.Code.LocalizedLanguages" Value="" />
            <Property Id="Microsoft.VisualStudio.Services.Links.Source" Value="${packageJson.repository?.url || ''}" />
            <Property Id="Microsoft.VisualStudio.Services.Links.Getstarted" Value="" />
            <Property Id="Microsoft.VisualStudio.Services.Links.GitHub" Value="${packageJson.repository?.url || ''}" />
            <Property Id="Microsoft.VisualStudio.Services.Links.Support" Value="" />
            <Property Id="Microsoft.VisualStudio.Services.Links.Learn" Value="" />
            <Property Id="Microsoft.VisualStudio.Services.Branding.Color" Value="" />
            <Property Id="Microsoft.VisualStudio.Services.Branding.Theme" Value="dark" />
            <Property Id="Microsoft.VisualStudio.Services.GitHubFlavoredMarkdown" Value="true" />
        </Properties>
        <License>extension/LICENSE</License>
        <Icon>extension/icon.png</Icon>
    </Metadata>
    <Installation>
        <InstallationTarget Id="Microsoft.VisualStudio.Code" Version="${packageJson.engines.vscode}" />
    </Installation>
    <Dependencies></Dependencies>
    <Assets>
        <Asset Type="Microsoft.VisualStudio.Code.Manifest" Path="extension/package.json" Addressable="true" />
        <Asset Type="Microsoft.VisualStudio.Services.Content.Details" Path="extension/README.md" Addressable="true" />
        <Asset Type="Microsoft.VisualStudio.Services.Content.Changelog" Path="extension/CHANGELOG.md" Addressable="true" />
        <Asset Type="Microsoft.VisualStudio.Services.Content.License" Path="extension/LICENSE" Addressable="true" />
        <Asset Type="Microsoft.VisualStudio.Services.Icons.Default" Path="extension/icon.png" Addressable="true" />
    </Assets>
</PackageManifest>`;
    
    fs.writeFileSync(path.join(tempDir, 'extension.vsixmanifest'), vsixManifest);
    console.log('📄 已创建: extension.vsixmanifest');
    
    console.log('🔧 创建扩展包结构...');
    
    // 确保dist目录存在
    const distDir = path.join(__dirname, 'dist');
    if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir);
    }
    
    // 使用zip命令打包（macOS自带）
    const outputPath = path.join(distDir, extensionName);
    process.chdir(tempDir);
    execSync(`zip -r "${outputPath}" .`, { stdio: 'inherit' });
    process.chdir('..');
    
    // 清理临时目录
    fs.rmSync(tempDir, { recursive: true });
    
    console.log(`🎉 打包完成: ${extensionName}`);
    console.log(`📍 文件位置: ${path.resolve(outputPath)}`);
    console.log(`📏 文件大小: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB`);
    
} catch (error) {
    console.error('❌ 打包失败:', error.message);
    process.exit(1);
}

/**
 * 递归复制目录
 * @param {string} src - 源目录路径
 * @param {string} dest - 目标目录路径
 */
function copyDir(src, dest) {
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        
        if (entry.isDirectory()) {
            fs.mkdirSync(destPath, { recursive: true });
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}