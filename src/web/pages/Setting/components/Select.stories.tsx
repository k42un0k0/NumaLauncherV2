import { ComponentStory } from "@storybook/react";
import { ComponentProps } from "react";
import Select from "./Select";

export default {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: "setting/Select",
  component: Select,
};

const Template = (_: ComponentProps<typeof Select>) => <Select />;

export const Primary: ComponentStory<typeof Select> = Template.bind({});
Primary.args = {};
