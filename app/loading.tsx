// Loader que Next.js muestra automáticamente durante la navegación
// entre rutas (Suspense boundary del App Router). Usa el mismo diseño
// premium definido en globals.css (.pn-loader).
export default function Loading() {
  return (
    <div className="pn-loader" role="status" aria-label="Cargando">
      <div className="pn-loader__halo" />
      <div className="pn-loader__badge">
        <div className="pn-loader__ring" />
        <div className="pn-loader__ring2" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-removebg-preview.png" alt="Punto Norte" className="pn-loader__logo" width={84} height={84} />
      </div>
      <div className="pn-loader__word">Punto Norte</div>
      <div className="pn-loader__bar" />
      <div className="pn-loader__text">Cargando</div>
    </div>
  )
}
