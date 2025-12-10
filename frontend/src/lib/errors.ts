export type ApiErrorDetails = Record<string, unknown> | undefined;

export class ApiError extends Error {
	readonly status: number;
	readonly type?: string;
	readonly details?: ApiErrorDetails;

	constructor(message: string, status: number, type?: string, details?: ApiErrorDetails, cause?: unknown) {
		super(message);
		this.name = "ApiError";
		this.status = status;
		this.type = type;
		this.details = details;
		if (cause !== undefined) {
			// @ts-expect-error cause is available in modern runtimes but not yet typed in TS config
			this.cause = cause;
		}
	}
}

export function isApiError(error: unknown): error is ApiError {
	return error instanceof ApiError;
}

export function toUserMessage(error: unknown): string | undefined {
	if (isApiError(error)) {
		return error.message;
	}
	if (error instanceof Error && error.message) {
		return error.message;
	}
	if (typeof error === "string") {
		return error;
	}
	return undefined;
}
