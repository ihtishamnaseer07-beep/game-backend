const DEFAULT_AVATAR_SIZE = 'h-10 w-10';

function getAvatarInitial(user) {
  const source = user?.avatarLabel || user?.avatarKey || user?.name || user?.email || 'U';
  return String(source).trim().charAt(0).toUpperCase() || 'U';
}

export default function UserAvatar({ user, sizeClassName = DEFAULT_AVATAR_SIZE, className = '' }) {
  const avatarImage = user?.avatarImage || user?.avatarUrl || '';
  const avatarEmoji = user?.avatarEmoji || '';
  const avatarInitial = getAvatarInitial(user);

  if (avatarImage) {
    return (
      <img
        src={avatarImage}
        alt={user?.avatarLabel || user?.name || 'Player avatar'}
        className={`${sizeClassName} ${className} rounded-full object-cover border border-white/10 shadow-lg`}
      />
    );
  }

  return (
    <div
      className={`${sizeClassName} ${className} flex items-center justify-center rounded-full bg-gradient-to-br from-green-400 via-emerald-500 to-cyan-600 text-white font-extrabold shadow-lg shadow-emerald-500/25`}
    >
      <span className="leading-none">{avatarEmoji || avatarInitial}</span>
    </div>
  );
}