import { Bookmark, Copy, Edit3, Pin, X } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import rehypeSanitize from 'rehype-sanitize'
import type { CommandEntry, UserCommandState } from '../model/types'
import { statusLabel } from '../model/state'

interface Props {
  command:CommandEntry|null; state:UserCommandState|null; drawer:boolean; onClose:()=>void
  onMark:(key:'1'|'2'|'3'|'0')=>void; onFavorite:()=>void; onPin:()=>void; onCopy:(text:string)=>void
  onEdit:()=>void; onNotes:(text:string)=>void; onSelectRelated:(id:string)=>void
}
export function Inspector({command,state,drawer,onClose,onMark,onFavorite,onPin,onCopy,onEdit,onNotes,onSelectRelated}:Props){
  if(!command||!state)return <aside className="inspector empty-inspector"><p>选择一张卡片查看完整命令。</p></aside>
  return <aside className={`inspector ${drawer?'inspector-drawer':''}`} aria-label={`${command.command} 详情`}>
    <div className="inspector-header"><div><span className="micro-label">Command detail</span><h2>{command.command}</h2></div>{drawer&&<button type="button" className="icon-button" onClick={onClose} aria-label="关闭详情"><X size={18}/></button>}</div>
    <div className="inspector-scroll">
      <p className="inspector-english">{command.meaningEn||'暂无可靠名称来源'}</p>
      <p className="inspector-chinese">{command.titleZh}</p>
      <p className="inspector-summary">{command.summaryZh}</p>
      <div className="metadata-row"><span>{command.platforms.map(p=>p==='macos'?'macOS':p==='linux'?'Linux':'通用').join(' / ')}</span><span>{command.safety==='read_only'?'只读':command.safety==='high_risk'?'高风险':'修改数据'}</span></div>
      {command.platformNote&&<p className="platform-note">{command.platformNote}</p>}
      {command.safety==='high_risk'&&<div className="risk-note">请先核对路径、目标及参数。此处只展示示例，不会执行命令。</div>}
      <section className="inspector-section"><div className="section-head"><h3>语法</h3><button className="text-button" onClick={()=>onCopy(command.syntax)}>复制</button></div><code className="syntax-block">{command.syntax}</code></section>
      {command.combinations.length>0&&<section className="inspector-section"><h3>组合参数</h3>{command.combinations.map(combo=><div className="combination" key={combo.expression}><code>{combo.expression}</code><p>{combo.explanationZh}</p><div className="token-row">{combo.tokens.map(token=><span key={token}>{token}</span>)}</div></div>)}</section>}
      {command.flags.length>0&&<section className="inspector-section"><h3>参数拆解</h3><div className="flag-list">{command.flags.map(flag=><div className="flag-row" key={flag.token}><code>{flag.token}</code><div><span>{flag.descriptionZh}</span>{flag.descriptionEn&&<small>{flag.descriptionEn}</small>}</div></div>)}</div></section>}
      <section className="inspector-section"><h3>示例</h3>{command.examples.map((example,index)=><div className="example" key={`${example.commandLine}-${index}`}><div className="section-head"><span>{example.titleZh}</span><button className="icon-button tiny" aria-label={`复制 ${example.commandLine}`} onClick={()=>onCopy(example.commandLine)}><Copy size={15}/></button></div><code>{example.commandLine}</code><p>{example.explanationZh}</p></div>)}</section>
      {command.relatedCommandIds.length>0&&<section className="inspector-section"><h3>相关命令</h3><div className="related-list">{command.relatedCommandIds.map(id=><button type="button" key={id} onClick={()=>onSelectRelated(id)}>{id.replaceAll('-',' ')}</button>)}</div></section>}
      {command.markdownBody&&<section className="inspector-section"><h3>补充说明</h3><div className="markdown"><ReactMarkdown rehypePlugins={[rehypeSanitize]}>{command.markdownBody}</ReactMarkdown></div></section>}
      <section className="inspector-section"><div className="section-head"><h3>我的笔记</h3><span className="muted">自动保存</span></div><textarea className="notes-editor" aria-label="个人 Markdown 笔记" placeholder="写下你记住这条命令的方法…" value={state.notesMarkdown} onChange={event=>onNotes(event.target.value)} /><div className="markdown notes-preview"><ReactMarkdown rehypePlugins={[rehypeSanitize]}>{state.notesMarkdown}</ReactMarkdown></div></section>
      <section className="inspector-section source-section"><h3>来源与许可</h3><p>{command.source.provider==='tldr-pages'?'tldr-pages · CC BY 4.0':command.source.provider==='user'?'用户自建':'Terminal Atlas 原创策展 · CC BY-NC 4.0'}{command.source.modified?' · 已改写':''}</p>{command.source.url&&<a href={command.source.url} target="_blank" rel="noopener noreferrer">查看原始页面 ↗</a>}<p>示例仅供学习与复制；不会自动执行。</p></section>
    </div>
    <div className="inspector-actions"><div className="learning-actions"><button className={state.isFrequent?'active':''} onClick={()=>onMark('1')} title="快捷键 1">1 常用</button><button className={state.learningStatus==='mastered'?'active':''} onClick={()=>onMark('2')} title="快捷键 2">2 熟练</button><button className={state.learningStatus==='often_forgotten'?'active':''} onClick={()=>onMark('3')} title="快捷键 3">3 总忘</button><button onClick={()=>onMark('0')} title="快捷键 0">清除</button></div><div className="quick-actions"><button onClick={onFavorite}><Bookmark size={15}/>{state.isFavorite?'已收藏':'收藏'}</button><button onClick={onPin}><Pin size={15}/>{state.isPinned?'已固定':'固定'}</button><button onClick={onEdit}><Edit3 size={15}/>编辑解释</button></div><span className="sr-only">{statusLabel(state.learningStatus)}</span></div>
  </aside>
}
