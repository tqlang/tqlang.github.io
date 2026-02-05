export type Token = {
    start: number;
    end: number;
    value: string;
    wsp?: string;
    kind: TokenKind;
    error: boolean;
};
export enum TokenKind {
        unknowm,
        word, 

        keyword,
        type,
        identifier,
        attribute,
        function,
        struct,
        number,
        string,
        boolean,
        comment,
        whitespace,
        newLine,
        assignOperator,
        binaryOperator,
        unaryOperator,
        punctuation,

        inlineHint,
        metaError,
        metaWarning,
};
export enum CodeBlockScope {
    root,
    struct,
    typedef,
    function,
}

type AnalyzerContext = {
    tokens: Token[],
    index: number,
    scope: CodeBlockScope[],
    level: number;
}

export function tokenize(source: string) : Token[] {
    let tokens = lex(source);
    analyze(tokens);
    return tokens;
}

function lex(text: string): Token[] {
    const tokens: Token[] = [];
    let i = 0;

    while (i < text.length) {
        const ch = text[i];
        const start = i;

        // Whitespace
        if (isWhitespace(ch)) {
            while (i < text.length && isWhitespace(text[i])) i++;
            tokens.push({ kind: TokenKind.whitespace, start, end: i, value: text.slice(start, i), error: false });
            continue;
        }

        // Line feed
        if (ch == '\n') {
            i++;
            while (i < text.length && text[i] == '\n') i++;
            tokens.push({ kind: TokenKind.newLine, start, end: i, value: text.slice(start, i), error: false });
            continue;
        }

        // Line comment
        if (ch === '#' && text.slice(i, i+3) !== '###') {
            i++;
            while (i < text.length && text[i] !== '\n') i++;
            tokens.push({ kind: TokenKind.comment, start, end: i, value: text.slice(start, i), error: false });
            continue;
        }

        // Block comment ### ###
        if (ch === '#' && text.slice(i, i+3) === '###') {
            i += 3;
            while (i < text.length && text.slice(i, i+3) !== '###') i++;
            i += 3;
            tokens.push({ kind: TokenKind.comment, start, end: i, value: text.slice(start, i), error: false });
            continue;
        }

        // word [a-zA-Z_][a-zA-Z0-9_]*
        if (isAlpha(ch) || ch === '_') {
            i++;
            while (i < text.length && isAlphaNum(text[i]) || text[i] === '_') i++;
            let val = text.slice(start, i);
            switch (val) {
                case 'as':
                    tokens.push({ kind: TokenKind.binaryOperator, start, end: i, value: val, error: false });
                    continue;
                default:
                    tokens.push({ kind: TokenKind.word, start, end: i, value: val, error: false });
                    continue;
            }
        }

        // Number
        if (isDigit(ch, 10)) {
            i++;
            let base = 10;
            while (true) {
                if (ch != '0' || i >= text.length) break;
                if (text[i] == 'x') { base = 16; i++; break; }
                if (text[i] == 'b') { base = 2; i++; break; }
                break;
            }

            while (i < text.length && isDigit(text[i], base)) i++;
            tokens.push({ kind: TokenKind.number, start, end: i, value: text.slice(start, i), error: false });
            continue;
        }

        // String
        if (ch === '"') {
            i++;
            let escaped = false;

            while (i < text.length) {
                const c = text[i];

                if (escaped) escaped = false;
                else if (c === '\\') escaped = true;
                else if (c === '"') break;

                i++;
            }

            const hasClosing = i < text.length;

            if (hasClosing) i++;

            tokens.push({
                kind: TokenKind.string,
                start,
                end: i,
                value: text.slice(start, i),
                error: !hasClosing
            });

            continue;
        }

        // Char
        if (ch === '\'') {
            i++;
            let escaped = false;

            while (i < text.length) {
                const c = text[i];

                if (escaped) escaped = false;
                else if (c === '\\') escaped = true;
                else if (c === '\'') break;

                i++;
            }

            const hasClosing = i < text.length;

            if (hasClosing) i++;

            tokens.push({
                kind: TokenKind.string,
                start,
                end: i,
                value: text.slice(start, i),
                error: !hasClosing
            });

            continue;
        }

        // Operators
        switch (ch) {

            case '+':
                i++;
                if (text[i] == '+') {
                    i++;
                    tokens.push({ kind: TokenKind.unaryOperator, start, end: i, value: text.slice(start, i), error: false });
                }
                else if (text[i] == '=') {
                    i++;
                    tokens.push({ kind: TokenKind.assignOperator, start, end: i, value: text.slice(start, i), error: false });
                }
                else {
                    if (['%', '|'].includes(text[i])) i++;
                    tokens.push({ kind: TokenKind.binaryOperator, start, end: i, value: text.slice(start, i), error: false });
                }
                continue;

            case '-':
                i++;
                if (text[i] == '=') {
                    i++;
                    tokens.push({ kind: TokenKind.assignOperator, start, end: i, value: text.slice(start, i), error: false });
                }
                if (['-', '%', '|'].includes(text[i])) i++;
                tokens.push({ kind: TokenKind.binaryOperator, start, end: i, value: text.slice(start, i), error: false });
                continue;

            case '*':
                i++;
                if (text[i] == '=') {
                    i++;
                    tokens.push({ kind: TokenKind.assignOperator, start, end: i, value: text.slice(start, i), error: false });
                }
                if (['*'].includes(text[i])) i++;
                tokens.push({ kind: TokenKind.binaryOperator, start, end: i, value: text.slice(start, i), error: false });
                continue;

            case '/':
                i++;
                if (text[i] == '=') {
                    i++;
                    tokens.push({ kind: TokenKind.assignOperator, start, end: i, value: text.slice(start, i), error: false });
                }
                if (['^', '_'].includes(text[i])) i++;
                tokens.push({ kind: TokenKind.binaryOperator, start, end: i, value: text.slice(start, i), error: false });
                continue;

            case '=':
                i++;
                if (['=', '>'].includes(text[i])) {
                    i++;
                    tokens.push({ kind: TokenKind.binaryOperator, start, end: i, value: text.slice(start, i), error: false });
                }
                else tokens.push({ kind: TokenKind.assignOperator, start, end: i, value: text.slice(start, i), error: false });
                continue;

            case '<':
            case '>':
                i++;
                if (['='].includes(text[i])) i++;
                tokens.push({ kind: TokenKind.binaryOperator, start, end: i, value: text.slice(start, i), error: false });
                continue;
            
            case '!':
                i++;
                if (text[i] === '=') {
                    i++;
                    tokens.push({ kind: TokenKind.binaryOperator, start, end: i, value: text.slice(start, i), error: false });
                    continue;
                }
                tokens.push({ kind: TokenKind.unaryOperator, start, end: i, value: text.slice(start, i), error: false });
                continue;
            
            case '&':
                i++;
                tokens.push({ kind: TokenKind.unaryOperator, start, end: i, value: text.slice(start, i), error: false });
                continue;
        }

        // ... (documentation quirk)
        if (i+3 < text.length && text.slice(i, i+3) === "...") {
            i += 3;
            tokens.push({ kind: TokenKind.inlineHint, start, end: i, value: "...", error: false });
            continue;
        }

        // ..
        if (i+2 < text.length && text.slice(i, i+2) === "..") {
            i += 2;
            tokens.push({ kind: TokenKind.binaryOperator, start, end: i, value: "..", error: false });
            continue;
        }

        // Punctuation
        if (isPunctuation(ch)) {
            i++;
            tokens.push({ kind: TokenKind.punctuation, start, end: i, value: ch, error: false });
            continue;
        }

        // Fallback
        i++;
        tokens.push({ kind: TokenKind.unknowm, start, end: i, value: ch, error: true });
    }

    return tokens;
}
function analyze(tokens: Token[]) {

    let ctx: AnalyzerContext = {
        index: 0,
        tokens: tokens,
        scope: [ CodeBlockScope.root ],
        level: 0,
    };

    if (tokens[0].kind == TokenKind.comment) {
        switch (tokens[0].value) {
            case "#/// root scope ///": ctx.scope[0] = CodeBlockScope.root; break;
            case "#/// func scope ///": ctx.scope[0] = CodeBlockScope.function; break;
            case "#/// struct scope ///": ctx.scope[0] = CodeBlockScope.struct; break;
        }
    }

    try {
        while (ctx.index < ctx.tokens.length) {
            let i = ctx.index;
            analize_generic(ctx);
            if (ctx.index == i) ctx.index++;
        }
        ctx.scope.pop();
    }
    catch(error) {
        console.error(error);
        for (let i = ctx.index; i < ctx.tokens.length; i++) {
            ctx.tokens[i].error = true;
        }
    }
}
function analize_generic(ctx: AnalyzerContext) {
    ignore_whitespace_hard(ctx);
    switch (ctx.scope[ctx.scope.length-1]) {

        case CodeBlockScope.struct:
        case CodeBlockScope.typedef:
        case CodeBlockScope.root: analyze_root(ctx); break;

        case CodeBlockScope.function: analyze_expression(ctx); break;

    }
    ignore_whitespace_hard(ctx);
}

function analyze_root(ctx: AnalyzerContext) {
    const token = ctx.tokens[ctx.index];

    if (token.kind == TokenKind.inlineHint) {
        ctx.index++;
        return;
    }

    if (token.kind == TokenKind.punctuation && token.value === "@") {
        ctx.tokens[ctx.index++].kind = TokenKind.attribute;
        if (ctx.index >= ctx.tokens.length) return;
        
        const start = ctx.index;
        analyze_identifier(ctx);
        for (let i = start; i < ctx.index; i++) ctx.tokens[i].kind = TokenKind.attribute;

        if (ctx.tokens[ctx.index].value == '(') analyze_functionCall(ctx);
        return;
    }

    switch (token.kind) {
        case TokenKind.word:
            switch (token.value) {
                case 'from': analyze_fromImport(ctx); break;
                case 'let': analyze_field(ctx); break;
                case 'const': analyze_field(ctx); break;
                case 'func': analyze_function(ctx); break;
                case 'constructor': analyze_ctor_dtor(ctx); break;
                case 'destructor': analyze_ctor_dtor(ctx); break;
                case 'struct': analyze_struct(ctx); break;
                case 'typedef': analyze_typedef(ctx); break;

                default: ctx.tokens[ctx.index++].error = true; break;
            }
            break;
        
        case TokenKind.whitespace:
        case TokenKind.newLine: ctx.index++; break;

        default: ctx.tokens[ctx.index++].error = true; break;
    }
}
function analyze_comment(ctx: AnalyzerContext) {
    if (ctx.index >= ctx.tokens.length) return;
    if (ctx.tokens[ctx.index].kind == TokenKind.comment) {
        const token = ctx.tokens[ctx.index];

        if (token.value.startsWith("### /!\\ Compilation Error!")) {
            let value = ctx.tokens[ctx.index].value;
            let valueLines = value.split('\n');

            value = "";

            const line0 = valueLines[0].trim();
            const headerLen = "### /!\\ Compilation Error!".length;
            if (line0.length > headerLen) value += line0.slice(0, line0.length - headerLen);

            for (let i = 1; i < valueLines.length - 1; i++)
                value += valueLines[i].trim() + '\n';

            const line1 = valueLines[valueLines.length-1].trim();
            if (line1.length > "###".length) value += line1.slice(0, line1.length - 3);

            ctx.tokens[ctx.index].kind = TokenKind.metaError;
            ctx.tokens[ctx.index].value = value.trim();

            if (ctx.index+1 < ctx.tokens.length && ctx.tokens[ctx.index+1].kind == TokenKind.newLine)
                ctx.tokens.splice(ctx.index+1, 1);

        }

        else ctx.index++;
    }
}

function analyze_fromImport(ctx: AnalyzerContext) {
    ctx.tokens[ctx.index++].kind = TokenKind.keyword;
    ignore_whitespace_hard(ctx);

    analyze_identifier(ctx);
    ignore_whitespace_hard(ctx);

    ctx.tokens[ctx.index++].kind = TokenKind.keyword;
    ignore_whitespace_hard(ctx);

    if (ctx.index < ctx.tokens.length && ctx.tokens[ctx.index].value == '{')
    {
        ctx.tokens[ctx.index++].kind = TokenKind.punctuation;
        ignore_whitespace_hard(ctx);

        while (ctx.tokens[ctx.index].value != '}')
        {
            ctx.tokens[ctx.index++].kind = TokenKind.identifier;
            ignore_whitespace_soft(ctx);

            if (ctx.tokens[ctx.index].value == 'as') {
                ctx.tokens[ctx.index++].kind = TokenKind.keyword;
                ignore_whitespace_hard(ctx);
                ctx.tokens[ctx.index++].kind = TokenKind.identifier;
                ignore_whitespace_hard(ctx);
            }

            if (ctx.tokens[ctx.index].value != ',') break;
            ctx.tokens[ctx.index++].kind = TokenKind.punctuation;
            ignore_whitespace_hard(ctx);
        }

        ignore_whitespace_hard(ctx);
        ctx.tokens[ctx.index++].kind = TokenKind.punctuation;
    }
}
function analyze_field(ctx: AnalyzerContext) {
    ctx.tokens[ctx.index++].kind = TokenKind.keyword;
    ignore_whitespace_soft(ctx);

    if (ctx.index+3 < ctx.tokens.length
        && ctx.tokens[ctx.index].kind == TokenKind.word && isAnyWhitespace(ctx.tokens[ctx.index+1])
        && ctx.tokens[ctx.index+2].kind != TokenKind.word)
    {
        ctx.tokens[ctx.index++].kind = TokenKind.identifier;
        ignore_whitespace_soft(ctx);
    }
    else
    {
        analyze_expression(ctx);
        ignore_whitespace_soft(ctx);

        if (ctx.index+1 < ctx.tokens.length
            && ctx.tokens[ctx.index].kind == TokenKind.word && isAnyWhitespace(ctx.tokens[ctx.index+1]))
        {
            ctx.tokens[ctx.index++].kind = TokenKind.identifier;
            ignore_whitespace_soft(ctx);
        }
        else return;
    }

    if (ctx.tokens[ctx.index].value != '=') return;
    ctx.tokens[ctx.index++].kind = TokenKind.binaryOperator;
    ignore_whitespace_hard(ctx);

    analyze_expression_tokens(ctx);
    ignore_whitespace_hard(ctx);
}
function analyze_function(ctx: AnalyzerContext) {
    ctx.tokens[ctx.index++].kind = TokenKind.keyword;
    ignore_whitespace_soft(ctx);

    if (ctx.tokens[ctx.index].value == "...") {
        
        ctx.tokens[ctx.index++].kind = TokenKind.inlineHint;
        ignore_whitespace_soft(ctx); 

    } else {
        
        ctx.tokens[ctx.index++].kind = TokenKind.function;
        ignore_whitespace_soft(ctx); 
        analyze_parameters(ctx);
        ignore_whitespace_hard(ctx);
    
        if (ctx.index >= ctx.tokens.length) return;
        if (ctx.tokens[ctx.index].value != '{' && ctx.tokens[ctx.index].kind != TokenKind.newLine) {
            analyze_expression(ctx);
        }

    }   

    ignore_whitespace_hard(ctx);
    if (ctx.index < ctx.tokens.length && ctx.tokens[ctx.index].value == '{')
        analyze_delimited_scope(ctx, CodeBlockScope.function);
}
function analyze_ctor_dtor(ctx: AnalyzerContext) {
    ctx.tokens[ctx.index++].kind = TokenKind.keyword;
    ignore_whitespace_soft(ctx);
    analyze_parameters(ctx);
    ignore_whitespace_hard(ctx);

    if (ctx.index >= ctx.tokens.length) return;
    if (ctx.tokens[ctx.index].value != '{' && ctx.tokens[ctx.index].kind != TokenKind.newLine) {
        analyze_expression(ctx);
    }

    if (ctx.index < ctx.tokens.length && ctx.tokens[ctx.index].value == '{')
        analyze_delimited_scope(ctx, CodeBlockScope.function);
}
function analyze_struct(ctx: AnalyzerContext) {
    ctx.tokens[ctx.index++].kind = TokenKind.keyword;
    ignore_whitespace_soft(ctx);

    ctx.tokens[ctx.index++].kind = TokenKind.identifier;
    ignore_whitespace_soft(ctx); 

    if (ctx.index < ctx.tokens.length && ctx.tokens[ctx.index].value == '{')
        analyze_delimited_scope(ctx, CodeBlockScope.struct);
}
function analyze_typedef(ctx: AnalyzerContext) {
    ctx.tokens[ctx.index++].kind = TokenKind.keyword;
    ignore_whitespace_soft(ctx);

    if (ctx.index < ctx.tokens.length && ctx.tokens[ctx.index].value == '(') {
        analyze_functionCall(ctx);
        ignore_whitespace_soft(ctx);
    }

    ctx.tokens[ctx.index++].kind = TokenKind.identifier;
    ignore_whitespace_soft(ctx); 

    if (ctx.index < ctx.tokens.length && ctx.tokens[ctx.index].value == '{')
        analyze_delimited_scope(ctx, CodeBlockScope.struct);
}

function analyze_delimited_scope(ctx: AnalyzerContext, scopeType: CodeBlockScope) {
    ctx.tokens[ctx.index++].kind = TokenKind.punctuation; // Left bracket
    
    ctx.scope.push(scopeType);
    while (ctx.index < ctx.tokens.length && ctx.tokens[ctx.index].value != '}')
    {
        let lasti = ctx.index;
        analize_generic(ctx);

        if (ctx.index == lasti) {
            console.error("Token pointer not incremented", ctx.tokens[ctx.index].value);
            ctx.index++;
        }
    }
    ctx.scope.pop();

    if (ctx.index < ctx.tokens.length && ctx.tokens[ctx.index].value == '}')
        ctx.tokens[ctx.index++].kind = TokenKind.punctuation; // Right bracket

}
function analyze_expression_tokens(ctx: AnalyzerContext) {
    
    let token = ctx.tokens[ctx.index];
    switch (token.kind) {
        
        case TokenKind.word:

            if (token.value[0] == 'i' || token.value[0] == 'u') {
                let len = Number(token.value.slice(1));
                if (!isNaN(len) && len > 0 && len <= 256) {
                    ctx.tokens[ctx.index++].kind = TokenKind.type;
                    return;
                }
            }

            if (token.value == "new") {
                ctx.tokens[ctx.index++].kind = TokenKind.keyword;

                ignore_whitespace_soft(ctx);
                analyze_expression(ctx);
                ignore_whitespace_hard(ctx);

                if (ctx.index < ctx.tokens.length && ctx.tokens[ctx.index].value == '{') {
                    console.log("test test")
                    analyze_delimited_scope(ctx, CodeBlockScope.function);
                    console.log("test test test")
                }
                console.log("bruh i hate it")
                return;
            }

            switch (token.value) {

                case 'let':
                case 'const':
                case 'while':
                case 'for':
                case 'if':
                case 'elif':
                case 'else':
                case 'do':
                case 'match':
                case 'case':
                case 'default':
                case 'return':
                    ctx.tokens[ctx.index++].kind = TokenKind.keyword;
                    return;
                
                case 'bool':
                case 'byte':
                case 'void':
                case 'string':
                case 'noreturn':
                    ctx.tokens[ctx.index++].kind = TokenKind.type;
                    return;
                    
                case 'true':
                case 'false':
                    ctx.tokens[ctx.index++].kind = TokenKind.boolean;
                    return;
                    
                case 'as':
                case '=>':
                    ctx.tokens[ctx.index++].kind = TokenKind.binaryOperator;
                    return;

                case '...':
                    ctx.tokens[ctx.index++].kind = TokenKind.inlineHint;
                    return;

            }

            ctx.index++; break;
        
        case TokenKind.punctuation:
            switch (token.value) {
                case '(':
                    if (ctx.index-1 >= 0
                        && ctx.tokens[ctx.index-1].kind == TokenKind.word
                        || ctx.tokens[ctx.index-1].kind == TokenKind.identifier)
                    {
                        ctx.tokens[ctx.index-1].kind = TokenKind.function;
                        ctx.tokens[ctx.index++].kind = TokenKind.punctuation;
                        return;
                    }
            }
            ctx.index++; break;
        
        default: ctx.index++; break;
    }
}
function analyze_expression(ctx: AnalyzerContext) {
    
    while (true) {
        console.log("a", ctx.tokens[ctx.index].value, TokenKind[ctx.tokens[ctx.index].kind]);

        let i = ctx.index;
        while (i < ctx.tokens.length && isValidInsideExpression(ctx.tokens[i])) i++;
        for (; ctx.index < i;) analyze_expression_tokens(ctx);

        ignore_whitespace_soft(ctx);
        console.log("b", ctx.tokens[ctx.index].value, TokenKind[ctx.tokens[ctx.index].kind]);
        if (ctx.index < ctx.tokens.length
            && ctx.tokens[ctx.index].kind == TokenKind.binaryOperator
            || ctx.tokens[ctx.index].kind == TokenKind.assignOperator) {
                
                ctx.index++;
                ignore_whitespace_soft(ctx);
                console.log("fuck", ctx.tokens[ctx.index].value, TokenKind[ctx.tokens[ctx.index].kind],
                    ctx.tokens.slice(ctx.index).map(e => `${e.value} ${TokenKind[e.kind]}`));
                continue;

        }
        console.log("breaking...");
        break;
    }
}

function analyze_identifier(ctx: AnalyzerContext) {
    while(true) {

        ctx.tokens[ctx.index++].kind = TokenKind.identifier;
        if (ctx.index >= ctx.tokens.length || ctx.tokens[ctx.index].value != '.') break;
        ctx.index++;

    }
}

function analyze_functionCall(ctx: AnalyzerContext) {
    if (ctx.tokens[ctx.index].value != '(') {
        ctx.tokens[ctx.index++].error = true;
        return;
    }
    ctx.tokens[ctx.index++].kind = TokenKind.punctuation;
    while (ctx.index < ctx.tokens.length && ctx.tokens[ctx.index].value != ')') {
        ignore_whitespace_hard(ctx);
        
        analyze_expression(ctx); // value

        if (ctx.tokens[ctx.index].value == ',') ctx.index++;
        else {
            ignore_whitespace_hard(ctx);
            break;
        }
        ignore_whitespace_hard(ctx);
    }
    if (ctx.index < ctx.tokens.length && ctx.tokens[ctx.index].value == ')')
        ctx.tokens[ctx.index++].kind = TokenKind.punctuation;
}
function analyze_parameters(ctx: AnalyzerContext) {
    ctx.tokens[ctx.index++].kind = TokenKind.punctuation;
    ignore_whitespace_hard(ctx);

    while (ctx.index < ctx.tokens.length && ctx.tokens[ctx.index].value != ')') {
        
        analyze_expression(ctx); // type
        analyze_expression(ctx); // name
        ignore_whitespace_soft(ctx);
        
        if (ctx.index < ctx.tokens.length && ctx.tokens[ctx.index].value == ',')
            ctx.tokens[ctx.index++].kind = TokenKind.punctuation;
        else break;

        ignore_whitespace_hard(ctx);
    }

    ignore_whitespace_hard(ctx);
    ctx.tokens[ctx.index++].kind = TokenKind.punctuation;
}

function ignore_whitespace_soft(ctx: AnalyzerContext) {
    while (ctx.index < ctx.tokens.length) {
        if (ctx.tokens[ctx.index].kind == TokenKind.whitespace) ctx.index++;

        else if (ctx.tokens[ctx.index].kind == TokenKind.comment) analyze_comment(ctx);

        else break;
    }
}
function ignore_whitespace_hard(ctx: AnalyzerContext) {
    while (ctx.index < ctx.tokens.length)
    {
        if ([
            TokenKind.whitespace,
            TokenKind.newLine,
        ].includes(ctx.tokens[ctx.index].kind)) ctx.index++;

        else if (ctx.tokens[ctx.index].kind == TokenKind.comment) analyze_comment(ctx);

        else break;
    }
}


function isWhitespace(c: string): boolean {
    return c === ' ' || c === '\t' || c === '\r';
}
function isAlpha(c: string): boolean {
    return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z');
}
function isDigit(c: string, base: number): boolean {
    switch (base) {
        case 2: return c >= '0' && c <= '1';
        case 10: return c >= '0' && c <= '9';
        case 16: return c >= '0' && c.toUpperCase() <= 'A';

        default: return c >= '0' && c <= '0';
    }
}
function isAlphaNum(c: string): boolean {
    return isAlpha(c) || isDigit(c, 10);
}
function isPunctuation(c: string): boolean {
    return '(){}[];:.,@'.includes(c);
}

function isAnyWhitespace(t: Token): boolean {
    return t === undefined ||
    t.kind == TokenKind.whitespace ||
    t.kind == TokenKind.comment ||
    t.kind == TokenKind.newLine;
}
function isValidInsideExpression(t: Token): boolean {
    return !isAnyWhitespace(t) &&
    (t.kind != TokenKind.punctuation
        || t.value == '.'
        || t.value == '('
        || t.value == ')'
        || t.value == ':');
}
