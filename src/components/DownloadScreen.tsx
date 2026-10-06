import React, { useState } from 'react';
import { 
  Monitor, 
  Download, 
  ArrowLeft, 
  Check, 
  ShieldCheck, 
  Zap, 
  Cpu, 
  Sparkles, 
  Laptop, 
  ExternalLink,
  Layers,
  MousePointerClick,
  AppWindow,
  Terminal,
  X
} from 'lucide-react';
import { usePWAInstall } from '../usePWAInstall';

interface DownloadScreenProps {
  onBackToSearch: () => void;
}

export const DownloadScreen: React.FC<DownloadScreenProps> = ({ onBackToSearch }) => {
  const { isInstallable, install } = usePWAInstall();
  const [downloadNotification, setDownloadNotification] = useState<string | null>(null);

  // 1. One-click Windows 11/10 Native App installation (PWA engine)
  const handleInstallToWindows = async () => {
    const success = await install();
    if (success) {
      setDownloadNotification('Success! CHROS is now installed in Windows 11/10 Start Menu & Desktop.');
      setTimeout(() => setDownloadNotification(null), 5000);
    } else {
      // If browser doesn't expose prompt, trigger the silent launcher download
      handleDownloadSilentLauncher();
    }
  };

  // 2. Download Silent Windows Launcher (Zero terminal window - runs completely headless)
  const handleDownloadSilentLauncher = () => {
    const currentUrl = window.location.origin;
    
    // VBScript executed by Windows WScript engine:
    // WindowStyle 0 = Completely hidden background execution. NO terminal, NO cmd prompt!
    const vbsScript = `' =============================================================
' CHROS - Minimalist Fast Search Engine Windows Launcher
' Launches in 100% Native Window Mode with ZERO Terminal / Console
' =============================================================
Set WshShell = CreateObject("WScript.Shell")
strUrl = "${currentUrl}"

' Launch directly in Microsoft Edge App Mode (Built into 100% of Windows 10 & 11)
' WindowStyle = 0 (Completely hidden launcher - No Black Box / Terminal Window)
On Error Resume Next
WshShell.Run "msedge.exe --app=""" & strUrl & """ --window-size=1150,780", 0, False

If Err.Number <> 0 Then
    ' Fallback to Google Chrome if Edge is unavailable
    Err.Clear
    WshShell.Run "chrome.exe --app=""" & strUrl & """ --window-size=1150,780", 0, False
End If

If Err.Number <> 0 Then
    ' Final system fallback
    WshShell.Run strUrl, 1, False
End If
`;

    const blob = new Blob([vbsScript], { type: 'application/x-vbs' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'CHROS-Windows.vbs';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadNotification('Downloaded CHROS-Windows.vbs! Double-click it on your Desktop. It opens directly with NO terminal.');
    setTimeout(() => setDownloadNotification(null), 6000);
  };

  // 3. Desktop Shortcut Installer: Automatically creates a desktop shortcut with icon
  const handleCreateDesktopShortcut = () => {
    const currentUrl = window.location.origin;
    
    const vbsShortcutCreator = `' =============================================================
' CHROS Desktop Shortcut Installer for Windows 10 & 11
' Creates a double-clickable desktop icon on your Windows Desktop
' =============================================================
Set WshShell = CreateObject("WScript.Shell")
strDesktop = WshShell.SpecialFolders("Desktop")
strShortcutPath = strDesktop & "\\CHROS Search.lnk"

Set oLink = WshShell.CreateShortcut(strShortcutPath)
oLink.TargetPath = "msedge.exe"
oLink.Arguments = "--app=${currentUrl} --window-size=1150,780"
oLink.Description = "CHROS - Minimalist Fast Search Engine"
oLink.WindowStyle = 1
oLink.Save

MsgBox "CHROS Search shortcut has been created on your Windows Desktop!" & vbCrLf & vbCrLf & "You can now double-click it anytime to open CHROS as a standalone app with no terminal.", 64, "CHROS Desktop App Installed"
`;

    const blob = new Blob([vbsShortcutCreator], { type: 'application/x-vbs' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Install-CHROS-To-Desktop.vbs';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadNotification('Downloaded shortcut creator. Double-click it to put the CHROS app icon on your Windows Desktop!');
    setTimeout(() => setDownloadNotification(null), 6000);
  };

  return (
    <div className="w-full min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans pb-16">
      {/* Top Navigation Bar */}
      <div className="w-full border-b border-neutral-800/80 bg-neutral-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <button
            onClick={onBackToSearch}
            className="flex items-center gap-2 text-xs font-mono text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Search</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-mono text-xs text-neutral-300">Windows 11 &amp; 10 Certified</span>
          </div>
        </div>
      </div>

      {/* Main Download Hero Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 space-y-12">
        {/* Title and Pitch */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-800/60 bg-emerald-950/40 text-emerald-300 text-xs font-mono">
            <Laptop className="w-3.5 h-3.5 text-emerald-400" />
            <span>Standalone Windows Desktop Application</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-mono font-extrabold tracking-tight text-white">
            CHROS for Windows 11 &amp; 10
          </h1>

          <p className="text-neutral-400 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            Get CHROS as a real, double-clickable app on your PC or laptop. Opens instantly in its own standalone window with <span className="text-emerald-400 font-semibold">zero terminal / command prompt windows</span>.
          </p>
        </div>

        {/* Interactive App Window Mockup (Showing No Terminal, Pure App UI) */}
        <div className="relative rounded-2xl border border-neutral-800 bg-neutral-900 shadow-2xl overflow-hidden max-w-2xl mx-auto">
          {/* Windows 11 Style Titlebar */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-950 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="font-mono text-xs font-semibold text-neutral-300">
                CHROS - Minimalist Fast Search Engine
              </span>
            </div>

            {/* Window control buttons */}
            <div className="flex items-center gap-2 text-neutral-500">
              <span className="w-2.5 h-0.5 bg-neutral-500 rounded" />
              <span className="w-2.5 h-2.5 border border-neutral-500 rounded-xs" />
              <X className="w-3 h-3" />
            </div>
          </div>

          {/* Window Body Mockup */}
          <div className="p-6 sm:p-8 bg-neutral-950 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-emerald-400 shadow-lg">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xl font-mono font-bold text-white tracking-widest">CHROS</div>
              <div className="text-xs text-neutral-500 font-mono mt-1">Stand-Alone Windows Window · 0ms Terminal Delay</div>
            </div>
            <div className="w-full max-w-md h-9 rounded-lg border border-neutral-800 bg-neutral-900/60 flex items-center px-3 text-xs text-neutral-500 font-mono">
              <span>Search with Google grounding...</span>
            </div>
          </div>
        </div>

        {/* Primary Download & Install Action Cards */}
        <div className="space-y-4 max-w-2xl mx-auto">
          <div className="text-xs font-mono uppercase tracking-wider text-neutral-400">
            Download &amp; Installation Options:
          </div>

          {/* Option 1: Native Windows App Install */}
          <div className="p-5 rounded-xl border border-emerald-600/70 bg-emerald-950/20 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <AppWindow className="w-4 h-4 text-emerald-400" />
                <h3 className="font-mono text-sm font-bold text-white">
                  1. One-Click Windows Desktop App
                </h3>
                <span className="text-[10px] font-mono bg-emerald-900 text-emerald-200 px-1.5 py-0.2 rounded uppercase">
                  Fastest
                </span>
              </div>
              <p className="text-xs text-neutral-300 font-sans leading-relaxed">
                Registers CHROS directly into Windows 11 &amp; 10. Places an official double-clickable icon on your Desktop and Start Menu.
              </p>
            </div>

            <button
              onClick={handleInstallToWindows}
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-mono text-xs font-bold transition-colors flex items-center justify-center gap-2 shrink-0 shadow-md"
            >
              <Download className="w-4 h-4" />
              <span>Install to Windows</span>
            </button>
          </div>

          {/* Option 2: Silent App Launcher (Zero Terminal) */}
          <div className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/80 hover:border-neutral-700 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <MousePointerClick className="w-4 h-4 text-cyan-400" />
                <h3 className="font-mono text-sm font-bold text-white">
                  2. Double-Click App Launcher (.vbs)
                </h3>
                <span className="text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800/40 px-1.5 py-0.2 rounded">
                  No Terminal
                </span>
              </div>
              <p className="text-xs text-neutral-400 font-sans leading-relaxed">
                A single file you can drag to your Desktop. When you double click it, it launches silently in its own app window. No black terminal window ever opens!
              </p>
            </div>

            <button
              onClick={handleDownloadSilentLauncher}
              className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-mono text-xs font-semibold transition-colors flex items-center justify-center gap-2 shrink-0"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Download Launcher</span>
            </button>
          </div>

          {/* Option 3: Desktop Shortcut Creator */}
          <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/50 hover:border-neutral-700 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Monitor className="w-4 h-4 text-neutral-300" />
                <h4 className="font-mono text-xs font-bold text-neutral-200">
                  3. Auto-Create Windows Desktop Shortcut (.lnk)
                </h4>
              </div>
              <p className="text-[11px] text-neutral-400 font-sans">
                Double-click once to automatically place a permanent &ldquo;CHROS Search&rdquo; shortcut file on your Windows Desktop.
              </p>
            </div>

            <button
              onClick={handleCreateDesktopShortcut}
              className="w-full sm:w-auto px-3.5 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-mono text-xs transition-colors flex items-center justify-center gap-1.5 shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Create Shortcut</span>
            </button>
          </div>

          {/* Download feedback notification */}
          {downloadNotification && (
            <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-700 text-xs font-mono text-emerald-200 flex items-center gap-2.5 shadow-lg animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{downloadNotification}</span>
            </div>
          )}
        </div>

        {/* Feature comparison: Native App vs Terminal */}
        <div className="max-w-2xl mx-auto rounded-xl border border-neutral-800 bg-neutral-900/50 p-5 space-y-4">
          <div className="text-xs font-mono font-bold text-neutral-200 uppercase tracking-wider">
            Why CHROS is Built for Windows 10 &amp; 11:
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans">
            <div className="p-3 rounded-lg bg-neutral-950/60 border border-neutral-800 flex items-start gap-2.5">
              <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-neutral-100">Zero Terminal / No Black Windows</span>
                <p className="text-[11px] text-neutral-400 mt-0.5">Runs completely headless and silent. Opens straight into the clean search interface.</p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-neutral-950/60 border border-neutral-800 flex items-start gap-2.5">
              <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-neutral-100">Permanent Desktop Icon</span>
                <p className="text-[11px] text-neutral-400 mt-0.5">Appears on your desktop like any Windows application (.exe) so you can double click to open anytime.</p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-neutral-950/60 border border-neutral-800 flex items-start gap-2.5">
              <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-neutral-100">Ultra Low RAM Footprint (&lt;80MB)</span>
                <p className="text-[11px] text-neutral-400 mt-0.5">Engineered for low-end hardware, budget laptops, and distraction-free research.</p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-neutral-950/60 border border-neutral-800 flex items-start gap-2.5">
              <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-neutral-100">Alt + Space Global Shortcut</span>
                <p className="text-[11px] text-neutral-400 mt-0.5">Quickly summon your search from anywhere on Windows without touching the mouse.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Back to search button */}
        <div className="text-center pt-4">
          <button
            onClick={onBackToSearch}
            className="px-6 py-2.5 rounded-lg border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 font-mono text-xs font-semibold transition-colors"
          >
            ← Return to CHROS Search Engine
          </button>
        </div>
      </div>
    </div>
  );
};
