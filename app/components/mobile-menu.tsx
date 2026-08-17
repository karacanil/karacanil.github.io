"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    function closeOutside(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    }

    document.addEventListener("keydown", closeOnEscape);
    document.addEventListener("pointerdown", closeOutside);

    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("pointerdown", closeOutside);
    };
  }, [open]);

  return (
    <div className={open ? "mobile-menu open" : "mobile-menu"} ref={menuRef}>
      <button
        aria-controls="mobile-navigation"
        aria-expanded={open}
        aria-label={open ? "Close navigation menu" : "Open navigation menu"}
        className="mobile-menu-button"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <span aria-hidden="true" className="mobile-menu-icon">
          <i />
          <i />
          <i />
        </span>
      </button>

      <nav
        aria-label="Mobile navigation"
        className="mobile-nav"
        hidden={!open}
        id="mobile-navigation"
      >
        <Link href="/#writing" onClick={() => setOpen(false)}>
          <span>01</span> Articles
        </Link>
        <Link href="/#topics" onClick={() => setOpen(false)}>
          <span>02</span> Topics
        </Link>
        <Link href="/about/" onClick={() => setOpen(false)}>
          <span>03</span> About
        </Link>
      </nav>
    </div>
  );
}
