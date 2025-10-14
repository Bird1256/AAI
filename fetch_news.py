# fetch_news.py
import requests
from bs4 import BeautifulSoup
from urllib.parse import quote
from nlp_summary import summarize_thai_news

def fetch_local_news(province, limit=3):
    """ดึงข่าวท้องถิ่นเกี่ยวกับจังหวัดนั้น ๆ จาก Google News"""
    try:
        query = quote(f"ข่าว {province}")
        url = f"https://news.google.com/search?q={query}&hl=th&gl=TH&ceid=TH:th"
        headers = {"User-Agent": "Mozilla/5.0"}
        html = requests.get(url, headers=headers, timeout=5).text

        soup = BeautifulSoup(html, "html.parser")
        cards = soup.select("article")[:limit]
        results = []

        for c in cards:
            title = c.text.strip()
            link_tag = c.find("a", href=True)
            link = "https://news.google.com" + link_tag["href"][1:] if link_tag else ""
            summary = summarize_thai_news(title, n_sentences=1)
            results.append({"title": title, "link": link, "summary": summary})
        
        return results or [{"title": f"ไม่มีข่าวล่าสุดเกี่ยวกับ {province}", "link": "", "summary": ""}]
    except Exception as e:
        return [{"title": f"เกิดข้อผิดพลาด: {e}", "link": "", "summary": ""}]
