import { describe, expect, it } from "vitest";

import { unwrapApiResponse } from "@/store/api";

describe("unwrapApiResponse", () => {
  it("keeps collection payloads as arrays", () => {
    const items = [{ id: "translation-1", translatedText: "Hello" }];

    const result = unwrapApiResponse({
      success: true,
      message: "Translation history loaded.",
      data: items,
    });

    expect(Array.isArray(result)).toBe(true);
    expect(result).toEqual(items);
  });

  it("attaches the envelope message to object payloads", () => {
    const result = unwrapApiResponse({
      success: true,
      message: "Account loaded.",
      data: { user: { id: "user-1" } },
    });

    expect(result).toEqual({
      user: { id: "user-1" },
      message: "Account loaded.",
    });
  });

  it("returns non-envelope payloads unchanged", () => {
    const payload = { message: "Signed out." };

    expect(unwrapApiResponse(payload)).toBe(payload);
  });
});
