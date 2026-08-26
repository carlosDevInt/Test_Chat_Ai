import React, { useState } from 'react';
import { MessageSquare, ImageIcon, Sparkles, Bot } from 'lucide-react';
import Chats_ai from './Chats_ai';
import Burrito_Img from './Burrito_Img';

type Tab = 'chat' | 'imagen';

const AppContainer: React.FC = () => {
    const [tabActiva, setTabActiva] = useState<Tab>('chat');

    const tabs = [
        {
            id: 'chat' as Tab,
            label: 'Chat AI',
            sublabel: 'Gemini 3.1 Flash',
            icon: MessageSquare,
            gradient: 'from-blue-500 to-indigo-500',
            glow: 'shadow-blue-500/20',
            activeBorder: 'border-blue-500/50',
            activeBg: 'bg-blue-500/10',
            activeText: 'text-blue-300',
            dotColor: 'bg-blue-400'
        },
        {
            id: 'imagen' as Tab,
            label: 'Generar Imagen',
            sublabel: 'Gemini Imagen',
            icon: ImageIcon,
            gradient: 'from-purple-500 to-pink-500',
            glow: 'shadow-purple-500/20',
            activeBorder: 'border-purple-500/50',
            activeBg: 'bg-purple-500/10',
            activeText: 'text-purple-300',
            dotColor: 'bg-purple-400'
        }
    ];

    const tabActual = tabs.find(t => t.id === tabActiva)!;

    return (
        <div className="relative flex flex-col h-screen w-full bg-[#090D16] overflow-hidden font-sans">

            {/* ── Ambient Background Glows ────────────────────────────────── */}
            <div className="absolute top-0 left-[-15%] w-[600px] h-[400px] bg-blue-700/8 rounded-full blur-[160px] pointer-events-none" />
            <div className="absolute bottom-0 right-[-15%] w-[500px] h-[400px] bg-indigo-700/8 rounded-full blur-[140px] pointer-events-none" />
            {tabActiva === 'imagen' && (
                <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-purple-700/8 rounded-full blur-[140px] pointer-events-none" />
            )}

            {/* ── Top Navigation Bar ───────────────────────────────────────── */}
            <nav className="relative z-20 flex-shrink-0 border-b border-slate-800/80 bg-[#0A0E1A]/90 backdrop-blur-xl">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="flex items-center justify-between h-14">

                        {/* Branding */}
                        <div className="flex items-center gap-2.5">
                            <div className="relative w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-md shadow-blue-500/20">
                                <Bot className="w-4 h-4 text-white" />
                                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#0A0E1A] rounded-full" />
                            </div>
                            <div className="hidden sm:block">
                                <p className="text-xs font-bold text-white leading-tight tracking-tight flex items-center gap-1.5">
                                    AI Studio
                                    <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full">
                                        Beta
                                    </span>
                                </p>
                                <p className="text-[10px] text-slate-500">Powered by Gemini</p>
                            </div>
                        </div>

                        {/* Tab Switcher Pill */}
                        <div className="flex items-center p-1 rounded-2xl bg-slate-900/80 border border-slate-800/80 gap-1 shadow-lg">
                            {tabs.map(tab => {
                                const Icon = tab.icon;
                                const isActive = tabActiva === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setTabActiva(tab.id)}
                                        className={`relative flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                                            isActive
                                                ? `${tab.activeBg} ${tab.activeText} border ${tab.activeBorder} shadow-md`
                                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-transparent'
                                        }`}
                                    >
                                        {isActive && (
                                            <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${tab.gradient} opacity-5`} />
                                        )}
                                        <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? '' : 'opacity-70'}`} />
                                        <span className="hidden xs:inline sm:inline">{tab.label}</span>
                                        {isActive && (
                                            <span className={`w-1.5 h-1.5 rounded-full ${tab.dotColor} animate-pulse hidden sm:inline-block`} />
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Right slot: active mode badge */}
                        <div className="flex items-center gap-2">
                            <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${tabActual.activeBg} border ${tabActual.activeBorder}`}>
                                <Sparkles className={`w-3 h-3 ${tabActual.activeText}`} />
                                <span className={`text-[10px] font-semibold ${tabActual.activeText}`}>
                                    {tabActual.sublabel}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* ── Tab Content (fills remaining height) ───────────────────── */}
            <main className="flex-1 min-h-0 relative overflow-hidden">
                {/* Chat Tab */}
                <div
                    className={`absolute inset-0 transition-opacity duration-200 ${
                        tabActiva === 'chat' ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
                    }`}
                >
                    <Chats_ai />
                </div>

                {/* Image Generator Tab */}
                <div
                    className={`absolute inset-0 overflow-y-auto transition-opacity duration-200 ${
                        tabActiva === 'imagen' ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
                    }`}
                >
                    <Burrito_Img />
                </div>
            </main>
        </div>
    );
};

export default AppContainer;
