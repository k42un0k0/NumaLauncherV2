import { withLandingContainer } from "@/_storybook/withLandingContainer";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { ComponentProps } from "react";
import withJotai from "storybook-addon-jotai";
import EditSkin from ".";

export default {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: "Landing/EditSkin",
  component: EditSkin,
  decorators: [withJotai, withLandingContainer],
} as ComponentMeta<typeof EditSkin>;

const Template = (props: ComponentProps<typeof EditSkin>) => <EditSkin {...props} />;

export const Primary: ComponentStory<typeof EditSkin> = Template.bind({});
Primary.args = {
  open: true,
};
