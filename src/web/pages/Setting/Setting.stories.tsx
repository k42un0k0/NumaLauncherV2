import { withMainWindow } from "@/_storybook/withMainWindow";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import withJotai from "storybook-addon-jotai";
import Setting from ".";
import { settingJotai } from "./utils/settingJotai";

export default {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: "Setting",
  component: Setting,
  decorators: [withJotai, withMainWindow],
} as ComponentMeta<typeof Setting>;

const Template = () => <Setting />;

export const Primary: ComponentStory<typeof Setting> = Template.bind({});
Primary.parameters = {
  jotai: {
    atoms: {
      setting: settingJotai,
    },
    values: {
      setting: "account",
    },
  },
};
