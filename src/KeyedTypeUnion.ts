import { Key } from "./Key";

export type KeyedTypeUnion<KeyedValues extends Record<Type, unknown>, TypeKey extends string = "type"> = {
    [Type in keyof KeyedValues]: { [K in TypeKey]: Type } & {
        [T in Type]: KeyedValues[Type];
    };
}[keyof KeyedValues];

export type RestrictedTypeUnionForTypeKey<
    TypeUnion extends KeyedTypeUnion<Record<Key, unknown>, TypeKey>,
    Type extends string,
    TypeKey extends string = "type",
> = TypeUnion extends Record<TypeKey, Type> ? TypeUnion : never;
export type ValueForTypeKey<
    TypeUnion extends KeyedTypeUnion<Record<Key, unknown>, TypeKey>,
    Type extends string,
    TypeKey extends string = "type",
> = TypeUnion extends Record<TypeKey, Type> ? TypeUnion[Type] : never;
