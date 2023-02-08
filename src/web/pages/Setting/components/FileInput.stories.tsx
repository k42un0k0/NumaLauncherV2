import { ComponentStory } from "@storybook/react";
import { ComponentProps } from "react";
import FileInput from "./FileInput";

export default {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: "setting/FileInput",
  component: FileInput,
};

const Template = (_: ComponentProps<typeof FileInput>) => <FileInput />;

export const Primary: ComponentStory<typeof FileInput> = Template.bind({});
Primary.args = {
  defaultValue: 3,
  min: 0,
  max: 10,
};
