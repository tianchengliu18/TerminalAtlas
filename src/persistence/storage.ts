import { openDB } from 'idb'
import { defaultAmbient, defaultPreferences, initialData, stateFor } from '../model/state'
import type { AmbientSettings, CommandEntry, PersonalData, Preferences, UserCommandState } from '../model/types'

const DB='terminal-atlas'
const KEY='personal-data'
const dbPromise = typeof indexedDB === 'undefined' ? null : openDB(DB,2,{upgrade(db){if(!db.objectStoreNames.contains('app'))db.createObjectStore('app')}})

function object(value:unknown):value is Record<string,unknown>{return typeof value==='object'&&value!==null&&!Array.isArray(value)}
function strings(value:unknown):value is string[]{return Array.isArray(value)&&value.every(x=>typeof x==='string')}
function validState(value:unknown):value is UserCommandState {
  return object(value)&&typeof value.commandId==='string'&&typeof value.isFrequent==='boolean'&&
    ['new','mastered','often_forgotten'].includes(String(value.learningStatus))&&typeof value.isFavorite==='boolean'&&typeof value.isPinned==='boolean'&&
    typeof value.notesMarkdown==='string'&&typeof value.timesShown==='number'&&Number.isFinite(value.timesShown)
}
function validEntry(value:unknown):value is CommandEntry {
  return object(value)&&typeof value.id==='string'&&typeof value.command==='string'&&typeof value.titleZh==='string'&&
    typeof value.summaryZh==='string'&&typeof value.syntax==='string'&&typeof value.category==='string'&&
    strings(value.tags)&&strings(value.searchAliasesZh)&&strings(value.platforms)&&strings(value.relatedCommandIds)&&
    ['read_only','modifies_data','high_risk'].includes(String(value.safety))&&
    Array.isArray(value.flags)&&value.flags.every((flag:unknown)=>object(flag)&&typeof flag.token==='string'&&typeof flag.descriptionZh==='string')&&
    Array.isArray(value.combinations)&&value.combinations.every((combo:unknown)=>object(combo)&&typeof combo.expression==='string'&&typeof combo.explanationZh==='string'&&strings(combo.tokens))&&
    Array.isArray(value.examples)&&value.examples.every((example:unknown)=>object(example)&&typeof example.commandLine==='string'&&typeof example.titleZh==='string'&&typeof example.explanationZh==='string'&&strings(example.platforms)&&['read_only','modifies_data','high_risk'].includes(String(example.safety)))&&
    typeof value.markdownBody==='string'&&object(value.source)&&typeof value.source.license==='string'&&['original','tldr-pages','user'].includes(String(value.source.provider))
}
function clampInt(value:unknown,fallback:number,min:number,max:number):number {
  const number=Number(value)
  return Number.isInteger(number)?Math.max(min,Math.min(max,number)):fallback
}
export function validateData(raw:unknown, now=Date.now()):PersonalData {
  if(!object(raw)||![1,2].includes(Number(raw.version))) throw new Error('备份版本不受支持或文件格式无效')
  const defaults=initialData(now)
  const states:Record<string,UserCommandState>={}
  if(object(raw.states)) for(const [id,value] of Object.entries(raw.states)){
    const migrated=raw.version===1&&object(value)?{...stateFor(id),...value}:value
    if(!validState(migrated)||id!==migrated.commandId)throw new Error(`备份中的命令状态无效：${id}`)
    states[id]=migrated
  }
  const overrides:Record<string,CommandEntry>={}
  if(object(raw.overrides)) for(const [id,value] of Object.entries(raw.overrides)){if(!validEntry(value)||id!==value.id)throw new Error(`备份中的命令解释无效：${id}`);overrides[id]=value}
  const customCommands:Record<string,CommandEntry>={}
  if(object(raw.customCommands)) for(const [id,value] of Object.entries(raw.customCommands)){if(!validEntry(value)||id!==value.id)throw new Error(`备份中的自定义命令无效：${id}`);customCommands[id]=value}
  const ambientRaw=object(raw.ambient)?raw.ambient:{}
  const preferencesRaw=object(raw.preferences)?raw.preferences:{}
  const ambient={...defaultAmbient} as AmbientSettings
  for(const key of ['category','stateFilter','rotationMode','cardDensity'] as const)if(typeof ambientRaw[key]==='string')(ambient as unknown as Record<string,unknown>)[key]=ambientRaw[key]
  for(const key of ['pauseOnHover','showProgress','showEnglish','showChinese','showFlags','showExample','autoStart','includePinned'] as const)if(typeof ambientRaw[key]==='boolean')ambient[key]=ambientRaw[key]
  ambient.rotationMinutes=clampInt(ambientRaw.rotationMinutes,28,1,1440)
  ambient.cardsPerRotation=clampInt(ambientRaw.cardsPerRotation,3,1,8)
  ambient.width=clampInt(ambientRaw.width,440,320,900)
  ambient.x=clampInt(ambientRaw.x,0,-2000,2000)
  ambient.y=clampInt(ambientRaw.y,0,-2000,2000)
  ambient.opacity=typeof ambientRaw.opacity==='number'?Math.max(.72,Math.min(1,ambientRaw.opacity)):.92
  if(!['weighted','sequential','random'].includes(ambient.rotationMode))ambient.rotationMode='weighted'
  if(!['all','frequent','forgotten','favorites'].includes(ambient.stateFilter))ambient.stateFilter='all'
  const preferences={...defaultPreferences} as Preferences
  if(typeof preferencesRaw.theme==='string')preferences.theme=preferencesRaw.theme as Preferences['theme']
  for(const key of ['reducedTransparency','highContrast','showEnglishMeaning','showChineseMeaning','showFlags','showExample','showPlatform','showRisk'] as const)if(typeof preferencesRaw[key]==='boolean')preferences[key]=preferencesRaw[key]
  if(!['frost','midnight','graphite','paper','terminal'].includes(preferences.theme))preferences.theme='frost'
  return {...defaults,states,overrides,customCommands,ambient,preferences,
    batchIds:Array.isArray(raw.batchIds)?raw.batchIds.filter(x=>typeof x==='string'):[],
    previousBatchIds:Array.isArray(raw.previousBatchIds)?raw.previousBatchIds.filter(x=>typeof x==='string'):[],
    nextRotationAt:typeof raw.nextRotationAt==='number'&&Number.isFinite(raw.nextRotationAt)?raw.nextRotationAt:defaults.nextRotationAt,
    sequenceIndex:clampInt(raw.sequenceIndex,0,0,1000000)}
}
export async function loadData():Promise<PersonalData>{
  if(!dbPromise)return initialData()
  try {const raw=await (await dbPromise).get('app',KEY);return raw?validateData(raw):initialData()}
  catch {return initialData()}
}
export async function saveData(data:PersonalData):Promise<void>{if(dbPromise)await (await dbPromise).put('app',data,KEY)}
export function downloadBackup(data:PersonalData):void {
  const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}))
  const link=document.createElement('a');link.href=url;link.download='terminal-atlas-backup.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000)
}
