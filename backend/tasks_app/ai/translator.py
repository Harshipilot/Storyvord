def run(client, text: str):
    prompt = f"Translate the following text to the requested language. If no language specified, translate to English:\n\n{text}"
    resp = client.generate(prompt)
    return {'translation': resp.get('output')}
