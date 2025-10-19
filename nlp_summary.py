# ============================================================
# nlp_summary.py — ฟังก์ชันสรุปข่าวภาษาไทยให้อ่านง่าย
# ใช้ร่วมกับ fetch_news.py
# ============================================================

from pythainlp.summarize import summarize

def summarize_thai_news(text: str, n_sentences: int = 1) -> str:
    """
    🔹 ฟังก์ชันสรุปข่าวภาษาไทยให้อ่านง่ายขึ้น
    - ใช้ pythainlp.summarize() ถ้าสรุปได้
    - ถ้าสรุปไม่ได้ จะใช้ข้อความต้นฉบับบางส่วนแทน
    - ตัดความยาวสูงสุด ~150 ตัวอักษร
    """

    # ถ้าไม่มีข้อความหรือเป็นค่าว่าง
    if not text or not isinstance(text, str):
        return ""

    try:
        # ใช้ PyThaiNLP สรุปข้อความ
        result = summarize(text, n_sentences)

        # ถ้า summarize คืนค่าว่าง → ใช้ fallback
        if not result:
            summary = text.strip()
        else:
            summary = result.strip()

        # ทำความสะอาดข้อความ
        summary = summary.replace("\n", " ").replace("\r", " ").strip()
        summary = " ".join(summary.split())  # ลบช่องว่างซ้ำ

        # จำกัดความยาวข้อความ
        if len(summary) > 150:
            summary = summary[:150].rstrip() + "..."

        return summary

    except Exception:
        # fallback กรณี summarize error
        fallback = text.strip().replace("\n", " ").replace("\r", " ")
        fallback = " ".join(fallback.split())
        return fallback[:150] + "..." if len(fallback) > 150 else fallback


# ============================================================
# ทดสอบการทำงาน (รันไฟล์นี้โดยตรง)
# ============================================================
if __name__ == "__main__":
    sample_text = (
        "ผู้ว่าราชการจังหวัดชลบุรีแถลงสถานการณ์น้ำท่วมล่าสุด "
        "หลังจากฝนตกต่อเนื่องหลายวันทำให้มีน้ำท่วมในหลายพื้นที่ "
        "โดยเฉพาะในเขตเมืองและพื้นที่ลุ่มต่ำ ซึ่งขณะนี้เจ้าหน้าที่ได้เร่งระบายน้ำออกจากพื้นที่แล้ว"
    )
    print("📰 ตัวอย่างข้อความต้นฉบับ:")
    print(sample_text)
    print("\n✨ สรุปข่าว:")
    print(summarize_thai_news(sample_text))
