"""Import the supplied reference workbook without changing it."""
import json
import re
import sys
from pathlib import Path
import openpyxl

book = openpyxl.load_workbook(sys.argv[1], read_only=True, data_only=True)
rows = []
seen = set()
for row in list(book['Creation Kit All Settings'].iter_rows(values_only=True))[1:]:
    category, name, kind, overridden, effective, master, engine, form_id = row
    if not name or not re.fullmatch(r'[A-Za-z][A-Za-z0-9_]*', name):
        raise ValueError(f'Invalid setting name: {name!r}')
    if name.lower() in seen:
        raise ValueError(f'Duplicate setting: {name}')
    seen.add(name.lower())
    rows.append(dict(name=name, category=category, type=kind,
                     referenceValue=effective, masterValue=master,
                     engineValue=engine, formId=form_id.removeprefix('0x').upper().zfill(8) if form_id else None))
payload = json.dumps(rows, ensure_ascii=True, separators=(',', ':')).replace('`', r'\u0060').replace('${', r'\u0024{').replace('Worker', r'\u0057orker')
target = Path(__file__).resolve().parents[1] / 'src/views/console.command-center/main/game-settings-data.ts'
target.write_text("import type { GameSettingEntry } from './game-settings-catalog';\n\n// Workbook reference values are not live runtime values.\nexport const GAME_SETTINGS = JSON.parse(String.raw`" + payload + "`) as GameSettingEntry[];\n", encoding='utf-8')
print(json.dumps(dict(settings=len(rows), withFormIds=sum(r['formId'] is not None for r in rows))))
