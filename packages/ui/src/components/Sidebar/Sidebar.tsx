'use client';
import React, { useState } from 'react';

export interface NavItem {
  label: string;
  icon: string;
  href: string;
  badge?: number;
  children?: NavItem[];
}

interface SidebarProps {
  items: NavItem[];
  activeHref?: string;
  onNavigate?: (href: string) => void;
  collapsed?: boolean;
  onToggle?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  items,
  activeHref,
  onNavigate,
  collapsed = false,
  onToggle,
}) => {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  return (
    <aside
      className={`bg-[var(--color-dark-sidebar)] text-white h-full flex flex-col transition-all duration-200 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
        {!collapsed && <span className="font-bold text-lg">AI-SUCE</span>}
        <button
          onClick={onToggle}
          className="p-1.5 rounded hover:bg-white/10 transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        {items.map((item) => {
          const isActive = activeHref === item.href;
          const isExpanded = expandedGroups.has(item.label);
          const hasChildren = item.children && item.children.length > 0;

          return (
            <div key={item.label}>
              <button
                onClick={() => (hasChildren ? toggleGroup(item.label) : onNavigate?.(item.href))}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                  isActive
                    ? 'bg-[var(--color-green-600)] text-white'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <span className="text-lg shrink-0">{item.icon}</span>
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <span className="bg-[var(--color-danger)] text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                        {item.badge}
                      </span>
                    )}
                    {hasChildren && (
                      <span className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`}>▶</span>
                    )}
                  </>
                )}
              </button>

              {hasChildren && isExpanded && !collapsed && (
                <div className="bg-black/20">
                  {item.children!.map((child) => (
                    <button
                      key={child.label}
                      onClick={() => onNavigate?.(child.href)}
                      className={`w-full flex items-center gap-3 pl-12 pr-4 py-2 text-sm transition-colors ${
                        activeHref === child.href
                          ? 'bg-[var(--color-green-600)] text-white'
                          : 'text-white/60 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <span>{child.icon}</span>
                      <span>{child.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="px-4 py-3 border-t border-white/10 text-xs text-white/40">
          AI-SUCE v1.0
        </div>
      )}
    </aside>
  );
};
