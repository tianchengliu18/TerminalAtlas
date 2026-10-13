import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { BookOpen, Layers3, Search, Settings2, Keyboard, Plus, Moon, Sun, Download, Upload, X, ChevronRight, PanelRightOpen, SlidersHorizontal, Sparkles } from 'lucide-react'
import { baseCommands, categories } from './content/commands'
import { CommandCard } from './components/CommandCard'
import { Inspector } from './components/Inspector'
import { Editor } from './components/Editor'
import { Ambient } from './components/Ambient'
import { changeLearning, initialData, mergedCommands, stateFor, themes } from './model/state'
import { searchCommands } from './model/search'
import { shortcutAllowed } from './model/keyboard'
import { dueForRotation, eligibleCommands, nextBatch, nextRotationAt } from './model/scheduler'
import { downloadBackup, loadData, saveData, validateData } from './persistence/storage'
import type { AmbientSettings, CommandEntry, PersonalData, Theme, UserCommandState } from './model/types'

type Mode='handbook'|'ambient'
type Filter='all'|'favorites'|'frequent'|'mastered'|'forgotten'|'pinned'
function routeMode():Mode{return location.pathname.startsWith('/ambient')?'ambient':'handbook'}
function routeCommand():string{return location.pathname.startsWith('/handbook/')?decodeURIComponent(location.pathname.slice('/handbook/'.length)): 'ls'}
function newCommand():CommandEntry {return {id:'',command:'',meaningEn:'',titleZh:'',summaryZh:'',syntax:'',category:'Shell',tags:[],searchAliasesZh:[],platforms:['macos','linux'],safety:'read_only',flags:[],combinations:[],examples:[],relatedCommandIds:[],markdownBody:'',source:{provider:'user',license:'user-owned',modified:false}}}
function filterLabel(filter:Filter):string{return ({all:'全部命令',favorites:'收藏',frequent:'常用',mastered:'已熟练',forgotten:'总是忘记',pinned:'Ambient 固定'} as const)[filter]}

export default function App(){
  const [data,setData]=useState<PersonalData>(()=>initialData())
  const [loaded,setLoaded]=useState(false)
  const [mode,setMode]=useState<Mode>(routeMode)
  const [query,setQuery]=useState('')
  const [category,setCategory]=useState('all')
  const [filter,setFilter]=useState<Filter>('all')
  const [selectedId,setSelectedId]=useState(routeCommand)
  const [flipped,setFlipped]=useState<Record<string,boolean>>({})
  const [drawer,setDrawer]=useState(false)
  const [editor,setEditor]=useState<CommandEntry|null>(null)
  const [isCreating,setIsCreating]=useState(false)
  const [help,setHelp]=useState(false)
  const [settingsOpen,setSettingsOpen]=useState(false)
  const [notice,setNotice]=useState('')
  const [paused,setPaused]=useState(false)
  const [hoverPause,setHoverPause]=useState(false)
  const [now,setNow]=useState(Date.now())
  const [mobileNav,setMobileNav]=useState(false)
  const searchRef=useRef<HTMLInputElement>(null)
  const importRef=useRef<HTMLInputElement>(null)
  const cardRefs=useRef<Record<string,HTMLElement|null>>({})
  const gridRef=useRef<HTMLDivElement>(null)
  const noticeTimer=useRef<ReturnType<typeof setTimeout>|null>(null)
  const saveTimer=useRef<ReturnType<typeof setTimeout>|null>(null)

  useEffect(()=>{let active=true;loadData().then(saved=>{if(active){setData(saved);setPaused(!saved.ambient.autoStart);setLoaded(true)}});return()=>{active=false}},[])
  useEffect(()=>{if(!loaded)return;if(saveTimer.current)clearTimeout(saveTimer.current);saveTimer.current=setTimeout(()=>{void saveData(data)},160);return()=>{if(saveTimer.current)clearTimeout(saveTimer.current)}},[data,loaded])
  useEffect(()=>{document.documentElement.dataset.theme=data.preferences.theme;document.documentElement.dataset.contrast=data.preferences.highContrast?'high':'normal';document.documentElement.dataset.solid=data.preferences.reducedTransparency?'true':'false';document.querySelector('meta[name="theme-color"]')?.setAttribute('content',['midnight','graphite','terminal'].includes(data.preferences.theme)?'#121c27':'#e9eff3')},[data.preferences])
  useEffect(()=>{
    if(!editor&&!help&&!settingsOpen)return
    const previous=document.activeElement as HTMLElement|null
    const dialog=document.querySelector<HTMLElement>('.modal-backdrop [role="dialog"]')
    if(!editor)dialog?.querySelector<HTMLElement>('button')?.focus()
    function trap(event:KeyboardEvent){
      if(event.key!=='Tab'||!dialog)return
      const items=[...dialog.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled),textarea:not(:disabled),select:not(:disabled),a[href]')]
      if(!items.length)return
      const first=items[0],last=items[items.length-1]
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
    }
    document.addEventListener('keydown',trap)
    return()=>{document.removeEventListener('keydown',trap);previous?.focus()}
  },[editor,help,settingsOpen])
  useEffect(()=>{const timer=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(timer)},[])
  useEffect(()=>{const onPop=()=>{setMode(routeMode());setSelectedId(routeCommand())};window.addEventListener('popstate',onPop);return()=>window.removeEventListener('popstate',onPop)},[])
  useEffect(()=>{if(mode==='handbook'&&selectedId&&location.pathname!==`/handbook/${encodeURIComponent(selectedId)}`)history.replaceState({},'',`/handbook/${encodeURIComponent(selectedId)}`)},[mode,selectedId])
  function toast(message:string){setNotice(message);if(noticeTimer.current)clearTimeout(noticeTimer.current);noticeTimer.current=setTimeout(()=>setNotice(''),3300)}
  function navigate(next:Mode){setMode(next);history.pushState({},'',`/${next}`);setDrawer(false);setMobileNav(false)}
  const commands=useMemo(()=>mergedCommands(data,baseCommands),[data.overrides,data.customCommands])
  const commandMap=useMemo(()=>new Map(commands.map(command=>[command.id,command])),[commands])
  const searched=useMemo(()=>searchCommands(commands,query,data.states),[commands,query,data.states])
  const visible=useMemo(()=>searched.filter(command=>(category==='all'||command.category===category)&&(
    filter==='all'||filter==='favorites'&&data.states[command.id]?.isFavorite||filter==='frequent'&&data.states[command.id]?.isFrequent||filter==='mastered'&&data.states[command.id]?.learningStatus==='mastered'||filter==='forgotten'&&data.states[command.id]?.learningStatus==='often_forgotten'||filter==='pinned'&&data.states[command.id]?.isPinned
  )),[searched,category,filter,data.states])
  const effectiveSelected=visible.some(command=>command.id===selectedId)?selectedId:visible[0]?.id??''
  const selected=commandMap.get(effectiveSelected)??null
  const selectedState=selected?stateFor(selected.id,data.states[selected.id]):null

  const rotate=useCallback(()=>{
    const time=Date.now(),shownAt=new Date(time).toISOString()
    setData(old=>{
      const result=nextBatch({commands:mergedCommands(old,baseCommands),states:old.states,settings:old.ambient,previousIds:old.batchIds,sequenceIndex:old.sequenceIndex,now:time})
      return {...old,batchIds:result.ids,previousBatchIds:old.batchIds,sequenceIndex:result.sequenceIndex,
        nextRotationAt:nextRotationAt(time,old.ambient.rotationMinutes),states:{...old.states,...Object.fromEntries(result.ids.map(id=>{const state=stateFor(id,old.states[id]);return [id,{...state,timesShown:state.timesShown+1,lastShownAt:shownAt}]}))}}
    })
  },[])
  useEffect(()=>{if(!loaded)return;if(data.batchIds.length===0){rotate();return}if(dueForRotation(now,data.nextRotationAt,paused||hoverPause)&&mode==='ambient')rotate()},[loaded,now,data.batchIds.length,data.nextRotationAt,paused,hoverPause,mode,rotate])
  function updateState(id:string,transform:(state:UserCommandState)=>UserCommandState){setData(old=>({...old,states:{...old.states,[id]:transform(stateFor(id,old.states[id]))}}))}
  function mark(key:'1'|'2'|'3'|'0',id=effectiveSelected){if(!id)return;updateState(id,state=>changeLearning(state,key));toast(key==='0'?'学习标记已清除':key==='3'?'已标记：总是忘记 · 将更频繁出现':key==='2'?'已标记：已熟练':`常用标记已切换`)}
  function toggleFavorite(id=effectiveSelected){if(!id)return;updateState(id,state=>({...state,isFavorite:!state.isFavorite,updatedAt:new Date().toISOString()}));toast('收藏状态已更新')}
  function togglePin(id=effectiveSelected){if(!id)return;updateState(id,state=>({...state,isPinned:!state.isPinned,updatedAt:new Date().toISOString()}));toast('Ambient 固定状态已更新')}
  async function copy(text:string){try{await navigator.clipboard.writeText(text);toast('已复制到剪贴板')}catch{toast('复制失败，请手动选择文本')}}
  function openSelected(){if(!selected)return;setDrawer(true);if(window.innerWidth<=1190)requestAnimationFrame(()=>document.querySelector<HTMLElement>('.inspector-drawer .icon-button')?.focus())}
  function choose(id:string){setSelectedId(id);if(window.innerWidth>1190)setDrawer(false)}
  function chooseRelated(id:string){setCategory('all');setFilter('all');setQuery('');setSelectedId(id);setDrawer(true);requestAnimationFrame(()=>cardRefs.current[id]?.scrollIntoView({block:'nearest'}))}
  function updateAmbient(patch:Partial<AmbientSettings>){
    const placementOnly=Object.keys(patch).every(key=>['x','y','width','opacity'].includes(key))
    const time=Date.now(),refreshBatch='category'in patch||'stateFilter'in patch||'cardsPerRotation'in patch
    setData(old=>{
      const ambient={...old.ambient,...patch}
      if(!refreshBatch)return {...old,ambient,nextRotationAt:placementOnly?old.nextRotationAt:nextRotationAt(time,ambient.rotationMinutes)}
      const result=nextBatch({commands:mergedCommands(old,baseCommands),states:old.states,settings:ambient,previousIds:old.batchIds,sequenceIndex:old.sequenceIndex,now:time})
      return {...old,ambient,batchIds:result.ids,previousBatchIds:old.batchIds,sequenceIndex:result.sequenceIndex,nextRotationAt:nextRotationAt(time,ambient.rotationMinutes)}
    })
    if(!placementOnly)toast('设置已保存，下次轮换已重新计时')
  }
  function previousBatch(){if(!data.previousBatchIds.length)return;const time=Date.now();setData(old=>({...old,batchIds:old.previousBatchIds,previousBatchIds:old.batchIds,nextRotationAt:nextRotationAt(time,old.ambient.rotationMinutes),states:{...old.states,...Object.fromEntries(old.previousBatchIds.map(id=>{const state=stateFor(id,old.states[id]);return [id,{...state,timesShown:state.timesShown+1,lastShownAt:new Date(time).toISOString()}]}))}}))}
  function saveEdit(entry:CommandEntry){if(isCreating&&commandMap.has(entry.id)){toast('命令已存在，请换一个名称');return}setData(old=>({...old,[isCreating?'customCommands':'overrides']:{...(isCreating?old.customCommands:old.overrides),[entry.id]:entry}}));setSelectedId(entry.id);setEditor(null);setIsCreating(false);toast('修改已保存到本机')}
  function startCreate(){setIsCreating(true);setEditor(newCommand())}
  async function importBackup(file:File){try{const parsed=validateData(JSON.parse(await file.text()));if(window.confirm('导入备份会替换当前浏览器中的标记、笔记、编辑内容和设置。确定继续吗？')){setData(parsed);setPaused(!parsed.ambient.autoStart);toast('备份已导入')}}catch(error){toast(error instanceof Error?error.message:'导入失败：文件格式无效')}if(importRef.current)importRef.current.value=''}
  function gridMove(key:string){if(!visible.length)return;const current=Math.max(0,visible.findIndex(item=>item.id===effectiveSelected));const columns=gridRef.current?Math.max(1,getComputedStyle(gridRef.current).gridTemplateColumns.split(' ').length):1;const delta=key==='ArrowLeft'?-1:key==='ArrowRight'?1:key==='ArrowUp'?-columns:columns;const next=Math.max(0,Math.min(visible.length-1,current+delta));const id=visible[next].id;setSelectedId(id);requestAnimationFrame(()=>{cardRefs.current[id]?.focus({preventScroll:true});cardRefs.current[id]?.scrollIntoView({block:'nearest',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})})}
  useEffect(()=>{
    const handler=(event:KeyboardEvent)=>{
      if(event.isComposing||event.key==='Process'||event.metaKey||event.ctrlKey||event.altKey)return
      if(event.key==='Escape'){if(editor){setEditor(null);return}if(help){setHelp(false);return}if(settingsOpen){setSettingsOpen(false);return}if(drawer){setDrawer(false);cardRefs.current[effectiveSelected]?.focus();return}if(mobileNav){setMobileNav(false);return}return}
      if(!shortcutAllowed(event)||mode!=='handbook')return
      if(event.key==='/'||event.key.toLowerCase()==='k'&&event.metaKey){event.preventDefault();searchRef.current?.focus();return}
      if(event.key==='?'){event.preventDefault();setHelp(true);return}
      if(event.key.startsWith('Arrow')){event.preventDefault();gridMove(event.key);return}
      if(['1','2','3','0'].includes(event.key)){event.preventDefault();mark(event.key as '1'|'2'|'3'|'0');return}
      if(event.key==='Enter'){if((event.target as HTMLElement)?.closest('button,a'))return;event.preventDefault();openSelected();return}
      if(event.key===' '){if((event.target as HTMLElement)?.closest('button,a'))return;event.preventDefault();setFlipped(old=>({...old,[effectiveSelected]:!old[effectiveSelected]}));return}
      if(event.key.toLowerCase()==='f'){event.preventDefault();toggleFavorite();return}
      if(event.key.toLowerCase()==='p'){event.preventDefault();togglePin();return}
      if(event.key.toLowerCase()==='c'&&selected?.examples[0]){event.preventDefault();void copy(selected.examples[0].commandLine)}
    }
    window.addEventListener('keydown',handler);return()=>window.removeEventListener('keydown',handler)
  })
  useEffect(()=>{const handler=(event:KeyboardEvent)=>{if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==='k'){event.preventDefault();navigate('handbook');requestAnimationFrame(()=>searchRef.current?.focus())}};window.addEventListener('keydown',handler);return()=>window.removeEventListener('keydown',handler)},[])

  const pool=eligibleCommands(commands,data.states,data.ambient)
  return <div className="app-shell"><a className="skip-link" href="#main-content">跳转到主要内容</a><header className="topbar"><div className="brand"><div className="brand-mark"><Layers3 size={20}/></div><div><strong>Terminal Atlas</strong><span>Ambient Terminal Handbook</span></div></div><nav className="mode-tabs" aria-label="主要模式"><button className={mode==='handbook'?'active':''} onClick={()=>navigate('handbook')}><BookOpen size={17}/>Handbook</button><button className={mode==='ambient'?'active':''} onClick={()=>navigate('ambient')}><Sparkles size={17}/>Ambient</button></nav><div className="top-actions"><button className="icon-button mobile-menu" title="打开资料库" aria-label="打开资料库" onClick={()=>setMobileNav(true)}><SlidersHorizontal size={19}/></button><button className="icon-button" title="切换明暗主题" aria-label="切换明暗主题" onClick={()=>setData(old=>({...old,preferences:{...old.preferences,theme:old.preferences.theme==='frost'?'midnight':'frost'}}))}>{data.preferences.theme==='frost'||data.preferences.theme==='paper'?<Moon size={18}/>:<Sun size={18}/>}</button><button className="icon-button" title="主题与数据设置" aria-label="主题与数据设置" onClick={()=>setSettingsOpen(true)}><Settings2 size={18}/></button><button className="icon-button" title="键盘快捷键" aria-label="键盘快捷键" onClick={()=>setHelp(true)}><Keyboard size={18}/></button></div></header>
    {mode==='handbook'?<div className="handbook-layout"><aside className={`library ${mobileNav?'mobile-open':''}`}><div className="library-heading"><span className="micro-label">Library</span><button className="icon-button mobile-close" aria-label="关闭资料库" onClick={()=>setMobileNav(false)}><X size={18}/></button></div><div className="library-section"><div className="library-section-title">浏览</div><button className={`library-link ${category==='all'&&filter==='all'?'active':''}`} onClick={()=>{setCategory('all');setFilter('all');setMobileNav(false)}}><span>全部命令</span><small>{commands.length}</small></button>{categories.map(cat=><button key={cat} className={`library-link ${category===cat?'active':''}`} onClick={()=>{setCategory(cat);setFilter('all');setMobileNav(false)}}><span>{cat}</span><small>{commands.filter(c=>c.category===cat).length}</small></button>)}</div><div className="library-section"><div className="library-section-title">我的标记</div>{(['favorites','frequent','mastered','forgotten','pinned'] as Filter[]).map(item=><button key={item} className={`library-link ${filter===item?'active':''}`} onClick={()=>{setCategory('all');setFilter(item);setMobileNav(false)}}><span>{filterLabel(item)}</span><small>{commands.filter(c=>item==='favorites'?data.states[c.id]?.isFavorite:item==='frequent'?data.states[c.id]?.isFrequent:item==='mastered'?data.states[c.id]?.learningStatus==='mastered':item==='forgotten'?data.states[c.id]?.learningStatus==='often_forgotten':data.states[c.id]?.isPinned).length}</small></button>)}</div><div className="library-footer"><button className="library-create" onClick={startCreate}><Plus size={17}/>添加自己的命令</button><span>资料与标记保存在本机</span></div></aside>
    <main id="main-content" className="handbook-main" tabIndex={-1}><div className="main-heading"><div><span className="micro-label">Your field guide</span><h1>命令，一眼就懂。</h1><p>从一张卡开始，慢慢熟悉你的终端。</p></div><button className="new-command-button" onClick={startCreate}><Plus size={16}/>添加命令</button></div><div className="search-toolbar"><div className="search-box"><Search size={18}/><input ref={searchRef} aria-label="搜索命令或用途" placeholder="搜索命令、中文用途或参数，例如 ls -lah" value={query} onChange={event=>setQuery(event.target.value)}/>{query?<button className="icon-button tiny" aria-label="清空搜索" onClick={()=>setQuery('')}><X size={15}/></button>:<kbd>⌘ K</kbd>}</div><button className="filter-indicator" onClick={()=>{setCategory('all');setFilter('all')}} title="清除分类和状态筛选">{category==='all'?filterLabel(filter):category}<ChevronRight size={14}/></button></div><div className="grid-meta"><span>{visible.length} 条命令 <span className="meta-divider">·</span> macOS / Linux</span><button className="inspector-toggle" onClick={()=>setDrawer(true)} disabled={!selected}><PanelRightOpen size={17}/>详情</button></div><div className="grid-scroll"><div className="command-grid" ref={gridRef}>{visible.map(command=><CommandCard key={command.id} command={command} state={stateFor(command.id,data.states[command.id])} preferences={data.preferences} selected={command.id===effectiveSelected} flipped={!!flipped[command.id]} elementRef={element=>{cardRefs.current[command.id]=element}} onSelect={()=>choose(command.id)} onOpen={()=>{choose(command.id);setDrawer(true)}} onFavorite={()=>toggleFavorite(command.id)} onPin={()=>togglePin(command.id)} onFlip={()=>setFlipped(old=>({...old,[command.id]:!old[command.id]}))}/>)}</div>{visible.length===0&&<div className="empty-results"><Search size={26}/><h2>没有找到对应命令</h2><p>试试命令名、中文用途，或清除当前筛选。</p><button className="secondary-button" onClick={()=>{setQuery('');setCategory('all');setFilter('all')}}>显示全部命令</button></div>}</div><div className="shortcut-bar"><span><kbd>↑ ↓ ← →</kbd> 切换卡片</span><span><kbd>1</kbd> 常用</span><span><kbd>2</kbd> 熟练</span><span><kbd>3</kbd> 总忘</span><span><kbd>Space</kbd> 翻面</span><button onClick={()=>setHelp(true)}>全部快捷键</button></div></main>
    <Inspector command={selected} state={selectedState} drawer={drawer} onClose={()=>setDrawer(false)} onMark={key=>mark(key)} onFavorite={()=>toggleFavorite()} onPin={()=>togglePin()} onCopy={text=>void copy(text)} onEdit={()=>{if(selected){setIsCreating(false);setEditor(selected)}}} onNotes={text=>{if(selected)updateState(selected.id,state=>({...state,notesMarkdown:text,updatedAt:new Date().toISOString()}))}} onSelectRelated={chooseRelated}/>
    </div>:<Ambient commands={commands} states={data.states} settings={data.ambient} batchIds={data.batchIds} previousIds={data.previousBatchIds} nextAt={data.nextRotationAt} now={now} paused={paused} onSettings={updateAmbient} onPause={()=>{const next=!paused;setPaused(next);setData(old=>({...old,ambient:{...old.ambient,autoStart:!next},nextRotationAt:nextRotationAt(Date.now(),old.ambient.rotationMinutes)}))}} onNext={()=>rotate()} onPrevious={previousBatch} onPin={togglePin} onSelect={id=>{navigate('handbook');chooseRelated(id)}} onHoverPause={value=>{setHoverPause(value);if(!value)setData(old=>({...old,nextRotationAt:nextRotationAt(Date.now(),old.ambient.rotationMinutes)}))}}/>}
    {drawer&&mode==='handbook'&&<div className="drawer-scrim" onClick={()=>setDrawer(false)}/>}
    {editor&&<Editor key={`${editor.id}-${isCreating}`} command={editor} isNew={isCreating} onClose={()=>{setEditor(null);setIsCreating(false)}} onSave={saveEdit}/>}
    {help&&<div className="modal-backdrop" onMouseDown={event=>{if(event.target===event.currentTarget)setHelp(false)}}><section className="help-modal" role="dialog" aria-modal="true" aria-labelledby="help-title" onKeyDown={event=>{if(event.key==='Escape')setHelp(false)}}><div className="modal-heading"><div><span className="micro-label">Keyboard guide</span><h2 id="help-title">快捷键</h2></div><button className="icon-button" onClick={()=>setHelp(false)} aria-label="关闭快捷键帮助"><X size={18}/></button></div><div className="shortcut-list">{[['↑ ↓ ← →','在网格中移动'],['1','切换常用'],['2','切换已熟练'],['3','切换总是忘记'],['0','清除学习标记'],['Enter','打开详情'],['Space','翻看参数'],['F','收藏'],['P','固定到 Ambient'],['C','复制示例'],['/ 或 ⌘K','搜索'],['?','打开本帮助'],['Esc','关闭弹层']].map(([key,label])=><div key={key}><kbd>{key}</kbd><span>{label}</span></div>)}</div><p className="muted">编辑文字或输入法组合输入时，卡片快捷键不会触发。</p></section></div>}
    {settingsOpen&&<div className="modal-backdrop" onMouseDown={event=>{if(event.target===event.currentTarget)setSettingsOpen(false)}}><section className="settings-modal" role="dialog" aria-modal="true" aria-labelledby="settings-title" onKeyDown={event=>{if(event.key==='Escape')setSettingsOpen(false)}}><div className="modal-heading"><div><span className="micro-label">Preferences</span><h2 id="settings-title">外观与数据</h2></div><button className="icon-button" onClick={()=>setSettingsOpen(false)} aria-label="关闭设置"><X size={18}/></button></div><h3>主题</h3><div className="theme-grid">{themes.map(theme=><button key={theme.id} className={`theme-option theme-${theme.id} ${data.preferences.theme===theme.id?'active':''}`} onClick={()=>setData(old=>({...old,preferences:{...old.preferences,theme:theme.id as Theme}}))}><span className="theme-swatch"/><strong>{theme.label}</strong><small>{theme.short}</small></button>)}</div><div className="switch-list"><label><input type="checkbox" checked={data.preferences.highContrast} onChange={event=>setData(old=>({...old,preferences:{...old.preferences,highContrast:event.target.checked}}))}/>提高对比度</label><label><input type="checkbox" checked={data.preferences.reducedTransparency} onChange={event=>setData(old=>({...old,preferences:{...old.preferences,reducedTransparency:event.target.checked}}))}/>减少透明效果</label></div><h3>卡片内容</h3><div className="switch-list compact-switches">{([['showEnglishMeaning','英文含义'],['showChineseMeaning','中文解释'],['showFlags','参数'],['showExample','示例'],['showPlatform','平台'],['showRisk','风险']] as const).map(([key,label])=><label key={key}><input type="checkbox" checked={data.preferences[key]} onChange={event=>setData(old=>({...old,preferences:{...old.preferences,[key]:event.target.checked}}))}/>{label}</label>)}</div><h3>本机数据</h3><div className="data-actions"><button className="secondary-button" onClick={()=>downloadBackup(data)}><Download size={16}/>导出 JSON 备份</button><button className="secondary-button" onClick={()=>importRef.current?.click()}><Upload size={16}/>导入 JSON 备份</button><input ref={importRef} className="sr-only" type="file" accept="application/json,.json" onChange={event=>{const file=event.target.files?.[0];if(file)void importBackup(file)}}/></div><p className="setting-hint">导入会替换当前本机数据。请先导出备份。</p><h3>Sources & Credits</h3><p className="setting-hint">当前内置命令为 Terminal Atlas 原创策展内容。详见 <a href="https://github.com/tianchengliu18/TerminalAtlas/blob/main/docs/ATTRIBUTION.md" target="_blank" rel="noopener noreferrer">来源与许可说明 ↗</a>。示例仅供学习，不会执行。</p><p className="setting-hint">Ambient 是 Web Preview，只能悬浮在此页面。后台标签页计时可能被浏览器限速；回到页面时按真实时间只补一次轮换。</p></section></div>}
    {notice&&<div className="toast" role="status" aria-live="polite">{notice}</div>}
    <span className="sr-only" aria-live="polite">{selected?`已选中 ${selected.command}，${selected.titleZh}`:''}</span>
    <span className="sr-only">当前 Ambient 候选 {pool.length} 条</span>
  </div>
}
