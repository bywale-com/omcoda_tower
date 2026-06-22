import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { OMCODA_LINKS } from "../omcodaLinks";

const platformItems = [
  { label: "Overview", href: OMCODA_LINKS.platform.overview },
  { label: "Developer docs", href: OMCODA_LINKS.platform.developerDocs },
  { label: "Pricing", href: OMCODA_LINKS.platform.pricing },
] as const;

function PlatformMenu({ onNavigate }: { onNavigate?: () => void }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div className="platform-menu" ref={rootRef}>
      <button
        type="button"
        className="nav-link"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
      >
        Platform
        <ChevronDown className="nav-chevron" aria-hidden />
      </button>

      {open && (
        <div className="platform-popover" role="menu">
          {platformItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onNavigate?.();
              }}
            >
              {item.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export function OmcodaNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobilePlatformOpen, setMobilePlatformOpen] = useState(false);

  return (
    <header className="hdr">
      <div className="hdr-shell">
        <div className="hdr-inner">
          <a className="lockup" href={OMCODA_LINKS.home} aria-label="Tower by omcoda — back to home">
            <img src="/assets/tower-by-omcoda-logo.png" alt="Tower by omcoda" />
          </a>

          <div className="hdr-actions">
            <nav className="primary" aria-label="Primary">
              <PlatformMenu />
              <a href={OMCODA_LINKS.solutions}>Solutions</a>
              <a href={OMCODA_LINKS.home}>← Back to Omcoda</a>
            </nav>

            <a className="btn" href={OMCODA_LINKS.contactSales}>
              Contact Sales
            </a>

            <button
              type="button"
              className="hdr-menu-toggle"
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav-drawer"
              onClick={() => setMobileOpen((open) => !open)}
            >
              Menu
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div id="mobile-nav-drawer" className="hdr-mobile-drawer is-open">
            <nav className="hdr-mobile-drawer__nav" aria-label="Mobile primary">
              <button
                type="button"
                onClick={() => setMobilePlatformOpen((open) => !open)}
                aria-expanded={mobilePlatformOpen}
              >
                Platform
              </button>
              {mobilePlatformOpen && (
                <div className="hdr-mobile-drawer__sub">
                  {platformItems.map((item) => (
                    <a key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
                      {item.label}
                    </a>
                  ))}
                </div>
              )}
              <a href={OMCODA_LINKS.solutions} onClick={() => setMobileOpen(false)}>
                Solutions
              </a>
              <a href={OMCODA_LINKS.home} onClick={() => setMobileOpen(false)}>
                ← Back to Omcoda
              </a>
              <a href={OMCODA_LINKS.contactSales} onClick={() => setMobileOpen(false)}>
                Contact Sales
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
