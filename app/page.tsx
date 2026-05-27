'use client'
import { useState } from 'react'

// ── Tipos ──────────────────────────────────────────────
type Pantalla =
  | 'inicio'
  | 'pedir-hora'
  | 'mis-horas'
  | 'servicios'
  | 'avisos'
  | 'que-traer'
  | 'confirmacion'

interface Hora { id: number; fecha: string; hora: string; servicio_nombre: string }
interface Aviso { id: number; titulo: string; mensaje: string }
interface Servicio { id: number; nombre: string; dias: string; horario: string; box: string }

// ── Tipos de atención ──────────────────────────────────
const ATENCIONES = [
  { id: 'medico',    icon: '🩺', label: 'Médico general',     desc: 'Síntomas, enfermedades agudas o seguimiento' },
  { id: 'cronico',   icon: '📋', label: 'Control crónico',    desc: 'Diabetes, hipertensión, asma u otras crónicas' },
  { id: 'matrona',   icon: '🤰', label: 'Matrona',            desc: 'Control prenatal, PAP, planificación familiar' },
  { id: 'tens',      icon: '💉', label: 'TENS / Enfermería',  desc: 'Curaciones, vacunas, toma de exámenes' },
  { id: 'nino',      icon: '👶', label: 'Niño sano',          desc: 'Control de desarrollo y crecimiento infantil' },
  { id: 'nutricion', icon: '🥗', label: 'Nutricionista',      desc: 'Evaluación nutricional y plan alimenticio' },
]

// ── Qué traer ──────────────────────────────────────────
const QUE_TRAER = [
  { tipo: 'Médico general',    icon: '🩺', docs: ['Carnet de identidad','Carnet FONASA','Lista de medicamentos actuales'],    extra: 'Si tiene enfermedades crónicas, traiga lista de sus remedios.' },
  { tipo: 'Control crónico',   icon: '📋', docs: ['Carnet de identidad','Carnet FONASA','Foto de derivación médica'],         extra: 'Debe enviar la foto de derivación al +56 9 5913 7356 entre 14:00–14:30.' },
  { tipo: 'Matrona',           icon: '🤰', docs: ['Carnet de identidad','Carnet FONASA','Carnet de control prenatal'],        extra: 'Para PAP: no relaciones 48h antes, no usar cremas vaginales.' },
  { tipo: 'TENS / Enfermería', icon: '💉', docs: ['Carnet de identidad','Carnet FONASA','Receta médica si aplica'],          extra: 'Para exámenes de sangre: venga en ayunas si se lo indicaron.' },
  { tipo: 'Niño sano',         icon: '👶', docs: ['Carnet del niño','Carnet FONASA','Libreta de control del niño'],          extra: 'Traiga al niño con ropa fácil de sacar.' },
  { tipo: 'Nutricionista',     icon: '🥗', docs: ['Carnet de identidad','Carnet FONASA'],                                    extra: 'Si puede, traiga registro de lo que comió los últimos 3 días.' },
]

// ── Utilidad RUT ───────────────────────────────────────
function validarRut(rut: string): boolean {
  const r = rut.replace(/\./g, '').replace('-', '')
  if (r.length < 2) return false
  const cuerpo = r.slice(0, -1)
  const dv = r.slice(-1).toUpperCase()
  let suma = 0, mul = 2
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i]) * mul
    mul = mul === 7 ? 2 : mul + 1
  }
  const esperado = 11 - (suma % 11)
  const dvEsp = esperado === 11 ? '0' : esperado === 10 ? 'K' : String(esperado)
  return dv === dvEsp
}

// ══════════════════════════════════════════════════════
export default function Home() {
  const [pantalla, setPantalla]     = useState<Pantalla>('inicio')
  const [horas]                     = useState<Hora[]>([])
  const [avisos]                    = useState<Aviso[]>([])
  const [servicios]                 = useState<Servicio[]>([])

  // Pedir hora — paso a paso
  const [paso, setPaso]             = useState(1)
  const [tipoSel, setTipoSel]       = useState('')
  const [nombre, setNombre]         = useState('')
  const [rut, setRut]               = useState('')
  const [edad, setEdad]             = useState('')
  const [fono, setFono]             = useState('')
  const [motivo, setMotivo]         = useState('')
  const [tiempo, setTiempo]         = useState('')
  const [folio, setFolio]           = useState('')
  const [errores, setErrores]       = useState<Record<string,string>>({})

  // Mis horas — buscar
  const [rutBuscar, setRutBuscar]   = useState('')

  const ir = (p: Pantalla) => { setPantalla(p); setPaso(1) }

  // Validar paso 2
  function validarPaso2(): boolean {
    const e: Record<string,string> = {}
    if (!nombre.trim() || nombre.trim().split(' ').length < 2) e.nombre = 'Ingrese nombre y apellido'
    if (!validarRut(rut)) e.rut = 'RUT no válido — revise el dígito verificador'
    if (!edad || Number(edad) < 0 || Number(edad) > 120) e.edad = 'Ingrese una edad válida'
    if (!fono || fono.replace(/\D/g,'').length < 9) e.fono = 'Ingrese un número de 9 dígitos'
    setErrores(e)
    return Object.keys(e).length === 0
  }

  // Validar paso 3
  function validarPaso3(): boolean {
    const e: Record<string,string> = {}
    if (!motivo.trim() || motivo.trim().length < 10) e.motivo = 'Describa brevemente su consulta'
    setErrores(e)
    return Object.keys(e).length === 0
  }

  function enviarSolicitud() {
    const f = 'SC-' + Math.floor(1000 + Math.random() * 9000)
    setFolio(f)
    ir('confirmacion')
  }

  // ── RENDER ─────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto">

      {/* ── HEADER ── */}
      <header className="bg-green-700 text-white px-4 py-3 sticky top-0 z-50 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-xl p-1.5">
              <img src="/logo.svg" alt="CerroSalud" className="w-7 h-7" onError={(e)=>{(e.target as HTMLImageElement).style.display='none'}}/>
              <span className="text-xl" style={{display:'none'}}>⛰️</span>
            </div>
            <div>
              <p className="font-bold text-lg leading-tight">CerroSalud</p>
              <p className="text-green-200 text-xs">CECOSF Santa Julia · Viña del Mar</p>
            </div>
          </div>
          {pantalla !== 'inicio' && (
            <button onClick={() => ir('inicio')} className="text-green-200 text-sm">
              ← Inicio
            </button>
          )}
        </div>
      </header>

      {/* ══ INICIO ══ */}
      {pantalla === 'inicio' && (
        <main className="flex-1 p-4">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-black">Buenos días</h1>
            <p className="text-gray-500 mt-1">¿En qué te ayudamos hoy?</p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { label: 'Pedir hora',  icon: '📅', s: 'pedir-hora',  color: 'bg-green-50 border-green-200' },
              { label: 'Mis horas',   icon: '🗓️', s: 'mis-horas',   color: 'bg-blue-50 border-blue-200' },
              { label: 'Servicios',   icon: '🏥', s: 'servicios',   color: 'bg-purple-50 border-purple-200' },
              { label: 'Avisos',      icon: '📢', s: 'avisos',      color: 'bg-yellow-50 border-yellow-200' },
            ].map((b) => (
              <button
                key={b.s}
                onClick={() => ir(b.s as Pantalla)}
                className={`${b.color} border-2 rounded-2xl p-5 shadow-sm flex flex-col items-center gap-2 active:scale-95 transition-transform`}
              >
                <span className="text-4xl">{b.icon}</span>
                <span className="text-base font-bold text-black">{b.label}</span>
              </button>
            ))}
          </div>

          {/* Atajo Qué traer */}
          <button
            onClick={() => ir('que-traer')}
            className="w-full bg-white border-2 border-gray-200 rounded-2xl p-4 shadow-sm flex items-center gap-3 active:scale-95 transition-transform"
          >
            <span className="text-3xl">📋</span>
            <div className="text-left">
              <p className="font-bold text-black">¿Qué traer a mi hora?</p>
              <p className="text-xs text-gray-500">Documentos según tipo de atención</p>
            </div>
            <span className="ml-auto text-gray-400">→</span>
          </button>

          {/* Aviso SAPU */}
          <div className="mt-4 bg-orange-50 border border-orange-200 rounded-2xl p-3 flex gap-2">
            <span className="text-xl">🚨</span>
            <p className="text-xs text-orange-800">
              <strong>¿Urgencia ahora?</strong> Vaya al SAPU Miraflores (24 hrs) o SAPU Gómez Carreño (17:00–00:00). No espere hora.
            </p>
          </div>
        </main>
      )}

      {/* ══ PEDIR HORA ══ */}
      {pantalla === 'pedir-hora' && (
        <main className="flex-1 p-4">

          {/* Barra de progreso */}
          <div className="flex items-center gap-1 mb-6">
            {[1,2,3,4].map(n => (
              <div key={n} className="flex items-center flex-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                  ${paso > n ? 'bg-green-600 text-white' : paso === n ? 'bg-green-700 text-white' : 'bg-gray-200 text-gray-400'}`}>
                  {paso > n ? '✓' : n}
                </div>
                {n < 4 && <div className={`h-1 flex-1 mx-1 rounded ${paso > n ? 'bg-green-500' : 'bg-gray-200'}`}/>}
              </div>
            ))}
          </div>

          {/* ─ Paso 1: Tipo de atención ─ */}
          {paso === 1 && (
            <div>
              <h2 className="text-xl font-bold text-black mb-1">¿Qué atención necesita?</h2>
              <p className="text-sm text-gray-500 mb-4">Toque la opción que corresponde</p>
              <div className="grid gap-3">
                {ATENCIONES.map(a => (
                  <button
                    key={a.id}
                    onClick={() => setTipoSel(a.label)}
                    className={`flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all active:scale-95
                      ${tipoSel === a.label
                        ? 'border-green-600 bg-green-50 shadow-md'
                        : 'border-gray-200 bg-white shadow-sm'}`}
                  >
                    <span className="text-3xl">{a.icon}</span>
                    <div className="flex-1">
                      <p className="font-bold text-black text-base">{a.label}</p>
                      <p className="text-xs text-gray-500">{a.desc}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                      ${tipoSel === a.label ? 'border-green-600 bg-green-600' : 'border-gray-300'}`}>
                      {tipoSel === a.label && <span className="text-white text-xs">✓</span>}
                    </div>
                  </button>
                ))}
              </div>
              <button
                onClick={() => { if (tipoSel) setPaso(2); else setErrores({tipo:'Seleccione un tipo de atención'}) }}
                disabled={!tipoSel}
                className="w-full mt-4 bg-green-700 text-white rounded-2xl py-4 font-bold text-base disabled:bg-gray-300 active:scale-95 transition-all"
              >
                Continuar →
              </button>
              {errores.tipo && <p className="text-red-500 text-sm text-center mt-2">{errores.tipo}</p>}
            </div>
          )}

          {/* ─ Paso 2: Datos del paciente ─ */}
          {paso === 2 && (
            <div>
              <h2 className="text-xl font-bold text-black mb-1">Sus datos</h2>
              <p className="text-sm text-gray-500 mb-4">Necesitamos esto para encontrar su ficha</p>

              {[
                { label: 'Nombre completo', id: 'nombre', val: nombre, set: setNombre, ph: 'ej: María González Rojas', type: 'text', mode: 'text' },
                { label: 'RUT (sin puntos, con guión)', id: 'rut', val: rut, set: setRut, ph: 'ej: 12345678-9', type: 'text', mode: 'text' },
                { label: 'Edad', id: 'edad', val: edad, set: setEdad, ph: 'ej: 45', type: 'number', mode: 'numeric' },
                { label: 'Teléfono de contacto', id: 'fono', val: fono, set: setFono, ph: 'ej: 9 1234 5678', type: 'tel', mode: 'tel' },
              ].map(f => (
                <div key={f.id} className="mb-4">
                  <label className="block text-sm font-semibold text-black mb-1">{f.label} <span className="text-red-500">*</span></label>
                  <input
                    type={f.type}
                    value={f.val}
                    onChange={e => { f.set(e.target.value); setErrores(p => ({...p, [f.id]: ''})) }}
                    placeholder={f.ph}
                    inputMode={f.mode as 'text'|'numeric'|'tel'}
                    className={`w-full border-2 rounded-xl px-4 py-3 text-base outline-none transition-all
                      ${errores[f.id] ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-green-600'}`}
                  />
                  {errores[f.id] && <p className="text-red-500 text-xs mt-1">⚠ {errores[f.id]}</p>}
                  {f.id === 'rut' && rut.length >= 8 && validarRut(rut) && (
                    <p className="text-green-600 text-xs mt-1">✓ RUT válido</p>
                  )}
                </div>
              ))}

              <div className="flex gap-2">
                <button onClick={() => setPaso(1)} className="px-5 py-4 border-2 border-gray-200 rounded-2xl font-bold text-gray-500 active:scale-95">← Atrás</button>
                <button onClick={() => { if (validarPaso2()) setPaso(3) }} className="flex-1 bg-green-700 text-white rounded-2xl py-4 font-bold text-base active:scale-95 transition-all">
                  Continuar →
                </button>
              </div>
            </div>
          )}

          {/* ─ Paso 3: Síntomas ─ */}
          {paso === 3 && (
            <div>
              <h2 className="text-xl font-bold text-black mb-1">Su consulta</h2>
              <p className="text-sm text-gray-500 mb-4">Esto ayuda al médico a priorizar</p>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-black mb-2">¿Hace cuánto tiene los síntomas?</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Desde hoy','2 a 3 días','Aprox. 1 semana','Más de 1 semana','Es un control'].map(t => (
                    <button key={t} onClick={() => setTiempo(t)}
                      className={`py-3 px-2 rounded-xl border-2 text-sm font-medium transition-all active:scale-95
                        ${tiempo === t ? 'border-green-600 bg-green-50 text-green-800' : 'border-gray-200 bg-white text-gray-600'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-black mb-1">
                  Describa su consulta <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-500 mb-2">Síntomas, desde cuándo y cualquier detalle importante</p>
                <textarea
                  value={motivo}
                  onChange={e => { setMotivo(e.target.value); setErrores(p => ({...p, motivo: ''})) }}
                  placeholder="ej: Llevo 2 días con dolor de cabeza y tos. Tengo asma y siento pitidos al respirar..."
                  maxLength={400}
                  className={`w-full border-2 rounded-xl px-4 py-3 text-base outline-none resize-none h-28 transition-all
                    ${errores.motivo ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-green-600'}`}
                />
                <div className="flex justify-between">
                  {errores.motivo && <p className="text-red-500 text-xs">⚠ {errores.motivo}</p>}
                  <p className="text-xs text-gray-400 ml-auto">{motivo.length}/400</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setPaso(2)} className="px-5 py-4 border-2 border-gray-200 rounded-2xl font-bold text-gray-500 active:scale-95">← Atrás</button>
                <button onClick={() => { if (validarPaso3()) setPaso(4) }} className="flex-1 bg-green-700 text-white rounded-2xl py-4 font-bold text-base active:scale-95 transition-all">
                  Continuar →
                </button>
              </div>
            </div>
          )}

          {/* ─ Paso 4: Confirmar ─ */}
          {paso === 4 && (
            <div>
              <h2 className="text-xl font-bold text-black mb-1">Revise su solicitud</h2>
              <p className="text-sm text-gray-500 mb-4">Verifique que todo esté correcto</p>

              <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm overflow-hidden mb-4">
                <div className="bg-green-700 px-4 py-3 flex items-center gap-3">
                  <span className="text-3xl">{ATENCIONES.find(a=>a.label===tipoSel)?.icon || '🏥'}</span>
                  <div>
                    <p className="text-white font-bold text-lg">{tipoSel}</p>
                    <p className="text-green-200 text-xs">CECOSF Santa Julia · {new Date().toLocaleDateString('es-CL',{weekday:'long',day:'numeric',month:'long'})}</p>
                  </div>
                </div>
                {[
                  ['Paciente', nombre],
                  ['RUT', rut],
                  ['Edad', edad + ' años'],
                  ['Teléfono', '+56 ' + fono],
                  ['Desde', tiempo || 'No especificado'],
                  ['Consulta', motivo.length > 80 ? motivo.slice(0,80)+'...' : motivo],
                ].map(([k, v]) => (
                  <div key={k} className="flex gap-3 px-4 py-3 border-b border-gray-100 last:border-0">
                    <span className="text-xs text-gray-400 w-20 flex-shrink-0 pt-0.5">{k}</span>
                    <span className="text-sm font-medium text-black">{v}</span>
                  </div>
                ))}
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex gap-2 mb-4">
                <span className="text-lg">📞</span>
                <p className="text-xs text-amber-800">Un funcionario le llamará <strong>antes del mediodía</strong> al {fono} para confirmar su horario. Esté atento/a al teléfono.</p>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setPaso(3)} className="px-5 py-4 border-2 border-gray-200 rounded-2xl font-bold text-gray-500 active:scale-95">← Atrás</button>
                <button onClick={enviarSolicitud} className="flex-1 bg-green-700 text-white rounded-2xl py-4 font-bold text-base active:scale-95 transition-all shadow-lg shadow-green-200">
                  ✓ Enviar solicitud
                </button>
              </div>
            </div>
          )}
        </main>
      )}

      {/* ══ CONFIRMACIÓN ══ */}
      {pantalla === 'confirmacion' && (
        <main className="flex-1 p-4 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-4xl mx-auto mt-6 mb-4">✅</div>
          <h2 className="text-2xl font-bold text-green-700 mb-2">¡Solicitud enviada!</h2>
          <p className="text-gray-500 text-sm mb-6">Su solicitud fue recibida. Le llamaremos antes del mediodía.</p>

          <div className="bg-green-700 rounded-2xl p-5 mb-6">
            <p className="text-green-200 text-xs uppercase tracking-widest mb-1">Número de folio</p>
            <p className="text-white text-4xl font-bold tracking-widest mb-1">{folio}</p>
            <p className="text-green-300 text-xs">Guarde este número para cualquier consulta</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-4 text-left mb-4">
            <p className="font-bold text-black mb-3">¿Qué sigue ahora?</p>
            {[
              'Un funcionario le llamará antes del mediodía.',
              'Le confirmarán el horario exacto de su atención.',
              'Recibirá un recordatorio el día anterior.',
              'Traiga carnet de identidad y carnet FONASA. Llegue 10 min antes.',
            ].map((t, i) => (
              <div key={i} className="flex gap-3 py-2 border-b border-gray-100 last:border-0">
                <div className="w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i+1}</div>
                <p className="text-sm text-gray-600">{t}</p>
              </div>
            ))}
          </div>

          <button onClick={() => { ir('inicio'); setTipoSel(''); setNombre(''); setRut(''); setEdad(''); setFono(''); setMotivo(''); setTiempo('') }}
            className="w-full bg-green-700 text-white rounded-2xl py-4 font-bold text-base active:scale-95">
            Volver al inicio
          </button>
        </main>
      )}

      {/* ══ QUÉ TRAER ══ */}
      {pantalla === 'que-traer' && (
        <main className="flex-1 p-4">
          <h2 className="text-xl font-bold text-black mb-1">¿Qué traer a su hora?</h2>
          <p className="text-sm text-gray-500 mb-4">Toque para ver los documentos necesarios</p>
          <div className="grid gap-3">
            {QUE_TRAER.map(q => (
              <details key={q.tipo} className="bg-white rounded-2xl shadow-sm border border-gray-200">
                <summary className="flex items-center gap-3 p-4 cursor-pointer list-none">
                  <span className="text-3xl">{q.icon}</span>
                  <span className="font-bold text-black text-base flex-1">{q.tipo}</span>
                  <span className="text-green-700 text-xl font-bold">+</span>
                </summary>
                <div className="px-4 pb-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Documentos necesarios</p>
                  {q.docs.map(d => (
                    <div key={d} className="flex items-center gap-2 py-1 text-sm text-gray-700">
                      <span className="text-green-600 font-bold">✓</span> {d}
                    </div>
                  ))}
                  {q.extra && (
                    <div className="bg-green-50 rounded-xl p-3 mt-3 text-xs text-green-800">
                      <strong>Importante: </strong>{q.extra}
                    </div>
                  )}
                </div>
              </details>
            ))}
          </div>
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-2xl p-3 text-xs text-yellow-800">
            <strong>Siempre llegue 10 minutos antes.</strong> Si no puede asistir, avise con anticipación.
          </div>
        </main>
      )}

      {/* ══ MIS HORAS ══ */}
      {pantalla === 'mis-horas' && (
        <main className="flex-1 p-4">
          <h2 className="text-xl font-bold text-black mb-4">Mis horas</h2>
          <input
            value={rutBuscar}
            onChange={e => setRutBuscar(e.target.value)}
            placeholder="Ingrese su RUT (ej: 12345678-9)"
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base outline-none focus:border-green-600 mb-3"
          />
          <button className="w-full bg-green-700 text-white rounded-xl py-3 font-bold text-base active:scale-95 mb-4">
            Buscar
          </button>
          {horas.length === 0
            ? <p className="text-gray-400 text-center py-8">No tiene horas agendadas</p>
            : horas.map(h => (
                <div key={h.id} className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm mb-3">
                  <p className="font-bold text-black text-lg">{h.fecha} · {h.hora}</p>
                  <p className="text-gray-500 text-sm mt-1">{h.servicio_nombre}</p>
                </div>
              ))
          }
        </main>
      )}

      {/* ══ SERVICIOS ══ */}
      {pantalla === 'servicios' && (
        <main className="flex-1 p-4">
          <h2 className="text-xl font-bold text-black mb-4">Servicios</h2>
          {servicios.length === 0
            ? (
              <div className="grid gap-3">
                {ATENCIONES.map(a => (
                  <div key={a.id} className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm flex items-center gap-3">
                    <span className="text-3xl">{a.icon}</span>
                    <div>
                      <p className="font-bold text-black">{a.label}</p>
                      <p className="text-xs text-gray-500">{a.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )
            : servicios.map(s => (
                <div key={s.id} className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm mb-3">
                  <p className="font-bold text-black text-lg">{s.nombre}</p>
                  <p className="text-gray-500 text-sm">{s.dias} · {s.horario}</p>
                  <p className="text-green-700 text-sm font-medium">{s.box}</p>
                </div>
              ))
          }
        </main>
      )}

      {/* ══ AVISOS ══ */}
      {pantalla === 'avisos' && (
        <main className="flex-1 p-4">
          <h2 className="text-xl font-bold text-black mb-4">Avisos</h2>
          {avisos.length === 0
            ? (
              <div className="bg-white rounded-2xl p-6 border border-gray-200 text-center">
                <span className="text-4xl">📢</span>
                <p className="text-gray-400 mt-3">No hay avisos por el momento</p>
                <p className="text-xs text-gray-300 mt-1">Vuelva más tarde para ver novedades del consultorio</p>
              </div>
            )
            : avisos.map(a => (
                <div key={a.id} className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm mb-3">
                  <p className="font-bold text-black text-lg">{a.titulo}</p>
                  <p className="text-gray-500 text-sm mt-1">{a.mensaje}</p>
                </div>
              ))
          }
        </main>
      )}

    </div>
  )
}
