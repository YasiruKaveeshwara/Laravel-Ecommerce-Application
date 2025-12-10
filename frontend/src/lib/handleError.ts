import { notifyError } from "@/lib/notify";
import { toUserMessage } from "@/lib/errors";

type HandleErrorOptions = {
	title?: string;
	fallbackMessage?: string;
	toast?: boolean;
};

/**
 * Normalize unknown errors into user-friendly copy and optionally toast.
 */
export function handleError(error: unknown, options: HandleErrorOptions = {}) {
	const { title = "Something went wrong", fallbackMessage = "Please try again.", toast = true } = options;
	const message = toUserMessage(error) ?? fallbackMessage;
	if (toast) {
		notifyError(title, message);
	}
	return message;
}
