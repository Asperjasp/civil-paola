#!/usr/bin/env python3
"""Refresh the DANE publication pointer, never infer a contractor price from an index."""
import datetime as dt
import html
import json
import pathlib
import re
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[1]
TARGET = ROOT / "public/data/indicadores.json"
PAGE = "https://www.dane.gov.co/index.php/estadisticas-por-tema/precios-y-costos/indice-de-costos-de-la-construccion-de-edificaciones-icoced/indice-de-costos-de-la-construccion-de-edificaciones-icoced-historicos"
MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"]
NAMES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"]


def latest_bulletin(page):
    links = re.findall(r'(?:https?://www\.dane\.gov\.co)?/files/operaciones/ICOCED/bol-ICOCED-([a-z]{3})(20\d{2})\.pdf', html.unescape(page), re.I)
    dates = [(int(year), MONTHS.index(month.lower()) + 1, month.lower()) for month, year in links if month.lower() in MONTHS]
    if not dates:
        raise ValueError("No se encontró un boletín ICOCED con periodo identificable")
    year, month_number, month = max(dates)
    return year, month_number, f"https://www.dane.gov.co/files/operaciones/ICOCED/bol-ICOCED-{month}{year}.pdf"


def main():
    request = urllib.request.Request(PAGE, headers={"User-Agent": "CONSTRUPLAN-publication-check/1.0"})
    with urllib.request.urlopen(request, timeout=25) as response:
        page = response.read().decode("utf-8", errors="replace")
    year, month, url = latest_bulletin(page)
    current = json.loads(TARGET.read_text(encoding="utf-8"))
    old_year, old_month = re.search(r"(20\d{2})", current["periodo"]), next((i for i, name in enumerate(NAMES, 1) if name in current["periodo"]), None)
    if old_year and old_month and (year, month) <= (int(old_year.group()), old_month):
        print("Sin nueva publicación; se conserva el indicador actual.")
        return
    current.update({
        "periodo": f"{NAMES[month-1]} de {year}",
        "publicado": "fecha por confirmar en el boletín",
        "variacion_mensual_nacional": None,
        "fuente": url,
        "consultado": dt.date.today().isoformat(),
    })
    TARGET.write_text(json.dumps(current, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Nuevo boletín {current['periodo']}; valor pendiente de revisión: {url}")


if __name__ == "__main__":
    main()
