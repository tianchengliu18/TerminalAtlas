import { useRef, useState } from 'react'
import type { CSSProperties, PointerEvent } from 'react'
import { ArrowLeft, ArrowRight, Pause, Play, Pin, Grip, RotateCw } from 'lucide-react'
import type { AmbientSettings, CommandEntry, UserCommandState } from '../model/types'
import { categories } from '../content/commands'
import { remainingLabel } from '../model/scheduler'

interface Props {
  commands:CommandEntry[]; states:Record<string,UserCommandState>; settings:AmbientSettings; batchIds:string[]
  previousIds:string[]; nextAt:number; now:number; paused:boolean; onSettings:(next:Partial<AmbientSettings>)=>void
  onPause:()=>void; onNext:()=>void; onPrevious:()=>void; onPin:(id:string)=>void; onSelect:(id:string)=>void; onHoverPause:(paused:boolean)=>void
}
export function Ambient({commands,states,settings,batchIds,previousIds,nextAt,now,paused,onSettings,onPause,onNext,onPrevious,onPin,onSelect,onHoverPause}:Props){
  const [hover,setHover]=useState(false)
  const drag=useRef<{startX:number;startY:number;x:number;y:number}|null>(null)
  const batch=batchIds.map(id=>commands.find(command=>command.id===id)).filter((command):command is CommandEntry=>Boolean(command))
  function startDrag(event:PointerEvent<HTMLDivElement>){
    if((event.target as HTMLElement).closest('button'))return
    drag.current={startX:event.clientX,startY:event.clientY,x:settings.x,y:settings.y}
    event.currentTarget.setPointerCapture(event.pointerId)
  }
  function moveDrag(event:PointerEvent<HTMLDivElement>){if(!drag.current)return;onSettings({x:drag.current.x+event.clientX-drag.current.startX,y:drag.current.y+event.clientY-drag.current.startY})}
  function endDrag(){drag.current=null}
  return <div className="ambient-layout">
    <main id="main-content" className="ambient-stage" tabIndex={-1}><div className="stage-heading"><span className="micro-label">Ambient memory</span><h1>在工作间隙，重新遇见。</h1><p>轻轻瞟一眼，命令会逐渐熟悉。拖动面板，在网页里找到舒适的位置。</p></div>
      <div className="ambient-frame" aria-label="Ambient Web Preview 区域"><div className="stage-grid"/><span className="stage-corner-label">Web Preview · 仅在此页面内悬浮</span>
        <div className={`ambient-window ${hover?'is-hovered':''}`} style={{transform:`translate(${settings.x}px, ${settings.y}px)`,width:`min(${settings.width}px, calc(100% - 32px))`,'--widget-opacity':settings.opacity} as CSSProperties} onMouseEnter={()=>{setHover(true);if(settings.pauseOnHover)onHoverPause(true)}} onMouseLeave={()=>{setHover(false);onHoverPause(false)}}>
          <div className="ambient-drag" onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag} aria-label="拖动预览面板"><div className="traffic-lights"><i/><i/><i/></div><span>Terminal Atlas</span><Grip size={15}/></div>
          <div className="ambient-window-content"><div className="ambient-window-heading"><div><span className="micro-label">On your desk</span><h2>今日命令</h2></div><span className="batch-count">{batch.length} / {settings.cardsPerRotation}</span></div>
          <div className={`ambient-card-stack density-${settings.cardDensity}`}>{batch.map(command=>{const state=states[command.id];return <article className="ambient-command" key={command.id}><div className="ambient-command-top"><span className="ambient-category">{command.category}</span><button className={`icon-button tiny ${state?.isPinned?'is-active':''}`} title={state?.isPinned?'取消固定':'固定此命令'} aria-label={`${state?.isPinned?'取消固定':'固定'} ${command.command}`} onClick={()=>onPin(command.id)}><Pin size={14} fill={state?.isPinned?'currentColor':'none'}/></button></div><button className="ambient-command-title" onClick={()=>onSelect(command.id)}><span>{command.command}</span><ArrowRight size={16}/></button>{settings.showEnglish&&<p className="ambient-english">{command.meaningEn||'暂无可靠名称来源'}</p>}{settings.showChinese&&<p className="ambient-chinese">{command.titleZh}</p>}{settings.cardDensity!=='compact'&&settings.showExample&&<code className="ambient-example">$ {command.examples[0]?.commandLine}</code>}{settings.cardDensity!=='compact'&&settings.showFlags&&command.flags.slice(0,settings.cardDensity==='detailed'?3:2).map(flag=><div className="ambient-flag" key={flag.token}><code>{flag.token}</code><span>{flag.descriptionZh}</span></div>)}</article>})}</div>
          {batch.length===0&&<div className="ambient-empty">当前条件下没有命令。调整分类或状态筛选。</div>}
          <div className="ambient-window-footer"><button className="icon-button" onClick={onPrevious} disabled={previousIds.length===0} aria-label="上一批"><ArrowLeft size={17}/></button><div className="timer-display">{settings.showProgress?(paused?'已暂停':hover&&settings.pauseOnHover?'悬停暂停':remainingLabel(now,nextAt)):'环境记忆'}</div><button className="icon-button" onClick={onPause} aria-label={paused?'继续轮换':'暂停轮换'}>{paused?<Play size={17}/>:<Pause size={17}/>}</button><button className="icon-button" onClick={onNext} aria-label="下一批"><ArrowRight size={17}/></button></div>
          </div><div className="ambient-resize"><label>宽度 <input aria-label="预览宽度" type="range" min="320" max="760" value={settings.width} onChange={event=>onSettings({width:Number(event.target.value)})}/></label></div>
        </div>
      </div>
    </main>
    <aside className="ambient-settings"><div className="settings-intro"><span className="micro-label">Display controls</span><h2>让内容按你的节奏出现</h2><p>所有选择只保存在这台浏览器里。</p></div>
      <div className="settings-block"><div className="setting-title"><h3>轮换间隔</h3><span>{settings.rotationMinutes} 分钟</span></div><div className="preset-row">{[1,5,15,28,30,60].map(n=><button key={n} className={settings.rotationMinutes===n?'active':''} onClick={()=>onSettings({rotationMinutes:n})}>{n}</button>)}</div><label className="setting-field">自定义分钟<input type="number" min="1" max="1440" value={settings.rotationMinutes} onChange={event=>{const n=Number(event.target.value);if(Number.isInteger(n)&&n>=1&&n<=1440)onSettings({rotationMinutes:n})}}/></label><p className="setting-hint">修改后从现在重新计算下次轮换。</p></div>
      <div className="settings-block"><div className="setting-title"><h3>每次显示</h3><span>{settings.cardsPerRotation} 张</span></div><input aria-label="每次显示卡片数" type="range" min="1" max="8" value={settings.cardsPerRotation} onChange={event=>onSettings({cardsPerRotation:Number(event.target.value)})}/><div className="range-endpoints"><span>1 张</span><span>8 张</span></div>{Object.values(states).filter(state=>state.isPinned).length>settings.cardsPerRotation&&<p className="setting-hint warning">固定卡片超过展示数量，按命令顺序展示前 {settings.cardsPerRotation} 张。</p>}</div>
      <div className="settings-block"><h3>轮换策略</h3><div className="segmented">{(['weighted','sequential','random'] as const).map(mode=><button key={mode} className={settings.rotationMode===mode?'active':''} onClick={()=>onSettings({rotationMode:mode})}>{mode==='weighted'?'加权复现':mode==='sequential'?'顺序':'随机'}</button>)}</div><p className="setting-hint">总是忘记的命令会更常出现；已熟练的出现更少。</p></div>
      <div className="settings-block two-fields"><label>分类<select value={settings.category} onChange={event=>onSettings({category:event.target.value})}><option value="all">全部分类</option>{categories.map(category=><option key={category}>{category}</option>)}</select></label><label>学习状态<select value={settings.stateFilter} onChange={event=>onSettings({stateFilter:event.target.value as AmbientSettings['stateFilter']})}><option value="all">全部状态</option><option value="frequent">常用</option><option value="forgotten">总是忘记</option><option value="favorites">收藏</option></select></label></div>
      <div className="settings-block"><h3>展示方式</h3><div className="segmented">{(['compact','standard','detailed'] as const).map(density=><button key={density} className={settings.cardDensity===density?'active':''} onClick={()=>onSettings({cardDensity:density})}>{density==='compact'?'精简':density==='standard'?'标准':'详细'}</button>)}</div><div className="switch-list"><label><input type="checkbox" checked={settings.includePinned} onChange={event=>onSettings({includePinned:event.target.checked})}/>优先展示固定卡片</label><label><input type="checkbox" checked={settings.pauseOnHover} onChange={event=>onSettings({pauseOnHover:event.target.checked})}/>悬停时暂停</label><label><input type="checkbox" checked={settings.showProgress} onChange={event=>onSettings({showProgress:event.target.checked})}/>显示倒计时</label></div></div>
      <div className="settings-block"><div className="setting-title"><h3>面板不透明度</h3><span>{Math.round(settings.opacity*100)}%</span></div><input aria-label="面板不透明度" type="range" min="0.72" max="1" step="0.01" value={settings.opacity} onChange={event=>onSettings({opacity:Number(event.target.value)})}/><div className="switch-list compact-switches">{([['showEnglish','英文含义'],['showChinese','中文解释'],['showFlags','参数'],['showExample','示例']] as const).map(([key,label])=><label key={key}><input type="checkbox" checked={settings[key]} onChange={event=>onSettings({[key]:event.target.checked})}/>{label}</label>)}</div></div>
      <button className="next-batch-button" onClick={onNext}><RotateCw size={16}/>立即切换下一批</button>
    </aside>
  </div>
}
