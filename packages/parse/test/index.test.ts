import test from 'ava';
import { Encoder, GD, Parser } from '@greendoc/parse';
import { ClassDeclaration, Project } from 'ts-morph';

const project = new Project();
const file = project.createSourceFile(
	'node.ts',
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

test('modules', (t) => {
	const parser = new Parser(project)
		.addModule({
			name: 'my-package',
			slug: 'my-package',
			entry: file
		})
		.init();
	const pkg = parser.modules[0];
	t.is(pkg.name, 'my-package', 'package name');
	t.deepEqual(
		pkg.exports,
		[
			{ name: 'Animal', path: '/modules/my-package/classes/Animal.html' },
			{ name: 'Dog', path: '/modules/my-package/classes/Dog.html' },
			{ name: 'Snake', path: '/modules/my-package/classes/Snake.html' },
			{ name: 'Freddy', path: '/modules/my-package/classes/Freddy.html' }
		],
		'package exports'
	);
});

test('encoder', (t) => {
	const encoder = new Encoder();
	const parser = new Parser(project)
		.addModule({
			name: 'my-package',
			slug: 'my-package',
			entry: file
		})
		.init();
	const dog = parser.getItemBySlug('Dog.html') as ClassDeclaration;
	t.deepEqual(
		encoder.encodeItem(parser, dog),
		{
			kind: 'Class',
			name: 'Dog',
			source: {
				text: 'node.ts',
				url: '/Users/donmccurdy/Documents/Projects/greendoc/packages/parse/node.ts'
			},
			comment: '<p>Description of Dog.</p>\n',
			extendsTypes: [
				{
					path: '/modules/my-package/classes/Animal.html',
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
						text: 'node.ts',
						url: '/Users/donmccurdy/Documents/Projects/greendoc/packages/parse/node.ts'
					}
				},
				{
					comment: '<p>Description of Animal#getName.</p>\n',
					kind: GD.ApiItemKind.METHOD,
					name: 'getName',
					params: [],
					returns: 'string',
					source: {
						text: 'node.ts',
						url: '/Users/donmccurdy/Documents/Projects/greendoc/packages/parse/node.ts'
					}
				}
			]
		},
		'encoded class'
	);
});
