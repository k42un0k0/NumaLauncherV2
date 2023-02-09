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

export const Primary: ComponentStory<typeof Tooltip> = () => (
  <div
    style={{
      position: "absolute",
      display: "inline-block",
      marginLeft: 200,
    }}
  >
    <Tooltip tooltip={<>hello</>}>
      <div>こんにちは</div>
    </Tooltip>
  </div>
);

export const Secondary: ComponentStory<typeof Tooltip> = () => (
  <div
    style={{
      position: "absolute",
      display: "inline-block",
    }}
  >
    <Tooltip tooltip={<>hello</>}>
      <div>こんにちは</div>
    </Tooltip>
  </div>
);
