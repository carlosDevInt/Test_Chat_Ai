import React, { useState, useRef } from "react";
import {
    Loader2,
    ImageIcon,
    Download,
    Trash2,
    Sparkles,
    X,
    Wand2,
    ZoomIn,
    Clock,
    Grid3X3,
    LayoutGrid,
    RefreshCw,
    Copy,
    Check,
    AlertCircle,
} from "lucide-react";

interface ImagenGenerada {
    id: string;
    prompt: string;
    src: string;
    mimeType: string;
    texto?: string | null;
    fecha: string;
}

const promptsInspiración = [
    "Un astronauta meditando en la luna al atardecer, estilo cinematográfico",
    "Ciudad cyberpunk bajo la lluvia con luces de neón reflejadas en el asfalto",
    "Bosque mágico con árboles bioluminiscentes y criaturas fantásticas",
    "Robot antiguo oxidado rodeado de flores silvestres en un campo",
    "Taza de café flotando en el espacio exterior, ultra realista",
    "Arquitectura futurista con jardines colgantes y autos voladores",
    "Un gato con sombrero de copa leyendo un libro antiguo en una biblioteca polvorienta, estilo renacentista",
    "Un perro astronauta paseando en la luna, estilo retro de los años 60",
    "Un dragón hecho de cristal flotando sobre una cascada de lava, estilo fantasía épica",
    "Una ciudad submarina con edificios de coral y peces bioluminiscentes",
    "Un robot samurai luchando contra ninjas en un tejado de Tokio bajo la lluvia",
    "Un zorro con gafas de sol conduciendo un coche deportivo convertible por la playa al atardecer",
    "Un pingüino con esmoquin sirviendo cócteles en una fiesta elegante en el Ártico",
    "Un unicornio volando sobre las nubes al amanecer, estilo fantasía suave",
    "Un robot detective investigando un caso en una calle oscura de Londres victoriano",
    "Un koala chef preparando sushi en una cocina moderna y minimalista",
    "Un león majestuoso sentado en un trono de oro en la selva, estilo realista",
    "Un mono astronauta explorando un planeta alienígena desconocido, estilo ciencia ficción",
    "Un zorro ninja deslizándose entre las sombras de Kioto al anochecer",
    "Un panda gigante meditando en un jardín zen rodeado de bambú",
    "Un koala surfista cabalgando una ola gigante en Australia",
    "Un delfín con gafas de sol nadando en el océano tropical"
];

const Burrito_Img: React.FC = () => {
    const [prompt, setPrompt] = useState("");
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [imagenes, setImagenes] = useState<ImagenGenerada[]>([]);
    const [imagenZoom, setImagenZoom] = useState<ImagenGenerada | null>(null);
    const [vistaGrid, setVistaGrid] = useState<"masonry" | "grid">("masonry");
    const [promptCopiado, setPromptCopiado] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleGenerar = async (textoPrompt?: string) => {
        const queryFinal = (textoPrompt ?? prompt).trim();
        if (!queryFinal || cargando) return;
        setError(null);
        setCargando(true);
        if (textoPrompt) setPrompt(textoPrompt);

        try {
            const response = await fetch("http://localhost:3002/generate-image", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: queryFinal }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.details ?? data.error ?? "Error desconocido");
            }

            const dataUrl = `data:${data.mimeType};base64,${data.image}`;

            const nueva: ImagenGenerada = {
                id: Date.now().toString(),
                prompt: queryFinal,
                src: dataUrl,
                mimeType: data.mimeType,
                texto: data.text,
                fecha: new Date().toLocaleString("es-MX", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                }),
            };

            setImagenes((prev) => [nueva, ...prev]);
            setPrompt("");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al generar imagen");
        } finally {
            setCargando(false);
        }
    };

    const handleDescargar = (img: ImagenGenerada) => {
        const a = document.createElement("a");
        a.href = img.src;
        const ext = img.mimeType.split("/")[1] ?? "png";
        a.download = `gemini-img-${img.id}.${ext}`;
        a.click();
    };

    const handleEliminar = (id: string) => {
        setImagenes((prev) => prev.filter((img) => img.id !== id));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleGenerar();
        }
    };

    const copiarPrompt = (texto: string) => {
        navigator.clipboard.writeText(texto);
        setPromptCopiado(true);
        setTimeout(() => setPromptCopiado(false), 2000);
    };

    const inspiracionAleatoria = () => {
        const random = promptsInspiración[Math.floor(Math.random() * promptsInspiración.length)];
        setPrompt(random);
        textareaRef.current?.focus();
    };

    return (
        <div className="relative flex flex-col h-full w-full overflow-hidden text-slate-100 select-none">

            {/* Ambient glows */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-700/8 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-fuchsia-700/8 rounded-full blur-[120px] pointer-events-none" />

            {/* ── Scrollable body ──────────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">

                {/* ── Hero / Prompt Area ───────────────────────────────────────── */}
                <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 pb-6">

                    {/* Section heading */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="relative p-2.5 rounded-2xl bg-linear-to-tr from-purple-600/30 to-fuchsia-600/20 border border-purple-500/30 shadow-lg shadow-purple-900/20">
                                <Wand2 className="w-5 h-5 text-purple-300" />
                                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-purple-400 rounded-full border-2 border-[#090D16] animate-pulse" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white tracking-tight leading-tight">
                                    Generador de Imágenes
                                </h2>
                                <p className="text-[11px] text-slate-400">Describe y deja que Gemini lo cree</p>
                            </div>
                        </div>

                        <button
                            onClick={inspiracionAleatoria}
                            title="Obtener prompt aleatorio de inspiración"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-purple-300 bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 hover:border-purple-500/40 transition-all active:scale-95"
                        >
                            <RefreshCw className="w-3 h-3" />
                            <span className="hidden sm:inline">Inspiración</span>
                        </button>
                    </div>

                    {/* Prompt Card */}
                    <div className={`relative rounded-2xl overflow-hidden transition-all duration-200 ${
                        prompt.length > 0
                            ? 'shadow-xl shadow-purple-900/20 ring-1 ring-purple-500/30'
                            : 'shadow-lg shadow-black/30'
                    } bg-slate-900/70 backdrop-blur-xl border border-slate-800/90`}>

                        {/* Top decorative gradient bar */}
                        <div className="h-0.5 w-full bg-linear-to-r from-purple-600 via-fuchsia-500 to-indigo-600 opacity-60" />

                        <textarea
                            ref={textareaRef}
                            rows={3}
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="✦  Describe la imagen con detalle: estilo, composición, luz, colores…"
                            disabled={cargando}
                            className="w-full bg-transparent resize-none px-5 pt-4 pb-3 text-slate-100 placeholder-slate-600 text-[15px] outline-none leading-relaxed disabled:opacity-50 font-light"
                        />

                        {/* Bottom toolbar */}
                        <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-800/70 bg-slate-950/30">
                            <div className="flex items-center gap-3">
                                <span className={`text-[11px] font-mono transition-colors ${
                                    prompt.length > 400 ? 'text-amber-400' : 'text-slate-500'
                                }`}>
                                    {prompt.length}<span className="text-slate-600">/500</span>
                                </span>
                                <span className="text-[10px] text-slate-600 hidden sm:inline">
                                    Shift+↵ para salto de línea
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                {prompt.trim().length > 0 && (
                                    <button
                                        onClick={() => setPrompt("")}
                                        className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
                                        title="Limpiar"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}

                                <button
                                    onClick={() => handleGenerar()}
                                    disabled={cargando || !prompt.trim()}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95 disabled:pointer-events-none
                                    bg-linear-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500
                                    disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600
                                    text-white shadow-lg shadow-purple-900/30"
                                >
                                    {cargando ? (
                                        <>
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            <span>Generando...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-3.5 h-3.5" />
                                            <span>Generar</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Error banner */}
                    {error && (
                        <div className="mt-3 flex items-start gap-2.5 bg-red-500/8 border border-red-500/25 text-red-300 text-sm px-4 py-3 rounded-xl animate-in fade-in duration-200">
                            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-400" />
                            <div>
                                <p className="font-semibold text-red-300 text-xs mb-0.5">Error de generación</p>
                                <p className="text-xs text-red-400/80">{error}</p>
                            </div>
                            <button onClick={() => setError(null)} className="ml-auto p-1 hover:bg-red-500/10 rounded-lg">
                                <X className="w-3.5 h-3.5 text-red-400" />
                            </button>
                        </div>
                    )}

                    {/* Prompt chips de inspiración */}
                    {imagenes.length === 0 && !cargando && (
                        <div className="mt-5 space-y-2">
                            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest px-1">
                                Ideas rápidas
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {promptsInspiración.slice(0, 4).map((p, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleGenerar(p)}
                                        className="text-[11px] text-slate-400 hover:text-purple-300 bg-slate-900/60 hover:bg-purple-500/10 border border-slate-800/80 hover:border-purple-500/30 px-3 py-1.5 rounded-full transition-all duration-200 text-left line-clamp-1 max-w-55 truncate"
                                    >
                                        ✦ {p}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Loading Skeleton ─────────────────────────────────────────── */}
                {cargando && (
                    <div className="max-w-3xl mx-auto px-4 sm:px-6 mb-6">
                        <div className="relative rounded-2xl overflow-hidden border border-purple-500/20 bg-slate-900/60 shadow-2xl shadow-purple-900/20">
                            <div className="h-0.5 w-full bg-linear-to-r from-purple-600 via-fuchsia-500 to-indigo-600 opacity-80 animate-pulse" />
                            <div className="flex flex-col items-center justify-center gap-4 py-16 px-6">
                                <div className="relative">
                                    <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                                        <Wand2 className="w-7 h-7 text-purple-400 animate-pulse" />
                                    </div>
                                    <div className="absolute -inset-1 rounded-2xl border border-purple-500/20 animate-ping opacity-30" />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-semibold text-purple-300 mb-1">Gemini está creando tu imagen…</p>
                                    <p className="text-xs text-slate-500">Esto puede tomar unos segundos</p>
                                </div>

                                {/* Animated bars */}
                                <div className="flex items-end gap-1.5 h-8">
                                    {[4, 7, 5, 9, 6, 8, 4, 7, 5].map((h, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                height: `${h * 3}px`,
                                                animationDelay: `${i * 0.08}s`
                                            }}
                                            className="w-1 rounded-full bg-linear-to-t from-purple-600 to-fuchsia-400 animate-bounce opacity-70"
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Gallery Section ──────────────────────────────────────────── */}
                {imagenes.length > 0 && (
                    <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-8">

                        {/* Gallery Header */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                                    Generadas
                                </h3>
                                <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/25 rounded-full">
                                    {imagenes.length}
                                </span>
                            </div>

                            {/* Layout toggle */}
                            <div className="flex items-center p-0.5 rounded-lg bg-slate-900/80 border border-slate-800/80 gap-0.5">
                                <button
                                    onClick={() => setVistaGrid("masonry")}
                                    className={`p-1.5 rounded-md transition-all ${
                                        vistaGrid === "masonry"
                                            ? "bg-purple-500/20 text-purple-300"
                                            : "text-slate-500 hover:text-slate-300"
                                    }`}
                                    title="Vista masonry"
                                >
                                    <LayoutGrid className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    onClick={() => setVistaGrid("grid")}
                                    className={`p-1.5 rounded-md transition-all ${
                                        vistaGrid === "grid"
                                            ? "bg-purple-500/20 text-purple-300"
                                            : "text-slate-500 hover:text-slate-300"
                                    }`}
                                    title="Vista cuadrícula"
                                >
                                    <Grid3X3 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>

                        {/* Image Grid */}
                        <div className={`grid gap-4 ${
                            vistaGrid === "grid"
                                ? "grid-cols-2 sm:grid-cols-3"
                                : "grid-cols-1 sm:grid-cols-2"
                        }`}>
                            {imagenes.map((img) => (
                                <div
                                    key={img.id}
                                    className="group relative rounded-2xl overflow-hidden bg-slate-900/60 border border-slate-800/80 hover:border-purple-500/40 transition-all duration-300 shadow-xl hover:shadow-purple-900/20 hover:shadow-2xl"
                                >
                                    {/* Image with overlay */}
                                    <div
                                        className="relative cursor-zoom-in overflow-hidden"
                                        onClick={() => setImagenZoom(img)}
                                    >
                                        <img
                                            src={img.src}
                                            alt={img.prompt}
                                            className="w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                                        />

                                        {/* Hover overlay */}
                                        <div className="absolute inset-0 bg-linear-to-t from-[#090D16]/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                        {/* Zoom pill */}
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-medium shadow-lg">
                                                <ZoomIn className="w-3.5 h-3.5" />
                                                Ver completa
                                            </div>
                                        </div>

                                        {/* Quick action buttons top-right */}
                                        <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDescargar(img); }}
                                                title="Descargar imagen"
                                                className="p-1.5 rounded-lg bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-slate-300 hover:text-purple-300 hover:border-purple-500/40 transition-colors shadow-md"
                                            >
                                                <Download className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleEliminar(img.id); }}
                                                title="Eliminar imagen"
                                                className="p-1.5 rounded-lg bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-slate-300 hover:text-red-400 hover:border-red-500/40 transition-colors shadow-md"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Card footer */}
                                    <div className="p-3 space-y-2 border-t border-slate-800/60">
                                        <p className="text-[12px] text-slate-300 line-clamp-2 leading-relaxed font-light">
                                            "{img.prompt}"
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <span className="flex items-center gap-1 text-[10px] text-slate-500">
                                                <Clock className="w-3 h-3" />
                                                {img.fecha}
                                            </span>
                                            <button
                                                onClick={() => copiarPrompt(img.prompt)}
                                                className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-purple-300 transition-colors px-2 py-0.5 rounded-md hover:bg-purple-500/10"
                                                title="Copiar prompt"
                                            >
                                                {promptCopiado ? (
                                                    <Check className="w-3 h-3 text-emerald-400" />
                                                ) : (
                                                    <Copy className="w-3 h-3" />
                                                )}
                                                Copiar prompt
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Empty State ──────────────────────────────────────────────── */}
                {imagenes.length === 0 && !cargando && (
                    <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-8">
                        <div className="relative overflow-hidden rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 backdrop-blur-sm py-16 flex flex-col items-center text-center gap-4">
                            <div className="relative">
                                {/* Decorative rings */}
                                <div className="absolute inset-0 rounded-full border border-purple-500/10 scale-[1.8] animate-ping" style={{ animationDuration: '3s' }} />
                                <div className="absolute inset-0 rounded-full border border-purple-500/10 scale-[1.4]" />
                                <div className="relative w-16 h-16 rounded-2xl bg-linear-to-br from-purple-600/20 to-fuchsia-600/10 border border-purple-500/20 flex items-center justify-center shadow-xl shadow-purple-900/10">
                                    <ImageIcon className="w-8 h-8 text-purple-400/60" />
                                </div>
                            </div>
                            <div>
                                <p className="font-bold text-slate-300 mb-1.5">Tu galería está vacía</p>
                                <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
                                    Escribe un prompt descriptivo arriba, o elige una de las <strong className="text-slate-400">ideas rápidas</strong> para empezar.
                                </p>
                            </div>
                            <button
                                onClick={inspiracionAleatoria}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-purple-300 bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 transition-all active:scale-95 mt-1"
                            >
                                <RefreshCw className="w-3.5 h-3.5" />
                                Sorpréndeme con un prompt
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Modal Zoom ──────────────────────────────────────────────────── */}
            {imagenZoom && (
                <div
                    className="fixed inset-0 bg-black/92 backdrop-blur-lg z-50 flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200"
                    onClick={() => setImagenZoom(null)}
                >
                    {/* Close */}
                    <button
                        className="absolute top-4 right-4 p-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 rounded-full transition-colors shadow-lg backdrop-blur"
                        onClick={() => setImagenZoom(null)}
                    >
                        <X className="w-5 h-5 text-white" />
                    </button>

                    {/* Content */}
                    <div
                        className="max-w-2xl w-full space-y-3"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="rounded-2xl overflow-hidden border border-slate-800/60 shadow-2xl shadow-purple-900/20">
                            <div className="h-0.5 bg-linear-to-r from-purple-600 via-fuchsia-500 to-indigo-600 opacity-70" />
                            <img
                                src={imagenZoom.src}
                                alt={imagenZoom.prompt}
                                className="w-full object-contain max-h-[70vh]"
                            />
                        </div>

                        {/* Zoom footer */}
                        <div className="flex items-start justify-between gap-3 px-1">
                            <p className="text-xs text-slate-400 italic flex-1 leading-relaxed">
                                "{imagenZoom.prompt}"
                            </p>
                            <div className="flex gap-2 shrink-0">
                                <button
                                    onClick={() => copiarPrompt(imagenZoom.prompt)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800/80 border border-slate-700/60 hover:border-purple-500/40 hover:text-purple-300 transition-all"
                                >
                                    {promptCopiado ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                    Prompt
                                </button>
                                <button
                                    onClick={() => handleDescargar(imagenZoom)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-linear-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 transition-all shadow-lg shadow-purple-900/30"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                    Descargar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Burrito_Img;