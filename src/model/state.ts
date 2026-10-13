import type { AmbientSettings, CommandEntry, LearningStatus, PersonalData, Preferences, Theme, UserCommandState } from './types'

export const themes: {id: Theme; label: string; short: string}[] = [
  {id:'frost',label:'Cupertino Frost',short:'浅色玻璃'},
  {id:'midnight',label:'Midnight Glass',short:'深色玻璃'},
  {id:'graphite',label:'Graphite Pro',short:'极简石墨'},
  {id:'paper',label:'Paper Notes',short:'暖纸笔记'},
  {id:'terminal',label:'Terminal Green',short:'终端绿'},
]

export const defaultAmbient: AmbientSettings = {
  rotationMinutes:28, cardsPerRotation:3, rotationMode:'weighted', category:'all', stateFilter:'all',
  cardDensity:'standard', pauseOnHover:true, showProgress:true, opacity:0.92,
  showEnglish:true, showChinese:true, showFlags:true, showExample:true,
  autoStart:true, includePinned:true, x:0, y:0, width:440,
}
export const defaultPreferences: Preferences = {
  theme:'frost',reducedTransparency:false,highContrast:false,
  showEnglishMeaning:true,showChineseMeaning:true,showFlags:true,showExample:true,showPlatform:true,showRisk:true,
}
export function initialData(now = Date.now()): PersonalData {
  return {version:2,states:{},overrides:{},customCommands:{},ambient:{...defaultAmbient},preferences:{...defaultPreferences},batchIds:[],previousBatchIds:[],nextRotationAt:now+28*60_000,sequenceIndex:0}
}
export function stateFor(id:string, state?:UserCommandState): UserCommandState {
  return state ?? {commandId:id,isFrequent:false,learningStatus:'new',isFavorite:false,isPinned:false,timesShown:0,notesMarkdown:'',updatedAt:new Date(0).toISOString()}
}
export function changeLearning(state:UserCommandState, key:'1'|'2'|'3'|'0', now = new Date().toISOString()): UserCommandState {
  const next = {...state,updatedAt:now}
  if (key==='1') next.isFrequent = !state.isFrequent
  if (key==='2') next.learningStatus = state.learningStatus === 'mastered' ? 'new' : 'mastered'
  if (key==='3') next.learningStatus = state.learningStatus === 'often_forgotten' ? 'new' : 'often_forgotten'
  if (key==='0') {next.isFrequent=false;next.learningStatus='new'}
  return next
}
export function statusLabel(status:LearningStatus): string {
  return status==='mastered'?'已熟练':status==='often_forgotten'?'总是忘记':'未标记'
}
export function mergedCommands(data:PersonalData, base:CommandEntry[]): CommandEntry[] {
  return [...base.map(command => data.overrides[command.id] ?? command), ...Object.values(data.customCommands)]
}
