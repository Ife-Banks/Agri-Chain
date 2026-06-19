import React from 'react';

interface HeaderProps {
  title: string;
  onSearch?: (query: string) => void;
  notificationCount?: number;
  userName?: string;
  userAvatar?: string;
  onNotificationClick?: () => void;
  onProfileClick?: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  onSearch,
  notificationCount = 0,
  userName,
  userAvatar,
  onNotificationClick,
  onProfileClick,
  onLogout,
}) => {
  const [showProfileMenu, setShowProfileMenu] = React.useState(false);

  return (
    <header className="bg-[var(--color-bg-surface)] border-b border-[var(--color-border-default)] px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4 flex-1">
        <h1 className="text-lg font-medium text-[var(--color-text-primary)]">{title}</h1>
        {onSearch && (
          <div className="relative max-w-md w-full">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] text-sm">🔍</span>
            <input
              type="text"
              placeholder="Search..."
              onChange={(e) => onSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-sm rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-page)] focus:border-[var(--color-green-600)] focus:outline-none"
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onNotificationClick}
          className="relative p-2 rounded-lg hover:bg-[var(--color-bg-subtle)] transition-colors"
          aria-label="Notifications"
        >
          <span className="text-lg">🔔</span>
          {notificationCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-[var(--color-danger)] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
        </button>

        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[var(--color-bg-subtle)] transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[var(--color-green-600)] flex items-center justify-center text-white text-sm font-medium">
              {userAvatar ? (
                <img src={userAvatar} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                userName?.charAt(0).toUpperCase() || 'U'
              )}
            </div>
            {userName && (
              <span className="text-sm text-[var(--color-text-primary)] hidden md:block">{userName}</span>
            )}
          </button>

          {showProfileMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowProfileMenu(false)} />
              <div className="absolute right-0 top-full mt-1 w-48 bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-lg shadow-lg z-20 py-1">
                <button
                  onClick={() => { onProfileClick?.(); setShowProfileMenu(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-bg-subtle)]"
                >
                  Profile
                </button>
                <hr className="border-[var(--color-border-default)] my-1" />
                <button
                  onClick={() => { onLogout?.(); setShowProfileMenu(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-[var(--color-danger)] hover:bg-[var(--color-bg-subtle)]"
                >
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
