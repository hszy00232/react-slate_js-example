/* eslint-disable react/prop-types */
import { useCallback, useState } from 'react'

import { Editor, Transforms, createEditor, Node } from 'slate'
import { Slate, Editable, withReact } from 'slate-react'

// 定义一个参数为 `value` 返回值是纯文本的序列化函数。
const serialize = value => {
	return (
		value
			// 返回这个 value 中每一个段落中的子节点的字符串内容。
			.map(n => Node.string(n))
			// 用换行符（用换行符来区分段落）来连接他们。
			.join('\n')
	)
}
// 定义一个参数是字符串返回值是 `value` 的反序列化函数
const deserialize = string => {
	if (!string)
		return {
			children: [{ text: '' }],
		}
	// 分隔字符串，返回一个包含value的child数组。
	return string.split('\n').map(line => {
		return {
			children: [{ text: line }],
		}
	})
}

const CustomEditor = {
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
		const isActive = CustomEditor.isBoldMarkActive(editor)
		if (isActive) {
			Editor.removeMark(editor, 'bold')
		} else {
			Editor.addMark(editor, 'bold', true)
		}
	},
	toggleCodeBlock(editor) {
		const isActive = CustomEditor.isCodeBlockActive(editor)
		Transforms.setNodes(
			editor,
			{ type: isActive ? null : 'code' },
			{ match: n => Editor.isBlock(editor, n) },
		)
	},
}
export const EditorBox = () => {
	// 创建初始化数据
	const [value, setValue] = useState(deserialize(localStorage.getItem('content')) || '')
	// 创建一个Editor对象
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
	// 渲染Slate上下文
	return (
		<Slate
			editor={editor}
			initialValue={value}
			onChange={value => {
				setValue(value)
				// 序列化 `value` 并将产生的字符串保存到 Local Storage。
				localStorage.setItem('content', serialize(value))
			}}
		>
			<div>
				<button
					onMouseDown={event => {
						event.preventDefault()
						CustomEditor.toggleBoldMarks(editor)
					}}
				>
					Bold
				</button>
				<button
					onMouseDown={event => {
						event.preventDefault()
						CustomEditor.toggleCodeBlock(editor)
					}}
				>
					code Block
				</button>
			</div>
			{/* 在上下文中，添加可编辑组件 */}
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
							// CustomEditor.toggleCodeBlock(editor)
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
							CustomEditor.toggleBoldMarks(editor)
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
