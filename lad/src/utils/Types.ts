export type ConstructorType<T> = new(...args: any[]) => T;

export type ConstructableType = { prototype: { name: string } };