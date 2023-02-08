import { setGlobalConfig } from "@storybook/testing-react";

// Storybook's preview file location
// @ts-expect-error treat as any
import * as globalStorybookConfig from "./.storybook/preview";

// Replace with setProjectAnnotations if you are using the new pre-release version the addon
setGlobalConfig(globalStorybookConfig);
