export function isTypingTarget(target:EventTarget|null):boolean {
  if(!(target instanceof HTMLElement))return false
  return !!target.closest('input,textarea,select,[contenteditable],[role="textbox"],.monaco-editor,.cm-editor,[role="dialog"]')
}
export function shortcutAllowed(event:Pick<KeyboardEvent,'target'|'isComposing'|'key'|'metaKey'|'ctrlKey'|'altKey'>):boolean {
  return !event.isComposing&&event.key!=='Process'&&!event.metaKey&&!event.ctrlKey&&!event.altKey&&!isTypingTarget(event.target)
}
