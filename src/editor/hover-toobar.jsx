import React, { useEffect, useMemo, useRef } from 'react'
import { Editor, Transforms, createEditor, Range } from 'slate'
import { Slate, Editable, withReact, useSlate, useFocused } from 'slate-react'
import { Menu, Portal, Button, Icon } from '../components'
import { css } from '@emotion/css'

const HoveringMenuExample = () => {
	const editor = useMemo(() => withReact(createEditor()), [])
	const initialValue = [
		{
			type: 'paragraph',
			children: [
				{
					text: 'This example shows how you can make a hovering menu appear above your content, which you can use to make text ',
				},
				{ text: 'bold', bold: true },
				{ text: ', ' },
				{ text: 'italic', italic: true },
				{ text: ', or anything else you might want to do!' },
			],
		},
		{
			type: 'paragraph',
			children: [
				{ text: 'Try it out yourself! Just ' },
				{ text: 'select any piece of text and the menu will appear', bold: true },
				{ text: '.' },
			],
		},
	]
	return (
		<Slate
			editor={editor}
			initialValue={initialValue}
			onChange={() => {
				// do nothing
			}}
		>
			<HoveringToolbar />
			<Editable
				renderLeaf={props => <Leaf {...props} />}
				placeholder="Enter some text..."
				onDOMBeforeInput={event => {
					switch (event.inputType) {
						case 'formatBold':
							event.preventDefault()
							return toggleMark(editor, 'bold')
						case 'formatItalic':
							event.preventDefault()
							return toggleMark(editor, 'italic')
						case 'formatUnderline':
							event.preventDefault()
							return toggleMark(editor, 'underlined')
					}
				}}
			/>
		</Slate>
	)
}
const isMarkActive = (editor, format) => {
	const marks = Editor.marks(editor)
	return marks ? marks[format] === true : false
}
const toggleMark = (editor, format) => {
	const isActive = isMarkActive(editor, format)
	if (isActive) {
		Editor.removeMark(editor, format)
	} else {
		Editor.addMark(editor, format, true)
	}
}

const Leaf = ({ attributes, children, leaf }) => {
	if (leaf.bold) {
		children = <strong>{children}</strong>
	}
	if (leaf.code) {
		children = <code>{children}</code>
	}
	if (leaf.italic) {
		children = <em>{children}</em>
	}
	if (leaf.underline) {
		children = <u>{children}</u>
	}
	return <span {...attributes}>{children}</span>
}

const FormatButton = ({ format, icon }) => {
	const editor = useSlate()
	return (
		<Button
			reversed
			active={isMarkActive(editor, format)}
			onClick={() => toggleMark(editor, format)}
		>
			<Icon>{icon}</Icon>
		</Button>
	)
}
const HoveringToolbar = () => {
	const ref = useRef(null)
	const editor = useSlate()
	const inFoucs = useFocused()

	useEffect(() => {
		const el = ref.current
		const { selection } = editor
		if (!el) {
			return
		}
		if (
			!selection ||
			!inFoucs ||
			Range.isCollapsed(selection) ||
			Editor.string(editor, selection) === ''
		) {
			el.removeAttribute('style')
			return
		}
		const domSelection = window.getSelection()
		const domRange = domSelection.getRangeAt(0)
		const rect = domRange.getBoundingClientRect()
		el.style.opacity = '1'
		el.style.top = `${rect.top - el.offsetHeight}px`
		el.style.left = `${rect.left - el.offsetWidth / 2 + rect.width / 2}px`
	})
	return (
		<Portal>
			<Menu
				ref={ref}
				className={css`
					padding: 8px 7px 6px;
					position: absolute;
					z-index: 1;
					top: -10000px;
					left: -10000px;
					margin-top: -6px;
					opacity: 0;
					background-color: #222;
					border-radius: 4px;
					transition: opacity 0.75s;
				`}
				onMouseDown={event => event.preventDefault()}
			>
				<FormatButton format={'bold'} icon={'format_bold'} />
				<FormatButton format="italic" icon={'format_italic'} />
				<FormatButton format="underlined" icon={'format_underlined'} />
			</Menu>
		</Portal>
	)
}

export { HoveringMenuExample }
