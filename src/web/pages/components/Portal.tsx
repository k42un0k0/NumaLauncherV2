import { forwardRef, ReactNode } from "react";
import { createPortal } from "react-dom";
import { setRef } from "../utils/useForkRef";

type Props = {
  children: ReactNode;
};
export default forwardRef<HTMLDivElement, Props>(function Portal({ children }, ref) {
  setRef(ref, document.getElementById("portal"));
  return createPortal(children, document.getElementById("portal")!);
});
