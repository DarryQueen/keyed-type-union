import { KeyedTypeUnion, RestrictedTypeUnionForTypeKey, ValueForTypeKey } from "./KeyedTypeUnion";

type TypeUnionVisitor<
    TypeUnion extends KeyedTypeUnion<Record<string, unknown>, TypeKey>,
    ReturnValue,
    TypeKey extends string,
> = {
    [Type in TypeUnion[TypeKey]]: (value: ValueForTypeKey<TypeUnion, Type, TypeKey>) => ReturnValue;
};

export function visitTypeUnion<TypeUnion extends KeyedTypeUnion<Record<string, unknown>, "type">, ReturnValue>(
    value: TypeUnion,
    visitor: TypeUnionVisitor<TypeUnion, ReturnValue, "type">,
): ReturnValue;
export function visitTypeUnion<
    TypeUnion extends KeyedTypeUnion<Record<string, unknown>, TypeKey>,
    ReturnValue,
    TypeKey extends string,
>(value: TypeUnion, visitor: TypeUnionVisitor<TypeUnion, ReturnValue, TypeKey>, typeKey: TypeKey): ReturnValue;
export function visitTypeUnion<
    TypeUnion extends KeyedTypeUnion<Record<string, unknown>, TypeKey>,
    ReturnValue,
    TypeKey extends string,
>(
    value: TypeUnion,
    visitor: TypeUnionVisitor<TypeUnion, ReturnValue, TypeKey>,
    typeKey: TypeKey = "type" as never,
): ReturnValue {
    const type = value[typeKey];
    const visitFunction = visitor[type];
    if (visitFunction == null) {
        throw new Error(`Unknown type "${type}".`);
    }

    return visitFunction(value[type] as never);
}

function createPackType<
    TypeUnion extends KeyedTypeUnion<Record<string, unknown>, TypeKey>,
    Type extends TypeUnion[TypeKey],
    TypeKey extends string,
>(
    type: Type,
    typeKey: TypeKey,
): (value: ValueForTypeKey<TypeUnion, Type, TypeKey>) => RestrictedTypeUnionForTypeKey<TypeUnion, Type, TypeKey> {
    return ((value: unknown) => ({ [typeKey]: type, [type]: value })) as never;
}

function createIsType<
    TypeUnion extends KeyedTypeUnion<Record<string, unknown>, TypeKey>,
    Type extends TypeUnion[TypeKey],
    TypeKey extends string,
>(
    type: Type,
    typeKey: TypeKey,
): (value: TypeUnion) => value is RestrictedTypeUnionForTypeKey<TypeUnion, Type, TypeKey> {
    return (value): value is RestrictedTypeUnionForTypeKey<TypeUnion, Type, TypeKey> => value[typeKey] === type;
}

function createVisitTypeUnion<
    TypeUnion extends KeyedTypeUnion<Record<string, unknown>, TypeKey>,
    TypeKey extends string,
>(
    typeKey: TypeKey,
): <ReturnValue>(value: TypeUnion, visitor: TypeUnionVisitor<TypeUnion, ReturnValue, TypeKey>) => ReturnValue {
    return (value, visitor) => visitTypeUnion(value, visitor, typeKey);
}

type ITypeUnionUtils<TypeUnion extends KeyedTypeUnion<Record<string, unknown>, TypeKey>, TypeKey extends string> = {
    [Type in TypeUnion[TypeKey]]: (
        value: ValueForTypeKey<TypeUnion, Type, TypeKey>,
    ) => RestrictedTypeUnionForTypeKey<TypeUnion, Type, TypeKey>;
} & {
    [Type in TypeUnion[TypeKey] as `is${Capitalize<Type>}`]: (
        value: TypeUnion,
    ) => value is RestrictedTypeUnionForTypeKey<TypeUnion, Type, TypeKey>;
} & {
    visit<ReturnValue>(value: TypeUnion, visitor: TypeUnionVisitor<TypeUnion, ReturnValue, TypeKey>): ReturnValue;
};

/**
 * Creates a type union const that includes the following utils:
 *   * Pack type (create a union-typed wrapper around the subtype).
 *   * Is type (create a type-checker on the union type).
 *   * Visitor.
 */
export function createTypeUnion<TypeUnion extends KeyedTypeUnion<Record<string, unknown>, "type">>(
    types: Record<TypeUnion["type"], undefined>,
): ITypeUnionUtils<TypeUnion, "type">;
export function createTypeUnion<
    TypeUnion extends KeyedTypeUnion<Record<string, unknown>, TypeKey>,
    TypeKey extends string,
>(types: Record<TypeUnion[TypeKey], undefined>, typeKey: TypeKey): ITypeUnionUtils<TypeUnion, TypeKey>;
export function createTypeUnion<
    TypeUnion extends KeyedTypeUnion<Record<string, unknown>, TypeKey>,
    TypeKey extends string,
>(
    types: Record<TypeUnion[TypeKey], undefined>,
    typeKey: TypeKey = "type" as never,
): ITypeUnionUtils<TypeUnion, TypeKey> {
    const utils: ITypeUnionUtils<TypeUnion, TypeKey> = {} as never;

    (Object.keys(types) as Array<TypeUnion[TypeKey]>).forEach((type) => {
        utils[type] = createPackType<TypeUnion, TypeUnion[TypeKey], TypeKey>(type, typeKey) as never;

        const isTypeKey = `is${type.charAt(0).toUpperCase()}${type.slice(1)}` as `is${Capitalize<TypeUnion[TypeKey]>}`;
        utils[isTypeKey] = createIsType<TypeUnion, TypeUnion[TypeKey], TypeKey>(type, typeKey) as never;
    });

    utils.visit = createVisitTypeUnion<TypeUnion, TypeKey>(typeKey);

    return utils;
}
