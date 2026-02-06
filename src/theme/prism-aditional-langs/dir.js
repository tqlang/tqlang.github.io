Prism.languages.dir = {
    'comment': {
		pattern: /#(?!##).*|###[\s\S]*?###/,
		greedy: true
	},

    'lines': {
        pattern: /(?:\||'--|\\|--|---)/,
        alias: 'comment',
    },

    'root': {
        pattern: /(^|\s)[A-Za-z0-9_-]+:/,
        alias: 'red'
    },

    'folders': {
        pattern: /(^|\s)[A-Za-z0-9_-]+\//,
        alias: 'green'
    },

}
