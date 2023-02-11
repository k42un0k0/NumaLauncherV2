import { withLandingContainer } from "@/_storybook/withLandingContainer";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { ComponentProps } from "react";
import withJotai from "storybook-addon-jotai";
import { stateJotai } from "../utils/stateJotai";
import DashBoard from "./DashBoard";

export default {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: "Landing/DashBoard",
  component: DashBoard,
  decorators: [withJotai, withLandingContainer],
} as ComponentMeta<typeof DashBoard>;

const Template = (_: ComponentProps<typeof DashBoard>) => <DashBoard />;

export const Primary: ComponentStory<typeof DashBoard> = Template.bind({});
Primary.parameters = {
  jotai: {
    atoms: {
      state: stateJotai,
    },
    values: {
      state: {
        landing: {
          account: {
            accessToken:
              "asdfaaefwefwefagargarghearhg.uiopf4h3jqpguiofh3qo4uihgoqpiuh34gopiug5hq3o4puighoq34uihgq3uoi4hgouqi3h4gouiq3h4ogiuh34oqui.239784ui32hkl4hljkhljkhhou934ho3984th34th83947",
            username: "mock_user",
            uuid: "424d3cd5bd7e4cb487fcbb722f1a2b61",
            displayName: "mock_user",
            expiresAt: "2030-02-12T11:58:43.622Z",
            type: "microsoft",
            microsoft: {
              accessToken:
                "asdfaaefwefwefagargarghearhg.uiopf4h3jqpguiofh3qo4uihgoqpiuh34gopiug5hq3o4puighoq34uihgq3uoi4hgouqi3h4gouiq3h4ogiuh34oqui.239784ui32hkl4hljkhljkhhou934ho3984th34th83947",
              refreshToken:
                "M.R3_BAY.-fdg-a0f8g-90a8g-^a90f8g-af8g9-afdg98adf-g7a890df7yg097yaer089*fdgadfghafgoahop9rgyua-89g7afgadfhga908!dhjfpaodshugpauisodhujgpaofhgaoilush",
              expiresAt: "2030-02-11T12:58:41.885Z",
            },
          },
        },
      },
    },
  },
};
