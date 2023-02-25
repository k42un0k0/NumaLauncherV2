import { ComponentStory } from "@storybook/react";
import { ComponentProps } from "react";
import Input from "./Input";

export default {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: "Landing/EditSkin/Input",
  component: Input,
};

const Template = (props: ComponentProps<typeof Input>) => <Input {...props} />;

export const Primary: ComponentStory<typeof Input> = Template.bind({});
