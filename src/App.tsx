import { useState, useRef, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import RadomiakLogo from './RadomiakLogo';
import type { LogoParams } from './RadomiakLogo';
import './App.css';

const DEFAULT_PARAMS: LogoParams = {
  prefix: 'ANY', nickname: 'RANDOM', location: 'TEAM', year: '1410',
  earLeftColor: '#FFFFFF', earRightColor: '#FFFFFF',
  topBodyColor: '#FFFFFF', bottomBodyColor: '#FFFFFF',
  stripeColor: '#FFFFFF', bandColor: '#FFFFFF',
  textColor: '#000000', borderColor: '#000000',
};

const BG_PRESETS = ['#ffffff', '#f0f0f0', '#111111', '#1a472a', '#1d3461', '#2d2d2d'];

const randomHex = () => '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');

function ColorChip({ label, value, onChange, active }: {
  label?: string;
  value: string;
  onChange: (hex: string) => void;
  active?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [hexInput, setHexInput] = useState(value.replace('#', '').toUpperCase());
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const swatchRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHexInput(value.replace('#', '').toUpperCase());
  }, [value]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        !popoverRef.current?.contains(e.target as Node) &&
        !swatchRef.current?.contains(e.target as Node)
      ) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleSwatchClick = () => {
    if (!open && swatchRef.current) {
      const r = swatchRef.current.getBoundingClientRect();
      const halfW = 105; // ~połowa szerokości popovera (190px + 2×10px padding)
      const margin = 8;
      const rawLeft = r.left + r.width / 2;
      const left = Math.max(halfW + margin, Math.min(window.innerWidth - halfW - margin, rawLeft));
      setPos({ top: r.top - 10, left });
    }
    setOpen(o => !o);
  };

  const handleHexInput = (raw: string) => {
    const upper = raw.toUpperCase().replace(/[^0-9A-F]/g, '');
    setHexInput(upper);
    if (upper.length === 6) onChange('#' + upper.toLowerCase());
  };

  const handleHexBlur = () => {
    if (hexInput.length !== 6) setHexInput(value.replace('#', '').toUpperCase());
  };

  return (
    <div className={'color-chip' + (active ? ' color-chip--active' : '')}>
      <div
        ref={swatchRef}
        className="color-chip-swatch"
        style={{ backgroundColor: value }}
        onClick={handleSwatchClick}
      />
      {label && <span className="color-chip-label">{label}</span>}
      {open && (
        <div
          ref={popoverRef}
          className="color-chip-popover"
          style={{ top: pos.top, left: pos.left }}
        >
          <HexColorPicker color={value} onChange={onChange} />
          <div className="color-chip-popover-hex">
            <span className="color-chip-hex-hash">#</span>
            <input
              type="text"
              className="color-chip-hex"
              value={hexInput}
              onChange={(e) => handleHexInput(e.target.value)}
              onBlur={handleHexBlur}
              maxLength={6}
              spellCheck={false}
              autoComplete="off"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [params, setParams] = useState<LogoParams>(DEFAULT_PARAMS);
  const [bgColor, setBgColor] = useState('#f0f0f0');
  const logoRef = useRef<HTMLDivElement>(null);

  const set = (field: keyof LogoParams, value: string) =>
    setParams((p) => ({ ...p, [field]: value }));

  const randomize = () => {
    setParams((p) => ({
      ...p,
      earLeftColor:    randomHex(),
      earRightColor:   randomHex(),
      topBodyColor:    randomHex(),
      bottomBodyColor: randomHex(),
      stripeColor:     randomHex(),
      bandColor:       randomHex(),
      textColor:       randomHex(),
      borderColor:     randomHex(),
    }));
  };

  const downloadPng = () => {
    const svgEl = logoRef.current?.querySelector('svg');
    if (!svgEl) return;
    const clone = svgEl.cloneNode(true) as SVGSVGElement;
    clone.setAttribute('width', '1028');
    clone.setAttribute('height', '972');
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    const svgString = new XMLSerializer().serializeToString(clone);
    // data URI zamiast blob URL — blob URL nie działa w WebView (Messenger, IG)
    const svgDataUrl = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1028;
      canvas.height = 972;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);

      const filename = (params.nickname || 'logo').toLowerCase() + '.png';
      const isInApp = /FBAN|FBAV|Instagram|Line\//i.test(navigator.userAgent);

      if (isInApp) {
        // In-app browsers (Messenger, IG) blokują blob download —
        // otwieramy dataURL w nowej karcie (przeglądarka systemowa)
        window.open(canvas.toDataURL('image/png'), '_blank');
      } else {
        canvas.toBlob((pngBlob) => {
          if (!pngBlob) return;
          const a = document.createElement('a');
          a.href = URL.createObjectURL(pngBlob);
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(() => URL.revokeObjectURL(a.href), 100);
        }, 'image/png');
      }
    };
    img.src = svgDataUrl;
  };

  return (
    <div className="app">
      <header className="app-header">
        <span className="app-logo-text">radomize.it</span>
      </header>

      <div className="toolbar">
        <button className="toolbar-btn" onClick={randomize}>
          RA(N)DOM
        </button>
        <button className="toolbar-btn" onClick={downloadPng}>
          <svg width="14" height="14" viewBox="0 0 13 13" fill="none">
            <path d="M6.5 1v7.5M4 6l2.5 2.5L9 6M1.5 11h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Download PNG
        </button>
      </div>

      <div className="workspace">
        <main className="panel-preview" style={{ backgroundColor: bgColor }}>
          <div className="logo-wrapper" ref={logoRef}>
            <RadomiakLogo {...params} />
          </div>
        </main>

        <aside className="panel-controls">

          <section className="ctrl-section">
            <div className="ctrl-section-title">DATA</div>
            {(
              [
                { key: 'prefix',   label: 'Label 1', placeholder: 'e.g. FC' },
                { key: 'nickname', label: 'Label 2', placeholder: 'e.g. BLAUGRANA'  },
                { key: 'location', label: 'Label 3', placeholder: 'e.g. MADRID'   },
                { key: 'year',     label: 'Year',      placeholder: 'e.g. 966'     },
              ] as { key: keyof LogoParams; label: string; placeholder: string }[]
            ).map(({ key, label, placeholder }) => (
              <div key={key} className="field">
                <label className="field-lbl">{label}</label>
                <input
                  type="text"
                  value={params[key]}
                  placeholder={placeholder}
                  onChange={(e) => set(key, e.target.value.toUpperCase())}
                  className="field-input"
                />
              </div>
            ))}
          </section>

          <div className="color-sections">
            <section className="ctrl-section">
              <div className="ctrl-section-title">Sides</div>
              <div className="color-chips-row">
                <ColorChip label="Left"  value={params.earLeftColor}  onChange={(v) => set('earLeftColor', v)} />
                <ColorChip label="Right" value={params.earRightColor} onChange={(v) => set('earRightColor', v)} />
              </div>
            </section>

            <section className="ctrl-section">
              <div className="ctrl-section-title">Top and bottom</div>
              <div className="color-chips-row">
                <ColorChip label="Top" value={params.topBodyColor}    onChange={(v) => set('topBodyColor', v)} />
                <ColorChip label="Bottom" value={params.bottomBodyColor} onChange={(v) => set('bottomBodyColor', v)} />
              </div>
            </section>

            <section className="ctrl-section">
              <div className="ctrl-section-title">Middle</div>
              <div className="color-chips-row">
                <ColorChip label="Background" value={params.stripeColor} onChange={(v) => set('stripeColor', v)} />
                <ColorChip label="Stripe"  value={params.bandColor}   onChange={(v) => set('bandColor', v)} />
              </div>
            </section>

            <section className="ctrl-section">
              <div className="ctrl-section-title">Text and border</div>
              <div className="color-chips-row">
                <ColorChip label="Text"   value={params.textColor}   onChange={(v) => set('textColor', v)} />
                <ColorChip label="Border" value={params.borderColor} onChange={(v) => set('borderColor', v)} />
              </div>
            </section>
          </div>

          <section className="ctrl-section">
            <div className="ctrl-section-title">Preview background</div>
            <div className="bg-section">
              <ColorChip value={bgColor} onChange={setBgColor} />
              <div className="bg-presets-row">
                {BG_PRESETS.map((c) => (
                  <button
                    key={c}
                    className={'bg-preset' + (bgColor === c ? ' bg-preset--active' : '')}
                    style={{ backgroundColor: c }}
                    onClick={() => setBgColor(c)}
                  />
                ))}
              </div>
            </div>
          </section>


        </aside>
      </div>

      <footer className="app-footer">
        <a href="https://cuplink.to/littlerest" target="_blank" rel="noopener noreferrer" className="app-footer-link">
          Radom wasn't built in a day. Buy me a brick.
        </a>
      </footer>
    </div>
  );
}
