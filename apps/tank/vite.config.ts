import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/postcss';
import {fileURLToPath} from 'node:url';
export default defineConfig({root:fileURLToPath(new URL('./src',import.meta.url)),base:'/apps/tank/',publicDir:false,resolve:{alias:{'@':fileURLToPath(new URL('./src',import.meta.url))}},plugins:[react()],css:{postcss:{plugins:[tailwindcss()]}},build:{outDir:fileURLToPath(new URL('.',import.meta.url)),emptyOutDir:false,assetsDir:'static'}});
