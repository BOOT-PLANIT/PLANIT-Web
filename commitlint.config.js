const config = {
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "refactor",
        "style",
        "format",
        "docs",
        "chore",
        "add",
        "del",
        "test",
      ],
    ],
    "type-empty": [2, "never"],
    "subject-empty": [2, "never"],
    "header-max-length": [2, "always", 100],
  },
};

export default config;
