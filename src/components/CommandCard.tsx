import { Bookmark, Pin, ArrowUpRight } from 'lucide-react'
import type { CommandEntry, Preferences, UserCommandState } from '../model/types'
import { statusLabel } from '../model/state'

interface Props {
  command:CommandEntry; state:UserCommandState; preferences:Preferences; selected:boolean; flipped:boolean
  onSelect:()=>void; onOpen:()=>void; onFavorite:()=>void; onPin:()=>void; onFlip:()=>void
  elementRef:(element:HTMLElement|null)=>void
}
export function CommandCard({command,state,preferences,selected,flipped,onSelect,onOpen,onFavorite,onPin,onFlip,elementRef}:Props){
  return <article ref={elementRef} tabIndex={selected?0:-1} role="group" aria-label={`${command.command}，${command.titleZh}，${statusLabel(state.learningStatus)}`}
    className={`command-card ${selected?'is-selected':''}`} onClick={onSelect}
    onKeyDown={event=>{if(event.target!==event.currentTarget)return;if(event.key==='Enter'){event.preventDefault();event.stopPropagation();onOpen()}if(event.key===' '){event.preventDefault();event.stopPropagation();onFlip()}}}
    onDoubleClick={onOpen} onFocus={onSelect}>
    <div className="card-top"><div className="card-meta"><span className="card-category">{command.category}</span>{preferences.showPlatform&&<span className="card-platform">{command.platforms.includes('macos')&&command.platforms.includes('linux')?'macOS · Linux':command.platforms.includes('macos')?'macOS':command.platforms.includes('linux')?'Linux':'跨平台'}</span>}</div><div className="card-actions">
      <button type="button" className={`icon-button tiny ${state.isFavorite?'is-active':''}`} title={state.isFavorite?'取消收藏':'收藏'} aria-label={state.isFavorite?'取消收藏':'收藏'} onClick={event=>{event.stopPropagation();onFavorite()}}><Bookmark size={15} fill={state.isFavorite?'currentColor':'none'}/></button>
      <button type="button" className={`icon-button tiny ${state.isPinned?'is-active':''}`} title={state.isPinned?'取消固定':'固定到 Ambient'} aria-label={state.isPinned?'取消固定':'固定到 Ambient'} onClick={event=>{event.stopPropagation();onPin()}}><Pin size={15} fill={state.isPinned?'currentColor':'none'}/></button>
    </div></div>
    <div className="card-main"><div className="command-line"><span className="prompt-char">›</span> {command.command}</div>
      {preferences.showEnglishMeaning&&<div className="meaning-en">{command.meaningEn||'暂无可靠名称来源'}</div>}
      {preferences.showChineseMeaning&&<p className="card-summary">{command.titleZh}</p>}
    </div>
    {flipped ? <div className="card-flip-content"><div className="micro-label">参数拆解</div>{command.flags.length ? command.flags.slice(0,3).map(flag=><div className="mini-flag" key={flag.token}><code>{flag.token}</code><span>{flag.descriptionZh}</span></div>) : <p className="muted">打开详情查看语法和示例。</p>}</div> : <>
      {preferences.showExample&&<code className="card-example">$ {command.examples[0]?.commandLine||command.syntax}</code>}
      {preferences.showFlags&&command.flags.length>0&&<div className="card-flags">{command.flags.slice(0,3).map(flag=><code key={flag.token}>{flag.token}</code>)}</div>}
    </>}
    <div className="card-bottom"><div className="status-chips">
      {state.isFrequent&&<span className="status-chip frequent">常用</span>}
      {state.learningStatus!=='new'&&<span className={`status-chip ${state.learningStatus}`}>{statusLabel(state.learningStatus)}</span>}
      {preferences.showRisk&&command.safety==='high_risk'&&<span className="status-chip risk">谨慎操作</span>}
      {!state.isFrequent&&state.learningStatus==='new'&&command.safety!=='high_risk'&&<span className="muted">尚未标记</span>}
    </div><button type="button" className="icon-button tiny card-open" title="查看详情" aria-label={`查看 ${command.command} 详情`} onClick={event=>{event.stopPropagation();onOpen()}}><ArrowUpRight size={16}/></button></div>
    <button type="button" className="flip-button" onClick={event=>{event.stopPropagation();onFlip()}}>{flipped?'看概览':'看参数'}</button>
  </article>
}
