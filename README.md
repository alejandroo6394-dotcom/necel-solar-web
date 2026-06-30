# Necel Solar — Web corporativa

Web oficial de **Necel Solar**, expertos en placas solares e instalaciones
fotovoltaicas para hogares y empresas. Sitio **estático** (HTML5 + CSS3 +
JavaScript, sin frameworks) preparado para producción, SEO y conversión.

> Transformamos la energía del sol en ahorro para hogares y empresas.

---

## ✨ Características

- **Diseño premium y responsive** (desktop, tablet y móvil — breakpoints 900px y 600px).
- **Calculadora solar interactiva** real: estima ahorro anual/mensual, instalación
  recomendada (kWp y nº de paneles), amortización y CO₂ evitado por provincia.
- **Galería de instalaciones** reales con filtros por categoría (viviendas, empresas, industriales).
- **40 opiniones** de clientes tipo Google Reviews con avatares generados (personas ficticias).
- **Formulario de contacto** con validación JavaScript, mensaje de confirmación y
  preparado para conectar con email / CRM / backend.
- **Animaciones suaves**: scroll reveal, contadores, barra de progreso, hover premium
  (respetan `prefers-reduced-motion`).
- **SEO técnico**: meta tags, Open Graph, Twitter Cards, datos estructurados
  Schema.org (LocalBusiness + FAQ), `sitemap.xml`, `robots.txt` y HTML semántico.
- **Mejora progresiva**: el contenido se muestra completo aunque JavaScript esté desactivado.
- **WhatsApp flotante** y CTAs de conversión en toda la página.

---

## 📁 Estructura del proyecto

```
necel-solar-web/
├── index.html              # Página principal (todo el contenido)
├── favicon.ico
├── site.webmanifest        # Manifest PWA
├── robots.txt
├── sitemap.xml
├── css/
│   ├── reset.css           # Reset / normalización
│   ├── layout.css          # Tokens de diseño, tipografía, header, hero, footer
│   ├── components.css      # Botones, tarjetas, calculadora, FAQ, formularios…
│   ├── animations.css      # Scroll reveal, keyframes, barra de progreso
│   └── no-js.css           # Fallback sin JavaScript (mejora progresiva)
├── js/
│   ├── main.js             # Navegación, reveal, contadores, opiniones, galería, FAQ
│   ├── calculator.js       # Calculadora solar (modelo de cálculo + provincias)
│   └── forms.js            # Validación y envío del formulario de contacto
└── assets/
    ├── logo/               # Logotipo (color, blanco y original)
    ├── marcas/             # Logotipos de fabricantes (SVG)
    ├── instalaciones/      # Fotografías reales de instalaciones
    ├── equipo/             # (preparada para fotos del equipo)
    └── icons/              # Favicons e iconos de la app
```

> El CSS y el JavaScript están **totalmente separados** del HTML (sin estilos ni
> scripts en línea).

---

## 🚀 Publicación

Al ser un sitio estático, puedes subirlo tal cual a cualquier hosting:

### Hosting FTP (Hostinger, SiteGround, Raiola…)
1. Sube **todo el contenido** de la carpeta `necel-solar-web/` a la raíz pública
   del hosting (normalmente `public_html/`).
2. Conecta el dominio `necelsolar.com`.
3. ¡Listo! No requiere build ni dependencias.

### Cloudflare Pages / Netlify
- **Build command:** _(vacío)_
- **Output / publish directory:** `/` (la raíz del repositorio)
- Conecta el repositorio y despliega; ambos detectan el sitio estático automáticamente.

### Probar en local
Abre `index.html` en el navegador, o sirve la carpeta con cualquier servidor estático:

```bash
python3 -m http.server 8000
# luego visita http://localhost:8000
```

---

## ⚙️ Personalización rápida

| Qué quieres cambiar | Dónde |
|---|---|
| Teléfono, email, dirección | `index.html` (sección contacto + footer + JSON-LD) |
| Colores de marca | Variables CSS en `css/layout.css` (`:root`) |
| Opiniones de clientes | Array `REVIEWS` en `js/main.js` |
| Provincias y modelo de cálculo | `CONFIG` y `PROVINCES` en `js/calculator.js` |
| Logotipos de fabricantes | Sustituye los SVG en `assets/marcas/` |
| Fotos de instalaciones | Reemplaza/añade imágenes en `assets/instalaciones/` |

### Conectar el formulario de contacto
En `js/forms.js`, edita `CONFIG.endpoint` con la URL de tu servicio
(Formspree, Getform, Web3Forms o tu propio backend/CRM). Si se deja en `null`,
el formulario funciona en modo demostración (valida y muestra confirmación sin enviar).

---

## 📝 Notas

- Los **avatares de las opiniones** se generan con las iniciales sobre un degradado:
  son personas ficticias, no se utilizan fotografías ni nombres de clientes reales.
- Los **resultados de la calculadora** son orientativos (valores medios de producción
  por provincia y precios de referencia); el estudio técnico personalizado puede variar.
- Los **logotipos de fabricantes** son versiones provisionales en SVG, listas para
  sustituir por los oficiales (ver `assets/marcas/README.md`).
- Sustituye los enlaces `#` de aviso legal, privacidad y cookies, y las URLs de redes
  sociales, por las definitivas antes de publicar.
