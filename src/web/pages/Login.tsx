import { useAtomValue, useSetAtom } from "jotai";
import { mainPreload } from "../utils/preload";
import { pageJotai, selectedUUIDJotai } from "./pageJotai";

export default function Login() {
  const selectedUUID = useAtomValue(selectedUUIDJotai);
  const setPage = useSetAtom(pageJotai);
  return (
    <div>
      {selectedUUID && <button onClick={() => setPage("setting")}>×</button>}
      <button onClick={() => mainPreload.login.openMSALoginWindow()}>
        microsoft login
      </button>
    </div>
  );
}
