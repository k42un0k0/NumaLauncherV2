import { withMainWindow } from "@/_storybook/withMainWindow";
import { withSettingContainer } from "@/_storybook/withSettingContainer";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import withJotai from "storybook-addon-jotai";
import Launcher from "./Launcher";

export default {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: "Setting/Launcher",
  component: Launcher,
  decorators: [withJotai, withSettingContainer],
} as ComponentMeta<typeof Launcher>;

const Template = () => <Launcher />;

export const Primary: ComponentStory<typeof Launcher> = Template.bind({});
