import json
import os
import base64
import uuid
import boto3
import psycopg2

def handler(event: dict, context) -> dict:
    """Загружает файл документа в S3 и сохраняет ссылку в БД."""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '86400'}, 'body': ''}

    body = json.loads(event.get('body') or '{}')
    step_id = body.get('step_id')
    doc_label = body.get('doc_label')
    file_name = body.get('file_name')
    file_data = body.get('file_data')

    if not all([step_id, doc_label, file_name, file_data]):
        return {'statusCode': 400, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Missing required fields'})}

    file_bytes = base64.b64decode(file_data)
    ext = file_name.rsplit('.', 1)[-1] if '.' in file_name else 'bin'
    s3_key = f'documents/{step_id}/{uuid.uuid4()}.{ext}'

    s3 = boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY']
    )
    s3.put_object(Bucket='files', Key=s3_key, Body=file_bytes)
    file_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{s3_key}"

    schema = os.environ['MAIN_DB_SCHEMA']
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    cur.execute(
        f"INSERT INTO {schema}.step_documents (step_id, doc_label, file_name, file_url) VALUES (%s, %s, %s, %s) RETURNING id",
        (step_id, doc_label, file_name, file_url)
    )
    doc_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()

    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'id': doc_id, 'file_url': file_url, 'file_name': file_name, 'doc_label': doc_label})
    }
