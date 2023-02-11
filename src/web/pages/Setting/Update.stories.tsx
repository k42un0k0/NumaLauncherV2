import { withMainWindow } from "@/_storybook/withMainWindow";
import { withSettingContainer } from "@/_storybook/withSettingContainer";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import withJotai from "storybook-addon-jotai";
import Update from "./Update";

export default {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: "Setting/Update",
  component: Update,
  decorators: [withJotai, withSettingContainer],
} as ComponentMeta<typeof Update>;

const Template = () => <Update />;

export const Primary: ComponentStory<typeof Update> = Template.bind({});
