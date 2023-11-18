export { matchers } from './matchers.js';

export const nodes = [
	() => import('./nodes/0.js'),
	() => import('./nodes/1.js'),
	() => import('./nodes/2.js'),
	() => import('./nodes/3.js'),
	() => import('./nodes/4.js'),
	() => import('./nodes/5.js'),
	() => import('./nodes/6.js'),
	() => import('./nodes/7.js'),
	() => import('./nodes/8.js')
];

export const server_loads = [0];

export const dictionary = {
		"/": [2],
		"/config": [3],
		"/config/chords": [4],
		"/config/layout": [5],
		"/config/settings": [6],
		"/plugin": [7],
		"/terminal": [8]
	};

export const hooks = {
	handleError: (({ error }) => { console.error(error) }),
};

export { default as root } from '../root.svelte';