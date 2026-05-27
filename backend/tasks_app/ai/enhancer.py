def run(client, text: str):
    prompt = f"Enhance and rewrite the text for clarity and grammar:\n\n{text}"
    resp = client.generate(prompt)
    return {'enhanced_text': resp.get('output')}
