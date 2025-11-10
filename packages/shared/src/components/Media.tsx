import { useState } from "react";

// CHANGE: Use key prop from parent instead of useEffect for src changes
// WHY: Avoid setState in useEffect (react-hooks/set-state-in-effect)
// REF: CLAUDE.md:8 - "Никогда не использовать eslint-disable"
// NOTE: Parent should use key={src} to remount component on src change
export default function Media({
	src,
	alt,
	className = "",
}: {
	src?: string | null;
	alt: string;
	className?: string;
}) {
	const [loaded, setLoaded] = useState(false);
	const [error, setError] = useState(false);

	if (!src || error) {
		return (
			<div className={`image-wrap ${className}`}>
				<div className="image-fallback">No image</div>
			</div>
		);
	}

	return (
		<div className={`image-wrap ${className}`}>
			{!loaded && <div className="image-ph" />}
			<img
				src={src}
				alt={alt}
				className={`img-progressive ${loaded ? "is-loaded" : ""}`}
				onLoad={() => setLoaded(true)}
				onError={() => setError(true)}
				loading="eager"
				decoding="async"
			/>
		</div>
	);
}
