import { atom, useAtom } from "jotai";
import { mainPreload } from "../../utils/preload";

export const selectedUUIDJotai = atom<string | null | Promise<string>>(null);
export function useSelectedUUID(): [string | null, () => Promise<void>] {
  const [selectedUUID, setSelectedUUID] = useAtom(selectedUUIDJotai);
  return [
    selectedUUID,
    async () => {
      setSelectedUUID(await mainPreload.config.getSelectedUUID());
    },
  ];
}
