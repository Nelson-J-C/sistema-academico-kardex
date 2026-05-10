import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const C = {
    pri: [25, 72, 168], priDark: [15, 45, 120], priLight: [220, 232, 252],
    dark: [20, 30, 48], gray: [108, 117, 125], grayLight: [160, 170, 180],
    white: [255, 255, 255], bg: [245, 247, 250], bgAlt: [235, 240, 248],
    ok: [22, 163, 74], fail: [220, 38, 38], gold: [180, 140, 20],
};

function openPdf(doc, name) {
    try {
        var b = doc.output("blob"), u = URL.createObjectURL(b);
        var w = window.open(u, "_blank");
        if (!w) { var a = document.createElement("a"); a.href = u; a.download = name; document.body.appendChild(a); a.click(); document.body.removeChild(a); }
        setTimeout(function () { URL.revokeObjectURL(u); }, 15000);
    } catch (e) { doc.save(name); }
}

function createDoc(o) { return new jsPDF({ orientation: o || "portrait", unit: "mm", format: "letter" }); }

function header(doc, opts) {
    var pw = doc.internal.pageSize.getWidth();
    // Gradient bar
    doc.setFillColor(...C.priDark); doc.rect(0, 0, pw, 32, "F");
    doc.setFillColor(...C.pri); doc.rect(0, 28, pw, 4, "F");
    // Accent line
    doc.setFillColor(...C.gold); doc.rect(0, 32, pw, 1.5, "F");
    // Institution
    doc.setTextColor(...C.white); doc.setFontSize(20); doc.setFont("helvetica", "bold");
    doc.text("SISTEMA ACADEMICO", 16, 14);
    doc.setFontSize(8); doc.setFont("helvetica", "normal");
    doc.text("Universidad - Sistema de Gestion Kardex", 16, 20);
    // Date
    doc.setFontSize(7.5);
    doc.text("Fecha: " + new Date().toLocaleDateString("es-BO"), pw - 16, 12, { align: "right" });
    doc.text("Hora: " + new Date().toLocaleTimeString("es-BO"), pw - 16, 17, { align: "right" });
    // Title area
    doc.setTextColor(...C.dark); doc.setFontSize(15); doc.setFont("helvetica", "bold");
    doc.text(opts.titulo, 16, 44);
    var y = 44;
    if (opts.subtitulo) {
        doc.setTextColor(...C.gray); doc.setFontSize(9); doc.setFont("helvetica", "normal");
        doc.text(opts.subtitulo, 16, 50); y = 50;
    }
    // Separator
    doc.setDrawColor(...C.pri); doc.setLineWidth(0.4);
    doc.line(16, y + 3, pw - 16, y + 3);
    return y + 8;
}

function footer(doc) {
    var n = doc.internal.getNumberOfPages(), pw = doc.internal.pageSize.getWidth(), ph = doc.internal.pageSize.getHeight();
    for (var i = 1; i <= n; i++) {
        doc.setPage(i);
        doc.setFillColor(...C.priDark); doc.rect(0, ph - 12, pw, 12, "F");
        doc.setFillColor(...C.gold); doc.rect(0, ph - 12, pw, 0.8, "F");
        doc.setTextColor(...C.white); doc.setFontSize(7); doc.setFont("helvetica", "normal");
        doc.text("Sistema Academico - Documento oficial generado automaticamente", 16, ph - 5);
        doc.text("Pag. " + i + "/" + n, pw - 16, ph - 5, { align: "right" });
    }
}

function tblStyle() {
    return {
        styles: { fontSize: 8.5, cellPadding: 3.5, font: "helvetica", lineColor: [210, 218, 230], lineWidth: 0.2 },
        headStyles: { fillColor: C.pri, textColor: C.white, fontStyle: "bold", fontSize: 8 },
        alternateRowStyles: { fillColor: C.bgAlt },
        margin: { left: 16, right: 16 },
    };
}

// ── ADMIN ──

export function generarReporteCarreras(data) {
    var doc = createDoc();
    var y = header(doc, { titulo: "REPORTE DE CARRERAS", subtitulo: "Total registradas: " + data.length });
    autoTable(doc, { ...tblStyle(), startY: y,
        head: [["#", "Carrera", "Descripcion", "Materias", "Estudiantes"]],
        body: data.map(function (c, i) { return [i + 1, c.nombre || "-", (c.descripcion || "-").substring(0, 55), c.materiasCount || 0, c.estudiantesCount || 0]; }),
        columnStyles: { 0: { cellWidth: 10, halign: "center" }, 3: { cellWidth: 20, halign: "center" }, 4: { cellWidth: 22, halign: "center" } },
    });
    footer(doc); openPdf(doc, "reporte_carreras.pdf");
}

export function generarReporteEstudiantes(data) {
    var doc = createDoc("landscape");
    var y = header(doc, { titulo: "REPORTE DE ESTUDIANTES", subtitulo: "Total: " + data.length + " estudiantes" });
    autoTable(doc, { ...tblStyle(), startY: y,
        head: [["#", "Carnet", "Nombres", "Ap. Paterno", "Ap. Materno", "Correo", "Telefono", "Carrera", "Estado"]],
        body: data.map(function (e, i) {
            return [i + 1, e.persona?.carnet || "-", e.persona?.nombres || "-", e.persona?.paterno || "-", e.persona?.materno || "-", e.persona?.correo || "-", e.persona?.telefono || "-", e.carrera?.nombre || "-", e.persona?.estado !== false ? "Activo" : "Inactivo"];
        }),
        columnStyles: { 0: { cellWidth: 8 }, 8: { cellWidth: 16, halign: "center" } },
        didParseCell: function (d) {
            if (d.section === "body" && d.column.index === 8) {
                d.cell.styles.textColor = d.cell.raw === "Activo" ? C.ok : C.fail;
                d.cell.styles.fontStyle = "bold";
            }
        },
    });
    footer(doc); openPdf(doc, "reporte_estudiantes.pdf");
}

export function generarReporteDocentes(data) {
    var doc = createDoc();
    var y = header(doc, { titulo: "REPORTE DE DOCENTES", subtitulo: "Total: " + data.length + " docentes" });
    autoTable(doc, { ...tblStyle(), startY: y,
        head: [["#", "Carnet", "Nombre Completo", "Especialidad", "Correo", "Estado"]],
        body: data.map(function (d, i) {
            return [i + 1, d.persona?.carnet || "-", ((d.persona?.nombres || "") + " " + (d.persona?.paterno || "") + " " + (d.persona?.materno || "")).trim(), d.especialidad || "-", d.persona?.correo || "-", d.persona?.estado !== false ? "Activo" : "Inactivo"];
        }),
        didParseCell: function (d) {
            if (d.section === "body" && d.column.index === 5) {
                d.cell.styles.textColor = d.cell.raw === "Activo" ? C.ok : C.fail;
                d.cell.styles.fontStyle = "bold";
            }
        },
    });
    footer(doc); openPdf(doc, "reporte_docentes.pdf");
}

export function generarReporteMaterias(data) {
    var doc = createDoc();
    var y = header(doc, { titulo: "REPORTE DE MATERIAS", subtitulo: "Total: " + data.length + " materias" });
    autoTable(doc, { ...tblStyle(), startY: y,
        head: [["#", "Sigla", "Materia", "Creditos", "Carrera"]],
        body: data.map(function (m, i) { return [i + 1, m.sigla || "-", m.nombre || "-", m.creditos || 0, m.carrera?.nombre || "-"]; }),
        columnStyles: { 0: { cellWidth: 10, halign: "center" }, 3: { cellWidth: 18, halign: "center" } },
    });
    footer(doc); openPdf(doc, "reporte_materias.pdf");
}

export function generarReportePeriodos(data) {
    var doc = createDoc();
    var y = header(doc, { titulo: "REPORTE DE PERIODOS ACADEMICOS", subtitulo: "Total: " + data.length });
    var fmt = function (d) { return d ? new Date(d + "T00:00:00").toLocaleDateString("es-BO") : "-"; };
    autoTable(doc, { ...tblStyle(), startY: y,
        head: [["#", "Codigo", "Descripcion", "Inicio", "Fin", "Estado"]],
        body: data.map(function (p, i) { return [i + 1, p.codigo || "-", p.descripcion || "-", fmt(p.fecha_inicio), fmt(p.fecha_fin), p.estado ? "Activo" : "Cerrado"]; }),
        columnStyles: { 0: { cellWidth: 10 }, 5: { cellWidth: 18, halign: "center" } },
        didParseCell: function (d) {
            if (d.section === "body" && d.column.index === 5) {
                d.cell.styles.textColor = d.cell.raw === "Activo" ? C.ok : C.fail;
                d.cell.styles.fontStyle = "bold";
            }
        },
    });
    footer(doc); openPdf(doc, "reporte_periodos.pdf");
}

// ── ESTUDIANTE ──

export function generarHistorialAcademico(kd, user) {
    var doc = createDoc(), pw = doc.internal.pageSize.getWidth();
    var nom = ((user?.nombres || "") + " " + (user?.paterno || "") + " " + (user?.materno || "")).trim();
    var y = header(doc, { titulo: "HISTORIAL ACADEMICO", subtitulo: "Estudiante: " + nom });

    // Info box
    doc.setFillColor(...C.bgAlt); doc.roundedRect(16, y, pw - 32, 20, 2, 2, "F");
    doc.setDrawColor(...C.pri); doc.setLineWidth(0.3); doc.roundedRect(16, y, pw - 32, 20, 2, 2, "S");
    doc.setFontSize(8); doc.setTextColor(...C.dark); doc.setFont("helvetica", "bold");
    doc.text("Carnet:", 22, y + 6); doc.setFont("helvetica", "normal"); doc.text(user?.carnet || "-", 40, y + 6);
    doc.setFont("helvetica", "bold"); doc.text("Carrera:", 90, y + 6); doc.setFont("helvetica", "normal"); doc.text(user?.carrera || "-", 110, y + 6);
    // Stats
    var tot = kd.length, apr = kd.filter(function (k) { return parseFloat(k.nota_final) >= 51; }).length;
    var prom = tot > 0 ? (kd.reduce(function (s, k) { return s + (parseFloat(k.nota_final) || 0); }, 0) / tot).toFixed(1) : "0.0";
    doc.setFont("helvetica", "bold"); doc.setTextColor(...C.pri);
    doc.text("Promedio: " + prom, 22, y + 14); doc.text("Cursadas: " + tot, 80, y + 14); doc.text("Aprobadas: " + apr, 130, y + 14);
    y += 26;

    // Group by periodo
    var per = {};
    kd.forEach(function (item) { var p = item.periodo || "Sin periodo"; if (!per[p]) per[p] = []; per[p].push(item); });

    Object.entries(per).forEach(function (entry) {
        var periodo = entry[0], mats = entry[1];
        var pp = mats.length > 0 ? (mats.reduce(function (s, m) { return s + (parseFloat(m.nota_final) || 0); }, 0) / mats.length).toFixed(1) : "0.0";
        autoTable(doc, { startY: y, head: [[{ content: "Periodo: " + periodo + "  |  Promedio: " + pp, colSpan: 4, styles: { fillColor: C.priDark, halign: "left" } }]], body: [], styles: { fontSize: 9, font: "helvetica" }, headStyles: { textColor: C.white, fontStyle: "bold" }, margin: { left: 16, right: 16 } });
        y = doc.lastAutoTable.finalY;
        autoTable(doc, { ...tblStyle(), startY: y,
            head: [["#", "Materia", "Nota Final", "Resultado"]],
            body: mats.map(function (m, i) { var n = parseFloat(m.nota_final) || 0; return [i + 1, m.materia, n.toFixed(1), n >= 51 ? "APROBADO" : "REPROBADO"]; }),
            columnStyles: { 0: { cellWidth: 10 }, 2: { cellWidth: 22, halign: "center" }, 3: { cellWidth: 26, halign: "center" } },
            didParseCell: function (d) { if (d.section === "body" && d.column.index === 3) { d.cell.styles.textColor = d.cell.raw === "APROBADO" ? C.ok : C.fail; d.cell.styles.fontStyle = "bold"; } },
        });
        y = doc.lastAutoTable.finalY + 5;
    });
    footer(doc); openPdf(doc, "historial_academico.pdf");
}

export function generarBoletaInscripcion(inscs, user, periodo) {
    var doc = createDoc(), pw = doc.internal.pageSize.getWidth();
    var y = header(doc, { titulo: "BOLETA DE INSCRIPCION", subtitulo: "Periodo: " + (periodo?.codigo || "") + " - " + (periodo?.descripcion || "") });

    // Student card
    doc.setFillColor(...C.bgAlt); doc.roundedRect(16, y, pw - 32, 22, 2, 2, "F");
    doc.setDrawColor(...C.pri); doc.setLineWidth(0.3); doc.roundedRect(16, y, pw - 32, 22, 2, 2, "S");
    doc.setFontSize(8.5); doc.setTextColor(...C.dark);
    doc.setFont("helvetica", "bold"); doc.text("Estudiante:", 22, y + 6); doc.setFont("helvetica", "normal"); doc.text((user?.nombres || "") + " " + (user?.paterno || ""), 52, y + 6);
    doc.setFont("helvetica", "bold"); doc.text("Carnet:", 140, y + 6); doc.setFont("helvetica", "normal"); doc.text(user?.carnet || "-", 158, y + 6);
    doc.setFont("helvetica", "bold"); doc.text("Carrera:", 22, y + 13); doc.setFont("helvetica", "normal"); doc.text(user?.carrera || "-", 52, y + 13);
    doc.setFont("helvetica", "bold"); doc.text("Reg. Univ.:", 140, y + 13); doc.setFont("helvetica", "normal"); doc.text(user?.registro_universitario || "-", 163, y + 13);
    y += 28;

    var tc = inscs.reduce(function (s, i) { return s + (i.grupo?.materia?.creditos || 0); }, 0);
    autoTable(doc, { ...tblStyle(), startY: y,
        head: [["#", "Sigla", "Materia", "Grupo", "Docente", "Cred."]],
        body: inscs.map(function (ins, i) { var dn = ((ins.grupo?.docente?.persona?.nombres || "") + " " + (ins.grupo?.docente?.persona?.paterno || "")).trim(); return [i + 1, ins.grupo?.materia?.sigla || "-", ins.grupo?.materia?.nombre || "-", ins.grupo?.paralelo || "-", dn || "-", ins.grupo?.materia?.creditos || 0]; }),
        foot: [["", "", "", "", "TOTAL CREDITOS:", tc]],
        footStyles: { fillColor: C.priDark, textColor: C.white, fontStyle: "bold" },
        columnStyles: { 0: { cellWidth: 10 }, 5: { cellWidth: 16, halign: "center" } },
    });

    // Signatures
    var fy = doc.lastAutoTable.finalY + 28;
    doc.setDrawColor(...C.gray); doc.setLineWidth(0.3);
    doc.line(35, fy, 95, fy); doc.line(pw - 95, fy, pw - 35, fy);
    doc.setFontSize(7.5); doc.setTextColor(...C.gray); doc.setFont("helvetica", "normal");
    doc.text("Firma del Estudiante", 48, fy + 5); doc.text("Sello Institucional", pw - 82, fy + 5);
    footer(doc); openPdf(doc, "boleta_inscripcion.pdf");
}

// ── DOCENTE ──

export function generarReporteInscritosPorMateria(grupo, ests, user) {
    var doc = createDoc(), pw = doc.internal.pageSize.getWidth();
    var y = header(doc, { titulo: "LISTA DE ESTUDIANTES INSCRITOS", subtitulo: (grupo.materia?.sigla || "") + " - " + (grupo.materia?.nombre || "") + " | Grupo " + (grupo.paralelo || "") });

    doc.setFillColor(...C.bgAlt); doc.roundedRect(16, y, pw - 32, 10, 1, 1, "F");
    doc.setFontSize(8); doc.setTextColor(...C.dark); doc.setFont("helvetica", "bold");
    doc.text("Docente: ", 22, y + 7); doc.setFont("helvetica", "normal"); doc.text((user?.nombres || "") + " " + (user?.paterno || ""), 44, y + 7);
    doc.setFont("helvetica", "bold"); doc.text("Periodo: ", 110, y + 7); doc.setFont("helvetica", "normal"); doc.text(grupo.periodo?.codigo || "-", 130, y + 7);
    doc.setFont("helvetica", "bold"); doc.text("Inscritos: " + ests.length, 165, y + 7);
    y += 14;

    autoTable(doc, { ...tblStyle(), startY: y,
        head: [["#", "Carnet", "Nombre Completo", "Correo", "Estado"]],
        body: ests.map(function (e, i) { var nm = ((e.estudiante?.persona?.nombres || "") + " " + (e.estudiante?.persona?.paterno || "") + " " + (e.estudiante?.persona?.materno || "")).trim(); return [i + 1, e.estudiante?.persona?.carnet || "-", nm, e.estudiante?.persona?.correo || "-", e.estado || "activo"]; }),
        columnStyles: { 0: { cellWidth: 10 } },
    });
    footer(doc); openPdf(doc, "lista_inscritos.pdf");
}

export function generarReporteCalificaciones(grupo, ests, evals, notas, user) {
    var doc = createDoc("landscape"), pw = doc.internal.pageSize.getWidth();
    var y = header(doc, { titulo: "REPORTE DE CALIFICACIONES", subtitulo: (grupo.materia?.sigla || "") + " - " + (grupo.materia?.nombre || "") + " | Grupo " + (grupo.paralelo || "") });

    doc.setFillColor(...C.bgAlt); doc.roundedRect(16, y, pw - 32, 10, 1, 1, "F");
    doc.setFontSize(8); doc.setTextColor(...C.dark); doc.setFont("helvetica", "bold");
    doc.text("Docente: ", 22, y + 7); doc.setFont("helvetica", "normal"); doc.text((user?.nombres || "") + " " + (user?.paterno || ""), 44, y + 7);
    doc.setFont("helvetica", "bold"); doc.text("Periodo: " + (grupo.periodo?.codigo || "-"), 150, y + 7);
    y += 14;

    var hd = ["#", "Carnet", "Estudiante"];
    evals.forEach(function (ev) { hd.push(ev.nombre + " (" + ev.porcentaje + "%)"); });
    hd.push("Final", "Estado");

    var bd = ests.map(function (est, i) {
        var r = [i + 1, est.estudiante?.persona?.carnet || "-", ((est.estudiante?.persona?.nombres || "") + " " + (est.estudiante?.persona?.paterno || "")).trim()];
        var nf = 0;
        evals.forEach(function (ev) { var n = parseFloat(notas[est.id + "_" + ev.id]) || 0; r.push(n > 0 ? n.toFixed(1) : "-"); nf += n * (parseFloat(ev.porcentaje) / 100); });
        r.push(nf.toFixed(1)); r.push(nf >= 51 ? "APROBADO" : "REPROBADO");
        return r;
    });

    autoTable(doc, { ...tblStyle(), startY: y, head: [hd], body: bd,
        columnStyles: { 0: { cellWidth: 8 } },
        didParseCell: function (d) { if (d.section === "body" && d.column.index === hd.length - 1) { d.cell.styles.textColor = d.cell.raw === "APROBADO" ? C.ok : C.fail; d.cell.styles.fontStyle = "bold"; } },
    });

    var ey = doc.lastAutoTable.finalY + 6;
    var ap = bd.filter(function (r) { return r[r.length - 1] === "APROBADO"; }).length;
    doc.setFillColor(...C.bgAlt); doc.roundedRect(16, ey, pw - 32, 10, 1, 1, "F");
    doc.setFontSize(8.5); doc.setFont("helvetica", "bold"); doc.setTextColor(...C.dark);
    doc.text("Aprobados: " + ap + "  |  Reprobados: " + (bd.length - ap) + "  |  Total: " + bd.length, 22, ey + 7);

    var sy = ey + 22;
    doc.setDrawColor(...C.gray); doc.setLineWidth(0.3);
    doc.line(pw / 2 - 35, sy, pw / 2 + 35, sy);
    doc.setFontSize(7.5); doc.setTextColor(...C.gray); doc.setFont("helvetica", "normal");
    doc.text("Firma del Docente", pw / 2, sy + 5, { align: "center" });
    footer(doc); openPdf(doc, "calificaciones.pdf");
}
