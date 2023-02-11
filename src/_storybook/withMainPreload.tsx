import { MainPreloadProvider } from "@/web/utils/preload";

export function withMainPreload(value: any) {
  return (Story: any) => {
    return (
      <MainPreloadProvider value={value}>
        <Story />
      </MainPreloadProvider>
    ) as any;
  };
}
