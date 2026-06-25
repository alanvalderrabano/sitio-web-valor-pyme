#!/bin/bash
# Genera/edita una imagen con Nano Banana Pro (kie.ai) y la descarga.
# Uso: kie-gen.sh "<PROMPT>" "<IMG_URL_o_vacio>" "<ASPECT>" "<OUT_PATH>" [RES] [FMT]
#   IMG_URL vacío ("") => text-to-image. Con URL => image-to-image (edición).
#   FMT: jpg (default) | png  -> usa png para personajes recortados (transparencia).
set -e
TOKEN=$(cat ~/.config/kie/token)
PROMPT="$1"; IMG="$2"; AR="$3"; OUT="$4"; RES="${5:-2K}"; FMT="${6:-jpg}"

python3 - "$PROMPT" "$IMG" "$AR" "$RES" "$FMT" > /tmp/kie_req.json <<'PY'
import json,sys
prompt,img,ar,res,fmt=sys.argv[1],sys.argv[2],sys.argv[3],sys.argv[4],sys.argv[5]
inp={"prompt":prompt,"aspect_ratio":ar,"resolution":res,"output_format":fmt}
if img.strip():
    inp["image_input"]=[img]
print(json.dumps({"model":"nano-banana-pro","input":inp}))
PY

RESP=$(curl -s -X POST "https://api.kie.ai/api/v1/jobs/createTask" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d @/tmp/kie_req.json)
echo "CREATE: $RESP"
TASK=$(python3 -c "import json,sys;print(json.loads(sys.stdin.read()).get('data',{}).get('taskId',''))" <<<"$RESP")
[ -z "$TASK" ] && { echo "NO_TASK_ID"; exit 1; }
echo "TASK: $TASK"

for i in $(seq 1 48); do
  sleep 5
  R=$(curl -s "https://api.kie.ai/api/v1/jobs/recordInfo?taskId=$TASK" -H "Authorization: Bearer $TOKEN")
  STATE=$(python3 -c "import json,sys;print(json.loads(sys.stdin.read()).get('data',{}).get('state',''))" <<<"$R")
  echo "poll $i: $STATE"
  if [ "$STATE" = "success" ]; then
    URL=$(python3 -c "import json,sys;d=json.loads(sys.stdin.read());print(json.loads(d['data']['resultJson'])['resultUrls'][0])" <<<"$R")
    echo "URL: $URL"
    curl -s "$URL" -o "$OUT"
    echo "SAVED: $OUT ($(wc -c <"$OUT") bytes)"
    exit 0
  fi
  [ "$STATE" = "fail" ] && { echo "FAILED: $R"; exit 1; }
done
echo "TIMEOUT"; exit 1
