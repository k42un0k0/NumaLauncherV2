import { ComponentStory } from "@storybook/react";
import { ComponentProps } from "react";
import Frame from "./Frame";

export default {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: "Frame",
  component: Frame,
};

const Template = (_: ComponentProps<typeof Frame>) => <Frame />;

export const Primary: ComponentStory<typeof Frame> = Template.bind({});
