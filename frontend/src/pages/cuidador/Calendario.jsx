import React, { useMemo, useState } from "react";
import { eventos } from "../../data";

function startOfMonth(d){ return new Date(d.getFullYear(), d.getMonth(), 1); }
function endOfMonth(d){ return new Date(d.getFullYear(), d.getMonth()+1, 0); }
function addMonths(d, n){ const x=new Date(d); x.setMonth(x.getMonth()+n); return x; }
function fmtDate(d){ return d.toISOString().slice(0,10); }
function isTodayDate(d){ const t=new Date(); return d.getFullYear()===t.getFullYear() && d.getMonth()===t.getMonth() && d.getDate()===t.getDate(); }

export default function Calendario({ pacienteId }){
  const [refDate, setRefDate] = useState(new Date());

  const monthLabel = refDate.toLocaleDateString("es-AR", { month:"long", year:"numeric" });

  const monthDays = useMemo(()=>{
    const s = startOfMonth(refDate);
    const startIdx = (s.getDay()+6)%7; // lunes=0
    const gridStart = new Date(s); gridStart.setDate(s.getDate() - startIdx);
    const days = [];
    for(let i=0;i<42;i++){ const d=new Date(gridStart); d.setDate(gridStart.getDate()+i); days.push(d); }
    return days;
  }, [refDate]);

  const list = eventos.filter(e=>e.paciente===pacienteId);
  const map = useMemo(()=>{
    const m={}; list.forEach(ev=>{ const iso=ev.fecha.slice(0,10); (m[iso]=m[iso]||[]).push(ev); });
    return m;
  }, [list]);

  const isSameMonth = (d)=> d.getMonth()===refDate.getMonth() && d.getFullYear()===refDate.getFullYear();
  const proximos = [...list].sort((a,b)=> new Date(a.fecha) - new Date(b.fecha));

  return (
    <div className="grid">
      <div className="col-12">
        <div className="card cal">
          <div className="cal-header">
            <div className="cal-title">
              <h3>Calendario de Cuidado</h3>
              <div className="cal-sub">{monthLabel}</div>
            </div>
            <div className="cal-controls">
              <button className="btn" onClick={()=>setRefDate(addMonths(refDate,-1))}>◀ Mes anterior</button>
              <button className="btn ghost" onClick={()=>setRefDate(new Date())}>Hoy</button>
              <button className="btn" onClick={()=>setRefDate(addMonths(refDate,1))}>Mes siguiente ▶</button>
            </div>
          </div>

          <div className="cal-week">
            {["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"].map(d=><div key={d}>{d}</div>)}
          </div>

          <div className="cal-grid">
            {monthDays.map((d,i)=>{
              const iso = fmtDate(d);
              const evs = map[iso] || [];
              const classes = ["cal-day"];
              if(!isSameMonth(d)) classes.push("muted");
              if(isTodayDate(d)) classes.push("today");
              return (
                <div key={i} className={classes.join(" ")}>
                  <div className="num">{d.getDate()}</div>
                  {evs.slice(0,3).map((ev,idx)=>(
                    <div key={idx} className="event-pill">
                      {ev.titulo}
                    </div>
                  ))}
                  {evs.length>3 && <div className="event-pill">+{evs.length-3} más</div>}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="col-12">
        <div className="card">
          <div className="row">
            <h2>Eventos</h2>
            <div className="btn-group">
              <button className="btn primary">Añadir evento</button>
              <button className="btn">Exportar</button>
            </div>
          </div>

          <div className="events-list">
            {proximos.map(e=>(
              <div key={e.id} className="item">
                <div>
                  <div style={{fontWeight:800}}>{e.titulo}</div>
                  <small className="muted">{e.lugar}</small>
                </div>
                <div className="row" style={{gap:8, justifyContent:"flex-end"}}>
                  <time>{e.fecha}</time>
                  <button className="btn">Editar</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
