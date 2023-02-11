import { withLandingContainer } from "@/_storybook/withLandingContainer";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { ComponentProps } from "react";
import withJotai from "storybook-addon-jotai";
import { stateJotai } from "../utils/stateJotai";
import Skin from "./Skin";

export default {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: "Landing/Skin",
  component: Skin,
  decorators: [withLandingContainer],
} as ComponentMeta<typeof Skin>;

const Template = (props: ComponentProps<typeof Skin>) => <Skin {...props} />;

export const Primary: ComponentStory<typeof Skin> = Template.bind({});
Primary.args = {
  currentSkin: {
    model: "default",
    skinURL: "http://textures.minecraft.net/texture/3ea5afa0200f4078fb34668394f5109e4941f41fd6d5f3ba4e2d8ab33190df38",
  },
};
