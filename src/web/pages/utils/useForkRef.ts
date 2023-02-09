import { MutableRefObject, Ref, RefCallback } from "react";

export function setRef<T>(ref: MutableRefObject<T> | RefCallback<T> | null, value: T): void {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref) {
    ref.current = value;
  }
}

export default function useForkRef<T>(...refs: Ref<T>[]): RefCallback<T> {
  return (instance) => {
    refs.forEach((ref) => {
      setRef(ref, instance);
    });
  };
}
