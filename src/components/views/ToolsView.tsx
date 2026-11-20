import React, { useState } from 'react';
import {
  Pipette,
  FileCode2,
  Minimize2,
  Image as ImageIcon,
  Binary,
  Link2,
  QrCode,
  Copy,
  Check,
  RefreshCw,
  Download,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { useUIStore } from '@/store/useUIStore';

export const ToolsView: React.FC = () => {
  const { selectedToolId } = useUIStore();
  const [activeTab, setActiveTab] = useState<string>(selectedToolId || 'color-picker');
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  // 1. Color Picker state
  const [colorHex, setColorHex] = useState('#EF233C');

  // Convert HEX to RGB
  const hexToRgb = (hex: string) => {
    let clean = hex.replace('#', '');
    if (clean.length === 3) {
      clean = clean.split('').map((c) => c + c).join('');
    }
    const num = parseInt(clean, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
    };
  };

  const rgb = hexToRgb(colorHex);
  const rgbString = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;

  // Convert to HSL
  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0,
      s = 0,
      l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }
    return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
  };

  const hslString = rgbToHsl(rgb.r, rgb.g, rgb.b);

  // 2. JSON Formatter state
  const [jsonInput, setJsonInput] = useState(
    '{\n  "name": "ZH Labs Command Center",\n  "status": "operational",\n  "version": 1,\n  "tags": ["AI", "Next.js", "Chrome Extension"]\n}'
  );
  const [jsonOutput, setJsonOutput] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);

  const formatJson = (minify: boolean = false) => {
    try {
      const parsed = JSON.parse(jsonInput);
      setJsonOutput(JSON.stringify(parsed, null, minify ? 0 : 2));
      setJsonError(null);
    } catch (err: any) {
      setJsonError(err.message);
    }
  };

  // 3. Base64 Tool state
  const [base64Input, setBase64Input] = useState('Build. Automate. Grow.');
  const [base64Output, setBase64Output] = useState('');
  const [base64Mode, setBase64Mode] = useState<'encode' | 'decode'>('encode');

  const processBase64 = () => {
    try {
      if (base64Mode === 'encode') {
        setBase64Output(btoa(base64Input));
      } else {
        setBase64Output(atob(base64Input));
      }
    } catch (err: any) {
      setBase64Output(`Error: ${err.message}`);
    }
  };

  // 4. URL Encoder state
  const [urlInput, setUrlInput] = useState('https://github.com/search?q=ZH Labs Command Center');
  const [urlOutput, setUrlOutput] = useState('');

  // 5. SVG Optimizer state
  const [svgInput, setSvgInput] = useState(
    `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">\n  <!-- ZH Labs Badge -->\n  <rect width="100" height="100" rx="20" fill="#EF233C"/>\n  <circle cx="50" cy="50" r="30" fill="white"/>\n</svg>`
  );
  const [optimizedSvg, setOptimizedSvg] = useState('');

  const optimizeSvg = () => {
    // Simple fast client SVG minifier
    const cleaned = svgInput
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/\s+/g, ' ')
      .replace(/>\s+</g, '><')
      .trim();
    setOptimizedSvg(cleaned);
  };

  // 6. QR Code Tool
  const [qrText, setQrText] = useState('https://github.com/zunaidhasan');

  // 7. Image Converter (Canvas based)
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [targetFormat, setTargetFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/webp');
  const [convertedDataUrl, setConvertedDataUrl] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
      setConvertedDataUrl(null);
    }
  };

  const handleConvertImage = () => {
    if (!imagePreview) return;
    const img = new Image();
    img.src = imagePreview;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      const converted = canvas.toDataURL(targetFormat, 0.9);
      setConvertedDataUrl(converted);
    };
  };

  const TOOLS_LIST = [
    { id: 'color-picker', name: 'Color Picker & Converter', icon: Pipette, category: 'Design' },
    { id: 'json-formatter', name: 'JSON Formatter & Validator', icon: FileCode2, category: 'Developer' },
    { id: 'base64', name: 'Base64 Encoder / Decoder', icon: Binary, category: 'Developer' },
    { id: 'url-encoder', name: 'URL Encoder / Decoder', icon: Link2, category: 'Developer' },
    { id: 'svg-optimizer', name: 'SVG Optimizer & Preview', icon: Minimize2, category: 'Design' },
    { id: 'qr-generator', name: 'QR Code Generator', icon: QrCode, category: 'Utility' },
    { id: 'image-converter', name: 'Image Format Converter', icon: ImageIcon, category: 'Utility' },
  ];

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Header */}
      <div className="pb-4 border-b border-border">
        <h2 className="font-heading font-bold text-2xl text-text-primary tracking-tight">
          Design & Developer Utilities
        </h2>
        <p className="text-xs text-text-secondary mt-0.5">
          Fast, local-first client tools for rapid prototyping, data conversion, and formatting.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Tools Navigation */}
        <div className="lg:col-span-1 space-y-1">
          {TOOLS_LIST.map((tool) => {
            const Icon = tool.icon;
            const isActive = activeTab === tool.id;

            return (
              <button
                key={tool.id}
                onClick={() => setActiveTab(tool.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-card text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-primary/15 text-white border border-primary/40 font-semibold'
                    : 'bg-surface/80 text-text-secondary hover:text-text-primary hover:bg-surface border border-border/80'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-text-muted'}`} />
                  <span className="truncate">{tool.name}</span>
                </div>
                <span className="text-[10px] font-mono text-text-muted">{tool.category}</span>
              </button>
            );
          })}
        </div>

        {/* Right Active Tool Work area */}
        <div className="lg:col-span-3 bg-surface/90 border border-border rounded-card p-5 shadow-card">
          {/* ========================================================= */}
          {/* TOOL 1: Color Picker & Converter */}
          {/* ========================================================= */}
          {activeTab === 'color-picker' && (
            <div className="space-y-6">
              <h3 className="font-heading font-bold text-lg text-text-primary">
                Color Picker & HEX/RGB/HSL Converter
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="flex flex-col items-center justify-center p-6 rounded-card border border-border bg-surface-secondary/40">
                  <div
                    className="w-32 h-32 rounded-2xl shadow-elevated border-2 border-white/20 transition-colors"
                    style={{ backgroundColor: colorHex }}
                  />
                  <input
                    type="color"
                    value={colorHex}
                    onChange={(e) => setColorHex(e.target.value)}
                    className="mt-4 w-36 h-9 cursor-pointer rounded border border-border bg-surface p-1"
                  />
                </div>

                <div className="space-y-3">
                  {/* HEX */}
                  <div>
                    <label className="block text-[11px] font-mono text-text-muted mb-1">
                      HEX CODE
                    </label>
                    <div className="flex gap-2">
                      <Input
                        value={colorHex.toUpperCase()}
                        onChange={(e) => setColorHex(e.target.value)}
                        className="font-mono text-sm"
                      />
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => copyToClipboard(colorHex.toUpperCase(), 'hex')}
                      >
                        {copied === 'hex' ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* RGB */}
                  <div>
                    <label className="block text-[11px] font-mono text-text-muted mb-1">
                      RGB CODE
                    </label>
                    <div className="flex gap-2">
                      <Input readOnly value={rgbString} className="font-mono text-sm" />
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => copyToClipboard(rgbString, 'rgb')}
                      >
                        {copied === 'rgb' ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* HSL */}
                  <div>
                    <label className="block text-[11px] font-mono text-text-muted mb-1">
                      HSL CODE
                    </label>
                    <div className="flex gap-2">
                      <Input readOnly value={hslString} className="font-mono text-sm" />
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => copyToClipboard(hslString, 'hsl')}
                      >
                        {copied === 'hsl' ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preset Palettes */}
              <div className="pt-4 border-t border-border">
                <span className="text-xs font-semibold text-text-primary block mb-2">
                  ZH Labs Command Center Core Palette
                </span>
                <div className="grid grid-cols-6 gap-2">
                  {[
                    { name: 'Crimson', hex: '#EF233C' },
                    { name: 'Engineering', hex: '#1EA7FF' },
                    { name: 'Client Ops', hex: '#18D879' },
                    { name: 'Creative', hex: '#B66BFF' },
                    { name: 'Personal', hex: '#FFB21A' },
                    { name: 'Cyber Cyan', hex: '#00F0FF' },
                  ].map((p) => (
                    <button
                      key={p.hex}
                      onClick={() => setColorHex(p.hex)}
                      className="p-2 rounded-card border border-border/70 hover:border-text-muted bg-surface-secondary/50 flex flex-col items-center gap-1.5 transition-transform hover:scale-102"
                    >
                      <div
                        className="w-full h-8 rounded-sm-card shadow-sm"
                        style={{ backgroundColor: p.hex }}
                      />
                      <span className="text-[10px] font-mono text-text-secondary truncate w-full text-center">
                        {p.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TOOL 2: JSON Formatter & Validator */}
          {/* ========================================================= */}
          {activeTab === 'json-formatter' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-lg text-text-primary">
                  JSON Formatter & Validator
                </h3>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => formatJson(true)}>
                    Minify
                  </Button>
                  <Button variant="primary" size="sm" onClick={() => formatJson(false)}>
                    Format (Beautify)
                  </Button>
                </div>
              </div>

              {jsonError && (
                <div className="p-3 rounded-card bg-red-500/15 border border-red-500/30 text-xs text-red-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Invalid JSON: {jsonError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-text-muted mb-1">
                    INPUT RAW JSON
                  </label>
                  <textarea
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    rows={12}
                    className="w-full bg-surface-secondary text-text-primary font-mono text-xs rounded-card p-3 border border-border focus:outline-none focus:border-primary resize-none leading-relaxed"
                    placeholder="Paste JSON here..."
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-mono text-text-muted">FORMATTED OUTPUT</label>
                    {jsonOutput && (
                      <button
                        onClick={() => copyToClipboard(jsonOutput, 'json-out')}
                        className="text-[11px] font-mono text-primary hover:underline flex items-center gap-1"
                      >
                        {copied === 'json-out' ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>Copy</span>
                      </button>
                    )}
                  </div>
                  <textarea
                    readOnly
                    value={jsonOutput || '// Formatted result will appear here'}
                    rows={12}
                    className="w-full bg-surface-darker text-emerald-400 font-mono text-xs rounded-card p-3 border border-border/80 resize-none leading-relaxed"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TOOL 3: Base64 Encoder / Decoder */}
          {/* ========================================================= */}
          {activeTab === 'base64' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-lg text-text-primary">
                  Base64 Encoder / Decoder
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setBase64Mode('encode');
                      processBase64();
                    }}
                    className={`px-3 py-1.5 rounded-sm-card text-xs font-medium ${
                      base64Mode === 'encode'
                        ? 'bg-primary text-white'
                        : 'bg-surface-secondary text-text-secondary'
                    }`}
                  >
                    Encode
                  </button>
                  <button
                    onClick={() => {
                      setBase64Mode('decode');
                      processBase64();
                    }}
                    className={`px-3 py-1.5 rounded-sm-card text-xs font-medium ${
                      base64Mode === 'decode'
                        ? 'bg-primary text-white'
                        : 'bg-surface-secondary text-text-secondary'
                    }`}
                  >
                    Decode
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-text-muted mb-1">
                  TEXT INPUT
                </label>
                <textarea
                  value={base64Input}
                  onChange={(e) => setBase64Input(e.target.value)}
                  rows={4}
                  className="w-full bg-surface-secondary text-text-primary font-mono text-xs rounded-card p-3 border border-border focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <Button variant="primary" size="sm" onClick={processBase64}>
                Convert
              </Button>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-mono text-text-muted">RESULT</label>
                  {base64Output && (
                    <button
                      onClick={() => copyToClipboard(base64Output, 'b64')}
                      className="text-[11px] font-mono text-primary hover:underline flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy Result</span>
                    </button>
                  )}
                </div>
                <textarea
                  readOnly
                  value={base64Output}
                  rows={4}
                  className="w-full bg-surface-darker text-text-primary font-mono text-xs rounded-card p-3 border border-border resize-none"
                />
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TOOL 4: URL Encoder / Decoder */}
          {/* ========================================================= */}
          {activeTab === 'url-encoder' && (
            <div className="space-y-4">
              <h3 className="font-heading font-bold text-lg text-text-primary">
                URL Encoder / Decoder
              </h3>

              <div>
                <label className="block text-xs font-mono text-text-muted mb-1">
                  URL STRING INPUT
                </label>
                <Input
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com/search?q=test string"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setUrlOutput(encodeURIComponent(urlInput))}
                >
                  Encode URL
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    try {
                      setUrlOutput(decodeURIComponent(urlInput));
                    } catch (e: any) {
                      setUrlOutput(`Decode error: ${e.message}`);
                    }
                  }}
                >
                  Decode URL
                </Button>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-mono text-text-muted">OUTPUT</label>
                  {urlOutput && (
                    <button
                      onClick={() => copyToClipboard(urlOutput, 'url')}
                      className="text-[11px] font-mono text-primary hover:underline flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </button>
                  )}
                </div>
                <textarea
                  readOnly
                  value={urlOutput}
                  rows={4}
                  className="w-full bg-surface-darker text-text-primary font-mono text-xs rounded-card p-3 border border-border resize-none"
                />
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TOOL 5: SVG Optimizer */}
          {/* ========================================================= */}
          {activeTab === 'svg-optimizer' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-lg text-text-primary">
                  SVG Optimizer & Preview
                </h3>
                <Button variant="primary" size="sm" onClick={optimizeSvg}>
                  Optimize SVG
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-text-muted mb-1">
                    RAW SVG CODE
                  </label>
                  <textarea
                    value={svgInput}
                    onChange={(e) => setSvgInput(e.target.value)}
                    rows={8}
                    className="w-full bg-surface-secondary text-text-primary font-mono text-xs rounded-card p-3 border border-border resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-text-muted mb-1">
                    LIVE SVG PREVIEW
                  </label>
                  <div
                    className="w-full h-44 rounded-card border border-border bg-surface-secondary/40 flex items-center justify-center p-4 overflow-hidden"
                    dangerouslySetInnerHTML={{ __html: svgInput }}
                  />
                </div>
              </div>

              {optimizedSvg && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono text-emerald-400">
                      Optimized Output (Saved ~
                      {Math.max(0, svgInput.length - optimizedSvg.length)} bytes)
                    </span>
                    <button
                      onClick={() => copyToClipboard(optimizedSvg, 'svg')}
                      className="text-[11px] font-mono text-primary hover:underline flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy Minified SVG</span>
                    </button>
                  </div>
                  <textarea
                    readOnly
                    value={optimizedSvg}
                    rows={4}
                    className="w-full bg-surface-darker text-text-primary font-mono text-xs rounded-card p-3 border border-border resize-none"
                  />
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TOOL 6: QR Code Generator */}
          {/* ========================================================= */}
          {activeTab === 'qr-generator' && (
            <div className="space-y-4">
              <h3 className="font-heading font-bold text-lg text-text-primary">
                QR Code Generator
              </h3>

              <div>
                <label className="block text-xs font-mono text-text-muted mb-1">
                  TARGET URL OR TEXT
                </label>
                <Input
                  value={qrText}
                  onChange={(e) => setQrText(e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div className="flex flex-col items-center justify-center p-6 bg-surface-secondary/40 rounded-card border border-border">
                {/* Generated QR using public SVG standard API */}
                <div className="p-4 bg-white rounded-card shadow-card">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                      qrText || 'https://github.com/zunaidhasan'
                    )}`}
                    alt="QR Code"
                    className="w-44 h-44 object-contain"
                  />
                </div>
                <p className="text-xs text-text-muted mt-3 font-mono">
                  Scan to open target on mobile device
                </p>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TOOL 7: Image Converter */}
          {/* ========================================================= */}
          {activeTab === 'image-converter' && (
            <div className="space-y-4">
              <h3 className="font-heading font-bold text-lg text-text-primary">
                Client-Side Image Converter & Compressor
              </h3>

              <div className="p-4 rounded-card border border-dashed border-border flex flex-col items-center justify-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="mb-2 text-xs text-text-muted file:mr-3 file:py-1.5 file:px-3 file:rounded-sm-card file:border-0 file:text-xs file:font-medium file:bg-surface-secondary file:text-text-primary hover:file:bg-surface-hover"
                />
                <span className="text-[11px] font-mono text-text-muted">
                  Supports PNG, JPG, WebP, SVG. Processed completely in-browser.
                </span>
              </div>

              {imagePreview && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <div className="flex flex-col items-center p-3 bg-surface-secondary/40 rounded-card border border-border">
                    <span className="text-xs font-mono text-text-muted mb-2">Source Image</span>
                    <img
                      src={imagePreview}
                      alt="Source"
                      className="max-h-48 object-contain rounded"
                    />
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-mono text-text-muted mb-1">
                        TARGET FORMAT
                      </label>
                      <select
                        value={targetFormat}
                        onChange={(e) => setTargetFormat(e.target.value as any)}
                        className="w-full bg-surface border border-border text-text-primary text-sm rounded-sm-card px-3 py-2"
                      >
                        <option value="image/webp">WebP (Optimized)</option>
                        <option value="image/jpeg">JPEG</option>
                        <option value="image/png">PNG</option>
                      </select>
                    </div>

                    <Button variant="primary" onClick={handleConvertImage}>
                      Convert Now
                    </Button>

                    {convertedDataUrl && (
                      <div className="pt-2">
                        <a
                          href={convertedDataUrl}
                          download={`converted-${Date.now()}.${targetFormat.split('/')[1]}`}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-sm-card bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-medium"
                        >
                          <Download className="w-4 h-4" />
                          <span>Download Converted Image</span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
