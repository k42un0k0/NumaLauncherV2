import { ComponentStory } from "@storybook/react";
import { ComponentProps } from "react";
import TextInput from "./TextInput";

export default {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: "setting/TextInput",
  component: TextInput,
};

const Template = (props: ComponentProps<typeof TextInput>) => <TextInput {...props} />;

export const Primary: ComponentStory<typeof TextInput> = Template.bind({});
Primary.args = {};
