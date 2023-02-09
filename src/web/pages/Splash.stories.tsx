import { ComponentStory } from "@storybook/react";
import { ComponentProps } from "react";
import Splash from "./Splash";

export default {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: "Splash",
  component: Splash,
};

const Template = () => <Splash />;

export const Primary: ComponentStory<typeof Splash> = Template.bind({});
