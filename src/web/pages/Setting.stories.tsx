import MainWindow from "@/_storybook/MainWindow";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import Setting from "./Setting";

export default {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: "Setting",
  component: Setting,
  decorators: [
    (Story) => (
      <MainWindow>
        <Story />
      </MainWindow>
    ),
  ],
} as ComponentMeta<typeof Setting>;

const Template = () => <Setting />;

export const Primary: ComponentStory<typeof Setting> = Template.bind({});
