# Cursor hooks — artwork / portrait guard

**Installed:** blocks agent edits on protected paths unless you allow them.

## Protected (blocked by default)

- `sketches/**`
- `installations/**`
- `machine-aesthetic/**`
- `Palm/**`
- Canonical starters (`portrait-wall.starter*.html`)

## Two gates (both must pass for artwork edits)

| Hook | Event | Blocks |
|------|--------|--------|
| `guard-artwork-write.py` | `preToolUse` (Write / StrReplace / Delete) | Direct file tool edits |
| `guard-artwork-shell.py` | `beforeShellExecution` | Shell bypass: `cat >`, `>>`, `tee`, `cp`/`mv`, `sed -i`, Python `write_text`, heredocs into protected paths |
| `guard-destructive-shell.py` | `beforeShellExecution` | Destructive `rm` on templates, `git checkout/restore` on sketches |

**No ALLOW_EDIT line → no agent write**, whether by file tool or shell.

## Allow a specific file

Add the **exact repo-relative path** to `.cursor/ALLOW_EDIT` (one line):

```
sketches/one-row_portrait.html
```

Remove the line when the session is done.

## Verify hooks loaded

Cursor → **Hooks** output channel. Restart Cursor after first install if hooks do not fire.

Test shell guard (should deny without ALLOW_EDIT):

```bash
echo '{"command":"cat > sketches/test-block.html << EOF"}' | python3 .cursor/hooks/guard-artwork-shell.py
```

## Manual check after a session

```bash
python3 _scripts/check_portrait_wall.py
git diff --stat
```
