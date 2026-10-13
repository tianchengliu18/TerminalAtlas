import type { CommandEntry, UserCommandState } from './types'

export function searchCommands(commands:CommandEntry[], query:string, states:Record<string,UserCommandState>): CommandEntry[] {
  const q=query.toLocaleLowerCase().trim()
  if (!q) return commands
  const terms=q.split(/\s+/)
  return commands.map(command => {
    const fields=[command.command,command.meaningEn,command.titleZh,command.summaryZh,command.syntax,
      ...command.searchAliasesZh,...command.tags,...command.flags.flatMap(flag=>[flag.token,flag.descriptionZh,flag.descriptionEn]),
      ...command.combinations.flatMap(combo=>[combo.expression,combo.explanationZh]),...command.examples.flatMap(example=>[example.commandLine,example.explanationZh]),
      states[command.id]?.notesMarkdown]
    const text=fields.filter(Boolean).join(' ').toLocaleLowerCase()
    const score=terms.every(term=>text.includes(term)) ?
      (command.command.toLocaleLowerCase()===q?100:0)+(command.command.toLocaleLowerCase().startsWith(q)?30:0)+
      (command.titleZh.includes(query)?10:0)+1 : 0
    return {command,score}
  }).filter(item=>item.score>0).sort((a,b)=>b.score-a.score).map(item=>item.command)
}
