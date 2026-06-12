import { Input } from '@/components/ui/input'
import { useApp } from '@/context/AppContext'

export default function Goals() {
  const { tasks, agents } = useApp()

  // Group tasks by status to create a goal-like view
  const activeTasks = tasks.filter(t => t.status === 'in_progress' || t.status === 'running')
  const completedTasks = tasks.filter(t => t.status === 'completed')
  const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'todo')

  return (
    <div className="flex-1 flex w-full h-full pb-10">
      {/* Sidebar */}
      <aside className="w-[320px] h-full border-r border-outline-variant/20 bg-surface-container-low/30 flex flex-col overflow-hidden shrink-0">
        <div className="p-md border-b border-outline-variant/20">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 text-[20px]">search</span>
            <Input className="w-full pl-10 pr-4 py-2 bg-surface-container-lowest border border-outline-variant/50 rounded-lg text-body-sm focus:outline-none focus:border-primary transition-all outline-none" placeholder="Search tasks..." type="text" readOnly />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto py-sm">
          <div className="px-md py-xs">
            <p className="font-label-sm text-on-surface-variant/60 uppercase tracking-wider">Active Tasks ({activeTasks.length})</p>
          </div>
          <div className="px-sm space-y-1">
            {activeTasks.length === 0 && pendingTasks.length === 0 ? (
              <p className="text-body-sm text-on-surface-variant text-center py-lg opacity-60">No tasks</p>
            ) : null}
            {activeTasks.map(task => (
              <div key={task.id} className="w-full flex flex-col gap-1 p-md rounded-xl bg-primary/10 border border-primary/20 cursor-pointer">
                <div className="flex justify-between items-start">
                  <span className="font-label-md text-primary font-bold truncate">{task.title}</span>
                  <span className="material-symbols-outlined text-primary text-[16px]">sync</span>
                </div>
                {task.assignee ? <span className="font-label-sm text-on-surface-variant">Assigned to: {task.assignee}</span> : null}
              </div>
            ))}
            {pendingTasks.map(task => (
              <div key={task.id} className="w-full flex flex-col gap-1 p-md rounded-xl hover:bg-surface-container-high/60 hover:shadow-sm hover:-translate-y-0.5 transition-all cursor-pointer duration-300">
                <div className="flex justify-between items-start">
                  <span className="font-label-md text-on-surface truncate">{task.title}</span>
                  <span className="font-label-sm text-on-surface-variant">Pending</span>
                </div>
                {task.assignee ? <span className="font-label-sm text-on-surface-variant">Assigned to: {task.assignee}</span> : null}
              </div>
            ))}
          </div>

          {completedTasks.length > 0 ? (
            <>
              <div className="px-md py-xs mt-lg">
                <p className="font-label-sm text-on-surface-variant/60 uppercase tracking-wider">Completed ({completedTasks.length})</p>
              </div>
              <div className="px-sm space-y-1">
                {completedTasks.map(task => (
                  <div key={task.id} className="w-full flex items-center gap-sm p-md rounded-xl opacity-60">
                    <span className="material-symbols-outlined text-green-500 text-[16px]">check_circle</span>
                    <span className="font-label-md text-on-surface truncate">{task.title}</span>
                  </div>
                ))}
              </div>
            </>
          ) : null}
        </div>
      </aside>

      {/* Main Canvas */}
      <div className="flex-1 flex flex-col overflow-y-auto p-xl relative">
        <div className="flex items-end justify-between mb-xl">
          <div>
            <div className="flex items-center gap-sm mb-xs">
              <span className="px-sm py-xs bg-primary/10 text-primary font-label-sm rounded-full">Tasks Overview</span>
              <span className="font-label-sm text-on-surface-variant/60">{tasks.length} total tasks</span>
            </div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">Task Management</h2>
          </div>
        </div>

        {/* Agent Call Path */}
        <div className="flex gap-gutter w-full">
          <div className="w-1/4 max-w-[280px]">
            <div className="glass-card bg-white/70 p-md rounded-xl sticky top-0">
              <h3 className="font-label-md text-on-surface mb-md flex items-center gap-sm">
                <span className="material-symbols-outlined text-primary text-[20px]">hub</span>
                Active Agents ({agents.length})
              </h3>
              {agents.length === 0 ? (
                <p className="text-body-sm text-on-surface-variant">No agents active.</p>
              ) : (
                <div className="space-y-lg relative">
                  <div className="absolute left-[15px] top-6 bottom-6 w-px border-l border-dashed border-primary/30" />
                  {agents.map(agent => (
                    <div key={agent.id} className="relative flex items-center gap-md">
                      <div className="z-10 w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center text-[18px]">
                        <span className="material-symbols-outlined">smart_toy</span>
                      </div>
                      <div>
                        <p className="font-label-md text-on-surface">{agent.name}</p>
                        <p className="font-label-sm text-on-surface-variant/70">{agent.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Task Tree */}
          <div className="flex-1 space-y-md">
            {tasks.length === 0 ? (
              <div className="text-center py-xl">
                <span className="material-symbols-outlined text-[48px] text-outline-variant">task_alt</span>
                <p className="font-body-md text-on-surface-variant mt-md">No tasks yet. Create tasks via the Tasks page or background execution.</p>
              </div>
            ) : (
              tasks.map(task => {
                const isActive = task.status === 'in_progress' || task.status === 'running'
                const isDone = task.status === 'completed'
                return (
                  <div key={task.id} className={`flex items-start gap-lg ${!isActive && !isDone ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                    <div className="mt-4 flex flex-col items-center">
                      <div className={`w-4 h-4 rounded-full z-10 ${isDone ? 'border-2 border-emerald-500 bg-background' : isActive ? 'border-2 border-primary bg-primary shadow-lg' : 'border-2 border-outline-variant bg-surface-container-highest'}`} />
                    </div>
                    <div className={`flex-1 glass-card p-lg rounded-xl transition-all ${isActive ? 'bg-white border-primary/30 ring-1 ring-primary/10 shadow-lg' : isDone ? 'bg-white/70' : 'bg-white/50'}`}>
                      <div className="flex items-center gap-md mb-xs">
                        <h4 className={`font-headline-md ${isActive ? 'text-primary' : isDone ? 'text-on-surface' : 'text-on-surface-variant'}`}>{task.title}</h4>
                        <span className={`px-sm py-xs font-label-sm rounded-lg flex items-center gap-1 ${
                          isDone ? 'bg-green-100 text-green-700' : isActive ? 'bg-primary/10 text-primary' : 'bg-surface-container-high text-on-surface-variant'
                        }`}>
                          <span className="material-symbols-outlined text-[14px]">{isDone ? 'check_circle' : isActive ? 'sync' : 'lock'}</span>
                          {isDone ? 'Done' : isActive ? 'In Progress' : 'Pending'}
                        </span>
                      </div>
                      {task.description ? <p className="text-on-surface-variant">{task.description}</p> : null}
                      {task.assignee ? <p className="text-label-sm text-on-surface-variant mt-sm">Assigned to: {task.assignee}</p> : null}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <aside className="w-[300px] border-l border-outline-variant/20 bg-surface-container-low/30 p-lg shrink-0 flex flex-col gap-lg">
        <div className="glass-card bg-white/70 p-lg rounded-xl">
          <h5 className="font-label-md text-on-surface-variant mb-md">Task Summary</h5>
          <div className="space-y-sm">
            <div className="flex justify-between"><span className="text-body-sm text-on-surface-variant">Active</span><span className="font-label-md text-primary font-bold">{activeTasks.length}</span></div>
            <div className="flex justify-between"><span className="text-body-sm text-on-surface-variant">Pending</span><span className="font-label-md text-on-surface font-bold">{pendingTasks.length}</span></div>
            <div className="flex justify-between"><span className="text-body-sm text-on-surface-variant">Completed</span><span className="font-label-md text-green-600 font-bold">{completedTasks.length}</span></div>
          </div>
        </div>
      </aside>
    </div>
  )
}
