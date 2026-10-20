"""Build the iOS router toggle shortcut; sign with Apple's shortcuts CLI.
Schema references: EachSheep/ShortcutsBench data/all_api2info.json;
electrikmilk/cherri action.go (operation=toggle), actions/web.cherri.
No hotspot secrets or device identifiers are included.
"""
import plistlib
from pathlib import Path
from uuid import uuid4

root = Path(__file__).resolve().parent.parent
out = root / 'output' / 'shortcuts'
out.mkdir(parents=True, exist_ok=True)
battery_id = str(uuid4()).upper()
url = ('https://udondong.github.io/iphone-router/'
       '%EB%82%98%EB%9D%BC%EA%B0%80%EC%A1%B1_%EB%9D%BC%EC%9A%B0%ED%84%B0.html'
       '#view=dock&source=shortcut&battery=\ufffc')
token = {
    'WFSerializationType': 'WFTextTokenString',
    'Value': {'string': url, 'attachmentsByRange': {
        '{%d, 1}' % url.index('\ufffc'): {
            'Type': 'ActionOutput', 'OutputUUID': battery_id,
            'OutputName': 'Battery State',
        }
    }},
}
def action(name, **parameters):
    return {'WFWorkflowActionIdentifier': 'is.workflow.actions.' + name,
            'WFWorkflowActionParameters': parameters}
workflow = {
    'WFWorkflowName': '나라가족 라우터',
    'WFWorkflowClientRelease': '18.0',
    'WFWorkflowMinimumClientVersion': 900,
    'WFWorkflowIcon': {'WFWorkflowIconStartColor': 463140863,
                       'WFWorkflowIconGlyphNumber': 59511},
    'WFWorkflowTypes': ['NCWidget'],
    'WFWorkflowInputContentItemClasses': [],
    'WFWorkflowImportQuestions': [],
    'WFWorkflowActions': [
        action('comment', WFCommentActionText='한 번 누르면 개인용 핫스팟을 전환하고 기존 QR 상태판을 엽니다. 충전 여부와 무관합니다. 웹 화면은 실제 핫스팟 상태를 읽지 않습니다.'),
        action('personalhotspot.set', operation='toggle'),
        action('getbatterylevel', Subject='Battery Level', UUID=battery_id),
        action('openurl', WFInput=token, **{'Show-WFInput': True}),
    ],
}
assert workflow['WFWorkflowActions'][1]['WFWorkflowActionParameters'] == {'operation': 'toggle'}
assert workflow['WFWorkflowActions'][-1]['WFWorkflowActionIdentifier'].endswith('openurl')
assert '?' not in url and 'password' not in url
path = out / 'router-unsigned.shortcut'
path.write_bytes(plistlib.dumps(workflow, fmt=plistlib.FMT_XML, sort_keys=False))
print(path)
