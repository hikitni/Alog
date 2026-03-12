'use client'

import { useState, useEffect, useCallback } from 'react'

export default function SidebarDrawer({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  const toggle = useCallback(() => setOpen(o => !o), [])
  const close  = useCallback(() => setOpen(false), [])

  useEffect(() => {
    document.addEventListener('toggleSidebar', toggle)
    return () => document.removeEventListener('toggleSidebar', toggle)
  }, [toggle])

  // Close on route change (clicking a link inside sidebar)
  useEffect(() => {
    if (!open) return
    const onPopState = () => setOpen(false)
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [open])

  return (
    <>
      {/* Backdrop — mobile only */}
      {open && (
        <div
          className="sidebar-backdrop"
          aria-hidden="true"
          onClick={close}
        />
      )}

      {/* The sidebar shell — server content rendered inside */}
      <aside className={`alog-sidebar${open ? ' sidebar-open' : ''}`}>
        {/* Close button — mobile only */}
        <button
          className="sidebar-close-btn"
          aria-label="关闭侧边栏"
          onClick={close}
        >
          ✕
        </button>
        {children}
      </aside>
    </>
  )
}
