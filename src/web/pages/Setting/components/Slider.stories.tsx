import { ComponentStory } from "@storybook/react";
import { ComponentProps } from "react";
import Slider from "./Slider";

export default {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: "setting/Slider",
  component: Slider,
};

const Template = (props: ComponentProps<typeof Slider>) => <Slider {...props} />;

export const Primary: ComponentStory<typeof Slider> = Template.bind({});
Primary.args = {
  defaultValue: 3,
  min: 0,
  max: 10,
};
