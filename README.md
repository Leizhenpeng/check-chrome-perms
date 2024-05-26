
# Check Chrome Perms

A tool to detect violations by requesting but not using the following Chrome extension permission(s).

## Installation

```bash
npm install -g check-chrome-perms
```

## Usage

```bash
check-perms <your-build-directory>
```

### Example

1. Navigate to your project directory:

    ```bash
    cd /path/to/your/chrome-extension
    ```

2. Build your Chrome extension (assuming your build output is in the `build` directory):

    ```bash
    npm run build
    ```

3. Run the permission checker on your build output:

    ```bash
    check-perms ./build/chrome-mv3-prod
    ```

### Sample Output

#### Case 1: All permissions are correctly used

```plaintext
插件申请的权限:
[ 'storage', 'tabs', 'bookmarks' ]
\x1b[32m所有权限均被正确使用和声明。
```

#### Case 2: Some permissions are requested but not used

```plaintext
插件申请的权限:
[ 'storage', 'tabs', 'bookmarks' ]
\x1b[31m以下权限未使用:
\x1b[31mtabs
```

#### Case 3: Some permissions are used but not declared

```plaintext
插件申请的权限:
[ 'storage' ]
\x1b[31m以下权限已在代码中使用但未声明:
\x1b[31mtabs
\x1b[31mbookmarks
```

By following the steps above, you can easily check for any unused or undeclared permissions in your Chrome extension and ensure compliance with best practices.
