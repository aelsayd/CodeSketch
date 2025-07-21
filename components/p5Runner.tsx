import { useEffect, useRef } from "react";

interface P5RunnerProps {
	code: string;
	blockId: string;
}

declare global {
	interface Window {
		__resizeIframeListenerAdded__?: boolean;
	}
}

if (!window.__resizeIframeListenerAdded__) {
	window.addEventListener("message", (e) => {
		if (e.data?.type === "resize-iframe" && typeof e.data.id === "string") {
			const iframe = document.getElementById(
				e.data.id,
			) as HTMLIFrameElement;
			if (iframe) {
				const height = Math.min(e.data.height + 5, 600);
				iframe.style.height = `${height}px`;
			}
		}
	});

	window.__resizeIframeListenerAdded__ = true;
}

export const P5Runner: React.FC<P5RunnerProps> = ({ code, blockId }) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const frameId = `sketchFrame-${blockId}`;

	useEffect(() => {
		const htmlContent = generateP5HTML(code, frameId);
		const blob = new Blob([htmlContent], { type: "text/html" });
		const blobURL = URL.createObjectURL(blob);

		const iframe = document.createElement("iframe");
		iframe.id = frameId;
		iframe.src = blobURL;
		iframe.width = "100%";
		iframe.height = "0";
		iframe.style.border = "0";

		if (containerRef.current) {
			containerRef.current.innerHTML = "";
			containerRef.current.appendChild(iframe);
		}

		iframe.onload = () => URL.revokeObjectURL(blobURL);

		return () => {
			if (containerRef.current) containerRef.current.innerHTML = "";
		};
	}, [code, blockId]);

	return <div ref={containerRef} />;
};

export function generateP5HTML(code: string, frameId: string): string {
	return `
<!DOCTYPE html>
<html>
  <head>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js"></script>
    <script>
      ${code}

      if (typeof setup === "function") {
        const originalSetup = setup;
        setup = (...args) => {
          const result = originalSetup(...args);
      console.log("sending the message", "${frameId}")
          window.parent.postMessage({
            type: "resize-iframe",
            id: "${frameId}",
            height: document.body.scrollHeight
          }, "*");
          return result;
        };
      }
    </script>
  </head>
  <body style="margin:0; padding:0;"></body>
</html>
  `.trim();
}
