// {
//   "env": {
//     "browser": true,
//     "es2021": true
//   },
//   "extends": ["eslint:recommended", "plugin:react/recommended", "plugin:@typescript-eslint/recommended", "plugin:prettier/recommended"],
//   "parser": "@typescript-eslint/parser",
//   "parserOptions": {
//     "ecmaFeatures": {
//       "jsx": true
//     },
//     "ecmaVersion": "latest",
//     "sourceType": "module"
//   },
//   "plugins": ["react", "@typescript-eslint", "prettier"],
//   "ignorePatterns": ["node_modules", "dist", "public"],
//   "rules": {
//     "prettier/prettier": [
//       "error",
//       {
//         "endOfLine": "auto"
//       }
//     ],
//     "@typescript-eslint/no-empty-interface": ["off"],
//     "@typescript-eslint/no-explicit-any": ["off"],
//     "react/react-in-jsx-scope": "off",
//     "@typescript-eslint/no-namespace": "off"
//   }
// }
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["react", "@typescript-eslint", "prettier"],
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  rules: {
    "@typescript-eslint/no-unused-vars": [
      2,
      { args: "all", argsIgnorePattern: "^_" },
    ],
    "@typescript-eslint/no-empty-interface": ["off"],
    "@typescript-eslint/no-explicit-any": ["off"],
    "react/react-in-jsx-scope": "off",
    "@typescript-eslint/no-namespace": "off"
  },
  "env": {
    "browser": true,
    "es2021": true
  },
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaFeatures": {
      "jsx": true
    },
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
};
