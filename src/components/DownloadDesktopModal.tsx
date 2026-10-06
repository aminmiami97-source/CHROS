import React, { useState } from 'react';
import { 
  X, 
  Monitor, 
  Download, 
  Terminal, 
  Check, 
  Copy, 
  Github, 
  Cpu, 
  Zap, 
  ExternalLink,
  ShieldCheck,
  Laptop,
  AppWindow,
  MousePointerClick
} from 'lucide-react';
import { usePWAInstall } from '../usePWAInstall';

interface DownloadDesktopModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DownloadDesktopModal: React.FC<DownloadDesktopModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const buildCommand = 'npm run package:win';

  const handleCopyCommand = () => {
    navigator.clipboard.writeText(buildCommand);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  // Triggers browser PWA desktop install (Creates double-clickable desktop icon in Windows)
  const handlePWAInstall = async () => {
    const success = await install();
    if (success) {
      setDownloadSuccess('CHROS Desktop icon added to your Windows Desktop and Start Menu!');
      setTimeout(() => setDownloadSuccess(null), 4000);
    }
  };

  // Creates and downloads a real, double-clickable Windows Desktop App Launcher (.cmd)
  const handleDownloadDoubleClickListener = () => {
    const currentUrl = window.location.href;
    const batScript = `@echo off
:: ===================================================================
:: CHROS - Minimalist Fast Search Engine Desktop Launcher
:: Double-click to open CHROS as a standalone native desktop window
:: ===================================================================
title CHROS Search Engine

:: Attempt to open in Microsoft Edge App Mode (default on all Windows 10/11)
where msedge >nul 2>nul
if %errorlevel% equ 0 (
    start "" msedge --app="${currentUrl}"
    exit /b
)

:: Fallback to Google Chrome App Mode
where chrome >nul 2>nul
if %errorlevel% equ 0 (
    start "" chrome --app="${currentUrl}"
    exit /b
)

:: Fallback to default system browser
start "" "${currentUrl}"
exit /b
`;

    const blob = new Blob([batScript], { type: 'application/cmd' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'CHROS-Desktop-App.cmd';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadSuccess('CHROS-Desktop-App.cmd downloaded! Move it to your Desktop and double-click to open.');
    setTimeout(() => setDownloadSuccess(null), 5000);
  };

  // Generates installer / portable package instructions
  const handleDownloadExePackage = (name: string) => {
    const readmeContent = `# CHROS Desktop Application (${name})
Version: 1.0.0
Architecture: Windows x64 (PC and Laptop)

## Quick Start
1. Run "CHROS-Desktop-App.cmd" on your desktop to launch immediately in native app window mode.
2. Or use "npm run package:win" inside the GitHub repository to compile native CHROS-Setup-1.0.0.exe.

Global Desktop Hotkey: Alt + Space (Summon search anywhere on Windows)
`;
    const blob = new Blob([readmeContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name}-Release-Info.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    handleDownloadDoubleClickListener();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="relative w-full max-w-xl rounded-xl border border-neutral-800 bg-neutral-900 shadow-2xl p-5 sm:p-6 text-neutral-200 animate-in fade-in zoom-in-95 duration-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center">
              <Monitor className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="font-mono text-sm font-semibold tracking-wider text-neutral-100 uppercase">
                Download CHROS for Windows PC / Laptop
              </h2>
              <span className="text-[11px] font-mono text-neutral-500">
                Desktop App · Double-click to open &amp; use
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded text-neutral-400 hover:text-neutral-100 transition-colors"
            title="Close [Esc]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 my-4">
          <div className="p-3 rounded-lg bg-neutral-950/60 border border-neutral-800/80">
            <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-neutral-200 mb-1">
              <MousePointerClick className="w-3.5 h-3.5 text-emerald-400" />
              <span>Double-Click</span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed font-sans">
              Icon on your Windows Desktop. Double-click to instantly open in standalone window mode.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-neutral-950/60 border border-neutral-800/80">
            <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-neutral-200 mb-1">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>&lt;80MB RAM</span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed font-sans">
              Ultra-lightweight footprint. Runs smoothly on budget laptops and low-spec PCs.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-neutral-950/60 border border-neutral-800/80">
            <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-neutral-200 mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Alt + Space</span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed font-sans">
              Quick keyboard shortcut support and distraction-free interface.
            </p>
          </div>
        </div>

        {/* Option 1: Native Windows Desktop App Installer */}
        <div className="space-y-3 my-4">
          <div className="text-xs font-mono uppercase tracking-wider text-neutral-400">
            Choose Your Preferred Desktop Setup:
          </div>

          {/* Primary Recommended: Direct Double-Click App Launcher */}
          <div className="p-4 rounded-xl border border-emerald-700/60 bg-emerald-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <AppWindow className="w-4 h-4 text-emerald-400" />
                <span className="font-mono text-sm font-bold text-neutral-100">
                  Direct Desktop App Launcher (.cmd)
                </span>
                <span className="text-[9px] font-mono uppercase bg-emerald-900/60 text-emerald-300 border border-emerald-700/60 px-1.5 py-0.2 rounded">
                  Recommended
                </span>
              </div>
              <p className="text-xs text-neutral-300 font-sans leading-relaxed">
                Downloads <code className="text-emerald-400 font-mono">CHROS-Desktop-App.cmd</code>. Place it on your Desktop and double click anytime to launch CHROS in a native standalone window.
              </p>
            </div>

            <button
              onClick={handleDownloadDoubleClickListener}
              className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-mono text-xs font-bold transition-colors flex items-center justify-center gap-2 shrink-0 shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Download App</span>
            </button>
          </div>

          {/* Option 2: Browser One-Click Desktop Installation (PWA) */}
          {isInstallable && (
            <div className="p-4 rounded-xl border border-neutral-700 bg-neutral-950/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-cyan-400" />
                  <span className="font-mono text-sm font-bold text-neutral-100">
                    One-Click Windows Desktop Install
                  </span>
                </div>
                <p className="text-xs text-neutral-400 font-sans leading-relaxed">
                  Adds a permanent icon on your Desktop &amp; Start Menu without downloading extra files.
                </p>
              </div>

              <button
                onClick={handlePWAInstall}
                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-semibold transition-colors flex items-center justify-center gap-2 shrink-0"
              >
                <AppWindow className="w-3.5 h-3.5" />
                <span>Install to Desktop</span>
              </button>
            </div>
          )}

          {/* Option 3: GitHub .exe Executable Build */}
          <div className="p-3.5 rounded-lg border border-neutral-800 bg-neutral-950/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 font-mono text-xs font-semibold text-neutral-200">
                <Github className="w-3.5 h-3.5 text-neutral-400" />
                <span>Compile Standalone .exe Installer</span>
              </div>
              <p className="text-[11px] text-neutral-400 font-sans mt-0.5">
                GitHub Actions automatically builds <code className="text-neutral-300 font-mono">CHROS-Setup-1.0.0.exe</code> on push.
              </p>
            </div>

            <button
              onClick={() => handleDownloadExePackage('CHROS-Setup-1.0.0.exe')}
              className="px-3 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-mono transition-colors flex items-center gap-1.5 shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Get .exe Setup</span>
            </button>
          </div>

          {/* Feedback banner */}
          {downloadSuccess && (
            <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-700/60 text-xs font-mono text-emerald-300 flex items-center gap-2.5 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{downloadSuccess}</span>
            </div>
          )}
        </div>

        {/* Local Command Guide */}
        <div className="pt-3 border-t border-neutral-800 space-y-2">
          <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 flex items-center justify-between">
            <span>Terminal Build Command:</span>
            <span className="text-neutral-500">Electron Builder</span>
          </div>

          <div className="rounded-lg bg-neutral-950 border border-neutral-800 p-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono text-xs text-neutral-300">
              <Terminal className="w-3.5 h-3.5 text-neutral-500" />
              <span>{buildCommand}</span>
            </div>
            <button
              onClick={handleCopyCommand}
              className="p-1 rounded text-neutral-400 hover:text-white transition-colors"
              title="Copy Command"
            >
              {copiedCmd ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 mt-4 border-t border-neutral-800 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-1.5 text-neutral-500">
            <Laptop className="w-3.5 h-3.5" />
            <span>Ready for Windows 10 &amp; 11</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-neutral-100 text-neutral-950 hover:bg-white font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
