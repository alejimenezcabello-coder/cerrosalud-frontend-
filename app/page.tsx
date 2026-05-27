'use client';
import { useState, useEffect } from 'react';

export default function Home() {
  const [pantalla, setPantalla] = useState('inicio');
  const [servicios, setServicios] = useState([]);
  const [avisos, setAvisos] = useState([]);
  const [rut, setRut] = useState('');
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [servicioSel, setServicioSel] = useState('');
  const [fecha, setFecha] = useState('');
  const [horasel, setHoraSel] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [rutBuscar, setRutBuscar] = useState('');
  const [horas, setHoras] = useState([]);
  const API = 'http://localhost:3001';

  useEffect(() => {
    setServicios([
  {id:1,nombre:'Médico general',dias:'Lunes a Viernes',horario:'08:00 - 17:00',box:'Box 1-3'},
  {id:2,nombre:'Dental',dias:'Martes y Jueves',horario:'09:00 - 13:00',box:'Box 4'},
  {id:3,nombre:'Vacunación',dias:'Todos los días',horario:'08:00 - 12:00',box:'Sala vacunación'},
  {id:4,nombre:'Salud mental',dias:'Miércoles',horario:'09:00 - 13:00',box:'Box 5'},
  {id:5,nombre:'Control niño sano',dias:'Lunes, Miércoles y Viernes',horario:'09:00 - 12:00',box:'Box 2'},
  {id:6,nombre:'Exámenes',dias:'Lunes a Viernes',horario:'08:00 - 10:00',box:'Sala exámenes'},
]);
    setAvisos([
  {id:1,titulo:'Campaña antiinfluenza',mensaje:'Vacunación disponible sin hora previa hasta el 30 de mayo. Todos los días de 8:00 a 12:00 hrs.',fecha:'2026-05-26'},
  {id:2,titulo:'Cambio de horario miércoles',mensaje:'El CESFAM abrirá a las 9:00 hrs el miércoles 28 por capacitación del personal.',fecha:'2026-05-26'},
  {id:3,titulo:'Nueva app CerroSalud',mensaje:'¡Ya puedes sacar tu hora en línea! Usa esta app para agendar sin hacer fila.',fecha:'2026-05-26'},
]);
  }, []);

  const buscarHoras = async () => {
    try {
      const res = await fetch(API+'/horas/'+rutBuscar);
      const data = await res.json();
      setHoras(Array.isArray(data) ? (data as never[]) : []);
    } catch { setHoras([]); }
    setPantalla('mis-horas');
  };

  const agendarHora = async () => {
    if (!rut||!nombre||!servicioSel||!fecha||!horasel) { setMensaje('Completa todos los campos'); return; }
    try { await fetch(API+'/vecinos',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({rut,nombre,telefono,fecha_nacimiento:''})}); } catch {}
    try {
      const res = await fetch(API+'/horas',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({rut_vecino:rut,id_servicio:parseInt(servicioSel),fecha,hora:horasel})});
      const data = await res.json();
      if (data.success) { setMensaje(''); setPantalla('confirmacion'); }
      else { setMensaje('Error al agendar'); }
    } catch { setMensaje('Error de conexion'); }
  };

  const hd = ['08:30','09:00','09:30','10:00','10:30','11:00','11:30','12:00','14:00','15:00','16:00'];
  const ic = "w-full border-2 border-gray-300 rounded-xl p-4 text-lg text-black font-medium focus:outline-none focus:border-green-600 bg-white";
  const lc = "text-base font-bold text-black mb-2 block";

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-lg mx-auto">
        <div className="bg-green-800 text-white p-5 sticky top-0 z-10 shadow-md">
          <div className="flex justify-between items-center">
            <div>
              <img src="/logo.svg" alt="CerroSalud" style={{height:"40px"}} />
              <p className="text-green-200 text-sm">CECOSF Santa Julia · Vina del Mar</p>
            </div>
            {pantalla!=='inicio' && <button type="button" onClick={()=>setPantalla('inicio')} className="text-white font-bold bg-green-700 px-4 py-2 rounded-xl">Inicio</button>}
          </div>
        </div>

        {pantalla==='inicio' && (
          <div className="p-5">
            <h2 className="text-2xl font-bold text-black mb-1">Buenos dias</h2>
            <p className="text-lg text-gray-700 mb-5">En que te ayudamos hoy?</p>
            <div className="grid grid-cols-2 gap-4 mb-6" style={{WebkitTapHighlightColor:"transparent"}}>
              {[{label:'Pedir hora',icon:'📅',s:'pedir-hora'},{label:'Mis horas',icon:'🗓',s:'buscar-horas'},{label:'Servicios',icon:'🏥',s:'servicios'},{label:'Avisos',icon:'📢',s:'avisos'}].map(b=>(
                <button type="button" key={b.s} onClick={()=>setPantalla(b.s)} className="bg-white rounded-2xl p-5 shadow border-2 border-gray-200 flex flex-col items-center gap-3">
                  <span className="text-4xl">{b.icon}</span>
                  <span className="text-lg font-bold text-black">{b.label}</span>
                </button>
              ))}
            </div>
            {avisos.length>0 && <div className="bg-white rounded-2xl p-4 border-2 border-gray-200 shadow"><p className="font-bold text-black text-lg">{(avisos[0] as any).titulo}</p><p className="text-gray-700 text-base mt-2">{(avisos[0] as any).mensaje}</p></div>}
          </div>
        )}

        {pantalla==='servicios' && (
          <div className="p-5">
            <h2 className="text-2xl font-bold text-black mb-4">Servicios</h2>
            {servicios.map((s)=>(<div key={s.id} className="bg-white rounded-2xl p-4 border-2 border-gray-200 shadow mb-4"><p className="font-bold text-black text-xl">{s.nombre}</p><p className="text-gray-700 text-base mt-1">{s.dias} · {s.horario}</p><p className="text-green-700 font-bold">{s.box}</p></div>))}
          </div>
        )}

        {pantalla==='avisos' && (
          <div className="p-5">
            <h2 className="text-2xl font-bold text-black mb-4">Avisos</h2>
            {avisos.map((a)=>(<div key={a.id} className="bg-white rounded-2xl p-4 border-2 border-gray-200 shadow mb-4"><p className="font-bold text-black text-xl">{a.titulo}</p><p className="text-gray-700 text-base mt-2">{a.mensaje}</p></div>))}
          </div>
        )}

        {pantalla==='pedir-hora' && (
          <div className="p-5">
            <h2 className="text-2xl font-bold text-black mb-5">Pedir hora</h2>
            <div className="flex flex-col gap-4">
              <div><label className={lc}>RUT</label><input value={rut} onChange={e=>setRut(e.target.value)} placeholder="12345678-9" className={ic}/></div>
              <div><label className={lc}>Nombre</label><input value={nombre} onChange={e=>setNombre(e.target.value)} placeholder="Tu nombre" className={ic}/></div>
              <div><label className={lc}>Telefono</label><input value={telefono} onChange={e=>setTelefono(e.target.value)} placeholder="+56912345678" className={ic}/></div>
              <div><label className={lc}>Servicio</label><select value={servicioSel} onChange={e=>setServicioSel(e.target.value)} className={ic}><option value="">Selecciona</option>{servicios.map((s)=><option key={s.id} value={s.id}>{s.nombre}</option>)}</select></div>
              <div><label className={lc}>Fecha</label><input type="date" value={fecha} onChange={e=>setFecha(e.target.value)} className={ic}/></div>
              <div><label className={lc}>Hora</label><select value={horasel} onChange={e=>setHoraSel(e.target.value)} className={ic}><option value="">Selecciona</option>{hd.map(h=><option key={h} value={h}>{h}</option>)}</select></div>
              {mensaje && <p className="text-red-600 font-bold">{mensaje}</p>}
              <button type="button" onClick={agendarHora} className="bg-green-700 text-white rounded-2xl p-5 font-bold text-xl shadow-md">Confirmar hora</button>
            </div>
          </div>
        )}

        {pantalla==='buscar-horas' && (
          <div className="p-5">
            <h2 className="text-2xl font-bold text-black mb-4">Mis horas</h2>
            <input value={rutBuscar} onChange={e=>setRutBuscar(e.target.value)} placeholder="Tu RUT" className={ic+" mb-4"}/>
            <button type="button" onClick={buscarHoras} className="w-full bg-green-700 text-white rounded-2xl p-5 font-bold text-xl">Buscar</button>
          </div>
        )}

        {pantalla==='mis-horas' && (
          <div className="p-5">
            <h2 className="text-2xl font-bold text-black mb-4">Mis horas</h2>
            {horas.length===0 ? <p className="text-gray-600 text-xl text-center py-8">No tienes horas agendadas</p> : horas.map((h)=>(<div key={h.id} className="bg-white rounded-2xl p-4 border-2 border-gray-200 shadow mb-4"><p className="font-bold text-black text-xl">{h.fecha} · {h.hora}</p><p className="text-gray-700">{h.servicio_nombre}</p></div>))}
          </div>
        )}

        {pantalla==='confirmacion' && (
          <div className="p-5">
            <div className="bg-green-700 rounded-3xl p-8 text-center text-white mb-5">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-2xl font-bold mb-2">Hora confirmada</h2>
              <p className="text-green-100 text-lg">Tu hora fue agendada en el CECOSF Santa Julia.</p>
            </div>
            <button type="button" onClick={()=>{setPantalla('inicio');setRut('');setNombre('');setServicioSel('');setFecha('');setHoraSel('');}} className="w-full bg-green-700 text-white rounded-2xl p-5 font-bold text-xl">Volver al inicio</button>
          </div>
        )}

      </div>
    </div>
  );
}
