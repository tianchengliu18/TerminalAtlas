import { describe, expect, it } from 'vitest'
import { baseCommands } from '../content/commands'
import { changeLearning, defaultAmbient, initialData, stateFor } from './state'
import { searchCommands } from './search'
import { commandWeight, dueForRotation, nextBatch, nextRotationAt } from './scheduler'
import { validateData } from '../persistence/storage'

describe('command content and search',()=>{
  it('ships at least 60 real commands and 20 with parameter detail',()=>{
    expect(baseCommands.length).toBeGreaterThanOrEqual(60)
    expect(baseCommands.filter(command=>command.flags.length>=2&&command.examples.length&&command.combinations.length).length).toBeGreaterThanOrEqual(20)
  })
  it('finds compound options, Chinese aliases and edited notes',()=>{
    expect(searchCommands(baseCommands,'ls -lah',{})[0].id).toBe('ls')
    expect(searchCommands(baseCommands,'查看隐藏文件',{})[0].id).toBe('ls')
    const state=stateFor('ls');state.notesMarkdown='我的彩虹清单'
    expect(searchCommands(baseCommands,'彩虹清单',{ls:state})[0].id).toBe('ls')
  })
})
describe('learning semantics',()=>{
  it('keeps frequent independent and mastery exclusive',()=>{
    let state=stateFor('ls')
    state=changeLearning(state,'1')
    state=changeLearning(state,'3')
    expect(state).toMatchObject({isFrequent:true,learningStatus:'often_forgotten'})
    state=changeLearning(state,'2')
    expect(state).toMatchObject({isFrequent:true,learningStatus:'mastered'})
    state.isFavorite=true;state.notesMarkdown='remember'
    state=changeLearning(state,'0')
    expect(state).toMatchObject({isFrequent:false,learningStatus:'new',isFavorite:true,notesMarkdown:'remember'})
  })
})
describe('Ambient scheduling',()=>{
  const settings={...defaultAmbient,cardsPerRotation:3}
  it('uses elapsed real time rather than interval counts',()=>{
    const now=Date.UTC(2026,9,13)
    expect(nextRotationAt(now,28)-now).toBe(28*60_000)
    expect(dueForRotation(now+28*60_000,nextRotationAt(now,28),false)).toBe(true)
    expect(dueForRotation(now+28*60_000,nextRotationAt(now,28),true)).toBe(false)
  })
  it('shows unique commands and avoids the prior batch when possible',()=>{
    const first=nextBatch({commands:baseCommands,states:{},settings,previousIds:[],sequenceIndex:0,now:0,random:()=>0})
    const second=nextBatch({commands:baseCommands,states:{},settings,previousIds:first.ids,sequenceIndex:first.sequenceIndex,now:0,random:()=>0})
    expect(new Set(first.ids).size).toBe(3)
    expect(second.ids.every(id=>!first.ids.includes(id))).toBe(true)
  })
  it('keeps pinned items and increases forgotten weight',()=>{
    const state=stateFor('ls');state.isPinned=true;state.learningStatus='often_forgotten'
    const mastered=stateFor('cd');mastered.learningStatus='mastered'
    expect(commandWeight(state,0)).toBeGreaterThan(commandWeight(mastered,0))
    const batch=nextBatch({commands:baseCommands,states:{ls:state},settings,previousIds:[],sequenceIndex:0,now:0,random:()=>0.9})
    expect(batch.ids).toContain('ls')
  })
})
describe('versioned persistence boundary',()=>{
  it('migrates version 1 and clamps imported settings',()=>{
    const raw={...initialData(0),version:1,states:{ls:{commandId:'ls',isFrequent:true,learningStatus:'new',isFavorite:false}},ambient:{...defaultAmbient,rotationMinutes:99999,cardsPerRotation:0}}
    const restored=validateData(raw,0)
    expect(restored.version).toBe(2)
    expect(restored.ambient.rotationMinutes).toBe(1440)
    expect(restored.ambient.cardsPerRotation).toBe(1)
    expect(restored.states.ls.isFrequent).toBe(true)
    expect(restored.states.ls.notesMarkdown).toBe('')
  })
  it('rejects invalid backups',()=>expect(()=>validateData({version:99})).toThrow())
  it('rejects malformed nested command content before it reaches search',()=>{
    const invalid={...initialData(0),customCommands:{bad:{...baseCommands[0],id:'bad',flags:[null]}}}
    expect(()=>validateData(invalid)).toThrow('自定义命令无效')
  })
})
