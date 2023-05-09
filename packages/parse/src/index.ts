export * from './Parser';
export * from './Encoder';
export * from './types';

/** This is test function, because the compiler wants something in the /functions path. */
export function testFunction(a: number, b: number): string {
	return 'hello world';
}

/** This is test enum, because the compiler wants something in the /enums path. */
export enum TestEnum {
	A,
	B,
	C
}
