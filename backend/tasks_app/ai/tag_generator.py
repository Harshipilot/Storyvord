def run(client, text: str):
    prompt = f"Generate short tags/keywords for the following content:\n\n{text}"
    resp = client.generate(prompt)
    # Expecting comma-separated or list output; normalize to list
    out = resp.get('output') or ''
    if isinstance(out, list):
        tags = out
    else:
        tags = [t.strip() for t in str(out).replace('\n', ',').split(',') if t.strip()]
    return {'tags': tags}
