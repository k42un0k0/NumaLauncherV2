import { useAtomValue } from "jotai";
import Overlay from "../../components/Overlay";
import { overlaySelectServerJotai } from "../jotai/overlaySelectServerJotai";

export default function OverlaySelectServer() {
  const overlaySelectServer = useAtomValue(overlaySelectServerJotai);
  return (
    <Overlay in={overlaySelectServer}>
      <div></div>
    </Overlay>
  );
}
