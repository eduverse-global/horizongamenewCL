// Narai-era story canon carried over from the Horinzonnext project (nuiel9/Horinzonnext,
// docs/superpowers/specs/2026-09-23-horizonnext-narai-era-setting-design.md and src/data/npcs.json).
// Pure data: no Three.js or DOM. Every player-facing entry is { en, th }.
// Quay-cast lines are the original Horinzonnext text, unchanged. Timeline and lead Thai text is new and needs Thai review.

export const SETTING = {
  start: { year: 1682, month: 1, day: 1, place: 'ayutthaya' },
  // Modern Buddhist Era convention (CE + 543); historical Siamese new-year reckoning is out of scope.
  beOffset: 543,
  subtitle: { en: 'A voyage from Ayutthaya, 1682', th: 'การเดินทางจากกรุงศรีอยุธยา พ.ศ. 2225' },
  goal: { en: 'Reach Versailles with the great embassy to Louis XIV, 1 September 1686.', th: 'ร่วมคณะราชทูตไปเฝ้าพระเจ้าหลุยส์ที่ 14 ณ พระราชวังแวร์ซาย 1 กันยายน 1686' }
};

export const buddhistYear = year => year + SETTING.beOffset;

// Documented public events. Invented deeds belong to the leads, never to the real people named here.
export const TIMELINE = [
  { id: 'soleil-lost', year: 1681, en: 'Siam’s first embassy to France is lost when the Soleil d’Orient sinks off Madagascar.', th: 'คณะราชทูตสยามชุดแรกที่ไปฝรั่งเศสสูญหาย เมื่อเรือโซเลย์ดอริยองต์อับปางนอกฝั่งมาดากัสการ์', role: 'Backstory: the court is grieving when the game opens.' },
  { id: 'bantam-falls', year: 1682, en: 'The Dutch take Bantam; English and Danish traders are expelled from Java.', th: 'ฮอลันดายึดเมืองบันตัม พ่อค้าอังกฤษและเดนมาร์กถูกขับออกจากเกาะชวา', role: 'Opening world state.' },
  { id: 'kosa-lek-dies', year: 1683, en: 'Kosa Lek, the Phra Khlang, dies; Constantine Phaulkon rises to control royal trade.', th: 'เจ้าพระยาโกษาธิบดี (เหล็ก) ผู้ว่าการพระคลังถึงแก่อสัญกรรม คอนสแตนติน ฟอลคอนขึ้นมาคุมการค้าหลวง', role: 'Early turning point for the Thai captain and the Persian merchant.' },
  { id: 'second-embassy', year: 1684, en: 'A small second embassy, with Khun Phichaiwalit, Khun Phichitmaitri and Bénigne Vachet, reaches France.', th: 'คณะทูตชุดที่สองขนาดเล็ก นำโดยขุนพิชัยวาลิตและขุนพิชิตไมตรี พร้อมบาทหลวงวาเชต์ เดินทางถึงฝรั่งเศส', role: 'The road to France is open again.' },
  { id: 'chaumont-arrives', year: 1685, month: 9, en: 'The Chevalier de Chaumont’s French embassy arrives in Ayutthaya, with the Abbé de Choisy.', th: 'คณะทูตฝรั่งเศสของเชอวาลิเยเดอโชมอง พร้อมบาทหลวงเดอชัวซี เดินทางถึงกรุงศรีอยุธยา', role: 'The French lead arrives; A Letter Against the Tide is set in these months.' },
  { id: 'kosa-pan-sails', year: 1685, month: 12, en: 'Kosa Pan (Ok-phra Wisut Sunthon) sails for France with Chaumont.', th: 'โกษาปาน (ออกพระวิสุทธสุนทร) ออกเดินทางไปฝรั่งเศสพร้อมเชอวาลิเยเดอโชมอง', role: 'The fleet departs; the leads’ paths converge.' },
  { id: 'brest', year: 1686, month: 6, en: 'The embassy lands at Brest.', th: 'คณะราชทูตขึ้นฝั่งที่เมืองเบรสต์', role: 'Arrival in France.' },
  { id: 'makassar-revolt', year: 1686, month: 8, en: 'The Makassarese exiles revolt in Ayutthaya.', th: 'ชาวมักกะสันที่ลี้ภัยในกรุงศรีอยุธยาก่อกบฏ', role: 'Parallel climax at home for the Makassarese prince.' },
  { id: 'versailles', year: 1686, month: 9, day: 1, en: 'Audience with Louis XIV in the Hall of Mirrors at Versailles.', th: 'เข้าเฝ้าพระเจ้าหลุยส์ที่ 14 ณ ท้องพระโรงกระจก พระราชวังแวร์ซาย', role: 'The campaign’s climax.' },
  { id: 'revolution', year: 1688, en: 'Palace revolution: Narai dies, Phaulkon is executed, the French are expelled.', th: 'การผลัดแผ่นดิน สมเด็จพระนารายณ์สวรรคต ฟอลคอนถูกประหาร ชาวฝรั่งเศสถูกขับออกจากสยาม', role: 'The dark horizon: epilogue or sequel hook.' }
];

// Five leads whose stories converge on 1686. The first release ships the Thai captain only.
export const LEADS = [
  { id: 'captain', start: 'ayutthaya', title: { en: 'Thai captain', th: 'นายสำเภาชาวสยาม' }, hook: { en: 'A young kinsman of Kosa Pan’s family, captain in the Phra Khlang’s royal trade fleet, who earns a place in the 1686 embassy fleet.', th: 'นายสำเภาหนุ่มในเครือญาติตระกูลโกษาปาน นายเรือแห่งกองเรือสำเภาหลวงของพระคลัง ผู้ได้ร่วมกองเรือคณะราชทูตปี 1686' } },
  { id: 'swordsman', start: 'ayutthaya', title: { en: 'Japanese-Siamese swordsman', th: 'นักดาบเชื้อสายญี่ปุ่น-สยาม' }, hook: { en: 'From Ban Yipun, Ayutthaya’s Japanese village: land combat, escort work and ties to Nagasaki’s closed-country trade.', th: 'ชาวบ้านญี่ปุ่นแห่งกรุงศรีอยุธยา ถนัดการรบบนบกและงานคุ้มกัน มีสายสัมพันธ์กับการค้านางาซากิในยุคปิดประเทศ' } },
  { id: 'frenchman', start: 'ayutthaya-1685', title: { en: 'French officer or missionary', th: 'นายทหารหรือมิชชันนารีชาวฝรั่งเศส' }, hook: { en: 'Arrives with Chaumont in 1685: the outsider’s view of Siam and guide for the France chapter.', th: 'มาถึงพร้อมคณะของโชมองในปี 1685 มองสยามด้วยสายตาคนนอก และเป็นผู้นำทางในบทฝรั่งเศส' } },
  { id: 'persian', start: 'ayutthaya', title: { en: 'Persian merchant', th: 'พ่อค้าชาวเปอร์เซีย' }, hook: { en: 'Of the community that dominated Narai’s court before Phaulkon: trade, diplomacy and intrigue toward Bandar Abbas and Isfahan.', th: 'จากชุมชนที่มีอิทธิพลในราชสำนักสมเด็จพระนารายณ์ก่อนยุคฟอลคอน เส้นทางการค้า การทูต และอุบายสู่บันดาร์อับบาสและอิสฟาฮาน' } },
  { id: 'prince', start: 'ayutthaya', title: { en: 'Makassarese prince in exile', th: 'เจ้าชายมักกะสันผู้ลี้ภัย' }, hook: { en: 'A tragic-hero arc that climaxes in the 1686 revolt.', th: 'เส้นทางวีรบุรุษโศกนาฏกรรมที่ไปถึงจุดสูงสุดในกบฏปี 1686' } }
];

// Ayutthaya riverside landing, January 1682. Each character has a greeting and four lines.
export const QUAY_CAST = {
  harbour_official: {
    service: 'harbour',
    name: { en: 'Khun Phithak Wari of the Krom Tha', th: 'ขุนพิทักษ์วารี กรมท่า' },
    greet: { en: 'Welcome ashore, captain. The Krom Tha keeps this landing for the Phra Khlang: water, rice, a carpenter for your hull, and the port dues are settled here.', th: 'ยินดีต้อนรับขึ้นฝั่ง นายสำเภา กรมท่าดูแลท่าน้ำนี้ให้พระคลัง ทั้งน้ำจืด ข้าวสาร ช่างไม้ซ่อมเรือ และค่าธรรมเนียมปากเรือก็ชำระกันที่นี่' },
    lines: [
      { en: 'Dues are reckoned by the beam of your ship, not by what she carries. A wide junk pays more at the river mouth, however light she sails.', th: 'ภาษีปากเรือคิดตามความกว้างของปากเรือ มิใช่ตามสินค้าที่บรรทุก สำเภาปากกว้างย่อมเสียมากกว่า ต่อให้บรรทุกเบาเพียงใดก็ตาม' },
      { en: 'The royal warehouses buy first. Sappanwood, deer hides and tin go to the Phra Khlang\'s factors; what they pass over, you may sell as you please.', th: 'พระคลังสินค้าได้ซื้อก่อนเสมอ ไม้ฝาง หนังกวาง และดีบุก ต้องผ่านเจ้าพนักงานพระคลังก่อน สิ่งใดที่ท่านไม่รับซื้อ จึงค่อยขายได้ตามใจ' },
      { en: 'The junks for Canton sail when the south-west wind sets in, about June. Until then the river is yours, and the dry season is kind to hulls.', th: 'สำเภาที่จะไปกวางตุ้งออกเรือเมื่อลมตะวันตกเฉียงใต้มาถึง ราวเดือนมิถุนายน ก่อนนั้นแม่น้ำเป็นของท่าน และหน้าแล้งก็ปรานีตัวเรือ' },
      { en: 'They say the ship that carried our envoys to France has not been heard of since Bantam. The court waits, and prays.', th: 'ว่ากันว่าเรือที่พาราชทูตของเราไปฝรั่งเศส ไม่มีข่าวคราวเลยนับแต่ออกจากเมืองบันตัม ราชสำนักยังรอคอย และภาวนา' }
    ]
  },
  junk_merchant: {
    service: 'market',
    name: { en: 'Tan Heng, junk merchant', th: 'ตันเฮง พ่อค้าสำเภา' },
    greet: { en: 'A captain with room in his hold! Porcelain from Canton, raw silk, tea, copper from Nagasaki. Or sell me your sappanwood and deer hides, and we both sleep well.', th: 'นายสำเภาที่ระวางยังว่างมาแล้ว เครื่องกระเบื้องจากกวางตุ้ง ไหมดิบ ใบชา ทองแดงจากนางาซากิ หรือจะขายไม้ฝางกับหนังกวางให้ข้าก็ได้ แล้วเราจะได้นอนหลับสบายทั้งคู่' },
    lines: [
      { en: 'The Japanese pay for deer hides in copper, and they take every hide Siam can send. Nagasaki is a long way, but never a wasted voyage.', th: 'ญี่ปุ่นจ่ายค่าหนังกวางเป็นทองแดง และรับซื้อทุกผืนที่สยามส่งไป นางาซากิไกลก็จริง แต่ไม่เคยเสียเที่ยว' },
      { en: 'The Qing still keep the China coast closed against Koxinga\'s heirs on Taiwan. Only tribute ships and the bold reach Canton, so I sail under the King of Siam\'s flag.', th: 'ราชวงศ์ชิงยังปิดชายฝั่งจีนไว้ กันพวกทายาทของเจิ้งเฉิงกงที่ไต้หวัน มีแต่เรือบรรณาการกับคนใจกล้าเท่านั้นที่ไปถึงกวางตุ้ง ข้าจึงแล่นใต้ธงของพระเจ้ากรุงสยาม' },
      { en: 'Porcelain rides low in the hold, packed in rice straw, with the tea stowed above to keep it dry. Load it the other way and you sell broken bowls and wet leaves.', th: 'เครื่องกระเบื้องต้องอยู่ท้องระวาง ห่อด้วยฟางข้าว ใบชาวางไว้ข้างบนให้แห้ง ถ้าบรรทุกกลับกัน ท่านจะได้ขายชามแตกกับใบชาเปียก' },
      { en: 'Before we sail we burn incense to Mazu, the lady of the sea. Laugh if you like; I have never lost a junk.', th: 'ก่อนออกเรือ เราจุดธูปบูชาเจ้าแม่หม่าโจ้ว เทวีแห่งท้องทะเล จะหัวเราะก็เชิญ แต่ข้าไม่เคยเสียสำเภาสักลำ' }
    ]
  },
  innkeeper: {
    service: 'lodge',
    name: { en: 'Mae Im of the river lodge', th: 'แม่อิ่ม เรือนพักริมน้ำ' },
    greet: { en: 'Come up out of the sun, captain. Rice on the fire, a mat that does not roll, rainwater from the jars. Rest here, and I keep your log safe till morning.', th: 'ขึ้นมาหลบแดดก่อนเถิดนายสำเภา ข้าวอยู่บนเตา มีเสื่อที่ไม่โคลงเคลง กับน้ำฝนจากโอ่ง พักที่นี่เถิด ข้าจะเก็บบันทึกการเดินทางของท่านไว้ให้จนถึงเช้า' },
    lines: [
      { en: 'Sailors from Bantam say the Dutch have taken the young sultan\'s side against his father, and the English there are packing their chests.', th: 'ลูกเรือจากบันตัมเล่าว่าฮอลันดาเข้าข้างสุลต่านองค์ลูกในศึกกับพระบิดา พวกอังกฤษที่นั่นกำลังเก็บหีบห่อเตรียมตัวไป' },
      { en: 'Tie a string of jasmine at your bow before you cast off. Mae Ya Nang, the spirit of the boat, likes to be remembered.', th: 'ผูกพวงมะลิไว้ที่หัวเรือก่อนออกเดินทางเถิด แม่ย่านางเรือชอบให้คนระลึกถึง' },
      { en: 'From my steps you can count the spires of Wat Phra Si Sanphet at dusk. The river brings everything to Ayutthaya in the end; the sea takes its time.', th: 'จากบันไดเรือนข้า ยามพลบค่ำ ท่านนับยอดเจดีย์วัดพระศรีสรรเพชญ์ได้ แม่น้ำพาทุกสิ่งมาถึงอยุธยาในที่สุด แต่ทะเลนั้นไม่เคยรีบร้อน' },
      { en: 'A crew that sleeps ashore sails better for it. Morale is the cheapest cargo you will ever buy.', th: 'ลูกเรือที่ได้นอนบนบกย่อมแล่นเรือได้ดีกว่า ขวัญกำลังใจเป็นสินค้าที่ถูกที่สุดที่ท่านจะซื้อได้' }
    ]
  },
  captain: {
    board: { en: 'The tide is turning. Do we go aboard?', th: 'น้ำกำลังจะเปลี่ยน เราจะขึ้นเรือกันหรือยัง' }
  }
};

export const text = (entry, lang) => entry?.[lang] ?? entry?.en ?? '';

// Greeting first, then each line in turn, wrapping around; `visit` counts conversations with that character.
export function quayLine(id, visit, lang) {
  const who = QUAY_CAST[id];
  if (!who?.greet) return '';
  const n = Math.max(0, Math.floor(visit) || 0);
  return text(n === 0 ? who.greet : who.lines[(n - 1) % who.lines.length], lang);
}
