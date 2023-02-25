import { withMainWindow } from "@/_storybook/withMainWindow";
import { withSettingContainer } from "@/_storybook/withSettingContainer";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import withJotai from "storybook-addon-jotai";
import Mod from "./Mod";

export default {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: "Setting/Mod",
  component: Mod,
  decorators: [withJotai, withSettingContainer],
} as ComponentMeta<typeof Mod>;

const Template = () => <Mod />;

export const Primary: ComponentStory<typeof Mod> = Template.bind({});
