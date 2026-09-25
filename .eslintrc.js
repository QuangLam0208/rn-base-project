module.exports = {
  extends: ["expo", "prettier"],
  plugins: ["prettier"],
  rules: {
    "prettier/prettier": "off",
    "react-hooks/refs": "off",
  },
  ignorePatterns: [
    "node_modules/",
    ".expo/",
    "android/",
    "ios/",
    "dist/",
    "types/",
  ],
}
