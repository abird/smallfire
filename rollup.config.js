import { terser } from 'rollup-plugin-terser';

export default [
	{
		input: 'index.js',
		output:
		{
			file: 'dist/smallfire.js',
			plugins: [
				terser(),
			]
		},
	},
	{
		input: 'src/auth/auth.js',
		output:
		{
			file: 'dist/auth.js',
			plugins: [
				terser(),
			]
		},
	},
	{
		input: 'src/firebase/firebase.js',
		output:
		{
			file: 'dist/firebase.js',
			plugins: [
				terser(),
			]
		},
	},
	{
		input: 'src/firestore/firestore.js',
		output:
		{
			file: 'dist/firestore.js',
			plugins: [
				terser(),
			]
		},
	},
];
