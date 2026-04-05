import { useStore } from '../store'

export default function TopNavBar() {
  const viewMode = useStore(s => s.viewMode)
  const setViewMode = useStore(s => s.setViewMode)

  return (
    <header className="h-[56px] w-full fixed top-0 left-0 bg-[#fbf9f4] border-b border-[#1b1c19]/10 flex justify-between items-center px-6 z-50">
      <div className="flex items-center gap-8">
        <span className="text-xl font-serif font-bold text-[#163328]">Athenaeum V3</span>
        {viewMode !== 'entry' && (
          <nav className="hidden md:flex items-center gap-6 font-serif text-lg tracking-tight font-bold">
            <button
              onClick={() => setViewMode('map')}
              className={viewMode === 'map' ? "text-[#163328] border-b-2 border-[#163328] pb-1" : "text-stone-500 hover:text-[#163328] transition-colors"}
            >
              Mind Map
            </button>
            <button
              onClick={() => setViewMode('outline')}
              className={viewMode === 'outline' ? "text-[#163328] border-b-2 border-[#163328] pb-1" : "text-stone-500 hover:text-[#163328] transition-colors"}
            >
              Outline
            </button>
          </nav>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button className="p-2 hover:bg-stone-100 transition-colors rounded-full text-[#163328] active:opacity-70">
          <span className="material-symbols-outlined">undo</span>
        </button>
        <button className="p-2 hover:bg-stone-100 transition-colors rounded-full text-[#163328] active:opacity-70">
          <span className="material-symbols-outlined">redo</span>
        </button>
        <button className="p-2 hover:bg-stone-100 transition-colors rounded-full text-[#163328] active:opacity-70">
          <span className="material-symbols-outlined">ios_share</span>
        </button>
      </div>
    </header>
  )
}
