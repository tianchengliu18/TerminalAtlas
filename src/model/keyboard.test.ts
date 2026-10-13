import { describe, expect, it } from 'vitest'
import { shortcutAllowed } from './keyboard'

describe('keyboard shortcut guard',()=>{
  const base={key:'1',isComposing:false,metaKey:false,ctrlKey:false,altKey:false}
  it('blocks editors and native fields',()=>{
    for(const html of ['<input>','<textarea></textarea>','<select></select>','<div contenteditable="true"></div>','<div role="textbox"></div>','<div class="cm-editor"><span></span></div>','<div role="dialog"><button></button></div>']){
      const wrapper=document.createElement('div');wrapper.innerHTML=html
      expect(shortcutAllowed({...base,target:wrapper.querySelector('*')!})).toBe(false)
    }
  })
  it('blocks IME and system modifiers but allows card focus',()=>{
    const card=document.createElement('article')
    expect(shortcutAllowed({...base,target:card})).toBe(true)
    expect(shortcutAllowed({...base,target:card,isComposing:true})).toBe(false)
    expect(shortcutAllowed({...base,target:card,metaKey:true})).toBe(false)
  })
})
