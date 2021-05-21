import { terser } from 'rollup-plugin-terser';

export default [
	{
		input: 'index.js',
		output:
		{
			file: 'smallfire.js',
			plugins: [
				terser(),
			]
		},
	},
	{
		input: 'src/auth/auth.js',
		output:
		{
			file: 'auth.js',
			plugins: [
				terser(),
			]
		},
	},
	{
		input: 'src/firebase/firebase.js',
		output:
		{
			file: 'firebase.js',
			plugins: [
				terser(),
			]
		},
	},
	{
		input: 'src/firestore/firestore.js',
		output:
		{
			file: 'firestore.js',
			plugins: [
				terser(),
			]
		},
	},
];
