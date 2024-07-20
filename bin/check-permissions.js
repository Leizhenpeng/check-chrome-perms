#!/usr/bin/env node

const path = require('path');
const checkPermissions = require('../lib/checkPermissions');

// 获取命令行参数中的路径
const dirPath = process.argv[2];

if (!dirPath) {
    console.error('Please provide a folder path as an argument');
    process.exit(1);
}

const resolvedPath = path.resolve(dirPath);

checkPermissions(resolvedPath);
