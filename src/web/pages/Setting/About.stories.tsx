import { withMainWindow } from "@/_storybook/withMainWindow";
import { withSettingContainer } from "@/_storybook/withSettingContainer";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import withJotai from "storybook-addon-jotai";
import About from "./About";

export default {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: "Setting/About",
  component: About,
  decorators: [withJotai, withSettingContainer],
} as ComponentMeta<typeof About>;

const Template = () => <About />;

export const Primary: ComponentStory<typeof About> = Template.bind({});
