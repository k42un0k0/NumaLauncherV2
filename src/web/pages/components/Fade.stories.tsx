import { ComponentStory } from "@storybook/react";
import { ComponentProps } from "react";
import Fade from "./Fade";

export default {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: "Fade",
  component: Fade,
};

const Template = (props: ComponentProps<typeof Fade>) => <Fade {...props} />;

export const Primary: ComponentStory<typeof Fade> = Template.bind({});
Primary.args = {
  in: true,
  children: "こんにちは",
};
