import { withMainWindow } from "@/_storybook/withMainWindow";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import OverlaySelectServer from "./OverlaySelectServer";
import { withJotai } from "storybook-addon-jotai";
import { stateJotai } from "./utils/stateJotai";
import { withMainPreload } from "@/_storybook/withMainPreload";
import { overlaySelectServerJotai } from "./utils/overlaySelectServerJotai";
export default {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: "OverlaySelectServer",
  component: OverlaySelectServer,
  decorators: [withJotai, withMainWindow],
} as ComponentMeta<typeof OverlaySelectServer>;

const Template = () => <OverlaySelectServer />;

export const Primary: ComponentStory<typeof OverlaySelectServer> = Template.bind({});
Primary.parameters = {
  jotai: {
    atoms: {
      open: overlaySelectServerJotai,
    },
    values: {
      open: true,
    },
  },
};
