import { withLandingContainer } from "@/_storybook/withLandingContainer";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { ComponentProps } from "react";
import withJotai from "storybook-addon-jotai";
import News from "./News";

export default {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: "Landing/News",
  component: News,
  decorators: [withJotai, withLandingContainer],
} as ComponentMeta<typeof News>;

const Template = (props: ComponentProps<typeof News>) => <News {...props} />;

export const Primary: ComponentStory<typeof News> = Template.bind({});
Primary.args = {
  open: true,
};
