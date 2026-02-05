Prism.languages.pseudo = {
	'comment': {
		pattern: /#(?!##).*|###[\s\S]*?###/,
		greedy: true
	},

	'keyword': /\b(import|from|func|struct|typedef|match|switch|case|enum|default|let|const|new|destroy|Flag|as|in|by|for|while|do|break|if|elif|else|and|or|try|catch|throw|return)\b/,
	'type': /(\!|\[\d*\]|\*|\?)*([iu](256|25[0-5]|2[0-4][0-9]|1?[0-9]{1,2}|ptr)|byte|f32|f64|float|double|string|char|bool|type|anytype|void|noreturn|fault)\b/,

	'fault': {
		pattern: /\b[a-zA-Z_][a-zA-Z0-9_]*Fault(?=\()\b/,
		alias: 'tag'
	},

	'boolean': /\b(true|false)\b/,

    'property': /@([a-zA-Z_][a-zA-Z0-9_]*)/,
	'function': /\b[a-zA-Z_][a-zA-Z0-9_]*(?=\()\b/,

	'operator': /(\+\+|\*\*|\?\?|==|>=|<=|\!=|\+=|-=|\*=|\/=|%=|=>|\+|-|\*|\/|%|=|>|<|\.|\&)/,
    'punctuation': /(\[|\]|{|}|\(|\))/,

	// values

	'char': {
		pattern: /'(?:\\(?:\r\n|[\s\S])|[^'\\\r\n]){0,32}'/,
		greedy: true
	},
	'string': {
		pattern: /"(?:\\(?:\r\n|[\s\S])|[^"\\\r\n])*"/,
		greedy: true,

		inside: {
			'interpolation': {
				pattern: /\\{[^}]*}/,
				
				inside: {
					'tag': /(\\{|})/,
					'plain': {
						pattern: /.+/,
						inside: Prism.languages.abs
					}
				}
			},

			'tag': { // escape char
				pattern: /\\./
			}
		}
	},
	'number': /\b(\d+.\d+|\d+|0x[0-9a-fA-F_]+|0b[01_]+)\b/,
};
