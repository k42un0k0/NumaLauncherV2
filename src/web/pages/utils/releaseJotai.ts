import axios from "axios";
import { atom, useSetAtom } from "jotai";
import { useEffect } from "react";
import { XMLParser } from "fast-xml-parser";

interface ReleaseNoteJson {
  "?xml": string;
  feed: {
    id: string;
    link: string[];
    title: string;
    updated: string;
    entry: {
      id: string;
      updated: string;
      link: string;
      title: string;
      content: string;
      author: {
        name: string;
      };
      "media:thumbnail": string;
    }[];
  };
}

export const releaseNoteJotai = atom<ReleaseNoteJson | undefined>(undefined);

export function usePrepareReleaseNoteJotai() {
  const setReleaseNote = useSetAtom(releaseNoteJotai);
  useEffect(() => {
    async function effect() {
      const response = await axios.get("https://github.com/TeamKun/NumaLauncher/releases.atom");
      const xp = new XMLParser();
      const data = response.data;
      const obj = xp.parse(data) as ReleaseNoteJson;
      console.log(JSON.stringify(obj));
      setReleaseNote(obj);
    }
    effect();
  }, []);
}
