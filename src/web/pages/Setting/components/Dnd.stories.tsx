import { ComponentStory } from "@storybook/react";
import { ComponentProps } from "react";
import Dnd from "./Dnd";

export default {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: "setting/Dnd",
  component: Dnd,
};

const Template = (_: ComponentProps<typeof Dnd>) => <Dnd />;

export const Primary: ComponentStory<typeof Dnd> = Template.bind({});
Primary.args = {
  defaultValue: 3,
  min: 0,
  max: 10,
};
