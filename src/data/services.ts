import type { ServiceCategory, Course, NewsItem } from '../types';

export const serviceCategories: ServiceCategory[] = [
  {
    id: 'caf',
    title: 'CAF e Patronato',
    description: 'Servizi di Assistenza e di Consulenza Fiscale, Agevolazioni Sociali e Pratiche Previdenziali',
    icon: 'Calculator',
    services: [
      { id: 'spid', title: 'SPID con Video Riconoscimento', description: 'Attivazione SPID rapida e sicura con riconoscimento video da casa', icon: 'IdCard', category: 'caf', slug: 'spid', popular: true },
      { id: 'isee', title: 'ISEE 2026', description: 'Calcolo e presentazione ISEE per agevolazioni, bonus e prestazioni sociali', icon: 'FileText', category: 'caf', slug: 'isee', popular: true },
      { id: '730', title: 'Modello 730', description: 'Dichiarazione dei redditi con calcolo detrazioni e rimborsi', icon: 'Receipt', category: 'caf', slug: 'modello-730', popular: true },
      { id: 'imu', title: 'IMU e TASI', description: 'Calcolo e pagamento imposte su immobili e servizi', icon: 'Home', category: 'caf', slug: 'imu-tasi' },
      { id: 'red', title: 'Modello RED', description: 'Dichiarazione reddituale per pensionati INPS', icon: 'FileText', category: 'caf', slug: 'modello-red' },
      { id: 'successione', title: 'Dichiarazione di Successione', description: 'Pratiche ereditarie, calcolo imposte e voltura catastale', icon: 'FileCheck', category: 'caf', slug: 'successione' },
    ]
  },
  {
    id: 'lavoro',
    title: 'Lavoro e Pensioni',
    description: 'Assistenza completa su contributi, pensioni, disoccupazione, maternità e vertenze',
    icon: 'Briefcase',
    services: [
      { id: 'pensione', title: 'Calcolo e Previsione Pensione', description: 'Simulazione personalizzata con verifica requisiti e decorrenza', icon: 'Calculator', category: 'lavoro', slug: 'calcolo-pensione', popular: true },
      { id: 'naspi', title: 'NASpI - Disoccupazione', description: 'Domanda indennità mensile di disoccupazione involontaria', icon: 'Wallet', category: 'lavoro', slug: 'naspi', popular: true },
      { id: 'superstiti', title: 'Pensione ai Superstiti', description: 'Pensione di reversibilità per coniuge e figli', icon: 'Heart', category: 'lavoro', slug: 'pensione-superstiti' },
      { id: 'maternita', title: 'Congedo di Maternità', description: 'Indennità e permessi per maternità e paternità', icon: 'Baby', category: 'lavoro', slug: 'maternita' },
      { id: 'dimissioni', title: 'Dimissioni Online', description: 'Procedura telematica dimissioni volontarie con assistenza', icon: 'LogOut', category: 'lavoro', slug: 'dimissioni-online', popular: true },
      { id: 'vertenze', title: 'Vertenze di Lavoro', description: 'Assistenza per controversie e recupero crediti lavorativi', icon: 'Gavel', category: 'lavoro', slug: 'vertenze' },
      { id: 'infortunio', title: 'Infortunio sul Lavoro', description: 'Pratiche INAIL per infortuni e malattie professionali', icon: 'AlertTriangle', category: 'lavoro', slug: 'infortunio' },
    ]
  },
  {
    id: 'famiglie',
    title: 'Famiglie',
    description: 'Servizi dedicati alle Famiglie: Assegno Unico, ISEE, Bonus, Congedi',
    icon: 'Users',
    services: [
      { id: 'assegno', title: 'Assegno Unico Figli 2026', description: 'Domanda e rinnovo assegno mensile per figli a carico', icon: 'Banknote', category: 'famiglie', slug: 'assegno-unico', popular: true },
      { id: 'isee-corrente', title: 'ISEE Corrente', description: 'ISEE aggiornato per variazioni reddituali o patrimoniali', icon: 'FileText', category: 'famiglie', slug: 'isee-corrente', popular: true },
      { id: 'bebe', title: 'Bonus Asilo Nido', description: 'Contributo per frequenza asilo nido pubblico e privato', icon: 'Gift', category: 'famiglie', slug: 'bonus-nido' },
      { id: 'congedo', title: 'Congedo Parentale', description: 'Indennità per congedo parentale facoltativo', icon: 'Clock', category: 'famiglie', slug: 'congedo-parentale' },
      { id: 'invalidita', title: 'Invalidità Civile', description: 'Domanda riconoscimento invalidità e accompagnamento', icon: 'Heart', category: 'famiglie', slug: 'invalidita-civile' },
      { id: 'legge104', title: 'Legge 104', description: 'Permessi e agevolazioni per disabilità e assistenza', icon: 'Shield', category: 'famiglie', slug: 'legge-104' },
    ]
  },
  {
    id: 'stranieri',
    title: 'Stranieri',
    description: 'Servizi per cittadini stranieri: permessi di soggiorno, cittadinanza, ricongiungimenti',
    icon: 'Globe',
    services: [
      { id: 'soggiorno', title: 'Permesso di Soggiorno', description: 'Rilascio e rinnovo permesso di soggiorno', icon: 'CreditCard', category: 'stranieri', slug: 'permesso-soggiorno', popular: true },
      { id: 'cittadinanza', title: 'Cittadinanza Italiana', description: 'Domanda di acquisizione cittadinanza italiana', icon: 'Flag', category: 'stranieri', slug: 'cittadinanza' },
      { id: 'ricongiungimento', title: 'Ricongiungimento Familiare', description: 'Nulla osta e visto per ricongiungimento familiare', icon: 'Users', category: 'stranieri', slug: 'ricongiungimento' },
      { id: 'emersione', title: 'Regolarizzazione', description: 'Pratiche di emersione e regolarizzazione lavorativa', icon: 'FileCheck', category: 'stranieri', slug: 'regolarizzazione' },
    ]
  },
  {
    id: 'casa',
    title: 'Casa',
    description: 'Servizi immobiliari: contratti, volture, visure catastali, bonus edilizi',
    icon: 'Home',
    services: [
      { id: 'contratto-affitto', title: 'Contratto di Affitto', description: 'Stipula, registrazione e rinnovo contratti di locazione', icon: 'FileText', category: 'casa', slug: 'contratto-affitto', popular: true },
      { id: 'voltura', title: 'Voltura Catastale', description: 'Cambio intestazione catastale per immobili ereditati o acquistati', icon: 'RefreshCw', category: 'casa', slug: 'voltura-catastale' },
      { id: 'visura-catastale', title: 'Visura Catastale', description: 'Consultazione dati catastali di fabbricati e terreni', icon: 'Search', category: 'casa', slug: 'visura-catastale' },
      { id: 'bonus-casa', title: 'Bonus Edilizi', description: 'Superbonus, Ecobonus, bonus ristrutturazione e facciate', icon: 'Hammer', category: 'casa', slug: 'bonus-edilizi' },
    ]
  },
  {
    id: 'comune',
    title: 'Comune',
    description: 'Richiesta online di documenti anagrafici validi per tutti i comuni italiani',
    icon: 'Building2',
    services: [
      { id: 'matrimonio', title: 'Certificato di Matrimonio', description: 'Richiesta certificato e estratto di matrimonio online', icon: 'Heart', category: 'comune', slug: 'certificato-matrimonio' },
      { id: 'stato-famiglia', title: 'Stato di Famiglia', description: 'Certificato stato famiglia storico e attuale', icon: 'Users', category: 'comune', slug: 'stato-famiglia' },
      { id: 'residenza', title: 'Certificato di Residenza', description: 'Certificato residenza anagrafica con validità nazionale', icon: 'Home', category: 'comune', slug: 'certificato-residenza' },
      { id: 'nascita', title: 'Certificato di Nascita', description: 'Certificato e estratto atto di nascita', icon: 'Baby', category: 'comune', slug: 'certificato-nascita' },
    ]
  },
  {
    id: 'pra',
    title: 'PRA',
    description: 'Verifica informazioni su veicoli e proprietari del Pubblico Registro Automobilistico',
    icon: 'Car',
    services: [
      { id: 'visura-bolli', title: 'Visura Bolli', description: 'Verifica pagamento e scadenza tasse automobilistiche', icon: 'Receipt', category: 'pra', slug: 'visura-bolli' },
      { id: 'visura-proprietari', title: 'Visura Proprietari PRA', description: 'Verifica intestazione e cronistoria veicolo', icon: 'Car', category: 'pra', slug: 'visura-proprietari' },
      { id: 'visura-targa', title: 'Visura Targa PRA', description: 'Ricerca dati veicolo tramite numero di targa', icon: 'Search', category: 'pra', slug: 'visura-targa' },
    ]
  },
  {
    id: 'certificati',
    title: 'Certificati',
    description: 'Richiesta certificati anagrafici, contributivi, penali e di veicoli',
    icon: 'FileCheck',
    services: [
      { id: 'durc', title: 'Richiesta DURC', description: 'Documento unico di regolarità contributiva per imprese', icon: 'FileCheck', category: 'certificati', slug: 'durc', popular: true },
      { id: 'estratto', title: 'Estratto di Matrimonio', description: 'Estratto per uso legale con annotazioni', icon: 'Heart', category: 'certificati', slug: 'estratto-matrimonio' },
      { id: 'copia', title: 'Copia Integrale Atti', description: 'Copia originale conforme di atti anagrafici', icon: 'Copy', category: 'certificati', slug: 'copia-integrale' },
      { id: 'casellario', title: 'Casellario Giudiziale', description: 'Certificato del casellario giudiziale e carichi pendenti', icon: 'Shield', category: 'certificati', slug: 'casellario-giudiziale' },
    ]
  },
];

export const allServices = serviceCategories.flatMap(cat => cat.services);

export const courses: Course[] = [
  { id: '1', title: 'Operatore CAF', description: 'Corso completo per diventare operatore CAF. Gestione pratiche fiscali, ISEE, 730, IMU e RED.', duration: '40 ore', level: 'Base', price: '€450' },
  { id: '2', title: 'Operatore Patronato', description: 'Formazione per operatore patronato. Pensioni, NASPI, maternità, invalidità e lavoro.', duration: '60 ore', level: 'Base', price: '€550' },
  { id: '3', title: 'ISEE Corrente', description: 'Approfondimento su ISEE corrente, ordinario e universitario. Casi pratici e simulazioni.', duration: '16 ore', level: 'Avanzato', price: '€200' },
  { id: '4', title: 'Successioni', description: 'Gestione pratiche di successione ereditaria. Dichiarazione, calcolo imposte e volture.', duration: '24 ore', level: 'Intermedio', price: '€300' },
  { id: '5', title: 'Locazioni', description: 'Contratti di locazione, registrazioni, cedolare secca e canone concordato.', duration: '20 ore', level: 'Intermedio', price: '€250' },
  { id: '6', title: 'Dichiarazione Redditi 730', description: 'Compilazione modello 730 precompilato. Detrazioni, crediti e oneri deducibili.', duration: '32 ore', level: 'Base', price: '€380' },
  { id: '7', title: 'Conciliazioni', description: 'Tecniche di conciliazione sindacale e mediazione. Gestione conflitti lavorativi.', duration: '24 ore', level: 'Intermedio', price: '€320' },
  { id: '8', title: 'Legge di Bilancio 2026', description: 'Tutte le novità fiscali e previdenziali della manovra 2026.', duration: '16 ore', level: 'Aggiornamento', price: '€150' },
  { id: '9', title: 'Deleghe Sindacali + Software', description: 'Gestione deleghe sindacali con strumenti digitali e software dedicato.', duration: '20 ore', level: 'Intermedio', price: '€280' },
  { id: '10', title: 'Pratiche Stranieri', description: 'Permessi di soggiorno, cittadinanza, ricongiungimento familiare e regolarizzazioni.', duration: '32 ore', level: 'Avanzato', price: '€400' },
];

export const newsItems: NewsItem[] = [
  { id: '1', title: 'ISEE 2026: nuovo calcolo, cosa cambia per le famiglie', excerpt: 'Le novità per il calcolo ISEE nel 2026: nuove soglie, esclusione titoli di stato e impatto sulle agevolazioni. Guida completa.', date: '27 Marzo 2026', category: 'Fisco', slug: 'isee-nuovo-calcolo-2026' },
  { id: '2', title: 'Calendario INPS Marzo 2026: tutte le date dei pagamenti', excerpt: 'Pensioni, NASpI, Assegno Unico, Reddito di Cittadinanza: tutte le date di accredito INPS per marzo 2026.', date: '25 Marzo 2026', category: 'Previdenza', slug: 'calendario-inps-marzo-2026' },
  { id: '3', title: 'Assegno Unico 2026: importi maggiorati per figli disabili', excerpt: 'Aumento fino al 50% per famiglie con figli disabili. Nuovi importi e come aggiornare la domanda.', date: '22 Marzo 2026', category: 'Famiglia', slug: 'assegno-unico-aumento-2026' },
  { id: '4', title: 'Pensioni quota 103: requisiti e finestre di uscita nel 2026', excerpt: 'Chi può accedere a quota 103 nel 2026. Requisiti anagrafici, contributivi e penalizzazioni.', date: '20 Marzo 2026', category: 'Pensioni', slug: 'pensioni-quota-103-2026' },
  { id: '5', title: 'NASpI 2026: durata estesa e nuovi requisiti', excerpt: 'Le novità sulla NASpI: durata prolungata, compatibilità con lavoro autonomo e nuove regole di decadenza.', date: '18 Marzo 2026', category: 'Lavoro', slug: 'naspi-2026-novita' },
  { id: '6', title: 'Bonus Edilizi 2026: cosa resta e cosa cambia', excerpt: 'Superbonus al 65%, Ecobonus, Sismabonus e bonus mobili. La mappa completa delle detrazioni edilizie.', date: '15 Marzo 2026', category: 'Casa', slug: 'bonus-edilizi-2026' },
  { id: '7', title: 'Permesso di soggiorno: tempi ridotti con la nuova procedura digitale', excerpt: 'La riforma della procedura telematica riduce i tempi di rilascio. Come funziona il nuovo sistema.', date: '12 Marzo 2026', category: 'Stranieri', slug: 'permesso-soggiorno-digitale' },
  { id: '8', title: 'Modello 730/2026: scadenze e novità per la dichiarazione', excerpt: 'Nuove detrazioni, scadenze confermate e precompilata ampliata. La guida al 730 del 2026.', date: '10 Marzo 2026', category: 'Fisco', slug: 'modello-730-2026-guida' },
  { id: '9', title: 'Invalidità civile: nuove tabelle e importi aggiornati', excerpt: 'Gli importi delle pensioni di invalidità civile per il 2026 e le nuove tabelle percentuali.', date: '08 Marzo 2026', category: 'Previdenza', slug: 'invalidita-civile-2026' },
  { id: '10', title: 'Dimissioni online: la guida completa alla procedura telematica', excerpt: 'Come presentare le dimissioni online. Procedura, tempistiche, revoca e casi particolari.', date: '05 Marzo 2026', category: 'Lavoro', slug: 'dimissioni-online-guida' },
];

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export const faqItems: FaqItem[] = [
  { id: '1', question: 'Quanto costa il servizio ISEE?', answer: 'Il calcolo ISEE presso i nostri sportelli SILCED è gratuito per gli associati. Per i non associati il costo parte da €30. Contattaci per un preventivo personalizzato.', category: 'CAF' },
  { id: '2', question: 'Quali documenti servono per il 730?', answer: 'Servono: CU (Certificazione Unica), documento identità, codice fiscale, eventuale 730 anno precedente, documentazione spese detraibili (sanitarie, mutuo, affitto, ecc.), visure catastali aggiornate.', category: 'CAF' },
  { id: '3', question: 'Come richiedo lo SPID con SILCED?', answer: 'Puoi attivare lo SPID con video riconoscimento direttamente online. Ti serve un documento di identità valido, tessera sanitaria e un indirizzo email. La procedura richiede circa 15 minuti.', category: 'Digitale' },
  { id: '4', question: 'Quanto tempo ci vuole per la NASpI?', answer: 'La domanda NASpI va presentata entro 68 giorni dal licenziamento. Il primo pagamento arriva generalmente entro 30-40 giorni dalla presentazione. Noi gestiamo tutta la pratica per te.', category: 'Lavoro' },
  { id: '5', question: 'Posso richiedere servizi online senza venire in sede?', answer: 'Assolutamente sì. La maggior parte dei nostri servizi può essere gestita completamente online. Puoi inviare i documenti via email o tramite il nostro portale, e noi ci occupiamo di tutto.', category: 'Generale' },
  { id: '6', question: 'Come funziona il tracking della mia pratica?', answer: 'Dopo aver richiesto un servizio, riceverai un codice di tracking. Dalla sezione "Tracking Pratica" del nostro sito potrai monitorare in tempo reale lo stato di avanzamento.', category: 'Generale' },
  { id: '7', question: 'Quali sono gli orari degli sportelli?', answer: 'I nostri sportelli sono aperti dal Lunedì al Venerdì dalle 9:00 alle 18:00, e il Sabato dalle 9:00 alle 12:00. Per appuntamenti urgenti contatta il numero verde 800.123.456.', category: 'Generale' },
  { id: '8', question: 'Come posso diventare partner SILCED?', answer: 'Per diventare partner o aprire un punto SILCED nella tua zona, compila il form nella sezione "Diventa Partner" oppure contattaci telefonicamente. Ti forniremo formazione, software e assistenza continua.', category: 'Partnership' },
  { id: '9', question: 'Il servizio è garantito "Soddisfatti o Rimborsati"?', answer: 'Sì. Tutti i nostri servizi prevedono la garanzia soddisfatti o rimborsati. Se non sei soddisfatto del servizio ricevuto, ti rimborsiamo integralmente entro 30 giorni.', category: 'Generale' },
  { id: '10', question: 'Come faccio a rinnovare l\'ISEE scaduto?', answer: 'L\'ISEE ha validità fino al 31 dicembre di ogni anno. Per il rinnovo servono gli stessi documenti della prima richiesta aggiornati. Puoi prenotare un appuntamento online o usare il nostro calcolatore ISEE per una stima preliminare.', category: 'CAF' },
];

export const navigationLinks = [
  { name: 'Home', href: '/' },
  { name: 'Servizi', href: '/servizi' },
  { name: 'Strumenti', href: '/strumenti' },
  { name: 'Formazione', href: '/formazione' },
  { name: 'Chi Siamo', href: '/chi-siamo' },
  { name: 'News', href: '/news' },
  { name: 'Contatti', href: '/contatti' },
];
