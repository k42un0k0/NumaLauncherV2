import { Module } from "@/common/types";

type Props = {
  module: Module;
};
export default function Required({ module }: Props) {
  return (
    <div>
      <div>
        <div>
          <div></div>
          <div>
            <span>{module.name}</span>
            <span>v{module.version}</span>
          </div>
        </div>
        <label>
          <input type="checkbox" checked disabled />
          <span></span>
        </label>
      </div>
      {module.subModules ? <div></div> : ""}
    </div>
  );
}
