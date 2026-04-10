import { useState, useRef } from 'react';
import RadomiakLogo from './RadomiakLogo';
import type { LogoParams } from './RadomiakLogo';
import './App.css';

const DEFAULT_PARAMS: LogoParams = {
  prefix: 'ANY', nickname: 'RANDOM', location: 'TEAM', year: '1410',
  earLeftColor: '#FFFFFF', earRightColor: '#FFFFFF',
  topBodyColor: '#FFFFFF', bottomBodyColor: '#FFFFFF',
  stripeColor: '#FFFFFF', bandColor: '#FFFFFF',
};

const BG_PRESETS = ['#ffffff', '#f0f0f0', '#111111', '#1a472a', '#1d3461', '#2d2d2d'];

const randomHex = () => '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');

function ColorChip({ label, value, onChange, active }: {
  label?: string;
  value: string;
  onChange: (hex: string) => void;
  active?: boolean;
}) {
  return (
    <div className={'color-chip' + (active ? ' color-chip--active' : '')}>
      <div className="color-chip-swatch" style={{ backgroundColor: value }}>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="color-chip-input"
          title={value.toUpperCase()}
        />
      </div>
      {label && <span className="color-chip-label">{label}</span>}
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
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1028;
      canvas.height = 972;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((pngBlob) => {
        if (!pngBlob) return;
        const a = document.createElement('a');
        a.href = URL.createObjectURL(pngBlob);
        a.download = (params.nickname || 'logo').toLowerCase() + '.png';
        a.click();
        URL.revokeObjectURL(a.href);
      }, 'image/png');
      URL.revokeObjectURL(url);
    };
    img.src = url;
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
                { key: 'prefix',   label: 'Label 1', placeholder: 'np. THE, LOS' },
                { key: 'nickname', label: 'Label 2', placeholder: 'np. GUNNERS'  },
                { key: 'location', label: 'Label 3', placeholder: 'np. LONDON'   },
                { key: 'year',     label: 'Year',      placeholder: 'np. 1886'     },
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
    </div>
  );
}
