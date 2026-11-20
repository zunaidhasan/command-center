import React, { useState, useRef } from 'react';
import {
  Pipette,
  FileCode2,
  Minimize2,
  Image as ImageIcon,
  Copy,
  Check,
  Download,
  AlertCircle,
  ExternalLink,
  Sparkles,
  Upload,
  RefreshCw,
} from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { useUIStore } from '@/store/useUIStore';

interface QuickToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialToolId?: string | null;
}

export const QuickToolsModal: React.FC<QuickToolsModalProps> = ({
  isOpen,
  onClose,
  initialToolId = 'color-picker',
}) => {
  const { setActiveView } = useUIStore();
  const [activeTab, setActiveTab] = useState<string>(initialToolId || 'color-picker');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Sync initial tab when opened
  React.useEffect(() => {
    if (initialToolId) {
      setActiveTab(initialToolId);
    }
  }, [initialToolId]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // ==========================================
  // 1. COLOR PICKER
  // ==========================================
  const [colorHex, setColorHex] = useState('#EF233C');

  const hexToRgb = (hex: string) => {
    let clean = hex.replace('#', '');
    if (clean.length === 3) {
      clean = clean.split('').map((c) => c + c).join('');
    }
    const num = parseInt(clean, 16) || 0;
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
    };
  };

  const rgb = hexToRgb(colorHex);
  const rgbString = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;

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

  const PRESET_SWATCHES = [
    { name: 'Crimson', hex: '#EF233C' },
    { name: 'Engineering Blue', hex: '#1EA7FF' },
    { name: 'Client Green', hex: '#18D879' },
    { name: 'Creative Violet', hex: '#B66BFF' },
    { name: 'Amber Gold', hex: '#FFB21A' },
    { name: 'Cyber Neon', hex: '#00F0FF' },
    { name: 'Obsidian Dark', hex: '#11151D' },
    { name: 'Slate Light', hex: '#F5F6F8' },
  ];

  // ==========================================
  // 2. JSON FORMATTER
  // ==========================================
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

  // ==========================================
  // 3. SVG OPTIMIZER
  // ==========================================
  const [svgInput, setSvgInput] = useState(
    `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">\n  <!-- ZH Labs Badge -->\n  <circle cx="50" cy="50" r="45" fill="#EF233C" stroke="#FFFFFF" stroke-width="2"/>\n  <text x="50" y="58" font-size="24" font-weight="bold" fill="#FFFFFF" text-anchor="middle">ZH</text>\n</svg>`
  );
  const [svgOutput, setSvgOutput] = useState('');
  const [svgSavings, setSvgSavings] = useState<{ orig: number; opt: number; pct: number } | null>(null);

  const optimizeSvg = () => {
    let cleaned = svgInput
      .replace(/<!--[\s\S]*?-->/g, '') // Remove comments
      .replace(/<\?xml[\s\S]*?\?>/g, '') // Remove XML prolog
      .replace(/>\s+</g, '><') // Collapse tags
      .replace(/\s{2,}/g, ' ') // Collapse multiple spaces
      .trim();

    setSvgOutput(cleaned);
    const orig = new Blob([svgInput]).size;
    const opt = new Blob([cleaned]).size;
    const pct = orig > 0 ? Math.round(((orig - opt) / orig) * 100) : 0;
    setSvgSavings({ orig, opt, pct });
  };

  const downloadSvg = () => {
    const blob = new Blob([svgOutput || svgInput], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'optimized-icon.svg';
    a.click();
    URL.revokeObjectURL(url);
  };

  // ==========================================
  // 4. IMAGE CONVERTER
  // ==========================================
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [outputFormat, setOutputFormat] = useState<'image/webp' | 'image/png' | 'image/jpeg'>('image/webp');
  const [imageQuality, setImageQuality] = useState(0.85);
  const [converting, setConverting] = useState(false);
  const [convertedSize, setConvertedSize] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setConvertedUrl(null);
    setConvertedSize(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const convertImage = () => {
    if (!imagePreview) return;
    setConverting(true);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imagePreview;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setConverting(false);
        return;
      }

      // If converting to JPEG, draw white backdrop
      if (outputFormat === 'image/jpeg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            setConvertedUrl(url);
            setConvertedSize(blob.size);
          }
          setConverting(false);
        },
        outputFormat,
        imageQuality
      );
    };
  };

  const downloadConvertedImage = () => {
    if (!convertedUrl) return;
    const ext = outputFormat.split('/')[1];
    const a = document.createElement('a');
    a.href = convertedUrl;
    a.download = `converted-image.${ext === 'jpeg' ? 'jpg' : ext}`;
    a.click();
  };

  const TABS = [
    { id: 'color-picker', name: 'Color Picker', icon: Pipette, color: '#EF233C' },
    { id: 'json-formatter', name: 'JSON Formatter', icon: FileCode2, color: '#1EA7FF' },
    { id: 'svg-optimizer', name: 'SVG Optimizer', icon: Minimize2, color: '#18D879' },
    { id: 'image-converter', name: 'Image Converter', icon: ImageIcon, color: '#FFB21A' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
      title={
        <div className="flex items-center justify-between w-full pr-6">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary" />
            <span className="font-heading font-bold text-lg text-text-primary">
              Interactive Quick Tools
            </span>
          </div>
          <button
            onClick={() => {
              onClose();
              setActiveView('tools');
            }}
            className="text-xs font-mono text-text-secondary hover:text-text-primary flex items-center gap-1 transition-colors"
          >
            <span>Open Studio</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      }
    >
      <div className="space-y-4 select-none">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-surface-secondary/70 border border-border/80 rounded-sm-card overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-surface text-text-primary shadow-subtle border border-border/80'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface/50'
                }`}
              >
                <Icon
                  className="w-3.5 h-3.5"
                  style={{ color: isActive ? tab.color : undefined }}
                />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: COLOR PICKER */}
        {activeTab === 'color-picker' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left: Swatch & Native Picker */}
              <div className="space-y-3">
                <label className="text-xs font-medium text-text-secondary block">
                  Interactive Color Swatch
                </label>
                <div
                  className="w-full h-28 rounded-card border border-border/80 flex items-end justify-between p-3 transition-colors shadow-elevated relative overflow-hidden"
                  style={{ backgroundColor: colorHex }}
                >
                  <div className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded text-xs font-mono font-bold text-white">
                    {colorHex.toUpperCase()}
                  </div>
                  <input
                    type="color"
                    value={colorHex}
                    onChange={(e) => setColorHex(e.target.value)}
                    className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                    title="Click anywhere to open native color picker"
                  />
                  <span className="text-[10px] font-mono bg-black/60 backdrop-blur-md text-white/90 px-2 py-0.5 rounded">
                    Click to Pick
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-text-secondary">HEX:</span>
                  <input
                    type="text"
                    value={colorHex}
                    onChange={(e) => setColorHex(e.target.value)}
                    className="flex-1 bg-surface-secondary border border-border rounded px-2.5 py-1 text-xs font-mono text-text-primary focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Right: Conversions & Presets */}
              <div className="space-y-3">
                <label className="text-xs font-medium text-text-secondary block">
                  Color Value Conversions
                </label>

                {/* RGB */}
                <div className="flex items-center justify-between p-2 rounded-sm-card bg-surface-secondary/70 border border-border/60 text-xs font-mono">
                  <div>
                    <span className="text-text-muted mr-2">RGB:</span>
                    <span className="text-text-primary">{rgbString}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(rgbString, 'rgb')}
                    className="p-1 hover:text-primary transition-colors text-text-secondary"
                    title="Copy RGB"
                  >
                    {copiedId === 'rgb' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* HSL */}
                <div className="flex items-center justify-between p-2 rounded-sm-card bg-surface-secondary/70 border border-border/60 text-xs font-mono">
                  <div>
                    <span className="text-text-muted mr-2">HSL:</span>
                    <span className="text-text-primary">{hslString}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(hslString, 'hsl')}
                    className="p-1 hover:text-primary transition-colors text-text-secondary"
                    title="Copy HSL"
                  >
                    {copiedId === 'hsl' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Presets */}
                <div className="pt-2">
                  <span className="text-[11px] font-mono text-text-muted block mb-1.5">
                    ZH Labs Design Palette
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_SWATCHES.map((swatch) => (
                      <button
                        key={swatch.hex}
                        onClick={() => setColorHex(swatch.hex)}
                        title={`${swatch.name} (${swatch.hex})`}
                        className="w-6 h-6 rounded-full border border-border hover:scale-110 transition-transform shadow-sm"
                        style={{ backgroundColor: swatch.hex }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: JSON FORMATTER */}
        {activeTab === 'json-formatter' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-secondary">Input / Output JSON</span>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={() => formatJson(false)}>
                  Beautify (2 Spaces)
                </Button>
                <Button variant="secondary" size="sm" onClick={() => formatJson(true)}>
                  Minify
                </Button>
              </div>
            </div>

            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder="Paste JSON here..."
              rows={6}
              className="w-full bg-surface-secondary border border-border rounded-sm-card p-2.5 font-mono text-xs text-text-primary focus:outline-none focus:border-primary placeholder:text-text-muted"
            />

            {jsonError && (
              <div className="flex items-center gap-2 text-xs font-mono text-red-400 bg-red-500/10 border border-red-500/20 p-2 rounded">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="truncate">{jsonError}</span>
              </div>
            )}

            {jsonOutput && (
              <div className="relative">
                <div className="flex items-center justify-between pb-1.5 text-xs text-text-muted font-mono">
                  <span>Formatted Output:</span>
                  <button
                    onClick={() => copyToClipboard(jsonOutput, 'json-out')}
                    className="flex items-center gap-1 hover:text-text-primary transition-colors"
                  >
                    {copiedId === 'json-out' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === 'json-out' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="w-full bg-surface-secondary/80 border border-border rounded-sm-card p-3 font-mono text-xs text-text-primary overflow-x-auto max-h-48">
                  {jsonOutput}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: SVG OPTIMIZER */}
        {activeTab === 'svg-optimizer' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-secondary">Raw SVG Markup</span>
              <Button variant="primary" size="sm" onClick={optimizeSvg}>
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                Optimize Markup
              </Button>
            </div>

            <textarea
              value={svgInput}
              onChange={(e) => setSvgInput(e.target.value)}
              placeholder="Paste <svg>...</svg> here"
              rows={4}
              className="w-full bg-surface-secondary border border-border rounded-sm-card p-2.5 font-mono text-xs text-text-primary focus:outline-none focus:border-primary"
            />

            {svgSavings && (
              <div className="flex items-center justify-between p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-400">
                <span>Savings: {svgSavings.pct}% reduction</span>
                <span>
                  {svgSavings.orig}B → {svgSavings.opt}B
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {/* Live Preview */}
              <div className="p-3 bg-surface-secondary/50 rounded-card border border-border flex flex-col items-center justify-center min-h-[120px]">
                <span className="text-[11px] font-mono text-text-muted mb-2">Live Rendering</span>
                <div
                  className="w-20 h-20 flex items-center justify-center overflow-hidden"
                  dangerouslySetInnerHTML={{ __html: svgOutput || svgInput }}
                />
              </div>

              {/* Actions */}
              <div className="flex flex-col justify-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => copyToClipboard(svgOutput || svgInput, 'svg')}
                  className="w-full justify-center"
                >
                  {copiedId === 'svg' ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                  <span>{copiedId === 'svg' ? 'Copied to Clipboard' : 'Copy Optimized SVG'}</span>
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={downloadSvg}
                  className="w-full justify-center"
                >
                  <Download className="w-3.5 h-3.5 mr-1" />
                  <span>Download .svg File</span>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: IMAGE CONVERTER */}
        {activeTab === 'image-converter' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-secondary">Image Converter & Compressor</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-3.5 h-3.5 mr-1" />
                Select Image
              </Button>
            </div>

            {imagePreview ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  {/* Preview */}
                  <div className="h-32 bg-surface-secondary/60 rounded-card border border-border flex items-center justify-center overflow-hidden p-2">
                    <img
                      src={imagePreview}
                      alt="Source preview"
                      className="max-h-full max-w-full object-contain rounded"
                    />
                  </div>

                  {/* Settings */}
                  <div className="space-y-2 text-xs">
                    <div>
                      <label className="text-text-muted block mb-1">Target Format:</label>
                      <select
                        value={outputFormat}
                        onChange={(e) => setOutputFormat(e.target.value as any)}
                        className="w-full bg-surface-secondary border border-border rounded px-2.5 py-1.5 text-text-primary focus:outline-none focus:border-primary"
                      >
                        <option value="image/webp">WebP (Modern & Small)</option>
                        <option value="image/jpeg">JPEG (Compressed)</option>
                        <option value="image/png">PNG (Lossless)</option>
                      </select>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-text-muted mb-1">
                        <span>Quality:</span>
                        <span>{Math.round(imageQuality * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.05"
                        value={imageQuality}
                        onChange={(e) => setImageQuality(parseFloat(e.target.value))}
                        className="w-full accent-primary cursor-pointer"
                      />
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={convertImage}
                      disabled={converting}
                      className="w-full justify-center"
                    >
                      {converting ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 mr-1 animate-spin" />
                          Converting...
                        </>
                      ) : (
                        'Convert Canvas'
                      )}
                    </Button>
                  </div>
                </div>

                {convertedUrl && (
                  <div className="p-3 bg-surface-secondary/80 rounded-card border border-border flex items-center justify-between">
                    <div className="text-xs font-mono text-text-secondary">
                      <span>Ready: </span>
                      {convertedSize && (
                        <span className="text-emerald-400 font-semibold">
                          {(convertedSize / 1024).toFixed(1)} KB
                        </span>
                      )}
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={downloadConvertedImage}
                    >
                      <Download className="w-3.5 h-3.5 mr-1" />
                      Download
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-8 border-2 border-dashed border-border/80 hover:border-primary/50 rounded-card flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-surface-secondary flex items-center justify-center text-text-muted">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <p className="text-xs font-medium text-text-primary">
                  Click to choose an image to convert
                </p>
                <p className="text-[11px] font-mono text-text-muted">
                  Supports PNG, JPEG, WebP, SVG, and GIF client-side
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
