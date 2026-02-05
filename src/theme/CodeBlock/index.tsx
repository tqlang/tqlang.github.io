import React, {isValidElement, type ReactNode} from 'react';
import useIsBrowser from '@docusaurus/useIsBrowser';
import ElementContent from '@theme/CodeBlock/Content/Element';
import StringContent from '@theme/CodeBlock/Content/String';
import { Token, tokenize, TokenKind } from './tokenization';
import type {Props} from '@theme/CodeBlock';
import AdmonitionTypes from '../Admonition/Types';
import Admotion from "@theme/Admonition";

function maybeStringifyChildren(children: ReactNode): ReactNode {
    if (React.Children.toArray(children).some((el) => isValidElement(el))) return children;
    return Array.isArray(children) ? children.join('') : (children as string);
}

export default function CodeBlock({ children: rawChildren, ...props }: Props): ReactNode {
    const isBrowser = useIsBrowser();
    const children = maybeStringifyChildren(rawChildren);
    const CodeBlockComp = typeof children === 'string' ? StringContent : ElementContent;

    const isTq = typeof children === 'string' && props?.className?.includes('language-tq');

    if (isTq) {
        const source = children.trimEnd();
        const tokens = tokenize(source);
        const inner = render(tokens, source);

        return (
            <ElementContent key={String(isBrowser)} {...props}>{inner}</ElementContent>
        );
    }

    return (
        <CodeBlockComp key={String(isBrowser)} {...props}>
            {children as string}
        </CodeBlockComp>
    );
}



function render(tokens: Token[], source: string) : ReactNode[] {
    const out: ReactNode[] = [];
    let last = 0;

    for (const t of tokens) {

        if (t.kind == TokenKind.metaError) {
            out.push( <Admotion type="danger" title="Compilation Error"> {t.value} </Admotion> );

        } else if (t.error == true) {
            out.push( <span key={out.length} className={`token error ${TokenKind[t.kind]}`}>{t.wsp}{t.value}</span> );

        } else {
            let tokenClass: string;
            switch (t.kind) {
                case TokenKind.comment: tokenClass = "comment"; break;
                case TokenKind.keyword: tokenClass = "keyword"; break;
                case TokenKind.function: tokenClass = "function"; break;
                case TokenKind.struct: tokenClass = "plain struct"; break;
                case TokenKind.attribute: tokenClass = "attribute"; break;
                case TokenKind.type: tokenClass = "type"; break;

                case TokenKind.punctuation: tokenClass = "punctuation"; break;

                case TokenKind.number: tokenClass = "number"; break;
                case TokenKind.string: tokenClass = "string"; break;
                case TokenKind.boolean: tokenClass = "boolean"; break;

                case TokenKind.unaryOperator: tokenClass = "operator unaryOperator"; break;
                case TokenKind.binaryOperator: tokenClass = "operator binaryOperator"; break;
                case TokenKind.assignOperator: tokenClass = "operator assignOperator"; break;

                case TokenKind.inlineHint: tokenClass = "inline-hint"; break;

                default: tokenClass = `plain ${TokenKind[t.kind]}`; break;
            }

            out.push( <span key={out.length} className={`token ${tokenClass}`}>{t.wsp}{t.value}</span> );
        }
        
        last = t.end;
    }

    return out;
}

function escapeHtml(str: string) : string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}
