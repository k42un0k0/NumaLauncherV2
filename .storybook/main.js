module.exports = {
  stories: ["../src/**/*.stories.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: ["@storybook/addon-links", "@storybook/addon-essentials", "@storybook/addon-interactions"],
  framework: "@storybook/react",
  core: {
    builder: "@storybook/builder-webpack5",
  },
  babel: async (options) => {
    const presetReact = options.presets.find((p) => /preset-react/.test(p[0]));
    presetReact[1] = {
      ...presetReact[1],
      importSource: "@emotion/react",
    };
    return options;
  },
};
