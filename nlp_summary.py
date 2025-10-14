# nlp_summary.py
from pythainlp.summarize import summarize

def summarize_thai_news(text, n_sentences=1):
    """สรุปข้อความข่าวสั้น ๆ"""
    try:
        result = summarize(text, n_sentences)
        if not result:
            return text[:120] + "..." if len(text) > 120 else text
        return result
    except Exception:
        return text[:120] + "..." if len(text) > 120 else text
