import { withSettingContainer } from "@/_storybook/withSettingContainer";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import withJotai from "storybook-addon-jotai";
import Minecraft from "./Minecraft";

export default {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: "Setting/Minecraft",
  component: Minecraft,
  decorators: [withJotai, withSettingContainer],
} as ComponentMeta<typeof Minecraft>;

const Template = () => <Minecraft />;

export const Primary: ComponentStory<typeof Minecraft> = Template.bind({});
