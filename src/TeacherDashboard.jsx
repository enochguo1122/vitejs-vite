import { useState, useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SUPABASE_URL = "https://jmddyrmvicpmyawhjybe.supabase.co";
const SUPABASE_KEY = "sb_publishable_TpoXUuvsBQeqE1MS-CQ5rg_2DCFIdbH";
const TEACHER_PASS = "teacher2025";
const CLASSES = ["Eagles", "Harp", "Lamp"];

const DIMS = ["stress","certainty","social","patience","resource","meaning"];
const DIM_LABELS = {
  stress:"压力耐受", certainty:"确定性偏好", social:"社交能量",
  patience:"执行耐心", resource:"现实资源", meaning:"意义锚点",
};
const DIM_COLORS = {
  stress:"#e53935", certainty:"#ef6c00", social:"#43a047",
  patience:"#5c6bc0", resource:"#0288d1", meaning:"#8e24aa",
};
const AVATAR_COLORS = ["#5c6bc0","#26a69a","#ef6c00","#8e24aa","#e53935","#43a047","#0288d1","#f06292"];

function avatarColor(name) {
  if (!name) return AVATAR_COLORS[0];
  let h = 0; for (const c of name) h += c.charCodeAt(0);
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}
function initials(name) { return name ? name.slice(0,1).toUpperCase() : "?"; }
function classAvg(students) {
  const avgs = {};
  DIMS.forEach(d => {
    const vals = students.map(s => s.profile?.[d]).filter(v => v != null && !isNaN(v));
    avgs[d] = vals.length ? vals.reduce((a,b)=>a+b,0)/vals.length : 0;
  });
  return avgs;
}
function topMajors(students, limit=6) {
  const counts = {};
  students.forEach(s => {
    if (!s.top_matches) return;
    s.top_matches.slice(0,3).forEach(m => { counts[m.name] = (counts[m.name]||0)+1; });
  });
  return Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,limit);
}
function atRisk(students) {
  return students.filter(s => {
    const p = s.profile || {};
    return p.resource < 2 || p.stress < 2.5 || p.meaning < 2;
  });
}

// ── Styles ──
const S = {
  page: { fontFamily:"'IBM Plex Sans','Noto Sans SC',system-ui,sans-serif", minHeight:"100vh", background:"#f8f8f6", color:"#1a1a18" },
  topbar: { background:"#fff", borderBottom:"1px solid #e5e5e0", padding:"0 24px", display:"flex", alignItems:"center", justifyContent:"space-between", height:56, position:"sticky", top:0, zIndex:100, gap:12 },
  classBar: { background:"#fff", borderBottom:"1px solid #e5e5e0", padding:"0 24px", display:"flex", gap:0, overflowX:"auto" },
  main: { padding:24, maxWidth:1100, margin:"0 auto" },
  card: { background:"#fff", border:"1px solid #e5e5e0", borderRadius:10, padding:"16px 20px", marginBottom:16 },
  cardTitle: { fontSize:11, fontWeight:600, color:"#9e9e9e", textTransform:"uppercase", letterSpacing:".06em", marginBottom:14 },
  btn: { display:"inline-flex", alignItems:"center", gap:6, padding:"8px 14px", borderRadius:8, border:"1px solid #e5e5e0", background:"#fff", color:"#555", cursor:"pointer", fontSize:13, fontWeight:500, whiteSpace:"nowrap" },
  btnPrimary: { background:"#5c6bc0", borderColor:"#5c6bc0", color:"#fff" },
  metric: { background:"#f5f5f3", borderRadius:8, padding:"12px 14px", textAlign:"center" },
  tab: (active) => ({ padding:"10px 16px", fontSize:13, fontWeight:500, cursor:"pointer", border:"none", background:"none", color: active ? "#5c6bc0" : "#9e9e9e", borderBottom: active ? "2px solid #5c6bc0" : "2px solid transparent", marginBottom:-1 }),
  classTab: (active) => ({ padding:"10px 16px", fontSize:13, fontWeight:500, cursor:"pointer", border:"none", background:"none", color: active ? "#5c6bc0" : "#9e9e9e", borderBottom: active ? "2px solid #5c6bc0" : "2px solid transparent", marginBottom:-1, whiteSpace:"nowrap" }),
  chip: (type) => {
    const map = { ok:["#e8f5e9","#2e7d32"], warn:["#ffebee","#c62828"], cls:["#e8eaf6","#3949ab"] };
    const [bg,color] = map[type] || map.ok;
    return { background:bg, color, borderRadius:99, padding:"2px 9px", fontSize:11, fontWeight:600, display:"inline-flex", alignItems:"center", gap:3 };
  },
};

// ── Login ──
function Login({ onLogin }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);
  const try_ = () => { if (pw === TEACHER_PASS) onLogin(); else { setErr(true); setPw(""); } };
  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:12, background:"#f8f8f6" }}>
      <div style={{ background:"#fff", border:"1px solid #e5e5e0", borderRadius:12, padding:"2rem", width:340 }}>
        <div style={{ fontSize:20, fontWeight:600, marginBottom:4 }}>🔐 教师看板</div>
        <div style={{ fontSize:13, color:"#9e9e9e", marginBottom:24 }}>请输入访问密码</div>
        <input type="password" value={pw} onChange={e=>{setPw(e.target.value);setErr(false);}}
          onKeyDown={e=>e.key==="Enter"&&try_()}
          placeholder="输入密码"
          style={{ width:"100%", padding:"10px 12px", border:`1px solid ${err?"#e53935":"#e5e5e0"}`, borderRadius:8, fontSize:14, outline:"none", marginBottom:err?4:12, boxSizing:"border-box" }}
        />
        {err && <div style={{ fontSize:12, color:"#e53935", marginBottom:8 }}>密码错误，请重试</div>}
        <button onClick={try_} style={{ ...S.btn, ...S.btnPrimary, width:"100%", justifyContent:"center", padding:"10px" }}>进入看板 →</button>
      </div>
      <div style={{ fontSize:12, color:"#bbb" }}>Major Match System · 教师端 v1.1</div>
    </div>
  );
}

// ── Avatar ──
function Avatar({ name, size=30 }) {
  return (
    <div style={{ width:size, height:size, borderRadius:"50%", background:avatarColor(name), display:"flex", alignItems:"center", justifyContent:"center", fontSize:size*0.4, fontWeight:600, color:"#fff", flexShrink:0 }}>
      {initials(name)}
    </div>
  );
}

// ── Dim Bar ──
function DimBar({ dim, val }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
      <span style={{ fontSize:12, color:"#9e9e9e", width:72, flexShrink:0 }}>{DIM_LABELS[dim]}</span>
      <div style={{ flex:1, height:6, background:"#f0f0ee", borderRadius:3, overflow:"hidden" }}>
        <div style={{ height:6, borderRadius:3, width:`${(val/5)*100}%`, background:DIM_COLORS[dim], transition:"width .5s" }} />
      </div>
      <span style={{ fontSize:12, fontWeight:600, color:DIM_COLORS[dim], width:28, textAlign:"right", flexShrink:0 }}>{val.toFixed(1)}</span>
    </div>
  );
}

// ── Student Modal ──
function StudentModal({ student, onClose }) {
  const p = student.profile || {};
  const matches = student.top_matches || [];
  const fb = student.feedback || {};
  const flags = [];
  if (p.resource < 2) flags.push("现实资源不足");
  if (p.stress < 2.5)  flags.push("压力耐受偏低");
  if (p.meaning < 2)   flags.push("意义锚点缺失");

  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.45)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:"#fff", borderRadius:12, width:"100%", maxWidth:500, maxHeight:"90vh", overflowY:"auto", padding:24 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <Avatar name={student.user_name} size={40} />
            <div>
              <div style={{ fontSize:16, fontWeight:600 }}>{student.user_name || "匿名"}</div>
              <div style={{ fontSize:12, color:"#9e9e9e" }}>
                {student.class_name || "未分班"} · {student.created_at?.slice(0,10) || "—"}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", fontSize:22, cursor:"pointer", color:"#9e9e9e", lineHeight:1 }}>×</button>
        </div>
        {flags.length > 0 && (
          <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:14 }}>
            {flags.map(f => <span key={f} style={S.chip("warn")}>{f}</span>)}
          </div>
        )}
        <div style={{ fontSize:11, fontWeight:600, color:"#9e9e9e", textTransform:"uppercase", letterSpacing:".05em", marginBottom:10 }}>六维画像</div>
        {DIMS.map(d => <DimBar key={d} dim={d} val={p[d]||0} />)}
        <div style={{ fontSize:11, fontWeight:600, color:"#9e9e9e", textTransform:"uppercase", letterSpacing:".05em", margin:"16px 0 10px" }}>高匹配方向（前3）</div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
          {matches.slice(0,3).map(m => (
            <span key={m.name} style={{ background:"#e8f5e9", color:"#2e7d32", borderRadius:99, padding:"4px 10px", fontSize:12, fontWeight:500 }}>{m.name}</span>
          ))}
        </div>
        {(fb.helpful || fb.clarity) && (
          <div style={{ marginTop:16, background:"#f5f5f3", borderRadius:8, padding:"10px 14px", fontSize:12, color:"#9e9e9e" }}>
            有用性 {fb.helpful||"—"}/5 · 清晰度 {fb.clarity||"—"}/5
            {fb.confusing && <div style={{ marginTop:4 }}>困惑点：{fb.confusing}</div>}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Overview Tab ──
function Overview({ students }) {
  const avg = classAvg(students);
  const risk = atRisk(students);
  const majors = topMajors(students);
  const wf = students.filter(s=>s.feedback?.helpful);
  const avgHelpful = wf.length ? (wf.reduce((a,s)=>a+s.feedback.helpful,0)/wf.length).toFixed(1) : "—";
  const topDim = DIMS.reduce((a,d)=>avg[d]>avg[a]?d:a, DIMS[0]);
  const n = students.length;

  const chartData = {
    labels: DIMS.map(d => DIM_LABELS[d]),
    datasets: [{
      label:"班级平均",
      data: DIMS.map(d => parseFloat(avg[d].toFixed(2))),
      backgroundColor: DIMS.map(d => DIM_COLORS[d]+"99"),
      borderColor: DIMS.map(d => DIM_COLORS[d]),
      borderWidth: 1.5, borderRadius: 4,
    }],
  };
  const chartOpts = {
    responsive:true, maintainAspectRatio:false,
    plugins:{ legend:{ display:false } },
    scales:{
      y:{ min:0, max:5, ticks:{ stepSize:1 }, grid:{ color:"rgba(128,128,128,0.1)" } },
      x:{ ticks:{ font:{ size:11 } }, grid:{ display:false } },
    },
  };

  return (
    <>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))", gap:12, marginBottom:16 }}>
        {[
          { val:n, label:"测评人数", sub:"已完成" },
          { val:risk.length, label:"需关注", sub:"异常维度", color:"#c62828" },
          { val:avgHelpful+(avgHelpful!=="—"?" 分":""), label:"有用性", sub:"满分 5 分" },
          { val:DIM_LABELS[topDim], label:"最高维度", sub:"班级平均最强项", small:true },
        ].map(m => (
          <div key={m.label} style={S.metric}>
            <div style={{ fontSize: m.small?15:24, fontWeight:600, color:m.color||"#1a1a18", lineHeight:1, marginBottom:4 }}>{m.val}</div>
            <div style={{ fontSize:11, fontWeight:600, color:"#555", marginBottom:2 }}>{m.label}</div>
            <div style={{ fontSize:11, color:"#9e9e9e" }}>{m.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
        <div style={S.card}>
          <div style={S.cardTitle}>六维画像（平均）</div>
          {DIMS.map(d => <DimBar key={d} dim={d} val={avg[d]} />)}
        </div>
        <div style={S.card}>
          <div style={S.cardTitle}>热门首选方向 Top 6</div>
          {majors.length === 0
            ? <div style={{ color:"#9e9e9e", fontSize:13 }}>暂无数据</div>
            : majors.map(([name,cnt]) => {
                const pct = n > 0 ? Math.round(cnt/n*100) : 0;
                return (
                  <div key={name} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"6px 0", borderBottom:"1px solid #f0f0ee" }}>
                    <span style={{ fontSize:12 }}>{name}</span>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <div style={{ width:70, height:4, background:"#f0f0ee", borderRadius:2, overflow:"hidden" }}>
                        <div style={{ height:4, background:"#5c6bc0", width:`${pct}%`, borderRadius:2 }} />
                      </div>
                      <span style={{ fontSize:11, color:"#9e9e9e", minWidth:52, textAlign:"right" }}>{cnt}人 ({pct}%)</span>
                    </div>
                  </div>
                );
              })}
        </div>
      </div>

      <div style={S.card}>
        <div style={S.cardTitle}>各维度得分分布</div>
        <div style={{ position:"relative", height:200 }}>
          <Bar data={chartData} options={chartOpts} />
        </div>
      </div>
    </>
  );
}

// ── Students Tab ──
function Students({ students, onOpen }) {
  const [q, setQ] = useState("");
  const rows = students.filter(s => (s.user_name||"").toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <div style={{ display:"flex", gap:8, marginBottom:14, alignItems:"center" }}>
        <input type="text" placeholder="搜索姓名..." value={q} onChange={e=>setQ(e.target.value)}
          style={{ padding:"8px 12px", border:"1px solid #e5e5e0", borderRadius:8, fontSize:13, outline:"none", width:200 }} />
        <span style={{ fontSize:13, color:"#9e9e9e", marginLeft:"auto" }}>{rows.length} 人</span>
      </div>
      <div style={{ overflowX:"auto", borderRadius:10, border:"1px solid #e5e5e0" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
          <thead>
            <tr>
              {["姓名","班级","首选方向","均分","现实资源","压力耐受","意义锚点","日期","状态"].map(h => (
                <th key={h} style={{ fontSize:11, fontWeight:600, color:"#9e9e9e", textTransform:"uppercase", letterSpacing:".05em", padding:"10px 14px", borderBottom:"1px solid #e5e5e0", background:"#f8f8f6", textAlign:"left", whiteSpace:"nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((s,i) => {
              const p = s.profile||{};
              const avg_ = DIMS.map(d=>p[d]||0).reduce((a,b)=>a+b,0)/DIMS.length;
              const isRisk = p.resource<2||p.stress<2.5||p.meaning<2;
              const top = s.top_matches?.[0]?.name || "—";
              return (
                <tr key={i} onClick={()=>onOpen(s)} style={{ cursor:"pointer" }}
                  onMouseEnter={e=>e.currentTarget.querySelectorAll('td').forEach(td=>td.style.background="#f8f8f6")}
                  onMouseLeave={e=>e.currentTarget.querySelectorAll('td').forEach(td=>td.style.background="")}>
                  <td style={{ padding:"11px 14px", borderBottom:"1px solid #f0f0ee" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <Avatar name={s.user_name} size={28} />
                      {s.user_name||"匿名"}
                    </div>
                  </td>
                  <td style={{ padding:"11px 14px", borderBottom:"1px solid #f0f0ee" }}>
                    <span style={S.chip("cls")}>{s.class_name||"—"}</span>
                  </td>
                  <td style={{ padding:"11px 14px", borderBottom:"1px solid #f0f0ee", maxWidth:140 }}>{top}</td>
                  <td style={{ padding:"11px 14px", borderBottom:"1px solid #f0f0ee" }}>{avg_.toFixed(1)}</td>
                  <td style={{ padding:"11px 14px", borderBottom:"1px solid #f0f0ee", color:(p.resource||0)<2?"#c62828":"inherit" }}>{(p.resource||0).toFixed(1)}</td>
                  <td style={{ padding:"11px 14px", borderBottom:"1px solid #f0f0ee", color:(p.stress||0)<2.5?"#e65100":"inherit" }}>{(p.stress||0).toFixed(1)}</td>
                  <td style={{ padding:"11px 14px", borderBottom:"1px solid #f0f0ee" }}>{(p.meaning||0).toFixed(1)}</td>
                  <td style={{ padding:"11px 14px", borderBottom:"1px solid #f0f0ee", whiteSpace:"nowrap", color:"#9e9e9e" }}>{s.created_at?.slice(0,10)||"—"}</td>
                  <td style={{ padding:"11px 14px", borderBottom:"1px solid #f0f0ee" }}>
                    <span style={S.chip(isRisk?"warn":"ok")}>{isRisk?"需关注":"正常"}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {rows.length === 0 && <div style={{ textAlign:"center", padding:"3rem", color:"#9e9e9e" }}>暂无数据</div>}
      </div>
    </>
  );
}

// ── Risk Tab ──
function Risk({ students, onOpen }) {
  const risk = atRisk(students);
  return (
    <>
      <div style={S.card}>
        <div style={S.cardTitle}>需要关注的学生</div>
        <p style={{ fontSize:13, color:"#9e9e9e", marginBottom:14 }}>
          以下学生在现实资源（&lt;2.0）、压力耐受（&lt;2.5）或意义锚点（&lt;2.0）维度显示异常
        </p>
        {risk.length === 0
          ? <div style={{ textAlign:"center", padding:"2rem", color:"#9e9e9e" }}>目前没有需要特别关注的学生</div>
          : risk.map((s,i) => {
              const p = s.profile||{};
              const flags = [];
              if(p.resource<2) flags.push("现实资源不足");
              if(p.stress<2.5) flags.push("压力耐受偏低");
              if(p.meaning<2)  flags.push("意义锚点缺失");
              return (
                <div key={i} onClick={()=>onOpen(s)} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 0", borderBottom:"1px solid #f0f0ee", cursor:"pointer" }}>
                  <Avatar name={s.user_name} size={34} />
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:500, display:"flex", alignItems:"center", gap:8 }}>
                      {s.user_name||"匿名"}
                      {s.class_name && <span style={S.chip("cls")}>{s.class_name}</span>}
                    </div>
                    <div style={{ fontSize:11, color:"#e53935", marginTop:2 }}>{flags.join(" · ")}</div>
                  </div>
                  <div style={{ fontSize:12, color:"#9e9e9e" }}>{s.top_matches?.[0]?.name||"—"}</div>
                </div>
              );
            })}
      </div>
      <div style={S.card}>
        <div style={S.cardTitle}>老师干预建议</div>
        {[
          { color:"#1565c0", bg:"#e3f2fd", title:"现实资源不足", text:"了解家庭背景，优先推荐回报快、门槛低的方向，介绍奖学金资源" },
          { color:"#e65100", bg:"#fff3e0", title:"压力耐受偏低", text:"避免推荐竞争激烈的专业，关注心理状态，适当减轻学业压力" },
          { color:"#555",    bg:"#f5f5f3", title:"意义锚点缺失", text:"帮助探索兴趣，鼓励职业访谈，避免纯经济导向的选专业决策" },
        ].map(tip => (
          <div key={tip.title} style={{ background:tip.bg, borderRadius:8, padding:"10px 14px", marginBottom:8, fontSize:13, color:tip.color }}>
            <strong>{tip.title}</strong>　{tip.text}
          </div>
        ))}
      </div>
    </>
  );
}

// ── Main Dashboard ──
function Dashboard({ onLogout }) {
  const [allStudents, setAllStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentClass, setCurrentClass] = useState("__all__");
  const [activeTab, setActiveTab] = useState("overview");
  const [modalStudent, setModalStudent] = useState(null);

  const load = async () => {
    setLoading(true); setError("");
    try {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/responses?select=*&order=created_at.desc`, {
        headers: { apikey: SUPABASE_KEY, Authorization: "Bearer " + SUPABASE_KEY },
      });
      if (!r.ok) throw new Error("HTTP " + r.status);
      const data = await r.json();
      // 同名同班只保留最新一条（数据已按 created_at desc 排序）
      const seen = new Set();
      const deduped = Array.isArray(data) ? data.filter(s => {
        const key = (s.user_name || "匿名") + "|" + (s.class_name || "");
        if (seen.has(key)) return false;
        seen.add(key); return true;
      }) : [];
      setAllStudents(deduped);
    } catch(e) { setError(e.message); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = currentClass === "__all__"
    ? allStudents
    : allStudents.filter(s => s.class_name === currentClass);

  const classCounts = {};
  allStudents.forEach(s => { const c = s.class_name||"未分班"; classCounts[c]=(classCounts[c]||0)+1; });
  const risk = atRisk(filtered);

  const exportCSV = () => {
    const rows = [["姓名","班级","提交日期","压力耐受","确定性偏好","社交能量","执行耐心","现实资源","意义锚点","首选方向","有用性","清晰度"]];
    filtered.forEach(s => {
      const p = s.profile||{}; const fb = s.feedback||{};
      rows.push([s.user_name||"匿名", s.class_name||"—", s.created_at?.slice(0,10)||"",
        ...DIMS.map(d=>(p[d]||0).toFixed(2)),
        s.top_matches?.[0]?.name||"—", fb.helpful||"", fb.clarity||""]);
    });
    const csv = rows.map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8,\uFEFF" + encodeURIComponent(csv);
    a.download = `测评数据_${currentClass==="__all__"?"全部":currentClass}_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

  const classTabs = [
    { key:"__all__", label:"全部班级", n:allStudents.length },
    ...CLASSES.map(c => ({ key:c, label:c, n:classCounts[c]||0 })),
    ...(classCounts["未分班"] ? [{ key:"未分班", label:"未分班", n:classCounts["未分班"] }] : []),
  ];

  return (
    <div style={S.page}>
      {modalStudent && <StudentModal student={modalStudent} onClose={()=>setModalStudent(null)} />}

      <div style={S.topbar}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:16, fontWeight:600 }}>📊 学生测评看板</span>
          <span style={{ fontSize:12, color:"#9e9e9e" }}>
            {currentClass==="__all__"?"全部班级":currentClass} · {filtered.length} 人
          </span>
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          {risk.length > 0
            ? <span style={{ ...S.chip("warn"), fontSize:11, padding:"3px 10px" }}>⚠ {risk.length} 人需关注</span>
            : <span style={{ background:"#e8f5e9", color:"#2e7d32", borderRadius:99, padding:"3px 10px", fontSize:11, fontWeight:600 }}>数据正常</span>}
          <button onClick={load} style={S.btn}>↻ 刷新</button>
          <button onClick={exportCSV} style={S.btn}>↓ 导出 CSV</button>
          <button onClick={onLogout} style={{ ...S.btn, color:"#9e9e9e" }}>退出</button>
        </div>
      </div>

      <div style={S.classBar}>
        {classTabs.map(t => (
          <button key={t.key} onClick={()=>{ setCurrentClass(t.key); setActiveTab("overview"); }}
            style={S.classTab(currentClass===t.key)}>
            {t.label}
            <span style={{ fontSize:11, background: currentClass===t.key?"#5c6bc0":"#f0f0ee", color: currentClass===t.key?"#fff":"#9e9e9e", borderRadius:99, padding:"1px 7px", marginLeft:6 }}>{t.n}</span>
          </button>
        ))}
      </div>

      <div style={S.main}>
        {loading && (
          <div style={{ display:"flex", alignItems:"center", gap:10, color:"#9e9e9e", justifyContent:"center", padding:"3rem" }}>
            <div style={{ width:18, height:18, border:"2px solid #e5e5e0", borderTopColor:"#5c6bc0", borderRadius:"50%", animation:"spin .7s linear infinite" }} />
            正在加载数据...
          </div>
        )}
        {error && <div style={{ color:"#c62828", padding:"2rem", textAlign:"center" }}>加载失败: {error}</div>}
        {!loading && !error && (
          <>
            <div style={{ display:"flex", gap:2, marginBottom:20, borderBottom:"1px solid #e5e5e0" }}>
              {[
                { key:"overview", label:"班级总览" },
                { key:"students", label:"学生列表" },
                { key:"risk",     label:`需关注${risk.length>0?" ("+risk.length+")":""}` },
              ].map(t => (
                <button key={t.key} onClick={()=>setActiveTab(t.key)} style={S.tab(activeTab===t.key)}>{t.label}</button>
              ))}
            </div>
            {activeTab==="overview" && <Overview students={filtered} />}
            {activeTab==="students" && <Students students={filtered} onOpen={setModalStudent} />}
            {activeTab==="risk"     && <Risk students={filtered} onOpen={setModalStudent} />}
          </>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ── Root ──
export default function TeacherDashboard() {
  const [auth, setAuth] = useState(false);
  if (!auth) return <Login onLogin={()=>setAuth(true)} />;
  return <Dashboard onLogout={()=>setAuth(false)} />;
}
