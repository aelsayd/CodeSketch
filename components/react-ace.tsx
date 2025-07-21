import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/ext-language_tools";
import { useEffect, useRef, useState } from "react";

interface ReactAceWrapperProps {
	value: string;
	setValue: (value: string) => void;
	onChange?: (val: string) => void;
	readOnly?: boolean;
	minHeight?: number;
	fontSize?: number;
	maxHeight?: number;
	width?: string;
}

export const ReactAceWrapper: React.FC<ReactAceWrapperProps> = ({
	value,
	setValue,
	onChange,
	readOnly = false,
	fontSize = 14,
	minHeight = 100,
	maxHeight = 700,
	width = "100%",
}) => {
	const [height, setHeight] = useState(0);
	const [lineHeight, setLineHeight] = useState(17);

	const aceRef = useRef<AceEditor | null>(null);

	useEffect(() => {
		if (aceRef.current) {
			const editor = aceRef.current.editor;
			setLineHeight(editor.renderer.lineHeight);
		}
	}, []);

	useEffect(() => {
		const newLines = Array.from(value.matchAll(/\n/g)).length;
		setHeight(lineHeight * newLines + 20);
	}, [value, lineHeight]);

	return (
		<AceEditor
			ref={aceRef}
			mode="javascript"
			theme="monokai"
			value={value}
			onChange={(val) => {
				setValue(val);
				if (onChange) onChange(val);
			}}
			style={{
				minHeight: `${minHeight}px`,
				maxHeight: `${maxHeight}px`,
				height: `${height}px`,
				width,
			}}
			readOnly={readOnly}
			fontSize={fontSize}
			height={height > maxHeight ? `${height}px` : "100%"}
			width={width}
			setOptions={{
				enableBasicAutocompletion: true,
				enableLiveAutocompletion: true,
				enableSnippets: true,
			}}
		/>
	);
};
