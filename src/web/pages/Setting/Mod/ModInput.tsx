import { Module } from "@/common/types";
import Switch from "../components/Switch";

type Props = {
  module: Module;
  disabled?: boolean;
};
export default function Option({ module }: Props) {
  return (
    <div>
      <div>
        <div>
          <div style={{ fontSize: 50, lineHeight: "7px" }}>&#8226;</div>
          <div>
            <span>{module.name}</span>
            <span>v{module.version}</span>
          </div>
        </div>
        <div>
          <Switch value={module.value} />
        </div>
      </div>
      {module.subModules ? <div></div> : ""}
    </div>
  );
}
