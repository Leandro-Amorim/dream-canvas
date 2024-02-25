import generateCursor, { CursorConfig } from "drizzle-cursor";
import { images } from "./schema";

export const imagesCursor = generateCursor({
	cursors: [
		{ order: "DESC", key: "createdAt", schema: images.createdAt },
	],
	primaryCursor: { order: "ASC", key: "id", schema: images.id },
} satisfies CursorConfig);