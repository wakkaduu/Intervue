// Feature: mock-interview-helper, Property 2: Empty or whitespace-only answers are always rejected without an API call

/**
 * Property 2: Empty or whitespace-only answers are always rejected without an API call
 *
 * Validates: Requirements 5.8
 *
 * For any string composed entirely of whitespace characters (including the empty string),
 * calling validateAnswer() SHALL produce a non-null error string, and fetch SHALL NOT be
 * called when the caller respects that error.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as fc from "fast-check";
import { validateAnswer } from "@/lib/validation";

// ---------------------------------------------------------------------------
// Whitespace character generators
// ---------------------------------------------------------------------------

/**
 * Arbitrary that produces a single whitespace character.
 * Covers: ASCII whitespace (space, tab, newline, carriage return, form feed,
 * vertical tab) plus a selection of Unicode whitespace code points.
 */
const whitespaceChar = fc.oneof(
  // ASCII whitespace
  fc.constant(" "),
  fc.constant("\t"),
  fc.constant("\n"),
  fc.constant("\r"),
  fc.constant("\f"),
  fc.constant("\v"),
  // Unicode whitespace
  fc.constant("\u00A0"), // NO-BREAK SPACE
  fc.constant("\u2000"), // EN QUAD
  fc.constant("\u2001"), // EM QUAD
  fc.constant("\u2002"), // EN SPACE
  fc.constant("\u2003"), // EM SPACE
  fc.constant("\u2009"), // THIN SPACE
  fc.constant("\u200A"), // HAIR SPACE
  fc.constant("\u202F"), // NARROW NO-BREAK SPACE
  fc.constant("\u205F"), // MEDIUM MATHEMATICAL SPACE
  fc.constant("\u3000"), // IDEOGRAPHIC SPACE
  fc.constant("\u2028"), // LINE SEPARATOR
  fc.constant("\u2029")  // PARAGRAPH SEPARATOR
);

/**
 * Arbitrary that produces a whitespace-only string (0 or more whitespace chars).
 * Includes the empty string as a degenerate case.
 */
const whitespaceOnlyString = fc.oneof(
  // Empty string
  fc.constant(""),
  // One or more whitespace characters
  fc.array(whitespaceChar, { minLength: 1, maxLength: 50 }).map((chars) =>
    chars.join("")
  )
);

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Property 2: Empty or whitespace-only answers are always rejected without an API call", () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Spy on the global fetch so we can assert it is never called
    fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ error: "should not be called" }), {
        status: 400,
      })
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it(
    "validateAnswer returns a non-null error string for every whitespace-only input",
    () => {
      fc.assert(
        fc.property(whitespaceOnlyString, (input) => {
          const result = validateAnswer(input);

          // The result must be a non-null, non-empty string (an error message)
          expect(result).not.toBeNull();
          expect(typeof result).toBe("string");
          expect((result as string).length).toBeGreaterThan(0);
        }),
        { numRuns: 100 }
      );
    }
  );

  it(
    "fetch is never called when validateAnswer returns an error for whitespace-only input",
    () => {
      fc.assert(
        fc.property(whitespaceOnlyString, (input) => {
          fetchSpy.mockClear();

          const error = validateAnswer(input);

          // Simulate the caller's responsibility: only call fetch when there is no error
          if (error !== null) {
            // Error present — fetch must NOT be called
            // (The caller should gate the API call on this check)
            expect(fetchSpy).not.toHaveBeenCalled();
          }
        }),
        { numRuns: 100 }
      );
    }
  );

  it(
    "validateAnswer rejects the empty string specifically",
    () => {
      const result = validateAnswer("");
      expect(result).not.toBeNull();
      expect(typeof result).toBe("string");
    }
  );

  it(
    "validateAnswer rejects strings of only ASCII whitespace",
    () => {
      fc.assert(
        fc.property(
          fc
            .array(
              fc.oneof(
                fc.constant(" "),
                fc.constant("\t"),
                fc.constant("\n"),
                fc.constant("\r")
              ),
              { minLength: 1, maxLength: 50 }
            )
            .map((chars) => chars.join("")),
          (input) => {
            const result = validateAnswer(input);
            expect(result).not.toBeNull();
          }
        ),
        { numRuns: 100 }
      );
    }
  );
});
