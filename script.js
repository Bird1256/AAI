// ===================== Thai Weather & Accident Risk =====================

// 🔹 แปลงชื่อจังหวัดไทย → อังกฤษ (WeatherAPI)
const provinceMap = {
  "กรุงเทพมหานคร": "Bangkok", "กระบี่": "Krabi", "กาญจนบุรี": "Kanchanaburi", "กาฬสินธุ์": "Kalasin",
  "กำแพงเพชร": "Kamphaeng Phet", "ขอนแก่น": "Khon Kaen", "จันทบุรี": "Chanthaburi", "ฉะเชิงเทรา": "Chachoengsao",
  "ชลบุรี": "Chon Buri", "ชัยนาท": "Chai Nat", "ชัยภูมิ": "Chaiyaphum", "ชุมพร": "Chumphon",
  "เชียงราย": "Chiang Rai", "เชียงใหม่": "Chiang Mai", "ตรัง": "Trang", "ตราด": "Trat",
  "ตาก": "Tak", "นครนายก": "Nakhon Nayok", "นครปฐม": "Nakhon Pathom", "นครพนม": "Nakhon Phanom",
  "นครราชสีมา": "Nakhon Ratchasima", "นครศรีธรรมราช": "Nakhon Si Thammarat", "นครสวรรค์": "Nakhon Sawan",
  "นนทบุรี": "Nonthaburi", "นราธิวาส": "Narathiwat", "น่าน": "Nan", "บึงกาฬ": "Bueng Kan",
  "บุรีรัมย์": "Buri Ram", "ปทุมธานี": "Pathum Thani", "ประจวบคีรีขันธ์": "Prachuap Khiri Khan",
  "ปราจีนบุรี": "Prachin Buri", "ปัตตานี": "Pattani", "พระนครศรีอยุธยา": "Phra Nakhon Si Ayutthaya",
  "พะเยา": "Phayao", "พังงา": "Phang Nga", "พัทลุง": "Phatthalung", "พิจิตร": "Phichit",
  "พิษณุโลก": "Phitsanulok", "เพชรบุรี": "Phetchaburi", "เพชรบูรณ์": "Phetchabun", "แพร่": "Phrae",
  "ภูเก็ต": "Phuket", "มหาสารคาม": "Maha Sarakham", "มุกดาหาร": "Mukdahan", "แม่ฮ่องสอน": "Mae Hong Son",
  "ยโสธร": "Yasothon", "ยะลา": "Yala", "ร้อยเอ็ด": "Roi Et", "ระนอง": "Ranong",
  "ระยอง": "Rayong", "ราชบุรี": "Ratchaburi", "ลพบุรี": "Lop Buri", "ลำปาง": "Lampang",
  "ลำพูน": "Lamphun", "เลย": "Loei", "ศรีสะเกษ": "Si Sa Ket", "สกลนคร": "Sakon Nakhon",
  "สงขลา": "Songkhla", "สตูล": "Satun", "สมุทรปราการ": "Samut Prakan", "สมุทรสงคราม": "Samut Songkhram",
  "สมุทรสาคร": "Samut Sakhon", "สระแก้ว": "Sa Kaeo", "สระบุรี": "Saraburi", "สิงห์บุรี": "Sing Buri",
  "สุโขทัย": "Sukhothai", "สุพรรณบุรี": "Suphan Buri", "สุราษฎร์ธานี": "Surat Thani", "สุรินทร์": "Surin",
  "หนองคาย": "Nong Khai", "หนองบัวลำภู": "Nong Bua Lam Phu", "อ่างทอง": "Ang Thong", "อำนาจเจริญ": "Amnat Charoen",
  "อุดรธานี": "Udon Thani", "อุตรดิตถ์": "Uttaradit", "อุทัยธานี": "Uthai Thani", "อุบลราชธานี": "Ubon Ratchathani"
};

// 🔸 ตัวแปร global
let accidentData = {};

// 🔹 Helper: ล้างชื่อจังหวัด
function normalizeProvince(name) {
  return name ? name.replace(/จังหวัด/g, "").replace(/จ\./g, "").replace(/\s+/g, "").trim() : "";
}

// 🔹 โหลดข้อมูลอุบัติเหตุจาก Flask
async function loadAccidentData() {
  try {
    const res = await fetch("http://127.0.0.1:5000/accident_data");
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    accidentData = {};
    Object.keys(data).forEach(k => (accidentData[normalizeProvince(k)] = data[k]));
    console.log("✅ โหลดข้อมูลอุบัติเหตุสำเร็จ:", Object.keys(accidentData).length, "จังหวัด");
  } catch (err) {
    console.error("❌ โหลดข้อมูลอุบัติเหตุไม่สำเร็จ:", err);
  }
}

// ===================== ดึงข้อมูลสภาพอากาศ + คำนวณความเสี่ยง =====================
async function getData() {
  const inputRaw = document.getElementById("province").value.trim();
  const provinceTH = normalizeProvince(inputRaw);
  const output = document.getElementById("result");

  if (!provinceTH) return alert("⚠️ กรุณาพิมพ์ชื่อจังหวัดก่อนครับ");

  output.innerHTML = "⏳ กำลังโหลดข้อมูล...";
  output.style.background = "#f1f5f9";

  const provinceEN = provinceMap[provinceTH] || provinceTH;
  const apiKey = "f181eb39c93f4e73bbc122856250910";

  try {
    const weatherURL = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(provinceEN)}&days=3&lang=th`;
    const resWeather = await fetch(weatherURL);
    const weatherData = await resWeather.json();
    if (weatherData.error) throw new Error(weatherData.error.message);

    const { temp_c, humidity, precip_mm, condition } = weatherData.current;
    const forecast = weatherData.forecast.forecastday;
    const todayRainChance = forecast[0].day.daily_chance_of_rain;

    if (Object.keys(accidentData).length === 0) await loadAccidentData();
    const provinceInfo = accidentData[provinceTH];
    if (!provinceInfo) {
      output.innerHTML = `⚠️ ไม่มีข้อมูลจาก DDC สำหรับจังหวัด "${inputRaw}"`;
      output.style.background = "#fee2e2";
      return;
    }

    const total = provinceInfo.total;
    const monthly = provinceInfo.monthly || {};
    const avg = provinceInfo.average || 0;
    const thaiMonths = ["ม.ค", "ก.พ", "มี.ค", "เม.ย", "พ.ค", "มิ.ย", "ก.ค", "ส.ค", "ก.ย", "ต.ค", "พ.ย", "ธ.ค"];
    const currentMonth = thaiMonths[new Date().getMonth()];
    const monthValue = monthly[currentMonth] || 0;
    const diffPercent = avg === 0 ? 0 : ((monthValue - avg) / avg) * 100;
    const diffLabel = diffPercent > 5 ? "สูงกว่าค่าเฉลี่ย" : diffPercent < -5 ? "ต่ำกว่าค่าเฉลี่ย" : "ใกล้เคียงค่าเฉลี่ย";

    let totalRisk = "low";
    if (todayRainChance > 80 || diffPercent > 15) totalRisk = "very_high";
    else if (todayRainChance > 60 || diffPercent > 5) totalRisk = "high";
    else if (todayRainChance > 30 || diffPercent > 0) totalRisk = "medium";

    const bgColor = { low: "#dcfce7", medium: "#fef9c3", high: "#fed7aa", very_high: "#fecaca" }[totalRisk];
    const rainBar = `
      <div style="background:#e5e7eb;border-radius:8px;overflow:hidden;height:10px;margin-top:4px;">
        <div style="width:${todayRainChance}%;height:100%;
                    background:${todayRainChance>80?'#2563eb':todayRainChance>50?'#60a5fa':'#93c5fd'};
                    transition:width 0.5s;"></div>
      </div>`;

    output.style.background = bgColor;
    output.style.padding = "20px";
    output.style.borderRadius = "14px";
    output.style.boxShadow = "0 3px 8px rgba(0,0,0,0.15)";
    output.style.textAlign = "left";

    let html = `
      <h2>📍 จังหวัด ${inputRaw}</h2>
      <p>⛅ สภาพอากาศ: ${condition.text}</p>
      <p>🌡️ อุณหภูมิ: ${temp_c} °C &nbsp; 💧 ความชื้น: ${humidity}%</p>
      <p>🌧️ ปริมาณฝนล่าสุด: ${precip_mm} มม.</p>
      <p>🌧️ ความน่าจะเป็นฝนตกวันนี้: <b>${todayRainChance}%</b></p>
      ${rainBar}
      <p>🚧 ผู้เสียชีวิตเดือนนี้ (${currentMonth}): ${monthValue.toLocaleString()} คน</p>
      <p>📈 เทียบค่าเฉลี่ย: ${diffLabel} (${diffPercent.toFixed(1)}%)</p>
      <p>☠️ ยอดรวมรายปี: ${total.toLocaleString()} คน</p>
      <h3>🔥 ความเสี่ยงรวม: <b style="color:${riskColor(totalRisk)}">${totalRisk.toUpperCase()}</b></h3>
      <hr><h3>📆 พยากรณ์อากาศ 3 วันข้างหน้า</h3>
      <table style="width:100%;border-collapse:collapse">
        <tr style="background:#e2e8f0">
          <th>วันที่</th><th>สภาพอากาศ</th><th>🌡️ สูงสุด-ต่ำสุด (°C)</th><th>💧 ฝน (%)</th>
        </tr>`;
    forecast.forEach(f => {
      html += `<tr style="border-top:1px solid #ccc">
        <td>${f.date}</td>
        <td>${f.day.condition.text}</td>
        <td>${f.day.maxtemp_c} / ${f.day.mintemp_c}</td>
        <td>${f.day.daily_chance_of_rain}%</td></tr>`;
    });
    html += `</table><br><small>🕓 ข้อมูลจาก WeatherAPI + DDC (อัปเดตทุกวัน ~02:00 น.)</small>`;
    output.innerHTML = html;

    // ✅ โหลดข่าวท้องถิ่นของจังหวัดนั้น
    await loadLocalNews(provinceTH);

  } catch (err) {
    console.error(err);
    output.innerHTML = `❌ เกิดข้อผิดพลาด: ${err.message}`;
    output.style.background = "#fee2e2";
  }
}

function riskColor(level) {
  return { very_high: "red", high: "darkorange", medium: "goldenrod", low: "green" }[level];
}

// ===================== ดึงข่าวท้องถิ่น =====================
async function loadLocalNews(provinceTH) {
  const newsBox = document.getElementById("news");
  if (!newsBox) return;
  newsBox.innerHTML = "📰 กำลังโหลดข่าว...";
  try {
    const res = await fetch(`http://127.0.0.1:5000/news/${provinceTH}`);
    const data = await res.json();
    if (data.error) throw new Error(data.error);

    newsBox.innerHTML = data.map(n => `
      <div style="margin-bottom:10px">
        <a href="${n.link}" target="_blank" style="font-weight:bold;color:#2563eb">${n.title}</a>
        <p>${n.summary}</p>
      </div>`).join("") || "ไม่มีข่าวล่าสุด";
  } catch (err) {
    newsBox.innerHTML = `❌ ไม่สามารถโหลดข่าวได้ (${err.message})`;
  }
}

window.onload = loadAccidentData;
