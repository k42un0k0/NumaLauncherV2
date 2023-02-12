import { Module } from "@/common/types";
import Required from "./Required";
import Option from "./Option";

type Props = {
  mod: { required: Module[]; option: Module[] };
};
export default function Mods({ mod }: Props) {
  return (
    <>
      <div>
        <div>必須Mod</div>
        <div>
          {mod.required.map((module) => {
            return <Required key={module.name} module={module} />;
          })}
        </div>
      </div>
      <div>
        <div>オプションMod</div>
        <div>
          {mod.option.map((module) => {
            return <Option key={module.name} module={module} />;
          })}
        </div>
      </div>
    </>
  );
}
