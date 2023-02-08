import { ComponentStory } from "@storybook/react";
import { ComponentProps } from "react";
import Tooltip from "./Tooltip";

export default {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: "Tooltip",
  component: Tooltip,
};

const Template = (props: ComponentProps<typeof Tooltip>) => (
  <div
    style={{
      position: "absolute",
      display: "inline-block",
      left: "400px",
    }}
  >
    <Tooltip {...props} />
  </div>
);

export const Primary: ComponentStory<typeof Tooltip> = Template.bind({});
Primary.args = {
  tooltip: (
    <>
      hello
      <br />
      こんばんは
    </>
  ),
  children: <div>こんにちは</div>,
};
