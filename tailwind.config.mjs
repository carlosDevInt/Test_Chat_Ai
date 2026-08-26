import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite'; // 1. Importa el plugin de Vite

export default defineConfig({
  // 2. Elimina la línea de integrations: [tailwind()] si la tenías
  vite: {
    plugins: [tailwindcss()],
  },
});