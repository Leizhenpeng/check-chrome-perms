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
Permissions requested by the extension:
[ 'storage', 'tabs', 'bookmarks' ]
All permissions are used and declared correctly.
```

#### Case 2: Some permissions are requested but not used

```plaintext
Permissions requested by the extension:
[ 'storage', 'tabs', 'bookmarks' ]
Permissions are not used but declared:
- tabs
```

#### Case 3: Some permissions are used but not declared

```plaintext
Permissions requested by the extension::
[ 'storage' ]
Permissions are used in the code but not declared:
- tabs
- bookmarks
```

By following the steps above, you can easily check for any unused or undeclared permissions in your Chrome extension and ensure compliance with best practices.
