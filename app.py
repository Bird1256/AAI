# ===============================================
# app.py — Flask API สำหรับข้อมูลอุบัติเหตุ + ข่าวท้องถิ่น
# ===============================================
from flask import Flask, jsonify
from flask_cors import CORS
import pandas as pd
import time, os, re
from fetch_news import fetch_local_news  # ✅ เพิ่มส่วนเชื่อมข่าว

app = Flask(__name__)
CORS(app)

# ==========================
# 🧠 ตัวแปร cache
# ==========================
cache_data = None
cache_timestamp = 0
CACHE_TTL = 24 * 60 * 60  # 24 ชั่วโมง

# ==========================
# 📍 Mapping รหัสจังหวัด → ชื่อจังหวัด
# ==========================
province_code_map = {
    10: "กรุงเทพมหานคร", 11: "สมุทรปราการ", 12: "นนทบุรี", 13: "ปทุมธานี", 14: "พระนครศรีอยุธยา",
    15: "อ่างทอง", 16: "ลพบุรี", 17: "สิงห์บุรี", 18: "ชัยนาท", 19: "สระบุรี", 20: "ชลบุรี",
    21: "ระยอง", 22: "จันทบุรี", 23: "ตราด", 24: "ฉะเชิงเทรา", 25: "ปราจีนบุรี", 26: "นครนายก",
    27: "สระแก้ว", 30: "นครราชสีมา", 31: "บุรีรัมย์", 32: "สุรินทร์", 33: "ศรีสะเกษ", 34: "อุบลราชธานี",
    35: "ยโสธร", 36: "ชัยภูมิ", 37: "อำนาจเจริญ", 38: "บึงกาฬ", 39: "หนองบัวลำภู", 40: "ขอนแก่น",
    41: "อุดรธานี", 42: "เลย", 43: "หนองคาย", 44: "มหาสารคาม", 45: "ร้อยเอ็ด", 46: "กาฬสินธุ์",
    47: "สกลนคร", 48: "นครพนม", 49: "มุกดาหาร", 50: "เชียงใหม่", 51: "ลำพูน", 52: "ลำปาง",
    53: "อุตรดิตถ์", 54: "แพร่", 55: "น่าน", 56: "พะเยา", 57: "เชียงราย", 58: "แม่ฮ่องสอน",
    60: "นครสวรรค์", 61: "อุทัยธานี", 62: "กำแพงเพชร", 63: "ตาก", 64: "สุโขทัย", 65: "พิษณุโลก",
    66: "พิจิตร", 67: "เพชรบูรณ์", 70: "ราชบุรี", 71: "กาญจนบุรี", 72: "สุพรรณบุรี", 73: "นครปฐม",
    74: "สมุทรสาคร", 75: "สมุทรสงคราม", 76: "เพชรบุรี", 77: "ประจวบคีรีขันธ์", 80: "นครศรีธรรมราช",
    81: "กระบี่", 82: "พังงา", 83: "ภูเก็ต", 84: "สุราษฎร์ธานี", 85: "ระนอง", 86: "ชุมพร",
    90: "สงขลา", 91: "สตูล", 92: "ตรัง", 93: "พัทลุง", 94: "ปัตตานี", 95: "ยะลา", 96: "นราธิวาส"
}

# ==========================
# 🔧 Utility
# ==========================
def clean_month_name(name):
    """แปลงชื่อเดือนจากหลายรูปแบบ เช่น 'ตุลาคม', 'ต.ค.', 'ตค' → 'ต.ค'"""
    if not isinstance(name, str):
        return None
    name = re.sub(r"[.\-\s_/]", "", name)
    mapping = {
        "มกราคม": "ม.ค", "มค": "ม.ค",
        "กุมภาพันธ์": "ก.พ", "กพ": "ก.พ",
        "มีนาคม": "มี.ค", "มีค": "มี.ค",
        "เมษายน": "เม.ย", "เมย": "เม.ย",
        "พฤษภาคม": "พ.ค", "พค": "พ.ค",
        "มิถุนายน": "มิ.ย", "มิย": "มิ.ย",
        "กรกฎาคม": "ก.ค", "กค": "ก.ค",
        "สิงหาคม": "ส.ค", "สค": "ส.ค",
        "กันยายน": "ก.ย", "กย": "ก.ย",
        "ตุลาคม": "ต.ค", "ตค": "ต.ค",
        "พฤศจิกายน": "พ.ย", "พย": "พ.ย",
        "ธันวาคม": "ธ.ค", "ธค": "ธ.ค"
    }
    for key, val in mapping.items():
        if key in name:
            return val
    return None


# ==========================
# 📊 โหลดข้อมูลจาก Excel
# ==========================
def fetch_accident_data():
    """อ่านไฟล์ Excel และรวมข้อมูลรายเดือน + รายปี"""
    yearly_file = next((f for f in os.listdir() if "ตารางที่ 1" in f and f.endswith(".xlsx")), None)
    monthly_file = next((f for f in os.listdir() if "ตารางที่ 2" in f and f.endswith(".xlsx")), None)

    if not monthly_file or not yearly_file:
        raise FileNotFoundError("❌ ต้องมีทั้ง 'ตารางที่ 1.xlsx' (รายปี) และ 'ตารางที่ 2.xlsx' (รายเดือน)")

    print(f"\n📂 ใช้ไฟล์รายปี: {yearly_file}")
    print(f"📂 ใช้ไฟล์รายเดือน: {monthly_file}")

    df_year = pd.read_excel(yearly_file)
    df_month = pd.read_excel(monthly_file)

    # หา column จังหวัด
    col_prov_y = [c for c in df_year.columns if "รหัส" in str(c) or "จังหวัด" in str(c)][0]
    col_prov_m = [c for c in df_month.columns if "รหัส" in str(c) or "จังหวัด" in str(c)][0]

    # แปลงรหัสเป็นตัวเลข
    df_year[col_prov_y] = pd.to_numeric(df_year[col_prov_y], errors="coerce").fillna(0).astype(int)
    df_month[col_prov_m] = pd.to_numeric(df_month[col_prov_m], errors="coerce").fillna(0).astype(int)

    # Map ชื่อจังหวัด
    df_year["province"] = df_year[col_prov_y].map(province_code_map)
    df_month["province"] = df_month[col_prov_m].map(province_code_map)

    # รวมรายปี
    col_total_y = [c for c in df_year.columns if "รวม" in str(c)][0]
    yearly_data = {}
    for _, row in df_year.iterrows():
        prov = row["province"]
        if prov:
            yearly_data[prov] = int(row[col_total_y])

    # รวมรายเดือน
    month_col_map = {}
    for col in df_month.columns:
        cleaned = clean_month_name(str(col))
        if cleaned:
            month_col_map[cleaned] = col

    print("\n🗓️ ตรวจพบคอลัมน์เดือนทั้งหมด:", list(month_col_map.keys()))

    monthly_data = {}
    for _, row in df_month.iterrows():
        prov = row["province"]
        if prov:
            monthly_data[prov] = {}
            for m, col_name in month_col_map.items():
                val = row[col_name]
                monthly_data[prov][m] = int(val) if not pd.isna(val) else 0

    # รวมทั้งหมด
    combined = {}
    for prov in province_code_map.values():
        total = yearly_data.get(prov, 0)
        months = monthly_data.get(prov, {})
        avg = round(sum(months.values()) / len(months), 2) if months else 0

        combined[prov] = {
            "total": total,
            "monthly": months,
            "average": avg
        }

    print(f"\n✅ โหลดข้อมูลสำเร็จ {len(combined)} จังหวัด")
    return combined


# ==========================
# 🔥 API
# ==========================
@app.route("/accident_data")
def accident_data():
    """คืนข้อมูลอุบัติเหตุแบบ JSON"""
    global cache_data, cache_timestamp
    try:
        now = time.time()
        if cache_data and (now - cache_timestamp) < CACHE_TTL:
            print("🟢 ใช้ข้อมูลจาก cache")
            return jsonify(cache_data)

        print("\n🔄 โหลดข้อมูลจาก Excel ใหม่...")
        data = fetch_accident_data()
        cache_data = data
        cache_timestamp = now
        return jsonify(data)

    except Exception as e:
        print("❌ Error:", e)
        return jsonify({"error": str(e)}), 500


# ==========================
# 📰 ดึงข่าวท้องถิ่น
# ==========================
@app.route("/news/<province>")
def news(province):
    """ดึงข่าวท้องถิ่นของจังหวัดนั้น ๆ"""
    try:
        news_data = fetch_local_news(province)
        return jsonify(news_data)
    except Exception as e:
        print("❌ Error (news):", e)
        return jsonify({"error": str(e)}), 500


# ==========================
# 🚀 Run Flask
# ==========================
if __name__ == "__main__":
    print("🚀 Flask server started (Yearly + Monthly + News)")
    try:
        preview = fetch_accident_data()
        print(f"\n✅ ตัวอย่างจังหวัด 3 แรก:")
        for k, v in list(preview.items())[:3]:
            jan_val = v["monthly"].get("ม.ค", "-")
            print(f"  {k}: รวม {v['total']} คน, มกราคม {jan_val} คน, ค่าเฉลี่ย {v['average']} คน/เดือน")
    except Exception as e:
        print(f"❌ โหลดข้อมูลไม่สำเร็จ: {e}")
    app.run(port=5000, debug=True)
