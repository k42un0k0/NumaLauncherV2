import { useEffect, useRef } from "react";
import { SkinViewer, WalkingAnimation } from "skinview3d";

export function createViewer(elm: HTMLCanvasElement) {
  const skinViewer = new SkinViewer({
    canvas: elm,
    width: 300,
    height: 400,
  });

  const control = skinViewer.controls;
  control.enableRotate = true;
  control.enableZoom = false;
  control.enablePan = false;

  const anime = new WalkingAnimation();
  anime.speed = 0.55;
  skinViewer.animation = anime;
  return skinViewer;
}

export function useSkinViewer() {
  const viewer = useRef<SkinViewer>();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    viewer.current = createViewer(ref.current);
  }, []);
  return { viewer, ref };
}
