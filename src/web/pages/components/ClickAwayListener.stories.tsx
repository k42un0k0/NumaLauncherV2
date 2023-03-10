import { ComponentStory } from "@storybook/react";
import { ComponentProps } from "react";
import ClickAwayListener from "./ClickAwayListener";

export default {
  /* ๐ The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: "ClickAwayListener",
  component: ClickAwayListener,
};

const Template = (props: ComponentProps<typeof ClickAwayListener>) => (
  <ClickAwayListener {...props}>
    <div>ใใใซใกใฏ</div>
  </ClickAwayListener>
);

export const Primary: ComponentStory<typeof ClickAwayListener> = Template.bind({});
