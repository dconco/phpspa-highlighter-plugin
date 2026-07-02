import { PhpSpaHighlightRules } from './php_spa_highlight_rules'

type GenericFile = {
	id?: string | number
	type?: string
	filename?: string
	name?: string
	currentMode?: string
	session?: {
		getMode?: () => { $id?: string } | null
		setMode?: (mode: string) => void
	}
	setMode?: (mode?: string, options?: { recommend?: boolean }) => void
}

type EditorManagerLike = {
	isCodeMirror?: boolean
	activeFile?: GenericFile | null
	files?: GenericFile[]
	editor?: any
	getFile?: (id: string | number) => GenericFile | null
	reapplyActiveFile?: () => void
	switchFile?: (...args: any[]) => any
	addFile?: (...args: any[]) => any
}

class PhpSpaHighlighter {
	private highlightRules: PhpSpaHighlightRules
	private editorManager: EditorManagerLike | null = null
	private originalSwitchFile: EditorManagerLike['switchFile'] | null = null
	private originalAddFile: EditorManagerLike['addFile'] | null = null
	private codeMirrorModeName = 'phpspa'
	private codeMirrorModeRegistered = false
	private codeMirrorExtension: any = null

	constructor() {
		this.highlightRules = new PhpSpaHighlightRules()
	}

	public async init(): Promise<void> {
		this.addStyles()
		this.editorManager = this.getEditorManager()
		this.syncCodeMirrorThemeColors()

		if (this.isCodeMirrorEditor()) {
			this.registerCodeMirrorMode()
			this.applyCodeMirrorGlobally()
			console.log('PhpSPA Highlighter: Initialized for CodeMirror')
			return
		}

		this.highlightRules.extendPhpMode()
		this.applyAceGlobally()

		console.log('PhpSPA Highlighter: Initialized for Ace')
	}

	private addStyles(): void {
		if (document.getElementById('phpspa-component-style')) return

		const style = document.createElement('style')
		style.id = 'phpspa-component-style'
		style.innerHTML = `
            /* @ component tags - GREEN */
            .ace_editor .ace_entity.ace_name.ace_tag.ace_component {
                color: #22c55e !important;
                font-weight: bold;
            }

            .cm-editor .tok-phpspa-component-tag,
            .cm-editor .tok-phpspa-component-tag * {
                color: #22c55e !important;
                font-weight: bold;
            }

            .cm-editor .phpspa-hd-keyword { color: var(--phpspa-hd-keyword, currentColor) !important; }
            .cm-editor .phpspa-hd-tag { color: var(--phpspa-hd-tag, currentColor) !important; }
            .cm-editor .phpspa-hd-attr { color: var(--phpspa-hd-attr, currentColor) !important; }
            .cm-editor .phpspa-hd-string { color: var(--phpspa-hd-string, currentColor) !important; }
            .cm-editor .phpspa-hd-comment { color: var(--phpspa-hd-comment, currentColor) !important; font-style: italic; }
            .cm-editor .phpspa-hd-var { color: var(--phpspa-hd-var, currentColor) !important; }
            .cm-editor .phpspa-hd-css-prop { color: var(--phpspa-hd-css-prop, currentColor) !important; }
            .cm-editor .phpspa-hd-css-selector { color: var(--phpspa-hd-css-selector, currentColor) !important; }
            .cm-editor .phpspa-hd-css-fn { color: var(--phpspa-hd-css-fn, currentColor) !important; }
            .cm-editor .phpspa-hd-js-keyword { color: var(--phpspa-hd-js-keyword, currentColor) !important; }
            .cm-editor .phpspa-hd-js-name { color: var(--phpspa-hd-js-name, currentColor) !important; }
            .cm-editor .phpspa-hd-js-property { color: var(--phpspa-hd-js-property, currentColor) !important; }
            .cm-editor .phpspa-hd-js-class { color: var(--phpspa-hd-js-class, currentColor) !important; }
            .cm-editor .phpspa-hd-js-regex { color: var(--phpspa-hd-js-regex, currentColor) !important; }
            .cm-editor .phpspa-hd-number { color: var(--phpspa-hd-number, currentColor) !important; }
            .cm-editor .phpspa-hd-operator { color: var(--phpspa-hd-operator, currentColor) !important; }
        `
		document.head.appendChild(style)
	}

	private syncCodeMirrorThemeColors(): void {
		const editorThemes = this.getAcodeModule('editorThemes')
		const settings = this.getAcodeModule('settings')
		const themeId = settings?.value?.editorTheme
		const config = editorThemes?.getConfig?.(themeId) || {}
		const root = document.documentElement
		const fallback = {
			keyword: '#c678dd',
			tag: '#e06c75',
			attribute: '#d19a66',
			string: '#98c379',
			comment: '#7f848e',
			variable: '#61afef',
			function: '#61afef',
			number: '#d19a66',
			operator: '#56b6c2',
			type: '#e5c07b'
		}
		const color = (name: string, fallbackName = name) =>
			config[name] || fallback[fallbackName as keyof typeof fallback] || 'currentColor'

		root.style.setProperty('--phpspa-hd-keyword', color('keyword'))
		root.style.setProperty('--phpspa-hd-tag', color('tag', 'type'))
		root.style.setProperty('--phpspa-hd-attr', color('attribute', 'variable'))
		root.style.setProperty('--phpspa-hd-string', color('string'))
		root.style.setProperty('--phpspa-hd-comment', color('comment'))
		root.style.setProperty('--phpspa-hd-var', color('variable'))
		root.style.setProperty('--phpspa-hd-css-prop', color('variable'))
		root.style.setProperty('--phpspa-hd-css-selector', color('type'))
		root.style.setProperty('--phpspa-hd-css-fn', color('function'))
		root.style.setProperty('--phpspa-hd-js-keyword', color('keyword'))
		root.style.setProperty('--phpspa-hd-js-name', color('function'))
		root.style.setProperty('--phpspa-hd-js-property', color('variable'))
		root.style.setProperty('--phpspa-hd-js-class', color('class', 'type'))
		root.style.setProperty('--phpspa-hd-js-regex', color('regexp', 'string'))
		root.style.setProperty('--phpspa-hd-number', color('number'))
		root.style.setProperty('--phpspa-hd-operator', color('operator'))
	}

	private getEditorManager(): EditorManagerLike | null {
		// @ts-ignore
		return window.editorManager || null
	}

	private isCodeMirrorEditor(): boolean {
		return !!this.editorManager?.isCodeMirror
	}

	private isPhpFile(file: GenericFile | null | undefined): boolean {
		const filename = file?.filename || file?.name || ''
		return /\.php$/i.test(filename)
	}

	private applyAceMode(file: GenericFile | null | undefined): void {
		if (file?.session?.getMode && file.session.setMode) {
			const mode = file.session.getMode()

			if (mode && mode.$id !== 'ace/mode/php_spa' && this.isPhpFile(file)) {
				file.session.setMode('ace/mode/php_spa')
				console.log('Applied PhpSPA to:', file.filename)
			}
		}
	}

	private resolveFile(fileOrId: GenericFile | string | number | null | undefined): GenericFile | null {
		if (!fileOrId) return null
		if (typeof fileOrId === 'object') return fileOrId
		return this.editorManager?.getFile?.(fileOrId) || null
	}

	private applyAceGlobally(): void {
		// @ts-ignore
		const ace = window.ace
		if (!ace) return

		const editorManager = this.editorManager
		if (editorManager) {
			this.originalSwitchFile = editorManager.switchFile || null
			this.originalAddFile = editorManager.addFile || null

			if (this.originalSwitchFile) {
				const plugin = this
				editorManager.switchFile = function (file: GenericFile | string | number) {
					const result = plugin.originalSwitchFile!.apply(this, arguments as any)
					setTimeout(() => {
						plugin.applyAceMode(plugin.resolveFile(file))
						plugin.applyAceMode(plugin.editorManager?.activeFile)
					}, 50)
					return result
				}
			}

			if (this.originalAddFile) {
				const plugin = this
				editorManager.addFile = function (file: GenericFile) {
					const result = plugin.originalAddFile!.apply(this, arguments as any)
					setTimeout(() => plugin.applyAceMode(file), 50)
					return result
				}
			}

			if (editorManager.files) {
				editorManager.files.forEach((file: GenericFile) =>
					void this.applyAceMode(file)
				)
			}
		}

		console.log('PhpSPA mode applied for Ace')
	}

	private getAcodeModule(moduleName: string): any {
		try {
			if (window.acode?.require) {
				return window.acode.require(moduleName)
			}
		} catch (error) {
			console.warn(`PhpSPA Highlighter: failed to require ${moduleName}`, error)
		}

		return null
	}

	private registerCodeMirrorMode(): void {
		if (this.codeMirrorModeRegistered) return

		const editorLanguages = this.getAcodeModule('editorLanguages')
		const codemirror = this.getAcodeModule('codemirror')
		const stateModule = codemirror?.state || this.getAcodeModule('@codemirror/state')
		const viewModule = codemirror?.view || this.getAcodeModule('@codemirror/view')

		if (!editorLanguages?.register || !stateModule?.RangeSetBuilder || !viewModule?.Decoration || !viewModule?.ViewPlugin) {
			console.warn(
				'PhpSPA Highlighter: CodeMirror language API not available, skipping CM mode registration'
			)
			return
		}

		const phpMode = editorLanguages.get?.('php')
		const { RangeSetBuilder } = stateModule
		const { Decoration, ViewPlugin } = viewModule

		try {
			editorLanguages.unregister?.(this.codeMirrorModeName)
		} catch (error) {
			console.warn('PhpSPA Highlighter: unregister failed', error)
		}

		const mark = (className: string) => Decoration.mark({ class: className })
		const marks = {
			tag: mark('phpspa-hd-tag'),
			componentTag: mark('tok-phpspa-component-tag'),
			attr: mark('phpspa-hd-attr'),
			string: mark('phpspa-hd-string'),
			comment: mark('phpspa-hd-comment'),
			variable: mark('phpspa-hd-var'),
			cssProp: mark('phpspa-hd-css-prop'),
			cssSelector: mark('phpspa-hd-css-selector'),
			cssFunction: mark('phpspa-hd-css-fn'),
			jsKeyword: mark('phpspa-hd-js-keyword'),
			jsName: mark('phpspa-hd-js-name'),
			jsProperty: mark('phpspa-hd-js-property'),
			jsClass: mark('phpspa-hd-js-class'),
			jsRegex: mark('phpspa-hd-js-regex'),
			number: mark('phpspa-hd-number'),
			operator: mark('phpspa-hd-operator'),
			keyword: mark('phpspa-hd-keyword')
		}

		const addMark = (ranges: any[], from: number, to: number, decoration: any) => {
			if (to > from) ranges.push({ from, to, decoration })
		}

		const heredocPlugin = ViewPlugin.fromClass(
			class {
				decorations: any

				constructor(view: any) {
					this.decorations = this.buildDecorations(view)
				}

				update(update: any) {
					if (update.docChanged || update.viewportChanged) {
						this.decorations = this.buildDecorations(update.view)
					}
				}

				buildDecorations(view: any) {
					const builder = new RangeSetBuilder()
					const text = view.state.doc.toString()
					const ranges: any[] = []
					this.decorateHeredocs(ranges, text)

					ranges
						.sort((a, b) => a.from - b.from || a.to - b.to)
						.forEach((range) => {
							builder.add(range.from, range.to, range.decoration)
						})

					return builder.finish()
				}

				decorateHeredocs(ranges: any[], text: string) {
					const heredocStartRegex = /<<<\s*(?:'(HTML|CSS|JS|JAVASCRIPT)'|(HTML|CSS|JS|JAVASCRIPT)\b)[^\n\r]*/gi
					let startMatch: RegExpExecArray | null

					while ((startMatch = heredocStartRegex.exec(text))) {
						const language = (startMatch[1] || startMatch[2] || '').toUpperCase()
						const openerLineEnd = this.findLineEnd(text, startMatch.index)
						const bodyStart = this.skipLineBreak(text, openerLineEnd)
						const closer = this.findHeredocCloser(text, bodyStart, language)

						if (!closer) continue

						addMark(ranges, startMatch.index, openerLineEnd, marks.keyword)

						const body = text.slice(bodyStart, closer.start)
						if (language === 'HTML') {
							this.decorateHtml(ranges, body, bodyStart)
						} else if (language === 'CSS') {
							this.decorateCss(ranges, body, bodyStart)
						} else {
							this.decorateJs(ranges, body, bodyStart)
						}

						addMark(ranges, closer.start, closer.end, marks.keyword)
						heredocStartRegex.lastIndex = closer.end
					}
				}

				findLineEnd(text: string, from: number) {
					const nextNewline = text.indexOf('\n', from)
					return nextNewline === -1 ? text.length : nextNewline
				}

				skipLineBreak(text: string, from: number) {
					if (text[from] === '\n') return from + 1
					return from
				}

				findHeredocCloser(text: string, from: number, language: string) {
					let lineStart = from
					const closerRegex = new RegExp(`^[ \\t]*${language}(?![A-Z0-9_])[ \\t]*(?:[;,)][^\\r\\n]*)?$`, 'i')

					while (lineStart < text.length) {
						const lineEnd = this.findLineEnd(text, lineStart)
						const line = text.slice(lineStart, lineEnd)
						if (closerRegex.test(line)) {
							return { start: lineStart, end: lineEnd }
						}
						lineStart = lineEnd + 1
					}

					return null
				}

				decorateHtml(ranges: any[], body: string, offset: number) {
					const commentRegex = /<!--[\s\S]*?-->/g
					let commentMatch: RegExpExecArray | null
					while ((commentMatch = commentRegex.exec(body))) {
						addMark(ranges, offset + commentMatch.index, offset + commentMatch.index + commentMatch[0].length, marks.comment)
					}

					const varRegex = /\{\$[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*(?:->[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*|\[[^\]]+\])*\}/g
					let varMatch: RegExpExecArray | null
					while ((varMatch = varRegex.exec(body))) {
						addMark(ranges, offset + varMatch.index, offset + varMatch.index + varMatch[0].length, marks.variable)
					}

					const tagRegex = /<\/?([@a-zA-Z][\w:.-]*)([^<>]*)\/?>/g
					let tagMatch: RegExpExecArray | null
					while ((tagMatch = tagRegex.exec(body))) {
						const tagStart = offset + tagMatch.index
						const tagNameStart = tagStart + tagMatch[0].indexOf(tagMatch[1])
						const tagNameMark = tagMatch[1].startsWith('@') ? marks.componentTag : marks.tag
						addMark(ranges, tagStart, tagStart + (tagMatch[0].startsWith('</') ? 2 : 1), marks.tag)
						addMark(ranges, tagNameStart, tagNameStart + tagMatch[1].length, tagNameMark)

						const attrs = tagMatch[2] || ''
						const attrsStart = tagStart + tagMatch[0].indexOf(attrs)
						const attrRegex = /([:@a-zA-Z_][\w:.-]*)(\s*=\s*)("[^"]*"|'[^']*'|[^\s"'=<>`]+)?/g
						let attrMatch: RegExpExecArray | null
						while ((attrMatch = attrRegex.exec(attrs))) {
							const attrNameStart = attrsStart + attrMatch.index
							addMark(ranges, attrNameStart, attrNameStart + attrMatch[1].length, marks.attr)
							if (attrMatch[3]) {
								const valueStart = attrNameStart + attrMatch[0].indexOf(attrMatch[3])
								addMark(ranges, valueStart, valueStart + attrMatch[3].length, marks.string)
							}
						}
					}
				}

				decorateCss(ranges: any[], body: string, offset: number) {
					const cssRegex = /\/\*[\s\S]*?\*\/|(\$[a-zA-Z_\x7f-\xff][\w\x7f-\xff]*|--[_a-zA-Z][\w-]*)|([a-z-]+)(\s*:)|([a-z-]+)(?=\s*\()|([.#]?-?[_a-zA-Z][\w-]*)(?=[\s,{.#:[>+~])|("[^"]*"|'[^']*')|(-?\d+(?:\.\d+)?(?:px|em|rem|%|vh|vw|s|ms)?)/gi
					let cssMatch: RegExpExecArray | null
					while ((cssMatch = cssRegex.exec(body))) {
						const from = offset + cssMatch.index
						if (cssMatch[0].startsWith('/*')) {
							addMark(ranges, from, from + cssMatch[0].length, marks.comment)
						} else if (cssMatch[1]) {
							addMark(ranges, from, from + cssMatch[1].length, marks.variable)
						} else if (cssMatch[2]) {
							addMark(ranges, from, from + cssMatch[2].length, marks.cssProp)
						} else if (cssMatch[4]) {
							addMark(ranges, from, from + cssMatch[4].length, marks.cssFunction)
						} else if (cssMatch[5]) {
							addMark(ranges, from, from + cssMatch[5].length, marks.cssSelector)
						} else if (cssMatch[6]) {
							addMark(ranges, from, from + cssMatch[6].length, marks.string)
						} else if (cssMatch[7]) {
							addMark(ranges, from, from + cssMatch[7].length, marks.number)
						}
					}
				}

				decorateJs(ranges: any[], body: string, offset: number) {
					const keywords = new Set([
						'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger',
						'default', 'delete', 'do', 'else', 'export', 'extends', 'finally',
						'for', 'from', 'function', 'if', 'import', 'in', 'instanceof', 'let',
						'new', 'of', 'return', 'static', 'super', 'switch', 'this', 'throw',
						'try', 'typeof', 'var', 'void', 'while', 'with', 'yield', 'async',
						'await', 'true', 'false', 'null', 'undefined'
					])
					const declarationKeywords = new Set(['function', 'class'])
					const variableKeywords = new Set(['const', 'let', 'var'])
					const isIdStart = (char: string) => /[A-Za-z_$]/.test(char)
					const isId = (char: string) => /[A-Za-z0-9_$]/.test(char)
					const isSpace = (char: string) => /\s/.test(char)
					const previousNonSpace = (index: number) => {
						for (let i = index - 1; i >= 0; i--) {
							if (!isSpace(body[i])) return body[i]
						}
						return ''
					}
					const nextNonSpaceIndex = (index: number) => {
						for (let i = index; i < body.length; i++) {
							if (!isSpace(body[i])) return i
						}
						return -1
					}
					const readQuoted = (index: number, quote: string) => {
						let i = index + 1
						while (i < body.length) {
							if (body[i] === '\\') {
								i += 2
								continue
							}
							if (body[i] === quote) return i + 1
							i++
						}
						return body.length
					}
					const readTemplate = (index: number) => {
						let i = index + 1
						while (i < body.length) {
							if (body[i] === '\\') {
								i += 2
								continue
							}
							if (body[i] === '`') return i + 1
							i++
						}
						return body.length
					}
					const readRegex = (index: number) => {
						let i = index + 1
						let inClass = false
						while (i < body.length) {
							const char = body[i]
							if (char === '\\') {
								i += 2
								continue
							}
							if (char === '[') inClass = true
							if (char === ']') inClass = false
							if (char === '/' && !inClass) {
								i++
								while (/[a-z]/i.test(body[i] || '')) i++
								return i
							}
							if (char === '\n') return index + 1
							i++
						}
						return body.length
					}

					let lastKeyword = ''
					let i = 0
					while (i < body.length) {
						const char = body[i]
						const from = offset + i

						if (isSpace(char)) {
							i++
							continue
						}

						if (char === '/' && body[i + 1] === '/') {
							const end = this.findLineEnd(body, i)
							addMark(ranges, from, offset + end, marks.comment)
							i = end
							continue
						}

						if (char === '/' && body[i + 1] === '*') {
							const end = body.indexOf('*/', i + 2)
							const to = end === -1 ? body.length : end + 2
							addMark(ranges, from, offset + to, marks.comment)
							i = to
							continue
						}

						if (char === '"' || char === "'") {
							const end = readQuoted(i, char)
							addMark(ranges, from, offset + end, marks.string)
							i = end
							continue
						}

						if (char === '`') {
							const end = readTemplate(i)
							addMark(ranges, from, offset + end, marks.string)
							i = end
							continue
						}

						if (char === '/' && /[=(:,[!&|?{};\n]/.test(previousNonSpace(i))) {
							const end = readRegex(i)
							if (end > i + 1) {
								addMark(ranges, from, offset + end, marks.jsRegex)
								i = end
								continue
							}
						}

						if (/\d/.test(char)) {
							let end = i + 1
							while (/[A-Za-z0-9_.]/.test(body[end] || '')) end++
							addMark(ranges, from, offset + end, marks.number)
							i = end
							lastKeyword = ''
							continue
						}

						if (isIdStart(char)) {
							let end = i + 1
							while (isId(body[end] || '')) end++
							const word = body.slice(i, end)
							const nextIndex = nextNonSpaceIndex(end)
							const prev = previousNonSpace(i)

							if (keywords.has(word)) {
								addMark(ranges, from, offset + end, marks.jsKeyword)
								lastKeyword = word
							} else if (declarationKeywords.has(lastKeyword)) {
								addMark(ranges, from, offset + end, lastKeyword === 'class' ? marks.jsClass : marks.jsName)
								lastKeyword = ''
							} else if (variableKeywords.has(lastKeyword)) {
								addMark(ranges, from, offset + end, marks.variable)
								lastKeyword = ''
							} else if (prev === '.') {
								addMark(ranges, from, offset + end, marks.jsProperty)
								lastKeyword = ''
							} else if (nextIndex !== -1 && body[nextIndex] === '(') {
								addMark(ranges, from, offset + end, marks.jsName)
								lastKeyword = ''
							} else if (nextIndex !== -1 && body[nextIndex] === ':') {
								addMark(ranges, from, offset + end, marks.jsProperty)
								lastKeyword = ''
							} else {
								addMark(ranges, from, offset + end, marks.variable)
								lastKeyword = ''
							}

							i = end
							continue
						}

						if (/[=+\-*/%<>!&|?:.]/.test(char)) {
							let end = i + 1
							while (/[=+\-*/%<>!&|?:.]/.test(body[end] || '')) end++
							addMark(ranges, from, offset + end, marks.operator)
							i = end
							continue
						}

						i++
					}
				}
			},
			{
				decorations: (value: any) => value.decorations
			}
		)

		this.codeMirrorExtension = heredocPlugin

		editorLanguages.register(
			this.codeMirrorModeName,
			'php',
			'PhpSPA PHP',
			async () => {
				const baseExtension = typeof phpMode?.getExtension === 'function'
					? await phpMode.getExtension()?.()
					: []
				return [baseExtension || [], heredocPlugin]
			}
		)

		this.codeMirrorModeRegistered = true
		console.log('PhpSPA mode registered for CodeMirror')
	}

	private applyCodeMirrorMode(file: GenericFile | null | undefined): void {
		if (!file || !this.isPhpFile(file) || typeof file.setMode !== 'function') return

		try {
			if (file.currentMode !== this.codeMirrorModeName) {
				file.setMode(this.codeMirrorModeName, { recommend: false })
			}

			if (this.editorManager?.activeFile === file) {
				this.editorManager.reapplyActiveFile?.()
				this.injectCodeMirrorExtension()
			}

			console.log('Applied PhpSPA CodeMirror mode to:', file.filename || file.name)
		} catch (error) {
			console.warn('PhpSPA Highlighter: failed to set CodeMirror mode', error)
		}
	}

	private injectCodeMirrorExtension(): void {
		const editor = this.editorManager?.editor
		if (!editor?.dispatch || !this.codeMirrorExtension) return

		try {
			this.syncCodeMirrorThemeColors()
			editor.dispatch({
				effects: this.getAcodeModule('codemirror')?.state?.StateEffect.appendConfig.of(this.codeMirrorExtension)
			})
		} catch (error) {
			console.warn('PhpSPA Highlighter: direct CodeMirror extension injection failed', error)
		}
	}

	private applyCodeMirrorGlobally(): void {
		const editorManager = this.editorManager
		if (!editorManager) return

		this.originalSwitchFile = editorManager.switchFile || null
		this.originalAddFile = editorManager.addFile || null

		if (this.originalSwitchFile) {
			const plugin = this
			editorManager.switchFile = function (file: GenericFile | string | number) {
				const result = plugin.originalSwitchFile!.apply(this, arguments as any)
				setTimeout(() => {
					plugin.applyCodeMirrorMode(plugin.resolveFile(file))
					plugin.applyCodeMirrorMode(plugin.editorManager?.activeFile)
				}, 50)
				return result
			}
		}

		if (this.originalAddFile) {
			const plugin = this
			editorManager.addFile = function (file: GenericFile) {
				const result = plugin.originalAddFile!.apply(this, arguments as any)
				setTimeout(() => plugin.applyCodeMirrorMode(file), 50)
				return result
			}
		}

		if (editorManager.files) {
			editorManager.files.forEach((file: GenericFile) =>
				void this.applyCodeMirrorMode(file)
			)
		}

		this.applyCodeMirrorMode(editorManager.activeFile)
		console.log('PhpSPA mode applied for CodeMirror')
	}

	public destroy(): void {
		if (this.editorManager) {
			if (this.originalSwitchFile) {
				this.editorManager.switchFile = this.originalSwitchFile
			}

			if (this.originalAddFile) {
				this.editorManager.addFile = this.originalAddFile
			}
		}

		const style = document.getElementById('phpspa-component-style')
		if (style) style.remove()
		console.log('PhpSPA Highlighter: Plugin unloaded')
	}
}

if (window.acode) {
	const acodePlugin = new PhpSpaHighlighter()
	acode.setPluginInit(
		'acode.plugin.phpspa',
		async (
			baseUrl: string,
			$page: HTMLElement,
			{
				cacheFile,
				cacheFileUrl
			}: { cacheFile: string; cacheFileUrl: string }
		) => {
			if (!baseUrl.endsWith('/')) {
				baseUrl += '/'
			}
			await acodePlugin.init()
		}
	)
	acode.setPluginUnmount('acode.plugin.phpspa', () => {
		acodePlugin.destroy()
	})
}
