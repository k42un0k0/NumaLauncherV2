export type Action<T> = { type: string; payload: T };
export type PayloadFromActionCreator<T> = T extends ActionCreator<infer T> ? T : never;
type ActionCreator<T> = ((payload: T) => Action<T>) & { toString(): string };
export function createAction<T>(type: string): ActionCreator<T> {
  return Object.assign((payload: T) => ({ type, payload }), {
    toString() {
      return type;
    },
  });
}
export const actions = {
  overlay: {
    selectServer: createAction<string>("OVERLAY/SELECT_SERVER"),
  },
  setting: {
    java: {
      setExecutable: createAction<string>("SETTING/JAVA/SETEXECUTABLE"),
    },
  },
};
