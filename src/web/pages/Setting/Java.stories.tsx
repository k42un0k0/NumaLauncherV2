import { withMainWindow } from "@/_storybook/withMainWindow";
import { withSettingContainer } from "@/_storybook/withSettingContainer";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import withJotai from "storybook-addon-jotai";
import Java from "./Java";

export default {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: "Setting/Java",
  component: Java,
  decorators: [withJotai, withSettingContainer],
} as ComponentMeta<typeof Java>;

const Template = () => <Java />;

export const Primary: ComponentStory<typeof Java> = Template.bind({});
