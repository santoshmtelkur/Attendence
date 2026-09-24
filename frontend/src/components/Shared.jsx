import React from 'react'

export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex gap-1 border-b border-line mb-6">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
            active === t.key
              ? 'border-navy text-navy'
              : 'border-transparent text-ink/50 hover:text-ink'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

export function Modal({ title, onClose, children, wide }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4" onClick={onClose}>
      <div
        className={`bg-white rounded-lg shadow-xl w-full ${wide ? 'max-w-2xl' : 'max-w-md'} max-h-[85vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-line">
          <h3 className="font-serif text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="text-ink/40 hover:text-ink text-xl leading-none">×</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

export function EmptyState({ message }) {
  return (
    <div className="text-center py-14 text-ink/40 text-sm border border-dashed border-line rounded-lg">
      {message}
    </div>
  )
}
