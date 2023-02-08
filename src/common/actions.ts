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
      setExecutable: createAction<string>("SETTING/JAVA/SET_EXECUTABLE"),
      setMinRAM: createAction<number>("SETTING/JAVA/SET_MINRAM"),
      setMaxRAM: createAction<number>("SETTING/JAVA/SET_MAXRAM"),
      setJvmOptions: createAction<string>("SETTING/JAVA/SET_JVM_OPTIONS"),
    },
  },
};
