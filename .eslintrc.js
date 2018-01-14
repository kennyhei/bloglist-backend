module.exports = {
    "env": {
        "browser": true,
        "commonjs": true,
        "es6": true
    },
    "globals": {
        "process": true,
        "describe": true,
        "it": true,
        "before": true,
        "after": true,
        "__dirname": true
    },
    "extends": "eslint:recommended",
    "parser": "babel-eslint",
    "rules": {
        "indent": [
            "error",
            4
        ],
        "linebreak-style": [
            "error",
            "windows"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "never"
        ],
        "eqeqeq": "error",
        "no-console": 0,
        "allowTemplateLiterals": true
    }
};