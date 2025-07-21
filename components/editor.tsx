import { useEffect, useRef, useState } from "react";
import { ReactAceWrapper } from "./react-ace";
import { P5Runner } from "./p5Runner";
import * as beautify from "js-beautify";

export const Editor = ({
	source,
	save,
	blockId,
}: {
	source: string;
	save: (value: string) => void;
	blockId: string;
}) => {
	const [value, setValue] = useState(source);
	const [executable, setExecutable] = useState(source);

	const valueRef = useRef(value);
	let lastSavedValue = "";

	const editorRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		valueRef.current = value;
	}, [value]);

	const saveIfNew = () => {
		if (lastSavedValue != valueRef.current) {
			lastSavedValue = valueRef.current;
			save(valueRef.current);
		}
	};

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				editorRef.current &&
				!editorRef.current.contains(event.target as Node)
			) {
				saveIfNew();
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			saveIfNew();
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	return (
		<div ref={editorRef}>
			<ReactAceWrapper value={value} setValue={setValue} />
			<BottomMenu
				value={value}
				setValue={setValue}
				setExecutable={setExecutable}
				save={saveIfNew}
			/>
			<P5Runner code={executable} blockId={blockId} />
		</div>
	);
};

import { Notice } from "obsidian";
export const BottomMenu = ({
	value,
	setValue,
	setExecutable,
	save,
}: {
	value: string;
	setValue: (value: string) => void;
	setExecutable: (value: string) => void;
	save: (value: string) => void;
}) => {
	const execute = () => {
		new Notice("Running code...", 1000);
		setExecutable(value);
	};

	const format = () => {
		const formattedCode = beautify.js_beautify(value);
		setValue(formattedCode);
	};

	return (
		<div
			style={{
				display: "flex",
				gap: "10px",
			}}
		>
			<button onClick={execute}>Run</button>
			<button
				onClick={() => {
					save(value);
				}}
			>
				Save
			</button>
			<button onClick={format}>Format</button>
		</div>
	);
};
