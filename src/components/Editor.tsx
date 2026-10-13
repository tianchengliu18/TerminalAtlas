import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import type { CommandEntry, CommandFlag } from '../model/types'

interface Props { command:CommandEntry; onClose:()=>void; onSave:(entry:CommandEntry)=>void; isNew?:boolean }
export function Editor({command,onClose,onSave,isNew}:Props){
  const [draft,setDraft]=useState(command)
  const [flags,setFlags]=useState(command.flags.map(f=>`${f.token} | ${f.descriptionZh} | ${f.descriptionEn??''}`).join('\n'))
  const [example,setExample]=useState(command.examples[0]?.commandLine??'')
  const [combo,setCombo]=useState(command.combinations[0]?.expression??'')
  const [comboDescription,setComboDescription]=useState(command.combinations[0]?.explanationZh??'')
  const first=useRef<HTMLInputElement>(null)
  const dirty=JSON.stringify(draft)!==JSON.stringify(command)||flags!==command.flags.map(f=>`${f.token} | ${f.descriptionZh} | ${f.descriptionEn??''}`).join('\n')||example!==(command.examples[0]?.commandLine??'')||combo!==(command.combinations[0]?.expression??'')||comboDescription!==(command.combinations[0]?.explanationZh??'')
  function close(){if(!dirty||window.confirm('这些修改尚未保存。确定放弃吗？'))onClose()}
  useEffect(()=>{if(first.current?.disabled)first.current.closest('.editor-fields')?.querySelector<HTMLInputElement>('input:not(:disabled)')?.focus();else first.current?.focus()},[])
  function update<K extends keyof CommandEntry>(key:K,value:CommandEntry[K]){setDraft(old=>({...old,[key]:value}))}
  function save(){
    if(!draft.command.trim()||!draft.titleZh.trim())return
    const parsedFlags:CommandFlag[]=flags.split('\n').map(line=>line.split('|').map(x=>x.trim())).filter(parts=>parts[0]&&parts[1]).map(([token,descriptionZh,descriptionEn])=>({token,descriptionZh,descriptionEn}))
    const id=isNew?draft.command.trim().toLocaleLowerCase().replace(/\s+/g,'-'):draft.id
    const entry:CommandEntry={...draft,id,command:draft.command.trim(),flags:parsedFlags,
      tags:draft.tags.filter(Boolean),
      combinations:combo.trim()?[{expression:combo.trim(),explanationZh:comboDescription.trim(),tokens:parsedFlags.filter(flag=>combo.includes(flag.token)).map(flag=>flag.token)}]:[],
      examples:example.trim()?[{titleZh:'常用示例',commandLine:example.trim(),explanationZh:draft.summaryZh,platforms:draft.platforms,safety:draft.safety}]:[],
      source:isNew?{provider:'user',license:'user-owned',modified:false}:{...draft.source,modified:true}}
    onSave(entry)
  }
  return <div className="modal-backdrop" onMouseDown={event=>{if(event.target===event.currentTarget)close()}}><section className="editor-modal" role="dialog" aria-modal="true" aria-labelledby="editor-title" onKeyDown={event=>{if(event.key==='Escape'){event.stopPropagation();close()}}}>
    <div className="modal-heading"><div><span className="micro-label">Personal overlay</span><h2 id="editor-title">{isNew?'新建命令':'编辑命令解释'}</h2></div><button className="icon-button" onClick={close} aria-label="关闭编辑"><X size={18}/></button></div>
    <p className="muted">修改只保存在本机，不会覆盖原始内容。可从设置导出备份。</p>
    <div className="editor-fields"><label>命令名<input ref={first} value={draft.command} disabled={!isNew} onChange={event=>update('command',event.target.value)}/></label><label>英文含义 / 名称来源<input value={draft.meaningEn??''} onChange={event=>update('meaningEn',event.target.value)}/></label>
      <label>中文标题<input value={draft.titleZh} onChange={event=>update('titleZh',event.target.value)}/></label><label>中文说明<textarea value={draft.summaryZh} onChange={event=>update('summaryZh',event.target.value)}/></label>
      <label>语法<input value={draft.syntax} onChange={event=>update('syntax',event.target.value)}/></label><label>示例命令<input value={example} onChange={event=>setExample(event.target.value)}/></label>
      <label>参数说明 <small>每行：参数 | 中文解释 | English</small><textarea rows={4} value={flags} onChange={event=>setFlags(event.target.value)}/></label>
      <label>组合参数<input value={combo} onChange={event=>setCombo(event.target.value)}/></label><label>组合效果<input value={comboDescription} onChange={event=>setComboDescription(event.target.value)}/></label>
      <label>标签 <small>用逗号分隔</small><input value={draft.tags.join(', ')} onChange={event=>update('tags',event.target.value.split(',').map(x=>x.trim()))}/></label>
      <label>关联命令 <small>用逗号分隔</small><input value={draft.relatedCommandIds.join(', ')} onChange={event=>update('relatedCommandIds',event.target.value.split(',').map(x=>x.trim()))}/></label>
      <label>补充 Markdown<textarea rows={3} value={draft.markdownBody} onChange={event=>update('markdownBody',event.target.value)}/></label>
    </div>
    <div className="modal-footer"><button className="secondary-button" onClick={close}>取消</button><button className="primary-button" onClick={save} disabled={!draft.command.trim()||!draft.titleZh.trim()}>保存修改</button></div>
  </section></div>
}
