import json
import os
import psycopg2

def handler(event: dict, context) -> dict:
    """Возвращает список документов для указанного шага."""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, DELETE, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '86400'}, 'body': ''}

    params = event.get('queryStringParameters') or {}
    step_id = params.get('step_id')

    if event.get('httpMethod') == 'DELETE':
        body = json.loads(event.get('body') or '{}')
        doc_id = body.get('id')
        schema = os.environ['MAIN_DB_SCHEMA']
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor()
        cur.execute(f"DELETE FROM {schema}.step_documents WHERE id = %s", (doc_id,))
        conn.commit()
        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'ok': True})}

    schema = os.environ['MAIN_DB_SCHEMA']
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    if step_id:
        cur.execute(f"SELECT id, step_id, doc_label, file_name, file_url, created_at FROM {schema}.step_documents WHERE step_id = %s ORDER BY created_at", (step_id,))
    else:
        cur.execute(f"SELECT id, step_id, doc_label, file_name, file_url, created_at FROM {schema}.step_documents ORDER BY created_at")
    rows = cur.fetchall()
    cur.close()
    conn.close()

    docs = [{'id': r[0], 'step_id': r[1], 'doc_label': r[2], 'file_name': r[3], 'file_url': r[4]} for r in rows]
    return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps(docs)}
