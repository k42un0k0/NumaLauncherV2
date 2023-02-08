import { ComponentStory } from "@storybook/react";
import { ComponentProps } from "react";
import Switch from "./Switch";

export default {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: "setting/Switch",
  component: Switch,
};

const Template = (props: ComponentProps<typeof Switch>) => <Switch {...props} />;

export const Primary: ComponentStory<typeof Switch> = Template.bind({});
Primary.args = {};
