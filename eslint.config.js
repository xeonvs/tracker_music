export default [
  {
    files: ["player.js"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "script",
      globals: {
        document: "readonly",
        window: "readonly",
        localStorage: "readonly",
        navigator: "readonly",
        XMLHttpRequest: "readonly",
        Cowbell: "readonly"
      }
    },
    rules: {}
  }
];
