def run(client, text: str):
    prompt = f"Summarize the following text:\n\n{text}"
    resp = client.generate(prompt)
    return {'summary': resp.get('output')}
