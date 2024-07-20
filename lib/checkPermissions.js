const fs = require('fs');
const path = require('path');

// 递归遍历文件夹并读取文件内容
function readFiles(dir) {
    const results = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results.push(...readFiles(filePath));
        } else {
            results.push(filePath);
        }
    });
    return results;
}

// 创建正则表达式来匹配权限使用情况
function createPermissionRegex(permission) {
    return new RegExp(`\\bchrome\\.${permission}\\b`, 'g');
}

// 检查权限使用情况和未声明的权限
function checkPermissionsUsage(files, declaredPermissions) {
    const permissions = Array.from(declaredPermissions);
    const unusedPermissions = new Set(permissions);
    const usedPermissions = new Set();

    // 创建权限正则表达式，排除 unlimitedStorage 特殊处理
    const permissionRegexes = permissions
        .filter(permission => permission !== 'unlimitedStorage')
        .map(createPermissionRegex);

    files.forEach((file) => {
        const content = fs.readFileSync(file, 'utf-8');

        permissionRegexes.forEach((regex, index) => {
            if (regex.test(content)) {
                const permission = permissions.filter(p => p !== 'unlimitedStorage')[index];
                unusedPermissions.delete(permission);
                usedPermissions.add(permission);
            }
        });

        // 特殊处理 unlimitedStorage
        if (declaredPermissions.has('unlimitedStorage') && /chrome\.storage\b/.test(content)) {
            unusedPermissions.delete('unlimitedStorage');
            usedPermissions.add('unlimitedStorage');
        }

        // 检查是否使用了未声明的权限
        const allPermissions = ['storage', 'tabs', 'bookmarks', 'history', 'alarms', 'notifications', 'identity'];
        allPermissions.forEach(permission => {
            const regex = createPermissionRegex(permission);
            if (regex.test(content) && !declaredPermissions.has(permission)) {
                usedPermissions.add(permission);
            }
        });
    });

    const undeclaredPermissions = Array.from(usedPermissions).filter(permission => !declaredPermissions.has(permission));

    return { unusedPermissions: Array.from(unusedPermissions), undeclaredPermissions };
}

const path = require('path');
const { readFiles, checkPermissionsUsage } = require('./utils');

function checkPermissions(dirPath) {
    const manifestPath = path.join(dirPath, 'manifest.json');
    const manifest = require(manifestPath);
    const declaredPermissions = new Set(manifest.permissions || []);

    console.log('Permissions declared in manifest:');
    console.log(Array.from(declaredPermissions));

    // Get all JavaScript files in the project
    const files = readFiles(dirPath);

    // Check for unused and undeclared permissions
    const { unusedPermissions, undeclaredPermissions } = checkPermissionsUsage(files, declaredPermissions);

    if (unusedPermissions.length) {
        console.error('\x1b[31mPermissions are not used but declared:');
        unusedPermissions.forEach(permission => console.error(`\x1b[31m${ permission } `));
    }

    if (undeclaredPermissions.length) {
        console.error('\x1b[31mPermissions used in code but not declared:');
        undeclaredPermissions.forEach(permission => console.error(`\x1b[31m${ permission } `));
    }

    if (unusedPermissions.length || undeclaredPermissions.length) {
        process.exit(1); // Exit with error
    } else {
        console.log('\x1b[32mAll permissions are correctly used and declared.');
    }
}

module.exports = checkPermissions;
