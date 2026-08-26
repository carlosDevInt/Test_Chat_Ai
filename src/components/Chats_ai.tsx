import React, { useState, useEffect, useRef } from 'react';
import {
    Loader2,
    Check,
    User,
    Bot,
    History,
    Save,
    Trash2,
    Plus,
    X,
    Send,
    Sparkles,
    Copy,
    MessageSquare,
    Search,
    Lightbulb,
    Code2,
    Zap,
    CornerDownLeft
} from 'lucide-react';

interface Mensaje {
    rol: "user" | "ia";
    texto: string;
    hora?: string;
}

interface ChatGuardado {
    id: string;
    nombre: string;
    mensajes: Mensaje[];
    fecha: string;
}

const sugerencias = [
    {
        icono: Lightbulb,
        titulo: "Explicar concepto",
        prompt: "Explica cómo funciona la inteligencia artificial generativa de forma sencilla.",
        color: "from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30"
    },
    {
        icono: Code2,
        titulo: "Escribir código",
        prompt: "Crea una función en TypeScript para formatear fechas relativas con ejemplos.",
        color: "from-blue-500/20 to-cyan-500/20 text-blue-400 border-blue-500/30"
    },
    {
        icono: Zap,
        titulo: "Optimizar ideas",
        prompt: "Dame 5 ideas innovadoras para mejorar la experiencia de usuario en una app web.",
        color: "from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30"
    },
    {
        icono: MessageSquare,
        titulo: "Redactar resumen",
        prompt: "Redacta un correo profesional solicitando una reunión de seguimiento de proyecto.",
        color: "from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30"
    }
];

const Chats_ai: React.FC = () => {
    const [input, setInput] = useState("");
    const [mensajes, setMensajes] = useState<Mensaje[]>([]);
    const [cargando, setCargando] = useState(false);
    const [chatsGuardados, setChatsGuardados] = useState<ChatGuardado[]>([]);
    const [sidebarAbierta, setSidebarAbierta] = useState(false);
    const [busquedaHistorial, setBusquedaHistorial] = useState("");
    const [copiadoIndex, setCopiadoIndex] = useState<number | null>(null);
    const [notificacion, setNotificacion] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Cargar chats desde localStorage al iniciar
    useEffect(() => {
        try {
            const guardados = localStorage.getItem("chats_astro_ai");
            if (guardados) {
                setChatsGuardados(JSON.parse(guardados));
            }
        } catch (e) {
            console.error("Error al cargar historial:", e);
        }
    }, []);

    // Guardar chats en localStorage cuando cambien
    useEffect(() => {
        if (chatsGuardados.length > 0) {
            localStorage.setItem("chats_astro_ai", JSON.stringify(chatsGuardados));
        }
    }, [chatsGuardados]);

    // Auto-scroll suave al fondo cuando hay mensajes nuevos
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [mensajes, cargando]);

    const mostrarToast = (mensaje: string) => {
        setNotificacion(mensaje);
        setTimeout(() => setNotificacion(null), 3000);
    };

    const getHoraActual = () => {
        return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const guardarChatActual = () => {
        if (mensajes.length === 0) return;

        const primerTexto = mensajes[0].texto;
        const nombreSugerido = primerTexto.length > 30 
            ? primerTexto.substring(0, 30) + "..." 
            : primerTexto;

        const nuevoChat: ChatGuardado = {
            id: Date.now().toString(),
            nombre: nombreSugerido,
            mensajes: [...mensajes],
            fecha: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
        };

        const actualizados = [nuevoChat, ...chatsGuardados.filter(c => c.id !== nuevoChat.id)];
        setChatsGuardados(actualizados);
        localStorage.setItem("chats_astro_ai", JSON.stringify(actualizados));
        mostrarToast("✓ Chat guardado en tu historial");
    };

    const cargarChat = (chat: ChatGuardado) => {
        setMensajes(chat.mensajes);
        setSidebarAbierta(false);
        mostrarToast(`Cargado: "${chat.nombre}"`);
    };

    const nuevoChat = () => {
        setMensajes([]);
        setSidebarAbierta(false);
        if (textareaRef.current) {
            textareaRef.current.focus();
        }
    };

    const eliminarChat = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const filtrados = chatsGuardados.filter(c => c.id !== id);
        setChatsGuardados(filtrados);
        localStorage.setItem("chats_astro_ai", JSON.stringify(filtrados));
        mostrarToast("Chat eliminado del historial");
    };

    const copiarTexto = (texto: string, index: number) => {
        navigator.clipboard.writeText(texto);
        setCopiadoIndex(index);
        setTimeout(() => setCopiadoIndex(null), 2000);
    };

    const handleGenerar = async (textoAEnviar?: string) => {
        const query = (textoAEnviar ?? input).trim();
        if (!query || cargando) return;

        const nuevoMensajeUsuario: Mensaje = { 
            rol: "user", 
            texto: query, 
            hora: getHoraActual() 
        };
        
        setMensajes(prev => [...prev, nuevoMensajeUsuario]);
        setCargando(true);
        setInput("");

        try {
            const response = await fetch("http://localhost:3001/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: query })
            });

            if (!response.ok) {
                throw new Error("No se pudo obtener respuesta del servidor.");
            }

            const data = await response.json();
            const nuevoMensajeIA: Mensaje = { 
                rol: "ia", 
                texto: data.text ?? data.respuesta ?? "Respuesta recibida.", 
                hora: getHoraActual() 
            };
            setMensajes(prev => [...prev, nuevoMensajeIA]);
        } catch (error) {
            console.error("Error:", error);
            setMensajes(prev => [
                ...prev, 
                { 
                    rol: "ia", 
                    texto: "⚠️ Ocurrió un inconveniente al conectar con el asistente AI. Verifica que el servidor local esté en ejecución.", 
                    hora: getHoraActual() 
                }
            ]);
        } finally {
            setCargando(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleGenerar();
        }
    };

    const chatsFiltrados = chatsGuardados.filter(c => 
        c.nombre.toLowerCase().includes(busquedaHistorial.toLowerCase())
    );

    return (
        <section className="relative flex justify-center items-center h-full w-full text-slate-100 overflow-hidden font-sans select-none">
            
            {/* Ambient Background Glows (subtle, AppContainer handles main bg) */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/8 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/8 rounded-full blur-[140px] pointer-events-none" />

            {/* Notification Toast */}
            {notificacion && (
                <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 bg-slate-800/90 border border-slate-700/80 text-cyan-300 text-xs font-medium rounded-full shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-3 duration-200">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{notificacion}</span>
                </div>
            )}

            {/* Main Chat Container */}
            <div className="relative flex flex-col items-center justify-between w-full h-full max-w-4xl mx-auto py-5 px-4 sm:px-6 z-10">

                {/* ── Modern Top Header Bar ────────────────────────────────────────── */}
                <header className="w-full flex items-center justify-between py-3 px-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-lg mb-3">
                    <div className="flex items-center gap-3">
                        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-md shadow-blue-500/20 text-white">
                            <Bot className="w-5 h-5" />
                            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                                    Gemini AI Assistant
                                </h1>
                                <span className="px-2 py-0.5 text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full">
                                    3.1 Flash
                                </span>
                            </div>
                            <p className="text-xs text-slate-400 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                Listo para responder
                            </p>
                        </div>
                    </div>

                    {/* Header Actions */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={nuevoChat}
                            title="Comenzar un nuevo chat"
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white rounded-xl text-xs font-medium transition-all border border-slate-700/60 shadow-sm active:scale-95"
                        >
                            <Plus className="w-3.5 h-3.5 text-blue-400" />
                            <span className="hidden sm:inline">Nuevo</span>
                        </button>

                        <button
                            onClick={guardarChatActual}
                            disabled={mensajes.length === 0}
                            title="Guardar esta conversación"
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/15 hover:bg-blue-600/30 text-blue-300 hover:text-blue-200 rounded-xl text-xs font-medium transition-all border border-blue-500/30 disabled:opacity-40 disabled:pointer-events-none active:scale-95 shadow-sm"
                        >
                            <Save className="w-3.5 h-3.5 text-blue-400" />
                            <span className="hidden sm:inline">Guardar</span>
                        </button>

                        <button
                            onClick={() => setSidebarAbierta(true)}
                            title="Ver historial de chats"
                            className="relative flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white rounded-xl text-xs font-medium transition-all border border-slate-700/60 active:scale-95 shadow-sm"
                        >
                            <History className="w-4 h-4 text-indigo-400" />
                            <span className="hidden sm:inline">Historial</span>
                            {chatsGuardados.length > 0 && (
                                <span className="px-1.5 py-0.2 text-[10px] font-bold bg-indigo-500 text-white rounded-full">
                                    {chatsGuardados.length}
                                </span>
                            )}
                        </button>
                    </div>
                </header>

                {/* ── Message Area & Feed ─────────────────────────────────────────── */}
                <div
                    ref={scrollRef}
                    className="w-full flex-1 overflow-y-auto px-1 sm:px-2 py-3 space-y-5 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent select-text"
                >
                    {/* Welcome / Empty State */}
                    {mensajes.length === 0 && !cargando && (
                        <div className="h-full flex flex-col items-center justify-center text-center px-4 py-8 max-w-lg mx-auto">
                            <div className="relative mb-5">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600/20 to-indigo-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-xl shadow-blue-500/10">
                                    <Sparkles className="w-8 h-8 animate-pulse text-indigo-400" />
                                </div>
                            </div>

                            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 tracking-tight">
                                ¿En qué podemos ayudarte hoy?
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-400 mb-8 max-w-sm">
                                Escribe cualquier consulta o selecciona una de las sugerencias rápidas:
                            </p>

                            {/* Suggestion Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
                                {sugerencias.map((sug, i) => {
                                    const IconComponent = sug.icono;
                                    return (
                                        <button
                                            key={i}
                                            onClick={() => handleGenerar(sug.prompt)}
                                            className={`group text-left p-3 rounded-xl bg-slate-900/50 hover:bg-slate-800/80 border transition-all duration-200 shadow-sm hover:scale-[1.02] flex items-start gap-2.5 ${sug.color}`}
                                        >
                                            <div className="p-2 rounded-lg bg-slate-800/90 border border-slate-700/60 mt-0.5 group-hover:border-slate-600">
                                                <IconComponent className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-xs font-semibold text-slate-200 group-hover:text-white mb-0.5">
                                                    {sug.titulo}
                                                </div>
                                                <div className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                                                    {sug.prompt}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Messages Stream */}
                    {mensajes.map((msg, index) => {
                        const isUser = msg.rol === "user";
                        return (
                            <div
                                key={index}
                                className={`flex gap-3 w-full animate-in fade-in slide-in-from-bottom-2 duration-200 group ${
                                    isUser ? 'justify-end' : 'justify-start'
                                }`}
                            >
                                {/* AI Avatar (left) */}
                                {!isUser && (
                                    <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20 mt-1">
                                        <Bot className="w-4 h-4" />
                                    </div>
                                )}

                                <div className={`flex flex-col gap-1 max-w-[85%] sm:max-w-[78%] ${isUser ? 'items-end' : 'items-start'}`}>
                                    {/* Sender Tag & Timestamp */}
                                    <div className="flex items-center gap-2 px-1 text-[11px] text-slate-400 font-medium">
                                        <span>{isUser ? 'Tú' : 'Gemini AI'}</span>
                                        {msg.hora && <span className="text-[10px] text-slate-500">• {msg.hora}</span>}
                                    </div>

                                    {/* Bubble */}
                                    <div
                                        className={`relative px-4 py-3 rounded-2xl shadow-md border leading-relaxed text-sm backdrop-blur-md ${
                                            isUser
                                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 border-blue-500/30 text-white rounded-tr-xs shadow-blue-600/10'
                                                : 'bg-slate-900/80 border-slate-800 text-slate-100 rounded-tl-xs shadow-black/20'
                                        }`}
                                    >
                                        <p className="whitespace-pre-wrap font-normal leading-relaxed">{msg.texto}</p>

                                        {/* Copy button on hover */}
                                        <button
                                            onClick={() => copiarTexto(msg.texto, index)}
                                            title="Copiar texto"
                                            className={`absolute -bottom-2.5 ${isUser ? 'left-2' : 'right-2'} p-1 rounded-md bg-slate-800 border border-slate-700 text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-all shadow-md`}
                                        >
                                            {copiadoIndex === index ? (
                                                <Check className="w-3 h-3 text-emerald-400" />
                                            ) : (
                                                <Copy className="w-3 h-3" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* User Avatar (right) */}
                                {isUser && (
                                    <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-500 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 mt-1">
                                        <User className="w-4 h-4" />
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* Loading Animation Bubble */}
                    {cargando && (
                        <div className="flex gap-3 w-full animate-in fade-in duration-300">
                            <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20 mt-1">
                                <Loader2 className="w-4 h-4 animate-spin text-white" />
                            </div>

                            <div className="flex flex-col gap-1 items-start">
                                <div className="px-1 text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
                                    <span>Gemini AI</span>
                                    <span className="text-[10px] text-indigo-400">generando respuesta...</span>
                                </div>

                                <div className="px-4 py-3.5 rounded-2xl rounded-tl-xs bg-slate-900/80 border border-slate-800 flex items-center gap-1.5 shadow-md">
                                    <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" />
                                    <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce [animation-delay:-0.15s]" />
                                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.3s]" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Modern Floating Input Dock ─────────────────────────────────── */}
                <div className="w-full pt-2">
                    <div className="relative flex items-center gap-2 p-2 rounded-2xl bg-slate-900/80 border border-slate-800 focus-within:border-blue-500/60 focus-within:ring-2 focus-within:ring-blue-500/20 backdrop-blur-xl shadow-2xl transition-all duration-200">
                        
                        <textarea
                            ref={textareaRef}
                            rows={1}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Escribe tu mensaje a Gemini AI..."
                            disabled={cargando}
                            className="flex-1 bg-transparent px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none resize-none leading-relaxed max-h-32 disabled:opacity-50"
                        />

                        {input.trim().length > 0 && (
                            <button
                                onClick={() => setInput("")}
                                title="Limpiar"
                                className="p-1.5 text-slate-500 hover:text-slate-300 rounded-lg hover:bg-slate-800 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}

                        <button
                            onClick={() => handleGenerar()}
                            disabled={cargando || !input.trim()}
                            title="Enviar mensaje (Enter)"
                            className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600 text-white shadow-lg shadow-blue-600/25 transition-all duration-200 active:scale-95 disabled:scale-100 flex-shrink-0"
                        >
                            {cargando ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Send className="w-4 h-4 ml-0.5" />
                            )}
                        </button>
                    </div>

                    <div className="flex items-center justify-between px-2 pt-1.5 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                            <CornerDownLeft className="w-3 h-3 text-slate-600" /> Presiona <b>Enter</b> para enviar
                        </span>
                        <span>AI Assistant v3.1</span>
                    </div>
                </div>
            </div>

            {/* ── Slide-Over History Sidebar ───────────────────────────────────── */}
            <aside
                className={`fixed top-0 right-0 h-full w-80 sm:w-96 bg-[#0B0F19]/95 border-l border-slate-800/90 shadow-2xl backdrop-blur-2xl transition-transform duration-300 ease-out z-40 flex flex-col ${
                    sidebarAbierta ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                {/* Sidebar Header */}
                <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                            <History className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-white">Historial de Chats</h3>
                            <p className="text-[11px] text-slate-400">{chatsGuardados.length} conversaciones guardadas</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setSidebarAbierta(false)}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Search in History */}
                {chatsGuardados.length > 0 && (
                    <div className="p-4 border-b border-slate-800/60">
                        <div className="relative flex items-center">
                            <Search className="w-3.5 h-3.5 absolute left-3 text-slate-500 pointer-events-none" />
                            <input
                                type="text"
                                value={busquedaHistorial}
                                onChange={(e) => setBusquedaHistorial(e.target.value)}
                                placeholder="Buscar en historial..."
                                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-900/80 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 outline-none focus:border-indigo-500/50"
                            />
                        </div>
                    </div>
                )}

                {/* History List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2.5 scrollbar-thin scrollbar-thumb-slate-800">
                    {chatsGuardados.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                            <MessageSquare className="w-10 h-10 mb-2 opacity-30" />
                            <p className="text-xs font-medium">No hay chats guardados aún</p>
                            <p className="text-[11px] text-slate-600 mt-1">Haz clic en "Guardar" en la barra superior para almacenar tus chats.</p>
                        </div>
                    ) : chatsFiltrados.length === 0 ? (
                        <div className="text-center py-10 text-slate-500 text-xs">
                            No se encontraron resultados para "{busquedaHistorial}"
                        </div>
                    ) : (
                        chatsFiltrados.map(chat => (
                            <div
                                key={chat.id}
                                onClick={() => cargarChat(chat)}
                                className="group relative p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-indigo-500/40 cursor-pointer transition-all duration-200 shadow-sm"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-slate-200 group-hover:text-white text-xs truncate mb-1">
                                            {chat.nombre}
                                        </p>
                                        <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                            <span>{chat.fecha}</span>
                                            <span>•</span>
                                            <span>{chat.mensajes.length} mensajes</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => eliminarChat(chat.id, e)}
                                        title="Eliminar del historial"
                                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Sidebar Footer */}
                {chatsGuardados.length > 0 && (
                    <div className="p-4 border-t border-slate-800/80 flex items-center justify-between">
                        <button
                            onClick={() => {
                                if (confirm("¿Estás seguro de que deseas borrar todo el historial?")) {
                                    setChatsGuardados([]);
                                    localStorage.removeItem("chats_astro_ai");
                                    mostrarToast("Historial eliminado por completo");
                                }
                            }}
                            className="text-[11px] text-slate-500 hover:text-red-400 transition-colors flex items-center gap-1"
                        >
                            <Trash2 className="w-3 h-3" /> Vaciar historial
                        </button>
                    </div>
                )}
            </aside>

            {/* Sidebar Overlay */}
            {sidebarAbierta && (
                <div
                    onClick={() => setSidebarAbierta(false)}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 transition-opacity animate-in fade-in duration-200"
                />
            )}
        </section>
    );
};

export default Chats_ai;