'use strict';

const scssConfig = require('./index');
const stylelint = require('stylelint');
const { resolve } = require('path');

const { hasOwnProperty } = Object.prototype;

function check(path) {
	const resolvedPath = resolve(process.cwd(), path || '');

	return stylelint.resolveConfig(resolvedPath).then((config) => {
		const prettierRules = {
			...scssConfig.rules,
		};
		const configRules = config.rules;
		const conflictingRules = [];

		function isEmpty(value) {
			return (
				value === null || (Array.isArray(value) && value.length === 0)
			);
		}

		Object.keys(prettierRules).forEach((rule) => {
			if (
				hasOwnProperty.call(configRules, rule) &&
				!isEmpty(configRules[rule]) &&
				configRules[rule][0] !== prettierRules[rule]
			) {
				conflictingRules.push(rule);
			}
		});

		return conflictingRules.length ? conflictingRules : null;
	});
}

exports.check = check;
