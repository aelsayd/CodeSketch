// components/AceEditorWithTypes.tsx
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/theme-monokai";
import { useEffect, useRef } from "react";

interface AceStandaloneProps {
	value: string;
	onChange?: (value: string) => void;
	readOnly?: boolean;
	fontSize?: string;
	height?: string;
	width?: string;
}

import * as ace from "ace-builds";

export const AceStandalone: React.FC<AceStandaloneProps> = ({
	value,
	onChange,
	readOnly = false,
	fontSize = "14px",
	height = "300px",
	width = "100%",
}) => {
	const editorRef = useRef<HTMLDivElement>(null);
	const aceInstanceRef = useRef<ace.Ace.Editor | null>(null);

	useEffect(() => {
		if (!editorRef.current) return;

		const editor = ace.edit(editorRef.current);
		aceInstanceRef.current = editor;

		editor.setTheme("ace/theme/chrome");
		editor.session.setMode("ace/mode/javascript");
		editor.setValue(value, -1);

		editor.setOptions({
			fontSize,
			readOnly,
			enableBasicAutocompletion: true,
			enableLiveAutocompletion: true,
			enableSnippets: true,
		});

		if (onChange) {
			editor.session.on("change", () => {
				onChange(editor.getValue());
			});
		}

		return () => {
			editor.destroy();
			aceInstanceRef.current = null;
		};
	}, [value, readOnly, fontSize, onChange]);

	return (
		<div ref={editorRef} style={{ height, width }}>
			hello world {value}{" "}
		</div>
	);
};
