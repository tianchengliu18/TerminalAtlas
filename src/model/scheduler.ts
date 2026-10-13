import type { AmbientSettings, CommandEntry, UserCommandState } from './types'

export function eligibleCommands(commands:CommandEntry[], states:Record<string,UserCommandState>, settings:AmbientSettings): CommandEntry[] {
  return commands.filter(command => (settings.category==='all'||command.category===settings.category) && (
    settings.stateFilter==='all' ||
    settings.stateFilter==='frequent' && states[command.id]?.isFrequent ||
    settings.stateFilter==='forgotten' && states[command.id]?.learningStatus==='often_forgotten' ||
    settings.stateFilter==='favorites' && states[command.id]?.isFavorite
  ))
}
export function commandWeight(state?:UserCommandState, now=Date.now()):number {
  let weight=1
  if(state?.isFrequent) weight*=1.5
  if(state?.learningStatus==='often_forgotten') weight*=3
  if(state?.learningStatus==='mastered') weight*=0.35
  if(state?.lastShownAt) {
    const elapsed=now-new Date(state.lastShownAt).getTime()
    if(elapsed<60*60_000) weight*=0.25
  }
  return weight
}
function weightedPick(items:CommandEntry[], states:Record<string,UserCommandState>, now:number, random:()=>number):number {
  const weights=items.map(item=>commandWeight(states[item.id],now))
  const total=weights.reduce((sum,weight)=>sum+weight,0)
  let point=random()*total
  for(let i=0;i<weights.length;i++){point-=weights[i];if(point<0)return i}
  return weights.length-1
}
export function nextBatch(args:{commands:CommandEntry[];states:Record<string,UserCommandState>;settings:AmbientSettings;previousIds:string[];sequenceIndex:number;now:number;random?:()=>number}):{ids:string[];sequenceIndex:number} {
  const {commands,states,settings,previousIds,now}=args
  const random=args.random??Math.random
  const pool=eligibleCommands(commands,states,settings)
  const count=Math.min(settings.cardsPerRotation,pool.length)
  const pins=settings.includePinned?pool.filter(item=>states[item.id]?.isPinned).slice(0,count):[]
  const selected=[...pins]
  let candidates=pool.filter(item=>!selected.some(p=>p.id===item.id))
  let index=args.sequenceIndex
  while(selected.length<count&&candidates.length){
    const fresh=candidates.filter(item=>!previousIds.includes(item.id))
    const choicePool=fresh.length?fresh:candidates
    let chosen:CommandEntry
    if(settings.rotationMode==='sequential') {
      const ordered=pool.filter(item=>choicePool.some(candidate=>candidate.id===item.id))
      chosen=ordered.find(item=>pool.indexOf(item)>=index%pool.length)??ordered[0]
      index=pool.indexOf(chosen)+1
    } else if(settings.rotationMode==='random') chosen=choicePool[Math.floor(random()*choicePool.length)]
    else chosen=choicePool[weightedPick(choicePool,states,now,random)]
    selected.push(chosen)
    candidates=candidates.filter(item=>item.id!==chosen.id)
  }
  return {ids:selected.map(item=>item.id),sequenceIndex:index}
}
export function nextRotationAt(now:number, minutes:number):number {return now+minutes*60_000}
export function dueForRotation(now:number, nextAt:number, paused:boolean):boolean {return !paused&&now>=nextAt}
export function remainingLabel(now:number,nextAt:number):string {
  const seconds=Math.max(0,Math.ceil((nextAt-now)/1000))
  return `${Math.floor(seconds/60).toString().padStart(2,'0')}:${(seconds%60).toString().padStart(2,'0')}`
}
