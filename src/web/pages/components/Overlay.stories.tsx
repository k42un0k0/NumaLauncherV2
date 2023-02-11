import { ComponentStory } from "@storybook/react";
import { ComponentProps } from "react";
import Overlay from "./Overlay";

export default {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: "Overlay",
  component: Overlay,
};

const Template = (props: ComponentProps<typeof Overlay>) => <Overlay {...props} />;

export const Primary: ComponentStory<typeof Overlay> = Template.bind({});
