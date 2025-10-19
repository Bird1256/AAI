// ======================================================
// 🌦️ script.js — ระบบแนะนำจังหวัดปลอดภัยจากฝนและอุบัติเหตุ (Full Thai Version)
// ======================================================

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

// ======================================================
// 🌦️ ฟังก์ชันแปลสภาพอากาศเป็นภาษาไทย (ครอบคลุม WeatherAPI ทั้งหมด)
// ======================================================
function translateWeatherCondition(cond) {
  const map = {
    "Sunny": "แดดจ้า ☀️", "Clear": "อากาศแจ่มใส 🌤️",
    "Partly cloudy": "มีเมฆบางส่วน ⛅", "Cloudy": "มีเมฆมาก ☁️", "Overcast": "ท้องฟ้ามืดครึ้ม 🌥️",

    "Patchy rain possible": "อาจมีฝนบางพื้นที่ 🌦️", "Patchy light rain": "มีฝนโปรยบางพื้นที่ 🌦️",
    "Light rain": "ฝนตกเล็กน้อย 🌦️", "Light rain shower": "ฝนตกปรอยๆ 🌧️",
    "Patchy light drizzle": "ฝนละอองเบาๆ 🌦️", "Moderate rain": "ฝนปานกลาง 🌧️",
    "Heavy rain": "ฝนตกหนัก ⛈️", "Torrential rain shower": "ฝนตกหนักมาก ⛈️",
    "Patchy rain nearby": "มีฝนบริเวณใกล้เคียง 🌦️", "Patchy moderate rain nearby": "ฝนปานกลางบริเวณใกล้เคียง 🌧️",
    "Moderate or heavy rain shower": "ฝนตกหนักบางพื้นที่ ⛈️", "Moderate or heavy rain with thunder": "ฝนตกหนักและมีฟ้าคะนอง ⛈️",
    "Patchy light rain with thunder": "มีฝนฟ้าคะนองประปราย ⛈️", "Thundery outbreaks possible": "อาจมีฟ้าคะนอง 🌩️",
    "Thunderstorm": "พายุฝนฟ้าคะนอง ⛈️",

    "Fog": "มีหมอกหนา 🌫️", "Mist": "มีหมอกจางๆ 🌫️", "Freezing fog": "หมอกน้ำแข็ง 🌫️❄️",
    "Light snow": "หิมะตกเล็กน้อย ❄️", "Moderate snow": "หิมะตกปานกลาง ❄️", "Heavy snow": "หิมะตกหนัก ❄️",
    "Ice pellets": "ลูกเห็บตก ❄️", "Patchy sleet possible": "อาจมีฝนลูกเห็บบางพื้นที่ ❄️",
    "Blizzard": "พายุหิมะ 🌨️", "Tornado": "พายุหมุน 🌪️", "Unknown": "ไม่ทราบสภาพอากาศ ❔"
  };

  // รองรับข้อความผสม
  for (const key in map) {
    if (cond.toLowerCase().includes(key.toLowerCase())) {
      return map[key];
    }
  }
  return cond;
}

// 🔹 ฟังก์ชันช่วยแปลระดับความเสี่ยง
function translateRisk(level) {
  const map = {
    "very_high": "เสี่ยงสูงมาก ⚠️",
    "high": "เสี่ยงสูง ⚠",
    "medium": "ปานกลาง 🟡",
    "low": "ต่ำ 🟢"
  };
  return map[level] || level;
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

// ======================================================
// 🎯 ฟังก์ชันหลัก: แสดงข้อมูลจังหวัด
// ======================================================
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
    const riskLabel = translateRisk(totalRisk);
    const weatherTH = translateWeatherCondition(condition.text);

    // 🔸 แถบแสดงระดับความเสี่ยง (Bar)
    const riskBarColors = {
      "low": "#22c55e",
      "medium": "#eab308",
      "high": "#f97316",
      "very_high": "#ef4444"
    };
    const riskBar = `
      <div style="background:#e5e7eb;border-radius:8px;overflow:hidden;height:14px;margin-top:8px;">
        <div style="width:${totalRisk === 'very_high' ? 100 : totalRisk === 'high' ? 75 : totalRisk === 'medium' ? 50 : 25}%;
                    height:100%;background:${riskBarColors[totalRisk]};
                    transition:width 0.6s;"></div>
      </div>`;

    output.style.background = bgColor;
    output.style.padding = "20px";
    output.style.borderRadius = "14px";
    output.style.boxShadow = "0 3px 8px rgba(0,0,0,0.15)";
    output.style.textAlign = "left";

    let html = `
      <div style="background:linear-gradient(90deg,#1e3a8a,#3b82f6);color:white;padding:14px;border-radius:12px;margin-bottom:16px;">
        🧭 <b>สรุปสถานการณ์วันนี้:</b> ${weatherTH} — ${riskLabel}
        ${riskBar}
      </div>

      <h2>📍 จังหวัด ${inputRaw}</h2>
      <p>⛅ สภาพอากาศ: ${weatherTH}</p>
      <p>🌡️ อุณหภูมิ: ${temp_c} °C &nbsp; 💧 ความชื้น: ${humidity}%</p>
      <p>🌧️ ปริมาณฝนล่าสุด: ${precip_mm} มม.</p>
      <p>🌧️ ความน่าจะเป็นฝนตกวันนี้: <b>${todayRainChance}%</b></p>
      <p>🚧 ผู้เสียชีวิตเดือนนี้ (${currentMonth}): ${monthValue.toLocaleString()} คน</p>
      <p>📈 เทียบค่าเฉลี่ย: ${diffLabel} (${diffPercent.toFixed(1)}%)</p>
      <p>☠️ ยอดรวมรายปี: ${total.toLocaleString()} คน</p>
      <h3>🔥 ความเสี่ยงรวม: <b style="color:${riskColor(totalRisk)}">${riskLabel}</b></h3>
      <hr><h3>📆 พยากรณ์อากาศ 3 วันข้างหน้า</h3>
      <table>
        <tr><th>วันที่</th><th>สภาพอากาศ</th><th>🌡️ สูงสุด-ต่ำสุด (°C)</th><th>💧 ฝน (%)</th></tr>`;

    forecast.forEach(f => {
      html += `<tr>
        <td>${f.date}</td>
        <td>${translateWeatherCondition(f.day.condition.text)}</td>
        <td>${f.day.maxtemp_c} / ${f.day.mintemp_c}</td>
        <td>${f.day.daily_chance_of_rain}%</td></tr>`;
    });
    html += `</table>`;

    // 📰 ข่าวท้องถิ่น
    try {
      const newsRes = await fetch(`http://127.0.0.1:5000/news/${encodeURIComponent(provinceTH)}`);
      const newsData = await newsRes.json();
      if (!newsData.error && newsData.length > 0) {
        html += `<hr><h3>📰 ข่าวล่าสุดเกี่ยวกับ ${inputRaw}</h3>
        <div id="news-section" style="display:grid;gap:12px;">`;
        newsData.forEach(n => {
          html += `
            <div class="news-card">
              <a href="${n.link}" target="_blank" class="news-title">${n.title}</a>
              <p class="news-summary">${n.summary}</p>
              <a href="${n.link}" target="_blank" class="news-readmore">อ่านต่อ ›</a>
            </div>`;
        });
        html += `</div>`;
      } else {
        html += `<p>ไม่มีข่าวสำคัญล่าสุดเกี่ยวกับจังหวัดนี้</p>`;
      }
    } catch (e) {
      console.warn("⚠️ ไม่สามารถดึงข่าวได้:", e);
    }

    html += `<br><small>🕓 ข้อมูลจาก WeatherAPI + DDC + Google News (อัปเดตทุกวัน ~02:00 น.)</small>`;
    output.innerHTML = html;

  } catch (err) {
    console.error(err);
    output.innerHTML = `❌ เกิดข้อผิดพลาด: ${err.message}`;
    output.style.background = "#fee2e2";
  }
}

// 🔹 สีข้อความตามระดับความเสี่ยง
function riskColor(level) {
  return { very_high: "red", high: "darkorange", medium: "goldenrod", low: "green" }[level];
}

window.onload = loadAccidentData;
