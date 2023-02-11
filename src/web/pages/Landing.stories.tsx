import { withMainWindow } from "@/_storybook/withMainWindow";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import Landing from "./Landing";
import { withJotai } from "storybook-addon-jotai";
import { stateJotai } from "./utils/stateJotai";
export default {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: "Landing",
  component: Landing,
  decorators: [withJotai, withMainWindow],
} as ComponentMeta<typeof Landing>;

const Template = () => <Landing />;

export const Primary: ComponentStory<typeof Landing> = Template.bind({});
Primary.parameters = {
  jotai: {
    atoms: {
      state: stateJotai,
    },
    values: {
      state: {
        landing: {
          account: {},
        },
      },
    },
  },
};
