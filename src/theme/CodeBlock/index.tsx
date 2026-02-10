import React, {isValidElement, type ReactNode} from 'react';
import useIsBrowser from '@docusaurus/useIsBrowser';
import ElementContent from '@theme/CodeBlock/Content/Element';
import StringContent from '@theme/CodeBlock/Content/String';
import { Token, tokenize, TokenKind } from './tokenization';
import type {Props} from '@theme/CodeBlock';

import IconDanger from '@theme/Admonition/Icon/Danger';
import IconWarning from '@theme/Admonition/Icon/Warning';
import IconInfo from '@theme/Admonition/Icon/Info';
import IconNote from '@theme/Admonition/Icon/Note';
import IconTip from '@theme/Admonition/Icon/Tip';

function maybeStringifyChildren(children: ReactNode): ReactNode {
    if (React.Children.toArray(children).some((el) => isValidElement(el))) return children;
    return Array.isArray(children) ? children.join('') : (children as string);
}

export default function CodeBlock({ children: rawChildren, ...props }: Props): ReactNode {
    const isBrowser = useIsBrowser();
    const children = maybeStringifyChildren(rawChildren);

    const isTq = typeof children === 'string' && props?.className?.endsWith('language-tq');

    if (isTq) {
        const source = children.trimEnd();
        const tokens = tokenize(source);
        const inner = render(tokens, source);

        return (
            <ElementContent key={String(isBrowser)} {...props}>
                {inner}
            </ElementContent>
        );
    }

    const CodeBlockComp = typeof children === 'string' ? StringContent : ElementContent;
    return (
        <CodeBlockComp key={String(isBrowser)} {...props}>
            {children as string}
        </CodeBlockComp>
    );
}


function render(tokens: Token[], source: string) : ReactNode[] {
    const out: ReactNode[] = [];
    let line: ReactNode[] = [];
    let last = 0;

    //console.log(tokens.map(e => [e.value, TokenKind[e.kind], e.error]));

    for (const t of tokens) {

        if (t.kind == TokenKind.admonition) {
            let icon: ReactNode | undefined = undefined;
            switch (t.adminitionType!) {
                case "danger": icon = <IconDanger/>; break;
                case "warning": icon = <IconWarning/>; break;
                case "note": icon = <IconNote/>; break;
                case "tip": icon = <IconTip/>; break;
            }

            line.push(
                <span key={out.length} className={`token-info inline-admonition ${t.adminitionType}`}>
                    {icon}<span>{t.value}</span>
                </span>
            );
        }

        else if (t.kind == TokenKind.newLine) {
            line.push( <br key={line.length}></br> );
            out.push( <span key={out.length} className={'token-line'}>{line}</span> );
            line = [];
        }

        else if (t.error == true) {
            line.push( <span key={line.length} className={`token error ${TokenKind[t.kind]}`}>{t.wsp}{t.value}</span> );

        }
        
        else {
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
                case TokenKind.arrowOperator: tokenClass = "operator arrowOperator"; break;

                case TokenKind.inlineHint: tokenClass = "inline-hint"; break;

                default: tokenClass = `plain ${TokenKind[t.kind]}`; break;
            }

            line.push( <span key={line.length} className={`token ${tokenClass}`}>{t.wsp}{t.value}</span> );
        }
        
        last = t.end;
    }
    if (line.length > 0) {
        out.push(<span key={out.length} className={'token-line'}>{line}</span>)
        line = []
    }

    return out;
}

function escapeHtml(str: string) : string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}
