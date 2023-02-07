export type ToPlain<T> = {
  [key in keyof T as T[key] extends (...args: unknown[]) => unknown ? never : key]: T[key] extends object
    ? ToPlain<T[key]>
    : T[key];
};

type Arg = { key: string; cls: new (...args: any[]) => any; args: Arg[] } | string;
type Def = {
  cls: new (...args: any[]) => any;
  args: Arg[];
};
/**
 *
 * <strong>Attention</strong>
 * this do "not" validate values. so it may be assigned nullish or incorrect value
 * thus validate return value yourself
 * recommend using `mergeNonNullishValue` together
 * @param def
 * @param plain
 * @returns
 */
export function plainToClass<T extends Def>(def: T, plain: ToPlain<InstanceType<T["cls"]>>): InstanceType<T["cls"]> {
  if (plain == null) {
    // @ts-expect-error cant write in typescript
    return;
  }
  const typedPlain = plain as Record<ObjectKey, any>;
  if (def.cls === Object) {
    return def.args.reduce((acc, arg) => {
      if (typeof arg === "string") {
        acc[arg] = typedPlain[arg];
        return acc;
      }
      if (arg.key === "") {
        return Object.keys(plain).reduce((acc, key) => {
          acc[key] = plainToClass({ cls: arg.cls, args: arg.args }, typedPlain[key]);
          return acc;
        }, {} as any);
      }
      if (Array.isArray(typedPlain[arg.key])) {
        acc[arg.key] = typedPlain[arg.key].map((v: any) => {
          return plainToClass({ cls: arg.cls, args: arg.args }, v);
        });
        return acc;
      }
      acc[arg.key] = plainToClass({ cls: arg.cls, args: arg.args }, typedPlain[arg.key]);
      return acc;
    }, {} as any);
  }
  return new def.cls(
    ...def.args.map((arg) => {
      if (typeof arg === "string") {
        return typedPlain[arg];
      }
      if (Array.isArray(typedPlain[arg.key])) {
        return typedPlain[arg.key].map((v: any) => {
          return plainToClass({ cls: arg.cls, args: arg.args }, v);
        });
      }
      return plainToClass({ cls: arg.cls, args: arg.args }, typedPlain[arg.key]);
    })
  );
}
export function mergeNonNullishValue<T>(target: T, src: T) {
  if (Array.isArray(target) && Array.isArray(src)) {
    target.forEach((_, key) => {
      target[key] = mergeNonNullishValue(target[key], src[key]);
    });
    return target;
  }
  if (typeof target === "object" && target != null && typeof src === "object" && src != null) {
    const typedTarget = target as Record<ObjectKey, any>;
    const typedSrc = src as Record<ObjectKey, any>;
    Object.keys({ ...typedTarget, ...typedSrc }).map((key) => {
      typedTarget[key] = mergeNonNullishValue(typedTarget[key], typedSrc[key]);
    });
    return target;
  }
  if (src != null) return src;
  return target;
}
