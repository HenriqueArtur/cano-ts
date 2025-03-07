export class PipeError extends Error {
  constructor(original_error: unknown, history: string[]) {
    super("");
    Object.setPrototypeOf(this, new.target.prototype);

    if (original_error instanceof Error) {
      if (original_error.stack) {
        this.stack = `${this.name}:\n${formatEnhancedErrorMsg(history)}\n↓↓↓  ORIGINAL ERROR  ↓↓↓\n${original_error.stack}`;
      }
      for (const key in original_error) {
        if (!(key in this)) {
          this[key] = original_error[key];
        }
      }
    }
  }
}

export function formatEnhancedErrorMsg(history: string[]): string {
  const history_length = history.length;
  const last_execution_index = history_length - 1;
  let displayed_history: string[];

  if (history_length > 3) {
    displayed_history = [
      `  ...(${history_length - 3})`,
      ...history.slice(-3).map((m, i) => `  ${history_length - 3 + i + 1}. ${m}`),
    ];
  } else {
    displayed_history = history.map((m, i) => `  ${i + 1}. ${m}`);
  }
  displayed_history[displayed_history.length - 1] =
    `  ${history_length}. ❌ ERROR in "${history[last_execution_index]}"`;

  return `🔗 Execution Chain:\n${displayed_history.join("\n")}`;
}
