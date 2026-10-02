/**
 * Shared console reporting for the protection-gate scripts.
 * Colour is disabled automatically when not a TTY, or when NO_COLOR is set.
 */

const useColor =
  process.stdout.isTTY && !process.env.NO_COLOR && process.env.TERM !== "dumb";

const wrap = (code) => (text) => (useColor ? `[${code}m${text}[0m` : text);

export const red = wrap("31");
export const green = wrap("32");
export const yellow = wrap("33");
export const cyan = wrap("36");
export const dim = wrap("2");
export const bold = wrap("1");

export function heading(text) {
  console.error(bold(`\n${text}`));
}

export function failure(title, lines = []) {
  console.error(`${red("✖")} ${bold(title)}`);
  for (const line of lines) console.error(`  ${line}`);
}

export function warning(title, lines = []) {
  console.error(`${yellow("!")} ${title}`);
  for (const line of lines) console.error(`  ${line}`);
}

export function success(title) {
  console.error(`${green("✔")} ${title}`);
}

export function hint(lines) {
  console.error("");
  for (const line of lines) console.error(dim(`  ${line}`));
}

/**
 * Exit helper. `findings` is a list of { file, line, message, detail? }.
 * Returns the process exit code so callers can compose multiple checks.
 */
export function reportFindings({ name, findings, remediation = [] }) {
  if (findings.length === 0) {
    success(`${name}: clean`);
    return 0;
  }

  failure(
    `${name}: ${findings.length} blocking issue${findings.length === 1 ? "" : "s"}`,
  );
  for (const f of findings) {
    const location = f.line ? `${f.file}:${f.line}` : f.file;
    console.error(`  ${cyan(location)}`);
    console.error(`    ${f.message}`);
    if (f.detail) console.error(`    ${dim(f.detail)}`);
  }
  if (remediation.length) hint(remediation);
  return 1;
}
