import { SkinViewer, WalkingAnimation } from "skinview3d";
import { PerspectiveCamera } from "three";
function setCamera(camera: PerspectiveCamera) {
  camera.rotation.x = 0.0684457336043845;
  camera.rotation.y = -0.4075532917126465;
  camera.rotation.z = 0.027165200024919168;
  camera.position.x = -23.781852599545154;
  camera.position.y = -11.767431171758776;
  camera.position.z = 54.956618794277766;
}

async function generateSkinModel(imageURL: string) {
  const skinViewer = new SkinViewer({
    width: 102,
    height: 172,
    renderPaused: true,
  });
  skinViewer.width = 288;
  skinViewer.height = 384;
  setCamera(skinViewer.camera);

  // Add an animation
  const walk = new WalkingAnimation();
  walk.paused = true;
  walk.progress = 5;
  skinViewer.animation = walk;
  await skinViewer.loadSkin(imageURL);
  skinViewer.render();
  const image = skinViewer.canvas.toDataURL();
  skinViewer.dispose();

  return image;
}
