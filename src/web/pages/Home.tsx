import { mainPreload } from "../utils/preload";

export default function Home() {
  return (
    <div>
      <button
        onClick={() => {
          mainPreload.home.runMinecraft((event, arg) => {
            if (event == "progress") {
              console.log(arg);
            }
          });
        }}
      >
        プレイ
      </button>
    </div>
  );
}
