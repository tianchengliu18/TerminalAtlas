import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Inspector } from './Inspector'
import { baseCommands } from '../content/commands'
import { stateFor } from '../model/state'

describe('Inspector',()=>{
  it('shows ls flags and sanitizes personal Markdown',()=>{
    const command=baseCommands.find(item=>item.id==='ls')!
    const state={...stateFor('ls'),notesMarkdown:'<script>alert(1)</script> **note**'}
    const noop=vi.fn()
    const {container}=render(<Inspector command={command} state={state} drawer={false} onClose={noop} onMark={noop} onFavorite={noop} onPin={noop} onCopy={noop} onEdit={noop} onNotes={noop} onSelectRelated={noop}/>)
    expect(screen.getAllByText('ls -lah').length).toBeGreaterThan(0)
    expect(screen.getByText('以长列表格式显示权限、大小和时间')).toBeInTheDocument()
    expect(container.querySelector('script')).toBeNull()
  })
})
