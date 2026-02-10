import React, {Children, isValidElement, type ReactNode} from 'react';
import clsx from 'clsx';
import Container from '@theme/CodeBlock/Container';
import type {Props} from '@theme/CodeBlock/Content/Element';

import styles from './styles.module.css';
import { usePrismTheme } from '@docusaurus/theme-common';
import { containsLineNumbers, parseCodeBlockTitle, useCodeWordWrap } from '@docusaurus/theme-common/internal';
import WordWrapButton from '../WordWrapButton';
import CopyButton from '../CopyButton';

function StringfyChildren(children: ReactNode): string {
    if (Array.isArray(children)) {
        const result: string[] = [];

        Children.forEach(children, c => {
            
            if (!c) return
            if (typeof c === 'string') {
                result.push(c);
                return;
            }
            const child: any = c;
            if (child.type === 'br') {
                result.push('\n');
                return;
            }

            if (!isValidElement(child)) return;

            const className = (child as any).props.className as string | undefined;

            if (className?.includes("inline-hint")) return;

            if (Array.isArray((child.props as any).children)) {
            result.push( ...StringfyChildren((child.props as any).children) );
            }
        });

        return result.join('');
    }
    else return children as string;
}

export default function CodeBlockJSX({
    children,
    className: blockClassName = '',
    metastring,
    title: titleProp,
    showLineNumbers: showLineNumbersProp,
    language: languageProp,
}: Props): ReactNode {

    const wordWrap = useCodeWordWrap();
    const title = parseCodeBlockTitle(metastring) || titleProp;
    const language = languageProp ?? 'text';
    const showLineNumbers = showLineNumbersProp ?? containsLineNumbers(metastring);

    return (
        <Container
            as="div"
            className={clsx(
                blockClassName,
                languageProp &&
                    !blockClassName.includes(`language-${language}`) &&
                    `language-${language}`,
            )}>
            {title && <div className={styles.codeBlockTitle}>{title}</div>}
            <div className={styles.codeBlockContent}>
                    <pre
                        tabIndex={0}
                        ref={wordWrap.codeBlockRef}
                        className={clsx(blockClassName, styles.codeBlock, 'thin-scrollbar')}>
                        <code
                            className={clsx(
                                styles.codeBlockLines,
                                showLineNumbers && styles.codeBlockLinesWithNumbering,
                            )}>
                            {children}
                        </code>
                    </pre>

                <div className={styles.buttonGroup}>
                    {(wordWrap.isEnabled || wordWrap.isCodeScrollable) && (
                        <WordWrapButton
                            className={styles.codeButton}
                            onClick={() => wordWrap.toggle()}
                            isEnabled={wordWrap.isEnabled}
                        />
                    )}
                    <CopyButton className={styles.codeButton} code={StringfyChildren(children)} />
                </div>
            </div>
        </Container>
    );

}
