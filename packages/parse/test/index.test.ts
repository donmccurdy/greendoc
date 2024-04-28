import test from 'ava';
import { Encoder, GD, Parser, createDefaultSort, createPrefixSort } from '@greendoc/parse';
import * as TS from 'ts-morph';

const MOCK_ROOT_PATH = '/path/to';
const MOCK_SOURCE_PATH = '/path/to/source.ts';
const MOCK_BASE_URL = 'https://example.com/api';

test('parser.modules', (t) => {
	const parser = createParser(
		'my-package',
		`
	export class Animal {}
	export class Dog {}
	export class Snake {}
	export class Freddy {}
	`
	);
	const pkg = parser.modules[0];
	t.is(pkg.name, 'my-package', 'package name');
	t.deepEqual(
		parser.getModuleExports(pkg.name).map((item) => (item as any).getName()),
		['Animal', 'Dog', 'Snake', 'Freddy'],
		'package exports'
	);
});

test('parser.modules - tags', (t) => {
	const parser = createParser(
		'my-package',
		`
	/**
	 * Description.
	 * @type {string} name
	 * @alpha
	 * @beta
	 * @deprecated Use something else.
	 * @experimental
	 */
	export function myFunction() {}

	/**
	 * @experimental
	 */
	export class MyClass {}
	`
	);

	const exports = parser.getModuleExports('my-package');

	t.deepEqual(
		exports.map((item) => [parser.getName(item), parser.getTags(item)]),
		[
			[
				'myFunction',
				{
					alpha: true,
					beta: true,
					deprecated: 'Use something else.',
					experimental: true
				}
			],
			['MyClass', { experimental: true }]
		],
		'tags'
	);
});

test('class serialization', (t) => {
	const parser = createParser(
		'my-package',
		`
	/** Description of Animal. */
export class Animal {
    private name: string;
    /** Description of Animal#getName. */
    getName(): string {
        return this.name;
    }
}

/** Description of Dog. */
export class Dog extends Animal {
    /** Description of Dog#getLegs. */
    getLegs(): number {
        return 4;
    }
}

/** Description of Cat. */
export class Snake extends Animal {
    /** Description of Snake#getFangs. */
    getFangs(): number {
        return 2;
    }
}

export class Freddy extends Dog {
    getName(): string {
        return 'Freddy';
    }
}
	`
	);

	const encoder = new Encoder(parser);
	const dog = parser.getItemBySlug('Dog') as TS.ClassDeclaration;
	const encodedDog = trim(encoder.encodeItem(dog));
	t.deepEqual(
		encodedDog,
		{
			kind: 'Class',
			name: 'Dog',
			source: {
				text: 'source.ts',
				url: 'https://example.com/api/source.ts'
			},
			comment: '<p>Description of Dog.</p>\n',
			extendsTypes: [
				{
					path: '/modules/my-package/classes/Animal',
					name: 'Animal',
					kind: 'Class'
				}
			],
			staticProperties: [],
			properties: [],
			staticMethods: [],
			methods: [
				{
					comment: '<p>Description of Dog#getLegs.</p>\n',
					kind: GD.ApiItemKind.METHOD,
					name: 'getLegs',
					params: [],
					returns: 'number',
					source: {
						text: 'source.ts',
						url: 'https://example.com/api/source.ts'
					}
				},
				{
					comment: '<p>Description of Animal#getName.</p>\n',
					kind: GD.ApiItemKind.METHOD,
					name: 'getName',
					params: [],
					returns: 'string',
					source: {
						text: 'source.ts',
						url: 'https://example.com/api/source.ts'
					}
				}
			]
		},
		'encoded class'
	);
});

test('constructors', (t) => {
	const parser = createParser(
		'my-package',
		`
	export class A {
		constructor(a: string, b: string) {
			// ...
		}
	}
	`
	);

	const encoder = new Encoder(parser);
	const classA = parser.getItemBySlug('A') as TS.ClassDeclaration;
	const encodedClassA = trim(encoder.encodeItem(classA));

	t.deepEqual(
		encodedClassA.constructor,
		{
			kind: GD.ApiItemKind.CONSTRUCTOR,
			name: 'constructor',
			params: [
				{ name: 'a', type: 'string' },
				{ name: 'b', type: 'string' }
			],
			returns: { kind: 'Class', name: 'A', path: '/modules/my-package/classes/A' },
			source: { text: 'source.ts', url: 'https://example.com/api/source.ts' }
		},
		'a.constructor'
	);
});

test('inherited members', (t) => {
	const parser = createParser(
		'my-package',
		`
	export class A {
		static parentStaticProperty = 1;
		parentProperty = 2;
		static parentStaticMethod (): number { return 3; }
		parentMethod (): number { return 4; }
	}

	export class B extends A {
		static childStaticProperty = 5;
		childProperty = 6;
		static childStaticMethod (): number { return 7; }
		childMethod (): number { return 8; }
	}
	`
	);

	const encoder = new Encoder(parser);
	const a = encoder.encodeItem(parser.getItemBySlug('A') as TS.ClassDeclaration);
	const b = encoder.encodeItem(parser.getItemBySlug('B') as TS.ClassDeclaration);

	// methods
	t.deepEqual(a.methods.map(toName), ['parentMethod'], 'a.methods');
	t.deepEqual(b.methods.map(toName), ['childMethod', 'parentMethod'], 'b.methods');

	// static methods
	t.deepEqual(a.staticMethods.map(toName), ['parentStaticMethod'], 'a.staticMethods');
	t.deepEqual(
		b.staticMethods.map(toName),
		['childStaticMethod', 'parentStaticMethod'],
		'b.staticMethods'
	);

	// properties
	t.deepEqual(a.properties.map(toName), ['parentProperty'], 'a.properties');
	t.deepEqual(b.properties.map(toName), ['childProperty', 'parentProperty'], 'b.properties');

	// static properties
	t.deepEqual(a.staticProperties.map(toName), ['parentStaticProperty'], 'a.staticProperties');
	t.deepEqual(
		b.staticProperties.map(toName),
		['childStaticProperty', 'parentStaticProperty'],
		'b.staticProperties'
	);
});

test('custom sort', (t) => {
	const parser = createParser(
		'my-package',
		`
	export class A {
		a() {}
		getA() {}
		setA() {}
		listA() {}
		b() {}
		getB() {}
		setB() {}
		listB() {}
	}
	`
	);

	const encoder = new Encoder(parser);
	const a = parser.getItemBySlug('A') as TS.ClassDeclaration;

	let encodedA = encoder.encodeItem(a);
	t.deepEqual(
		encodedA.methods.map(toName),
		['a', 'b', 'getA', 'getB', 'listA', 'listB', 'setA', 'setB'],
		'default sort'
	);

	encodedA = encoder.setSort(createPrefixSort()).encodeItem(a);
	t.deepEqual(
		encodedA.methods.map(toName),
		['a', 'getA', 'listA', 'setA', 'b', 'getB', 'listB', 'setB'],
		'prefix sort'
	);

	encodedA = encoder.setSort(createDefaultSort()).encodeItem(a);
	t.deepEqual(
		encodedA.methods.map(toName),
		['a', 'b', 'getA', 'getB', 'listA', 'listB', 'setA', 'setB'],
		'default sort (reset)'
	);
});

test('tsdoc comments, params, and returns', (t) => {
	const parser = createParser(
		'my-package',
		`
	/**
	 * Concatenates two string arguments.
	 * @param a First argument.
	 * @param b Second argument.
	 * @returns Concatenation of first and second arguments.
	 */
	export function concat(a: string, b: string): string {
		return a + b;
	}

	/** Class that adds numbers. */
	export class AddingMachine {
		/**
		 * Sums two numbers.
		 * @param a First addend.
		 * @param b Second addend.
		 * @returns Sum of first and second addends.
		 */
		add(a: number, b: number): number {
			return a + b;
		}
	}
	`
	);

	const encoder = new Encoder(parser);
	const concat = parser.getItemBySlug('concat') as TS.FunctionDeclaration;
	const encodedConcat = trim(encoder.encodeItem(concat));

	t.deepEqual(
		encodedConcat,
		{
			kind: 'Function',
			name: 'concat',
			source: { text: 'source.ts', url: 'https://example.com/api/source.ts' },
			params: [
				{ name: 'a', type: 'string', comment: '<p>First argument.</p>\n' },
				{ name: 'b', type: 'string', comment: '<p>Second argument.</p>\n' }
			],
			returns: 'string',
			returnsComment: '<p>Concatenation of first and second arguments.</p>\n',
			comment: '<p>Concatenates two string arguments.</p>\n'
		},
		'function'
	);

	const addingMachine = parser.getItemBySlug('AddingMachine') as TS.ClassDeclaration;
	const encodedAddingMachine = trim(encoder.encodeItem(addingMachine));

	t.deepEqual(
		encodedAddingMachine,
		{
			kind: 'Class',
			name: 'AddingMachine',
			comment: '<p>Class that adds numbers.</p>\n',
			source: { text: 'source.ts', url: 'https://example.com/api/source.ts' },
			methods: [
				{
					kind: 'Method',
					name: 'add',
					source: { text: 'source.ts', url: 'https://example.com/api/source.ts' },
					comment: '<p>Sums two numbers.</p>\n',
					params: [
						{ name: 'a', type: 'number', comment: '<p>First addend.</p>\n' },
						{ name: 'b', type: 'number', comment: '<p>Second addend.</p>\n' }
					],
					returns: 'number',
					returnsComment: '<p>Sum of first and second addends.</p>\n'
				}
			],
			extendsTypes: [],
			staticProperties: [],
			properties: [],
			staticMethods: []
		},
		'class'
	);
});

test('item tags', (t) => {
	const parser = createParser(
		'my-package',
		`
	/**
	 * My class.
	 * @public
	 */
	export class AddingMachine {
		/** @deprecated Do not use this. */
		public myProperty = 25;
		/**
		 * Sums two numbers.
		 * @param a First addend.
		 * @param b Second addend.
		 * @returns Sum of first and second addends.
		 * @public
		 */
		add(a: number, b: number): number {
			return a + b;
		}
		/** @deprecated */
		subtract(a: number, b: number): number {
			return a - b;
		}
		/** @alpha */
		multiply(a: number, b: number): number {
			return a * b;
		}
	}
	`
	);

	const encoder = new Encoder(parser);
	const addingMachine = parser.getItemBySlug('AddingMachine') as TS.ClassDeclaration;
	const encodedAddingMachine = trim(encoder.encodeItem(addingMachine));
	const addMethod = encodedAddingMachine.methods.find(({ name }) => name === 'add');
	const subtractMethod = encodedAddingMachine.methods.find(({ name }) => name === 'subtract');
	const multiplyMethod = encodedAddingMachine.methods.find(({ name }) => name === 'multiply');

	t.deepEqual(encodedAddingMachine.tags, { public: true }, 'class.tags');
	t.deepEqual(
		encodedAddingMachine.properties[0].tags,
		{ deprecated: 'Do not use this.' },
		'class.property.tags'
	);
	t.deepEqual(addMethod.tags, { public: true }, 'class#add.tags');
	t.deepEqual(subtractMethod.tags, { deprecated: true }, 'class#subtract.tags');
	t.deepEqual(multiplyMethod.tags, { alpha: true }, 'class#multiply.tags');
});

test('variables', (t) => {
	const parser = createParser(
		'my-package',
		`
	/**
	 * Description.
	 * @type {string} name
	 */
	export let name = 'hello';
	`
	);

	const encoder = new Encoder(parser);
	const encodedVariable = trim(
		encoder.encodeItem(parser.getItemBySlug('name') as TS.VariableDeclaration)
	);

	t.deepEqual(
		encodedVariable,
		{
			kind: 'Variable',
			name: 'name',
			source: { text: 'source.ts', url: 'https://example.com/api/source.ts' },
			type: 'string'
			// comment: '<p>Description.</p>\n' // not yet supported by ts-morph
		},
		'variable'
	);
});

//////////////////////// UTILITIES ////////////////////////

/** Trims properties that JSON serialization would exclude. */
function trim<T extends {}>(object: T): T {
	return JSON.parse(JSON.stringify(object));
}

function toName(object: { name: string }): string {
	return object.name;
}

function createParser(name: string, source: string) {
	const project = new TS.Project();
	const file = project.createSourceFile(MOCK_SOURCE_PATH, source);
	return new Parser(project)
		.setRootPath(MOCK_ROOT_PATH)
		.setBaseURL(MOCK_BASE_URL)
		.addModule({ name: name, slug: name, entry: file })
		.init();
}
