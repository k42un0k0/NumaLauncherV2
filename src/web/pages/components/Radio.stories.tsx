import { ComponentStory } from "@storybook/react";
import { ComponentProps } from "react";
import Radio from "./Radio";

export default {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: "Radio",
  component: Radio,
};

const Template = (props: ComponentProps<typeof Radio>) => <Radio {...props} />;

export const Primary: ComponentStory<typeof Radio> = Template.bind({});
