import { formatEnhancedErrorMsg, PipeError } from "error";
import { describe, expect, it } from "vitest";

class CustomErr extends Error {
  key = "value";
}

describe("PipeError", () => {
  it("should extend the Error class", () => {
    const error = new PipeError(new CustomErr("Test Error"), ["Step 1", "Step 2"]);
    expect(error).toBeInstanceOf(PipeError);
    expect(error.name).toBe("PipeError"); // Default name for custom errors
  });

  it("should include the original error message and history", () => {
    const originalError = new CustomErr("Something went wrong");
    const history = ["Step A", "Step B", "Final Step"];
    const error = new PipeError(originalError, history);

    expect(error.stack).toContain("PipeError:");
    expect(error.stack).toContain('❌ ERROR in "Final Step"');
    expect(error.stack).toContain("↓↓↓  ORIGINAL ERROR  ↓↓↓");
    expect(error.stack).toContain(originalError.stack?.split("\n")[0]); // Ensure original error's stack is retained
  });

  it("should copy extra properties from the original error", () => {
    const originalError = new CustomErr("With extra properties");
    const error = new PipeError(originalError, ["Step X"]);

    expect((error as CustomErr).key).toBe("value");
  });
});

describe("formatEnhancedErrorMsg", () => {
  it("should correctly format short execution histories", () => {
    const history = ["Step 1", "Step 2"];
    const formattedMsg = formatEnhancedErrorMsg(history);

    expect(formattedMsg).toBe(`🔗 Execution Chain:\n  1. Step 1\n  2. ❌ ERROR in "Step 2"`);
  });

  it("should correctly format long execution histories", () => {
    const history = ["A", "B", "C", "D", "E"];
    const formattedMsg = formatEnhancedErrorMsg(history);

    expect(formattedMsg).toBe(
      `🔗 Execution Chain:\n  ...(2)\n  3. C\n  4. D\n  5. ❌ ERROR in "E"`,
    );
  });

  it("should handle empty history gracefully", () => {
    const formattedMsg = formatEnhancedErrorMsg([]);
    expect(formattedMsg).toBe("🔗 Execution Chain:\n");
  });
});
