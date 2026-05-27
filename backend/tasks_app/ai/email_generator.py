def run(client, text: str):
    prompt = f"Write a professional email based on the following notes:\n\n{text}"
    resp = client.generate(prompt)
    return {'output': resp.get('output')}
