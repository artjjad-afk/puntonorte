// Loader que Next.js muestra automáticamente durante la navegación
// entre rutas (Suspense boundary del App Router). Usa el mismo estilo
// de marca definido en globals.css (.pn-loader).
export default function Loading() {
  return (
    <div className="pn-loader" role="status" aria-label="Cargando">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.png" alt="Punto Norte" className="pn-loader__logo" width={64} height={64} />
      <div className="pn-loader__ring" />
      <div className="pn-loader__text">Cargando</div>
    </div>
  )
}
