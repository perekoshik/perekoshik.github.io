import React from "react";

interface ErrorBoundaryState {
	hasError: boolean;
	error?: Error;
}

class ErrorBoundary extends React.Component<
	{ children: React.ReactNode },
	ErrorBoundaryState
> {
	constructor(props: { children: React.ReactNode }) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { hasError: true, error };
	}

	override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		console.error("Error caught by boundary:", error, errorInfo);
	}

	override render() {
		if (this.state.hasError) {
			return (
				<div className="flex items-center justify-center min-h-screen bg-gray-100">
					<div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
						<h1 className="text-2xl font-bold text-red-600 mb-4">
							Something went wrong
						</h1>
						<p className="text-gray-700 mb-4">
							{this.state.error?.message || "An unexpected error occurred."}
						</p>
						<button
							type="button"
							className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
							onClick={() => window.location.reload()}
						>
							Reload Page
						</button>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}

export default ErrorBoundary;
