import { withMainPreload } from "@/_storybook/withMainPreload";
import { withMainWindow } from "@/_storybook/withMainWindow";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { withJotai } from "storybook-addon-jotai";
import Login from "../Login/Login";
export default {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: "Login",
  component: Login,
  decorators: [
    withMainPreload({
      onCloseMSALoginWindow: () => () => void 0,
    }),
    withJotai,
    withMainWindow,
  ],
} as ComponentMeta<typeof Login>;

const Template = () => <Login />;

export const Primary: ComponentStory<typeof Login> = Template.bind({});
