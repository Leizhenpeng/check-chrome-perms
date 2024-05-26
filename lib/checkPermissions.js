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

function checkPermissions(dirPath) {
    const manifestPath = path.join(dirPath, 'manifest.json');
    const manifest = require(manifestPath);
    const declaredPermissions = new Set(manifest.permissions || []);

    console.log('插件申请的权限:');
    console.log(Array.from(declaredPermissions));

    // 获取项目中的所有JavaScript文件
    const files = readFiles(dirPath);

    // 检查未使用的权限和未声明的权限
    const { unusedPermissions, undeclaredPermissions } = checkPermissionsUsage(files, declaredPermissions);

    if (unusedPermissions.length) {
        console.error('\x1b[31m以下权限未使用:');
        unusedPermissions.forEach(permission => console.error(`\x1b[31m${permission}`));
    }

    if (undeclaredPermissions.length) {
        console.error('\x1b[31m以下权限已在代码中使用但未声明:');
        undeclaredPermissions.forEach(permission => console.error(`\x1b[31m${permission}`));
    }

    if (unusedPermissions.length || undeclaredPermissions.length) {
        process.exit(1); // 报错退出
    } else {
        console.log('\x1b[32m所有权限均被正确使用和声明。');
    }
}

module.exports = checkPermissions;
