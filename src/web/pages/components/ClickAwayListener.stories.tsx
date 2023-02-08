import { ComponentStory } from "@storybook/react";
import { ComponentProps } from "react";
import ClickAwayListener from "./ClickAwayListener";

export default {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: "ClickAwayListener",
  component: ClickAwayListener,
};

const Template = (props: ComponentProps<typeof ClickAwayListener>) => (
  <ClickAwayListener {...props}>
    <div>こんにちは</div>
  </ClickAwayListener>
);

export const Primary: ComponentStory<typeof ClickAwayListener> = Template.bind({});
Primary.argTypes = {
  onClickAway: { action: "clicked" },
};
