import { withMainWindow } from "@/_storybook/withMainWindow";
import { withSettingContainer } from "@/_storybook/withSettingContainer";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import withJotai from "storybook-addon-jotai";
import Account from "./Account";

export default {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: "Setting/Account",
  component: Account,
  decorators: [withJotai, withSettingContainer],
} as ComponentMeta<typeof Account>;

const Template = () => <Account />;

export const Primary: ComponentStory<typeof Account> = Template.bind({});
