import { Module } from "@/common/types";
import ModInput from "./ModInput";
import { css } from "@emotion/react";

type Props = {
  mod: { required: Module[]; option: Module[] };
};
export default function Mods({ mod }: Props) {
  return (
    <>
      <div>
        <div css={styles.head}>必須Mod</div>
        <div>
          {mod.required.map((module) => {
            return <ModInput key={module.name} module={module} disabled />;
          })}
        </div>
      </div>
      <div>
        <div css={styles.head}>オプションMod</div>
        <div>
          {mod.option.map((module) => {
            return <ModInput key={module.name} module={module} />;
          })}
        </div>
      </div>
    </>
  );
}

const styles = {
  head: css``,
};
