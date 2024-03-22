/* eslint-disable react/prop-types */
import { useCallback, useMemo, useState } from 'react'

import { Editor, Transforms, Element, createEditor } from 'slate'
import { Slate, Editable, withReact } from 'slate-react'

const CustomeEditor = {
	isBoldMarkActive(editor) {
		const marks = Editor.marks(editor)
		return marks ? marks.bold === true : false
	},
	isCodeBlockActive(editor) {
		const [match] = Editor.nodes(editor, {
			match: n => n.type === 'code',
		})
		return match
	},
	toggleBoldMarks(editor) {
		const isActive = CustomeEditor.isBoldMarkActive(editor)
		if (isActive) {
			Editor.removeMark(editor, 'bold')
		} else {
			Editor.addMark(editor, 'bold', true)
		}
	},
	toggleCodeBlock(editor) {
		const isActive = CustomeEditor.isCodeBlockActive(editor)
		Transforms.setNodes(
			editor,
			{ type: isActive ? null : 'code' },
			{ match: n => Editor.isBlock(editor, n) },
		)
	},
}
export const EditorBox = () => {
	const initialValue = useMemo(() => {
		JSON.stringify(localStorage.getItem('content')) || [
			{
				type: 'paragraph',
				children: [{ text: 'A line of text in a paragraph.' }],
			},
		]
	}, [])
	const [editor] = useState(() => withReact(createEditor()))
	const DefaultElement = props => {
		return <p {...props.attributes}>{props.children}</p>
	}
	const CodeElement = props => {
		return (
			<pre {...props.attributes}>
				<code>{props.children}</code>
			</pre>
		)
	}
	const Leaf = props => {
		return (
			<span {...props.attributes} style={{ fontWeight: props.leaf.bold ? 'bold' : 'normal' }}>
				{props.children}
			</span>
		)
	}

	const renderLeaf = useCallback(props => <Leaf {...props} />, [])
	const renderElement = useCallback(props => {
		switch (props.element.type) {
			case 'code':
				return <CodeElement {...props} />
			default:
				return <DefaultElement {...props} />
		}
	}, [])
	return (
		<Slate editor={editor} initialValue={initialValue}>
			<div>
				<button
					onMouseDown={event => {
						event.preventDefault()
						CustomeEditor.toggleBoldMarks(editor)
					}}
				>
					Bold
				</button>
				<button
					onMouseDown={event => {
						event.preventDefault()
						CustomeEditor.toggleCodeBlock(editor)
					}}
				>
					code Block
				</button>
			</div>
			<Editable
				renderElement={renderElement}
				renderLeaf={renderLeaf}
				onKeyDown={event => {
					if (!event.ctrlKey) {
						return
					}
					switch (event.key) {
						case '`': {
							event.preventDefault()
							// CustomeEditor.toggleCodeBlock(editor)
							const [match] = Editor.nodes(editor, {
								match: n => n.type === 'code',
							})
							Transforms.setNodes(
								editor,
								{ type: match ? null : 'code' },
								{ match: n => Editor.isBlock(editor, n) },
							)
							break
						}
						case 'b': {
							event.preventDefault()
							CustomeEditor.toggleBoldMarks(editor)
							// const marks = Editor.marks(editor)
							// const isActive = marks ? marks.bold === true : false
							// if (isActive) {
							// 	Editor.removeMark(editor, 'bold')
							// } else {
							// 	Editor.addMark(editor, 'bold', true)
							// }
							break
						}
					}
				}}
			/>
		</Slate>
	)
}
