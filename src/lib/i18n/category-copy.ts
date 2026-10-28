import type { CategorySlug } from "@/lib/catalogue/categories";

import type { Locale } from "./config";

type CategoryCopy = Record<CategorySlug, string>;

/**
 * Distinct, factual commercial copy per product range.
 *
 * It is kept beside the dictionaries because it is catalogue-specific content,
 * not UI chrome. Every sentence is limited to what the catalogue already
 * publishes: the range's intended applications and the fact that patterns and
 * sizes are listed. No certifications, radial/nylon claims, stock, MOQ or
 * performance figures are introduced.
 */
const COPY: Record<Locale, CategoryCopy> = {
  en: {
    motorcycle:
      "Motorcycle tyres for everyday riding and mixed road conditions. Browse the range by pattern code and the sizes available.",
    "three-wheeler":
      "Tyres built for the daily load of three-wheeled transport. Browse patterns and available sizes.",
    "truck-bus":
      "Nylon and radial tyres for freight and passenger duty. Compare the Nylon, TBR and PCR ranges, then open a pattern for its sizes.",
    agriculture:
      "Tyres for tractors, agricultural equipment and implements in varied working conditions. Browse patterns and available sizes.",
    otr: "Off-the-road tyres for mining, construction and heavy equipment. Browse patterns and available sizes.",
    forklift:
      "Solid and pneumatic tyres for forklifts and industrial handling. Browse patterns and available sizes.",
    tubes:
      "Inner tubes for a range of tyre applications. Tell us the sizes and patterns you need for a quotation.",
  },
  fr: {
    motorcycle:
      "Pneus moto pour la conduite quotidienne et des conditions de route variées. Parcourez la gamme par code de motif et par dimensions disponibles.",
    "three-wheeler":
      "Pneus conçus pour la charge quotidienne du transport à trois roues. Parcourez les motifs et les dimensions disponibles.",
    "truck-bus":
      "Pneus nylon et radiaux pour le transport de marchandises et de passagers. Comparez les gammes Nylon, TBR et PCR, puis ouvrez un motif pour voir ses dimensions.",
    agriculture:
      "Pneus pour tracteurs, matériels et instruments agricoles dans des conditions de travail variées. Parcourez les motifs et les dimensions disponibles.",
    otr: "Pneus tout-terrain pour les mines, la construction et les engins lourds. Parcourez les motifs et les dimensions disponibles.",
    forklift:
      "Pneus pleins et pneumatiques pour chariots élévateurs et la manutention industrielle. Parcourez les motifs et les dimensions disponibles.",
    tubes:
      "Chambres à air pour diverses applications de pneus. Indiquez-nous les dimensions et les motifs dont vous avez besoin pour un devis.",
  },
  pt: {
    motorcycle:
      "Pneus de moto para a condução diária e condições de estrada variadas. Explore a gama por código de padrão e pelas medidas disponíveis.",
    "three-wheeler":
      "Pneus concebidos para a carga diária do transporte de três rodas. Explore os padrões e as medidas disponíveis.",
    "truck-bus":
      "Pneus de nylon e radiais para transporte de mercadorias e passageiros. Compare as gamas Nylon, TBR e PCR e abra um padrão para ver as medidas.",
    agriculture:
      "Pneus para tratores, equipamentos e alfaias agrícolas em condições de trabalho variadas. Explore os padrões e as medidas disponíveis.",
    otr: "Pneus todo-o-terreno para mineração, construção e equipamento pesado. Explore os padrões e as medidas disponíveis.",
    forklift:
      "Pneus maciços e pneumáticos para empilhadores e movimentação industrial. Explore os padrões e as medidas disponíveis.",
    tubes:
      "Câmaras de ar para várias aplicações de pneus. Indique-nos as medidas e os padrões de que necessita para uma cotação.",
  },
  es: {
    motorcycle:
      "Neumáticos de motocicleta para el uso diario y condiciones de carretera variadas. Explore la gama por código de dibujo y las medidas disponibles.",
    "three-wheeler":
      "Neumáticos diseñados para la carga diaria del transporte de tres ruedas. Explore los dibujos y las medidas disponibles.",
    "truck-bus":
      "Neumáticos de nylon y radiales para transporte de mercancías y pasajeros. Compare las gamas Nylon, TBR y PCR y abra un dibujo para ver sus medidas.",
    agriculture:
      "Neumáticos para tractores, equipos e implementos agrícolas en condiciones de trabajo variadas. Explore los dibujos y las medidas disponibles.",
    otr: "Neumáticos todoterreno para minería, construcción y equipos pesados. Explore los dibujos y las medidas disponibles.",
    forklift:
      "Neumáticos macizos y neumáticos para carretillas elevadoras y manipulación industrial. Explore los dibujos y las medidas disponibles.",
    tubes:
      "Cámaras de aire para diversas aplicaciones de neumáticos. Indíquenos las medidas y los dibujos que necesita para una cotización.",
  },
  de: {
    motorcycle:
      "Motorradreifen für den täglichen Einsatz und unterschiedliche Straßenbedingungen. Durchsuchen Sie die Serie nach Musterkennung und verfügbaren Größen.",
    "three-wheeler":
      "Reifen für die tägliche Last des dreirädrigen Transports. Durchsuchen Sie Muster und verfügbare Größen.",
    "truck-bus":
      "Nylon- und Radialreifen für Güter- und Personentransport. Vergleichen Sie die Serien Nylon, TBR und PCR und öffnen Sie ein Muster für die Größen.",
    agriculture:
      "Reifen für Traktoren, landwirtschaftliche Geräte und Anbaugeräte unter unterschiedlichen Arbeitsbedingungen. Durchsuchen Sie Muster und verfügbare Größen.",
    otr: "Geländereifen für Bergbau, Bauwesen und schwere Maschinen. Durchsuchen Sie Muster und verfügbare Größen.",
    forklift:
      "Vollgummireifen und Luftreifen für Gabelstapler und industrielle Handhabung. Durchsuchen Sie Muster und verfügbare Größen.",
    tubes:
      "Schläuche für verschiedene Reifenanwendungen. Nennen Sie uns die benötigten Größen und Muster für ein Angebot.",
  },
  nl: {
    motorcycle:
      "Motorbanden voor dagelijks gebruik en uiteenlopende wegcondities. Bekijk de serie op patrooncode en beschikbare maten.",
    "three-wheeler":
      "Banden voor de dagelijkse belasting van driewielig vervoer. Bekijk patronen en beschikbare maten.",
    "truck-bus":
      "Nylon- en radiaalbanden voor goederen- en personenvervoer. Vergelijk de series Nylon, TBR en PCR en open een patroon voor de maten.",
    agriculture:
      "Banden voor tractoren, landbouwwerktuigen en -implementen onder uiteenlopende werkomstandigheden. Bekijk patronen en beschikbare maten.",
    otr: "Offroad-banden voor mijnbouw, bouw en zwaar materieel. Bekijk patronen en beschikbare maten.",
    forklift:
      "Massieve en pneumatische banden voor heftrucks en industriële handling. Bekijk patronen en beschikbare maten.",
    tubes:
      "Binnenbanden voor diverse bandtoepassingen. Laat ons de maten en patronen weten die u nodig hebt voor een offerte.",
  },
  pl: {
    motorcycle:
      "Opony motocyklowe do codziennej jazdy i zróżnicowanych warunków drogowych. Przeglądaj serię według kodu wzoru i dostępnych rozmiarów.",
    "three-wheeler":
      "Opony do codziennego obciążenia transportu trójkołowego. Przeglądaj wzory i dostępne rozmiary.",
    "truck-bus":
      "Opony nylonowe i radialne do transportu towarowego i pasażerskiego. Porównaj serie Nylon, TBR i PCR, a następnie otwórz wzór, aby zobaczyć rozmiary.",
    agriculture:
      "Opony do ciągników, maszyn i narzędzi rolniczych w zróżnicowanych warunkach pracy. Przeglądaj wzory i dostępne rozmiary.",
    otr: "Opony terenowe do górnictwa, budownictwa i maszyn ciężkich. Przeglądaj wzory i dostępne rozmiary.",
    forklift:
      "Opony pełne i pneumatyczne do wózków widłowych i obsługi przemysłowej. Przeglądaj wzory i dostępne rozmiary.",
    tubes:
      "Dętki do różnych zastosowań opon. Podaj nam potrzebne rozmiary i wzory, abyśmy przygotowali ofertę.",
  },
  ru: {
    motorcycle:
      "Мотоциклетные шины для повседневной езды и разных дорожных условий. Смотрите серию по коду рисунка и доступным размерам.",
    "three-wheeler":
      "Шины для ежедневной нагрузки трёхколёсного транспорта. Смотрите рисунки и доступные размеры.",
    "truck-bus":
      "Нейлоновые и радиальные шины для грузовых и пассажирских перевозок. Сравните серии Nylon, TBR и PCR, затем откройте рисунок, чтобы увидеть размеры.",
    agriculture:
      "Шины для тракторов, сельскохозяйственной техники и орудий в разных условиях работы. Смотрите рисунки и доступные размеры.",
    otr: "Шины для внедорожных условий: горная добыча, строительство и тяжёлая техника. Смотрите рисунки и доступные размеры.",
    forklift:
      "Цельные и пневматические шины для вилочных погрузчиков и промышленной обработки. Смотрите рисунки и доступные размеры.",
    tubes:
      "Камеры для различных применений шин. Сообщите нужные размеры и рисунки для расчёта предложения.",
  },
  id: {
    motorcycle:
      "Ban motor untuk penggunaan harian dan kondisi jalan yang beragam. Jelajahi rangkaian berdasarkan kode pola dan ukuran yang tersedia.",
    "three-wheeler":
      "Ban untuk beban harian angkutan roda tiga. Jelajahi pola dan ukuran yang tersedia.",
    "truck-bus":
      "Ban nylon dan radial untuk angkutan barang dan penumpang. Bandingkan rangkaian Nylon, TBR, dan PCR, lalu buka pola untuk melihat ukurannya.",
    agriculture:
      "Ban untuk traktor, peralatan dan implement pertanian dalam berbagai kondisi kerja. Jelajahi pola dan ukuran yang tersedia.",
    otr: "Ban off-the-road untuk pertambangan, konstruksi, dan peralatan berat. Jelajahi pola dan ukuran yang tersedia.",
    forklift:
      "Ban solid dan pneumatik untuk forklift dan penanganan industri. Jelajahi pola dan ukuran yang tersedia.",
    tubes:
      "Ban dalam untuk berbagai aplikasi ban. Beri tahu kami ukuran dan pola yang Anda butuhkan untuk penawaran.",
  },
  sw: {
    motorcycle:
      "Matairi ya pikipiki kwa matumizi ya kila siku na hali mbalimbali za barabara. Vinjari mfululizo kwa msimbo wa muundo na ukubwa unaopatikana.",
    "three-wheeler":
      "Matairi yaliyoundwa kwa mzigo wa kila siku wa usafirishaji wa magurudumu matatu. Vinjari miundo na ukubwa unaopatikana.",
    "truck-bus":
      "Matairi ya nailoni na radial kwa usafirishaji wa mizigo na abiria. Linganisha mfululizo wa Nylon, TBR na PCR, kisha fungua muundo kuona ukubwa wake.",
    agriculture:
      "Matairi ya matrekta, zana na vifaa vya kilimo katika hali mbalimbali za kazi. Vinjari miundo na ukubwa unaopatikana.",
    otr: "Matairi ya nje ya barabara kwa uchimbaji madini, ujenzi na mitambo mizito. Vinjari miundo na ukubwa unaopatikana.",
    forklift:
      "Matairi imara na ya pneumatiki kwa forklift na utunzaji wa viwandani. Vinjari miundo na ukubwa unaopatikana.",
    tubes:
      "Tuba za ndani kwa matumizi mbalimbali ya matairi. Tueleze ukubwa na miundo unayohitaji kwa nukuu.",
  },
  hi: {
    motorcycle:
      "रोज़मर्रा की सवारी और अलग-अलग सड़क स्थितियों के लिए मोटरसाइकिल टायर। पैटर्न कोड और उपलब्ध साइज़ के अनुसार रेंज देखें।",
    "three-wheeler":
      "तीन पहिया परिवहन के दैनिक भार के लिए बने टायर। पैटर्न और उपलब्ध साइज़ देखें।",
    "truck-bus":
      "माल और यात्री परिवहन के लिए नायलॉन और रेडियल टायर। नायलॉन, TBR और PCR रेंज की तुलना करें, फिर साइज़ देखने के लिए पैटर्न खोलें।",
    agriculture:
      "अलग-अलग कामकाजी परिस्थितियों में ट्रैक्टर, कृषि उपकरणों और कृषि यंत्रों के लिए टायर। पैटर्न और उपलब्ध साइज़ देखें।",
    otr: "खनन, निर्माण और भारी उपकरणों के लिए ऑफ-द-रोड टायर। पैटर्न और उपलब्ध साइज़ देखें।",
    forklift:
      "फोर्कलिफ्ट और औद्योगिक हैंडलिंग के लिए ठोस और वायवीय टायर। पैटर्न और उपलब्ध साइज़ देखें।",
    tubes:
      "विभिन्न टायर अनुप्रयोगों के लिए इनर ट्यूब। कोटेशन के लिए अपने आवश्यक साइज़ और पैटर्न बताएं।",
  },
  bn: {
    motorcycle:
      "প্রতিদিনের রাইডিং ও বিভিন্ন রাস্তার অবস্থার জন্য মোটরসাইকেল টায়ার। প্যাটার্ন কোড ও উপলব্ধ সাইজ অনুযায়ী রেঞ্জ দেখুন।",
    "three-wheeler":
      "তিন চাকার পরিবহনের দৈনিক ভার বহনের জন্য তৈরি টায়ার। প্যাটার্ন ও উপলব্ধ সাইজ দেখুন।",
    "truck-bus":
      "পণ্য ও যাত্রী পরিবহনের জন্য নাইলন ও রেডিয়াল টায়ার। নাইলন, TBR ও PCR রেঞ্জ তুলনা করুন, তারপর সাইজ দেখতে প্যাটার্ন খুলুন।",
    agriculture:
      "বিভিন্ন কাজের পরিবেশে ট্রাক্টর, কৃষি যন্ত্রপাতি ও সরঞ্জামের জন্য টায়ার। প্যাটার্ন ও উপলব্ধ সাইজ দেখুন।",
    otr: "খনন, নির্মাণ ও ভারী যন্ত্রপাতির জন্য অফ-দ্য-রোড টায়ার। প্যাটার্ন ও উপলব্ধ সাইজ দেখুন।",
    forklift:
      "ফর্কলিফ্ট ও শিল্প হ্যান্ডলিংয়ের জন্য সলিড ও নিউম্যাটিক টায়ার। প্যাটার্ন ও উপলব্ধ সাইজ দেখুন।",
    tubes:
      "বিভিন্ন টায়ার প্রয়োগের জন্য ইনার টিউব। কোটেশনের জন্য আপনার প্রয়োজনীয় সাইজ ও প্যাটার্ন জানান।",
  },
  ar: {
    motorcycle:
      "إطارات دراجات نارية للاستخدام اليومي وظروف الطرق المتنوعة. تصفح المجموعة حسب رمز النقشة والمقاسات المتاحة.",
    "three-wheeler":
      "إطارات مصممة للحمل اليومي للنقل بثلاث عجلات. تصفح النقشات والمقاسات المتاحة.",
    "truck-bus":
      "إطارات نايلون وشعاعية لنقل البضائع والركاب. قارن بين مجموعات Nylon وTBR وPCR، ثم افتح النقشة لمعرفة مقاساتها.",
    agriculture:
      "إطارات للجرارات والمعدات والآلات الزراعية في ظروف عمل متنوعة. تصفح النقشات والمقاسات المتاحة.",
    otr: "إطارات للطرق الوعرة لقطاعات التعدين والبناء والمعدات الثقيلة. تصفح النقشات والمقاسات المتاحة.",
    forklift:
      "إطارات صلبة وهوائية للرافعات الشوكية والمناولة الصناعية. تصفح النقشات والمقاسات المتاحة.",
    tubes:
      "أنابيب داخلية لمجموعة من تطبيقات الإطارات. أخبرنا بالمقاسات والنقشات التي تحتاجها للحصول على عرض سعر.",
  },
  ur: {
    motorcycle:
      "روزمرہ سواری اور مختلف سڑکی حالات کے لیے موٹر سائیکل ٹائر۔ پیٹرن کوڈ اور دستیاب سائز کے مطابق رینج دیکھیں۔",
    "three-wheeler":
      "تین پہیہ نقل و حمل کے روزانہ بوجھ کے لیے بنائے گئے ٹائر۔ پیٹرن اور دستیاب سائز دیکھیں۔",
    "truck-bus":
      "مال اور مسافر برداری کے لیے نائلون اور ریڈیل ٹائر۔ نائلون، TBR اور PCR رینج کا موازنہ کریں، پھر سائز دیکھنے کے لیے پیٹرن کھولیں۔",
    agriculture:
      "مختلف کام کے حالات میں ٹریکٹر، زرعی آلات اور اوزار کے لیے ٹائر۔ پیٹرن اور دستیاب سائز دیکھیں۔",
    otr: "کان کنی، تعمیرات اور بھاری مشینری کے لیے آف دی روڈ ٹائر۔ پیٹرن اور دستیاب سائز دیکھیں۔",
    forklift:
      "فورک لفٹ اور صنعتی ہینڈلنگ کے لیے ٹھوس اور نیومیٹک ٹائر۔ پیٹرن اور دستیاب سائز دیکھیں۔",
    tubes:
      "مختلف ٹائر استعمالات کے لیے اندرونی ٹیوب۔ کوٹیشن کے لیے اپنے مطلوبہ سائز اور پیٹرن بتائیں۔",
  },
  zh: {
    motorcycle:
      "适用于日常骑行和多种路况的摩托车轮胎。按花纹代码和可选尺寸浏览系列。",
    "three-wheeler":
      "专为三轮运输的日常载荷设计。浏览花纹和可选尺寸。",
    "truck-bus":
      "用于货运和客运的尼龙与子午线轮胎。比较 Nylon、TBR 和 PCR 系列，然后打开花纹查看尺寸。",
    agriculture:
      "适用于不同作业条件下的拖拉机、农业设备和农机具轮胎。浏览花纹和可选尺寸。",
    otr: "适用于采矿、建筑和重型设备的非公路轮胎。浏览花纹和可选尺寸。",
    forklift:
      "适用于叉车和工业搬运的实心胎和充气胎。浏览花纹和可选尺寸。",
    tubes:
      "适用于多种轮胎用途的内胎。请告知您需要的尺寸和花纹，以便我们报价。",
  },
  ja: {
    motorcycle:
      "日常走行やさまざまな路面状況に対応する二輪車用タイヤ。パターンコードと利用可能なサイズからシリーズをご覧ください。",
    "three-wheeler":
      "三輪輸送の日常的な荷重に対応するタイヤ。パターンと利用可能なサイズをご覧ください。",
    "truck-bus":
      "貨物・旅客輸送向けのナイロンタイヤとラジアルタイヤ。Nylon、TBR、PCR シリーズを比較し、パターンを開いてサイズをご確認ください。",
    agriculture:
      "さまざまな作業条件に対応するトラクター、農業機械、農具用タイヤ。パターンと利用可能なサイズをご覧ください。",
    otr: "鉱山、建設、重機向けのオフロードタイヤ。パターンと利用可能なサイズをご覧ください。",
    forklift:
      "フォークリフトや産業用ハンドリング向けのソリッドタイヤと空気入りタイヤ。パターンと利用可能なサイズをご覧ください。",
    tubes:
      "各種タイヤ用途のチューブ。お見積りのため、必要なサイズとパターンをお知らせください。",
  },
};

/** Localized commercial copy for a category, with an English safety fallback. */
export function categoryDescription(
  locale: Locale,
  slug: CategorySlug,
): string {
  return COPY[locale]?.[slug] ?? COPY.en[slug];
}
