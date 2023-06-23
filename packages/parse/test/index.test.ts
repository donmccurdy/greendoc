import test from 'ava';
import { Encoder, GD, Parser, createDefaultSort, createPrefixSort } from '@greendoc/parse';
import { ClassDeclaration, Project } from 'ts-morph';

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
	const dog = parser.getItemBySlug('Dog') as ClassDeclaration;
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
	let a = encoder.encodeItem(parser.getItemBySlug('A') as ClassDeclaration);
	a = trim(a);

	t.deepEqual(
		a.constructor,
		{
			kind: GD.ApiItemKind.CONSTRUCTOR,
			name: 'constructor',
			params: [
				{ name: 'a', type: 'string' },
				{ name: 'b', type: 'string' }
			],
			returns: {
				kind: 'Class',
				name: 'A',
				path: '/modules/my-package/classes/A'
			},
			source: {
				text: 'source.ts',
				url: 'https://example.com/api/source.ts'
			}
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
	const a = encoder.encodeItem(parser.getItemBySlug('A') as ClassDeclaration);
	const b = encoder.encodeItem(parser.getItemBySlug('B') as ClassDeclaration);

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
	const a = parser.getItemBySlug('A') as ClassDeclaration;

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

/** Trims properties that JSON serialization would exclude. */
function trim<T extends {}>(object: T): T {
	return JSON.parse(JSON.stringify(object));
}

function toName(object: { name: string }): string {
	return object.name;
}

function createParser(name: string, source: string) {
	const project = new Project();
	const file = project.createSourceFile(MOCK_SOURCE_PATH, source);
	return new Parser(project)
		.setRootPath(MOCK_ROOT_PATH)
		.setBaseURL(MOCK_BASE_URL)
		.addModule({ name: name, slug: name, entry: file })
		.init();
}
