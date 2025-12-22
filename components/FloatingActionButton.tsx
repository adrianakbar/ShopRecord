'use client';

import Link from 'next/link';

interface FloatingActionButtonProps {
  href?: string;
  onClick?: () => void;
  icon?: string;
  label?: string;
}

export default function FloatingActionButton({
  href = '/quick-add',
  onClick,
  icon = 'add',
  label = 'Quick Add'
}: FloatingActionButtonProps) {
  const buttonClasses = "fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-primary hover:bg-primary-hover text-white px-6 py-4 rounded-full shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 hover:scale-105 active:scale-95 font-bold text-sm group";

  const content = (
    <>
      <span className="material-symbols-outlined text-xl group-hover:rotate-90 transition-transform duration-300">
        {icon}
      </span>
      <span className="hidden sm:inline">{label}</span>
    </>
  );

  if (onClick) {
    return (
      <button onClick={onClick} className={buttonClasses} aria-label={label}>
        {content}
      </button>
    );
  }

  return (
    <Link href={href} className={buttonClasses} aria-label={label}>
      {content}
    </Link>
  );
}
