import { KeyedTypeUnion } from "../KeyedTypeUnion";
import { createTypeUnion } from "../createTypeUnion";

type ITypeUnion = KeyedTypeUnion<{ a: string; typeB: number; anotherTypeC: ITypeUnion.IAnotherTypeC }>;
namespace ITypeUnion {
    export interface IAnotherTypeC {
        foo: "bar";
        test: number;
    }
}
const ITypeUnion = createTypeUnion<ITypeUnion>({
    a: undefined,
    typeB: undefined,
    anotherTypeC: undefined,
});

describe("typeUnionUtils", () => {
    const typeUnionA = ITypeUnion.a("hello!");
    const typeUnionB = ITypeUnion.typeB(35);
    const typeUnionC = ITypeUnion.anotherTypeC({ foo: "bar", test: 1 });

    it("can create types", () => {
        expect(typeUnionA).toEqual({ type: "a", a: "hello!" });
        expect(typeUnionB).toEqual({ type: "typeB", typeB: 35 });
        expect(typeUnionC).toEqual({ type: "anotherTypeC", anotherTypeC: { foo: "bar", test: 1 } });
    });

    it("can check types", () => {
        expect(ITypeUnion.isA(typeUnionA)).toBeTruthy();
        expect(ITypeUnion.isTypeB(typeUnionA)).toBeFalsy();
        expect(ITypeUnion.isAnotherTypeC(typeUnionA)).toBeFalsy();

        expect(ITypeUnion.isA(typeUnionB)).toBeFalsy();
        expect(ITypeUnion.isTypeB(typeUnionB)).toBeTruthy();
        expect(ITypeUnion.isAnotherTypeC(typeUnionB)).toBeFalsy();

        expect(ITypeUnion.isA(typeUnionC)).toBeFalsy();
        expect(ITypeUnion.isTypeB(typeUnionC)).toBeFalsy();
        expect(ITypeUnion.isAnotherTypeC(typeUnionC)).toBeTruthy();
    });

    it("can visit types", () => {
        const visitA = jest.fn();
        const visitB = jest.fn();
        const visitC = jest.fn();

        [typeUnionA, typeUnionB, typeUnionC].forEach((typeUnion) =>
            ITypeUnion.visit(typeUnion, {
                a: (a) => {
                    visitA();
                    expect(a).toBe("hello!");
                },
                typeB: (typeB) => {
                    visitB();
                    expect(typeB).toBe(35);
                },
                anotherTypeC: ({ foo, test }) => {
                    visitC();
                    expect(foo).toBe("bar");
                    expect(test).toBe(1);
                },
            }),
        );

        [visitA, visitB, visitC].forEach((visit) => expect(visit).toBeCalledTimes(1));
    });
});
