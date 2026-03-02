// ============================================
// CONFIGURACIÓN GLOBAL
// ============================================
const CONFIG = {
    nodeRadius: {
        congressperson: 40,
        familiar: 28,
        entity: 32,
        contract: 20
    },
    forces: {
        link: { distance: { 'congressperson-familiar': 170, 'familiar-contract': 120, 'contract-entity': 100 }, strength: 0.5 },
        // Collapsed state: weak repulsion so congresspersons cluster together
        chargeCollapsed: { congressperson: -120, familiar: -380, entity: -300, contract: -140 },
        // Expanded state: strong repulsion so the active network spreads out
        chargeExpanded:  { congressperson: -200, familiar: -400, entity: -340, contract: -160 },
        collisionCollapsed: 10,   // small collision → nodes pack tightly
        collisionExpanded:  22    // larger collision when network opens up
    },
    colors: {
        congressperson: '#f59e0b',
        familiar: '#3b82f6',
        entity: '#8b5cf6',
        contract: '#10b981'
    }
};

// ============================================
// NORMALIZAR TEXTO (tildes + mayúsculas)
// ============================================
function normalizeText(str) {
    if (!str) return '';
    return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

// ============================================
// FORMAS SVG
// ============================================
function getHexagonPath(size) {
    const points = [];
    for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 2;
        points.push([size * Math.cos(angle), size * Math.sin(angle)]);
    }
    return points.map((p, i) => (i === 0 ? 'M' : 'L') + p[0] + ',' + p[1]).join(' ') + ' Z';
}

function getDiamondPath(size) {
    return `M 0 ${-size} L ${size} 0 L 0 ${size} L ${-size} 0 Z`;
}

function getRoundedSquarePath(size, radius) {
    const r = radius || size * 0.2;
    const s = size;
    return `M ${-s + r} ${-s} H ${s - r} Q ${s} ${-s} ${s} ${-s + r} V ${s - r} Q ${s} ${s} ${s - r} ${s} H ${-s + r} Q ${-s} ${s} ${-s} ${s - r} V ${-s + r} Q ${-s} ${-s} ${-s + r} ${-s} Z`;
}

// ============================================
// DATOS DE EJEMPLO – 20 CONGRESISTAS
// ============================================
const PARTIES = [
    'Alianza para el Progreso', 'Podemos Perú', 'Avanza País', 'Fuerza Popular',
    'Acción Popular', 'Somos Perú', 'UPP', 'Integridad y Desarrollo',
    'Renovación Popular', 'Perú Libre'
];
const COMMISSIONS = [
    'Comisión de Economía', 'Comisión de Transportes', 'Junta de Portavoces',
    'Comisión de Salud', 'Comisión de Educación', 'Comisión de Justicia',
    'Comisión de Defensa', 'Comisión de Presupuesto', 'Comisión de Fiscalización',
    'Comisión de Vivienda'
];
const DEPARTMENTS = [
    'Lima', 'Ica', 'Callao', 'Arequipa', 'La Libertad', 'Cusco',
    'Piura', 'Ancash', 'Puno', 'Junín', 'Cajamarca', 'Loreto',
    'Áncash', 'Madre de Dios', 'San Martín', 'Tumbes', 'Ucayali', 'Apurímac', 'Ayacucho', 'Huánuco'
];

const SAMPLE_DATA = {
    nodes: [
        // ── CONGRESISTAS ──────────────────────────────────────────────────────
        { id: "C001", type: "congressperson", name: "Ana María Zegarra López",       dni: "42628319", party: "Somos Perú",                  commission: "Comisión de Economía",      department: "Lima",          photo: './img/ana-zegarra.png' },
        { id: "C002", type: "congressperson", name: "José Luis Elías Ávalos",         dni: "21569935", party: "Alianza Para el Progreso",   commission: "Comisión de Transportes",   department: "Ica",           photo: './img/jose-elias.png' },
        { id: "C003", type: "congressperson", name: "Patricia Rosa Chirinos Venegas", dni: "10280036", party: "Alianza Para el Progreso",   commission: "Junta de Portavoces",       department: "Callao",        photo: './img/patricia-chirinos.png' },
        { id: "C004", type: "congressperson", name: "Alejandro Soto Reyes",           dni: "23901989", party: "Alianza Para el Progreso",   commission: "Comisión de Presupuesto",   department: "Cusco",         photo: './img/alejandro-soto.png' },
        { id: "C005", type: "congressperson", name: "Norma Yarrow Lumbreras",         dni: "10806296", party: "Renovación Popular",         commission: "Comisión de Salud",         department: "Lima",          photo: './img/norma-yarrow.png' },
        { id: "C006", type: "congressperson", name: "Hector Ventura Asencio",         dni: "40242430", party: "Fuerza Popular",             commission: "Comisión de Educación",     department: "Áncash",        photo: './img/hector-ventura.png' },
        { id: "C007", type: "congressperson", name: "Eduardo Salhuana Cavides",       dni: "05070188", party: "Alianza Para el Progreso",   commission: "Comisión de Justicia",      department: "Lima",          photo: './img/eduardo-salhuana.png' },
        { id: "C008", type: "congressperson", name: "Roberto Sánchez Palomino",       dni: "16002918", party: "Juntos Por el Perú",         commission: "Comisión de Defensa",       department: "La Libertad",   photo: './img/roberto-sanchez.png' },
        { id: "C009", type: "congressperson", name: "Magaly Ruiz Rodríguez",          dni: "18032382", party: "Alianza Para el Progreso",   commission: "Comisión de Fiscalización", department: "Piura",         photo: './img/magaly-ruiz.png' },
        { id: "C010", type: "congressperson", name: "Silvana Robles Espinoza",        dni: "42750152", party: "Juntos Por el Perú",         commission: "Comisión de Vivienda",      department: "Junín",         photo: './img/silvana-robles.png' },
        { id: "C011", type: "congressperson", name: "Abel Reyes Quispe",              dni: "42377791", party: "Perú Libre",                 commission: "Comisión de Economía",      department: "Puno",          photo: './img/abel-reyes.png' },
        { id: "C012", type: "congressperson", name: "Adriana Tudela Gutiérrez",       dni: "45591954", party: "Avanza País",                commission: "Comisión de Transportes",   department: "Lima",          photo: './img/adriana-tudela.png' },
        { id: "C013", type: "congressperson", name: "Jhakeline Ugarte Rivera",        dni: "24711696", party: "Juntos Por el Perú",         commission: "Comisión de Salud",         department: "Arequipa",      photo: './img/katy-ugarte.png' },
        { id: "C014", type: "congressperson", name: "Rosio Torres Palomino",          dni: "05618705", party: "Alianza Para el Progreso",   commission: "Comisión de Educación",     department: "Ayacucho",      photo: './img/rosio-torres.png' },
        { id: "C015", type: "congressperson", name: "Cheryl Trigozo Murayari",        dni: "44886100", party: "Renovación Popular",         commission: "Comisión de Justicia",      department: "Loreto",        photo: './img/cheryl-trigozo.png' },
        { id: "C016", type: "congressperson", name: "Hector Valer Collado",           dni: "25567150", party: "Somos Perú",                 commission: "Comisión de Presupuesto",   department: "Cusco",         photo: './img/hector-valer.png' },
        { id: "C017", type: "congressperson", name: "Fernando Rospigliosi Capurro",   dni: "07704730", party: "Fuerza Popular",             commission: "Comisión de Defensa",       department: "Lima",          photo: './img/fernando-rospigliosi.png' },
        { id: "C018", type: "congressperson", name: "Elias Varas Meléndez",           dni: "32923902", party: "Juntos Por el Perú",         commission: "Comisión de Fiscalización", department: "Ancash",        photo: './img/elias-varas.png' },
        { id: "C019", type: "congressperson", name: "Maria Elena Taipe Coronel",      dni: "41005490", party: "Perú Libre",                 commission: "Comisión de Vivienda",      department: "Cajamarca",     photo: './img/elizabeth-taipe.png' },
        { id: "C020", type: "congressperson", name: "José Williams Zapata",           dni: "43287528", party: "Avanza País",                commission: "Comisión de Economía",      department: "Lima",          photo: './img/jose-williams.png' },

        // ── FAMILIARES ────────────────────────────────────────────────────────
        // C001 – Ana Zegarra
        { id: "F001", type: "familiar", name: "Hugo Hermilio Alvarado Apaza",   dni: "04632989", parentesco: "Padre del Cónyuge", ocupacion: "Pescador Artesanal",  congresspersonId: "C001" },
        { id: "F002", type: "familiar", name: "José Alfredo Alvarado Mamani",   dni: "40448882", parentesco: "Cuñado",           ocupacion: "Chofer",               lugarTrabajo: "Transportes Halcon SRL",   ruc: "20456789012", congresspersonId: "C001" },
        { id: "F003", type: "familiar", name: "Deisy Paola Alvarado Mamani",    dni: "42067814", parentesco: "Cuñada",           ocupacion: "Promotora Educativa",  lugarTrabajo: "Programa Educación Básica", congresspersonId: "C001" },
        // C002 – José Elías
        { id: "F004", type: "familiar", name: "Carlos Elías Mendoza",           dni: "21234567", parentesco: "Hermano",          ocupacion: "Gerente General",     lugarTrabajo: "Constructora del Sur SAC", ruc: "20567891234", congresspersonId: "C002" },
        { id: "F005", type: "familiar", name: "María Elena Ávalos de Elías",    dni: "21345678", parentesco: "Madre",            ocupacion: "Comerciante",          lugarTrabajo: "Distribuidora Ávalos EIRL", ruc: "20123456789", congresspersonId: "C002" },
        // C003 – Patricia Chirinos
        { id: "F006", type: "familiar", name: "Ricardo Venegas Pérez",          dni: "10345678", parentesco: "Hermano",          ocupacion: "Abogado",              lugarTrabajo: "Estudio Venegas & Asociados", ruc: "20789012345", congresspersonId: "C003" },
        // C004 – Alejandro Soto
        { id: "F007", type: "familiar", name: "Lidia Reyes de Soto",            dni: "23456789", parentesco: "Cónyuge",          ocupacion: "Contadora",            lugarTrabajo: "Consorcio Soto & Reyes SAC", ruc: "20234567891", congresspersonId: "C004" },
        { id: "F008", type: "familiar", name: "Gonzalo Soto Quispe",            dni: "23567890", parentesco: "Hijo",             ocupacion: "Empresario",           lugarTrabajo: "Inversiones Soto EIRL",    ruc: "20345678912", congresspersonId: "C004" },
        // C005 – Norma Yarrow
        { id: "F009", type: "familiar", name: "Luis Alberto Yarrow Lira",       dni: "10901234", parentesco: "Hermano",          ocupacion: "Médico",               lugarTrabajo: "Clínica San Felipe SAC",  ruc: "20901234567", congresspersonId: "C005" },
        // C006 – Hector Ventura
        { id: "F010", type: "familiar", name: "Carmen Rosa Asencio de Ventura", dni: "40312345", parentesco: "Cónyuge",          ocupacion: "Docente",              lugarTrabajo: "MINEDU – UGEL 01",       congresspersonId: "C006" },
        { id: "F011", type: "familiar", name: "Miguel Ventura Asencio",         dni: "40423456", parentesco: "Hermano",          ocupacion: "Contratista",          lugarTrabajo: "Constructora Ventura SAC", ruc: "20134567890", congresspersonId: "C006" },
        // C007 – Eduardo Salhuana
        { id: "F012", type: "familiar", name: "Raúl Salhuana Paredes",          dni: "05189012", parentesco: "Hermano",          ocupacion: "Abogado",              lugarTrabajo: "Salhuana Abogados SRL",  ruc: "20189012345", congresspersonId: "C007" },
        // C008 – Roberto Sánchez
        { id: "F013", type: "familiar", name: "Pedro Sánchez Llanos",           dni: "16123456", parentesco: "Padre",            ocupacion: "Agricultor",           congresspersonId: "C008" },
        { id: "F014", type: "familiar", name: "Carla Palomino de Sánchez",      dni: "16234567", parentesco: "Cónyuge",          ocupacion: "Ingeniera",            lugarTrabajo: "Constructora Palomino EIRL", ruc: "20456701234", congresspersonId: "C008" },
        // C009 – Magaly Ruiz
        { id: "F015", type: "familiar", name: "Jorge Luis Ruiz Chávez",         dni: "18145678", parentesco: "Hermano",          ocupacion: "Gerente Comercial",    lugarTrabajo: "Agro Norte SAC",         ruc: "20512345678", congresspersonId: "C009" },
        // C010 – Silvana Robles
        { id: "F016", type: "familiar", name: "Yuri Espinoza Robles",           dni: "42856789", parentesco: "Cónyuge",          ocupacion: "Contador",             lugarTrabajo: "Minera Espinoza SAC",    ruc: "20678901234", congresspersonId: "C010" },
        // C011 – Abel Reyes
        { id: "F017", type: "familiar", name: "Dionicia Quispe de Reyes",       dni: "42490123", parentesco: "Madre",            ocupacion: "Comerciante",          lugarTrabajo: "Asociación Comercial Puno", congresspersonId: "C011" },
        // C012 – Adriana Tudela
        { id: "F018", type: "familiar", name: "Augusto Gutiérrez Tudela",       dni: "45701234", parentesco: "Padre",            ocupacion: "Empresario",           lugarTrabajo: "Inversiones Gutiérrez SA", ruc: "20712345678", congresspersonId: "C012" },
        { id: "F019", type: "familiar", name: "Pamela Tudela Rivera",           dni: "45812345", parentesco: "Hermana",          ocupacion: "Consultora",           lugarTrabajo: "Consultores Tudela SAC", ruc: "20823456789", congresspersonId: "C012" },
        // C013 – Jhakeline Ugarte
        { id: "F020", type: "familiar", name: "Rolando Rivera Ugarte",          dni: "24823456", parentesco: "Esposo",           ocupacion: "Constructor",          lugarTrabajo: "Obras Rivera EIRL",     ruc: "20934567890", congresspersonId: "C013" },
        // C014 – Rosio Torres
        { id: "F021", type: "familiar", name: "Nicanor Torres Huanca",          dni: "05734567", parentesco: "Padre",            ocupacion: "Agropecuario",         congresspersonId: "C014" },
        // C015 – Cheryl Trigozo
        { id: "F022", type: "familiar", name: "Eder Murayari Trigozo",          dni: "44990123", parentesco: "Hermano",          ocupacion: "Transportista",        lugarTrabajo: "Trans Amazonas SRL",    ruc: "20045678901", congresspersonId: "C015" },
        // C016 – Hector Valer
        { id: "F023", type: "familiar", name: "Sonia Collado de Valer",         dni: "25678901", parentesco: "Cónyuge",          ocupacion: "Contratista",          lugarTrabajo: "Valer Construcciones SAC", ruc: "20156789012", congresspersonId: "C016" },
        // C017 – Fernando Rospigliosi
        { id: "F024", type: "familiar", name: "Claudia Capurro de Rospigliosi", dni: "07856789", parentesco: "Cónyuge",          ocupacion: "Empresaria",           lugarTrabajo: "Capurro Inversiones SA", ruc: "20267890123", congresspersonId: "C017" },
        // C018 – Elias Varas
        { id: "F025", type: "familiar", name: "David Varas Chávez",             dni: "32967890", parentesco: "Hermano",          ocupacion: "Gerente",              lugarTrabajo: "Ancash Servicios SAC",   ruc: "20378901234", congresspersonId: "C018" },
        // C019 – Maria Taipe
        { id: "F026", type: "familiar", name: "Juan Carlos Coronel Taipe",      dni: "41123456", parentesco: "Esposo",           ocupacion: "Ingeniero Civil",      lugarTrabajo: "Coronel & Asociados SAC", ruc: "20489012345", congresspersonId: "C019" },
        // C020 – José Williams
        { id: "F027", type: "familiar", name: "Jorge Williams Rodríguez",       dni: "43401234", parentesco: "Hermano",          ocupacion: "Empresario",           lugarTrabajo: "Grupo Williams SAC",     ruc: "20590123456", congresspersonId: "C020" },

        // ── ENTIDADES ─────────────────────────────────────────────────────────
        { id: "E001", type: "entity", name: "Transportes Halcon SRL",        ruc: "20456789012", rubro: "Transporte de carga",         montoTotal: 1250000, numContratos: 8 },
        { id: "E002", type: "entity", name: "Constructora del Sur SAC",      ruc: "20567891234", rubro: "Construcción",                montoTotal: 4580000, numContratos: 12 },
        { id: "E003", type: "entity", name: "Distribuidora Ávalos EIRL",     ruc: "20123456789", rubro: "Comercialización",            montoTotal: 890000,  numContratos: 5 },
        { id: "E004", type: "entity", name: "Estudio Venegas & Asociados",   ruc: "20789012345", rubro: "Servicios legales",           montoTotal: 560000,  numContratos: 7 },
        { id: "E005", type: "entity", name: "Consorcio Soto & Reyes SAC",    ruc: "20234567891", rubro: "Infraestructura vial",        montoTotal: 6200000, numContratos: 15 },
        { id: "E006", type: "entity", name: "Inversiones Soto EIRL",         ruc: "20345678912", rubro: "Inmobiliaria",                montoTotal: 3100000, numContratos: 9 },
        { id: "E007", type: "entity", name: "Constructora Ventura SAC",      ruc: "20134567890", rubro: "Construcción",                montoTotal: 2750000, numContratos: 10 },
        { id: "E008", type: "entity", name: "Salhuana Abogados SRL",         ruc: "20189012345", rubro: "Asesoría jurídica",           montoTotal: 480000,  numContratos: 6 },
        { id: "E009", type: "entity", name: "Constructora Palomino EIRL",    ruc: "20456701234", rubro: "Construcción",                montoTotal: 1890000, numContratos: 8 },
        { id: "E010", type: "entity", name: "Agro Norte SAC",                ruc: "20512345678", rubro: "Agropecuario",               montoTotal: 720000,  numContratos: 4 },
        { id: "E011", type: "entity", name: "Inversiones Gutiérrez SA",      ruc: "20712345678", rubro: "Consultoría empresarial",     montoTotal: 2200000, numContratos: 11 },
        { id: "E012", type: "entity", name: "Obras Rivera EIRL",             ruc: "20934567890", rubro: "Obras civiles",              montoTotal: 1450000, numContratos: 7 },
        { id: "E013", type: "entity", name: "Trans Amazonas SRL",            ruc: "20045678901", rubro: "Transporte fluvial",         montoTotal: 340000,  numContratos: 5 },
        { id: "E014", type: "entity", name: "Valer Construcciones SAC",      ruc: "20156789012", rubro: "Edificaciones",              montoTotal: 3800000, numContratos: 14 },
        { id: "E015", type: "entity", name: "Grupo Williams SAC",            ruc: "20590123456", rubro: "Logística y distribución",   montoTotal: 1950000, numContratos: 9 },

        // ── CONTRATOS ─────────────────────────────────────────────────────────
        // F002 → E001
        { id: "CT001", type: "contract", entidadId: "E001", fecha: "2023-05-15", descripcion: "Transporte de materiales para PRONIED", monto: 320000,  entidadContratante: "PRONIED",             vigencia: "Finalizado oct. 2023" },
        { id: "CT002", type: "contract", entidadId: "E001", fecha: "2024-01-10", descripcion: "Distribución de materiales educativos",  monto: 245000,  entidadContratante: "MINEDU",              vigencia: "Vigente desde ene. 2024" },
        // F004 → E002
        { id: "CT003", type: "contract", entidadId: "E002", fecha: "2023-03-10", descripcion: "Construcción puente vehicular – Ica",    monto: 2150000, entidadContratante: "MTC",                 vigencia: "Finalizado sep. 2023" },
        { id: "CT004", type: "contract", entidadId: "E002", fecha: "2023-11-05", descripcion: "Mejoramiento de carretera regional",     monto: 1850000, entidadContratante: "GR Ica",             vigencia: "Vigente desde nov. 2023" },
        // F005 → E003
        { id: "CT005", type: "contract", entidadId: "E003", fecha: "2024-01-15", descripcion: "Provisión de alimentos – Qali Warma",    monto: 520000,  entidadContratante: "Qali Warma",          vigencia: "Vigente desde ene. 2024" },
        // F006 → E004
        { id: "CT006", type: "contract", entidadId: "E004", fecha: "2023-06-20", descripcion: "Asesoría legal proceso de licitación",   monto: 180000,  entidadContratante: "ESSALUD",             vigencia: "Finalizado dic. 2023" },
        { id: "CT007", type: "contract", entidadId: "E004", fecha: "2024-02-01", descripcion: "Consultoría jurídica institucional",     monto: 220000,  entidadContratante: "Municipalidad Callao", vigencia: "Vigente desde feb. 2024" },
        // F007 → E005
        { id: "CT008", type: "contract", entidadId: "E005", fecha: "2023-07-01", descripcion: "Construcción vía de evitamiento Cusco",  monto: 3200000, entidadContratante: "GR Cusco",            vigencia: "Vigente desde jul. 2023" },
        { id: "CT009", type: "contract", entidadId: "E005", fecha: "2024-03-15", descripcion: "Pavimentación avenidas principales",     monto: 1800000, entidadContratante: "Municipalidad Cusco", vigencia: "Vigente desde mar. 2024" },
        // F008 → E006
        { id: "CT010", type: "contract", entidadId: "E006", fecha: "2023-09-20", descripcion: "Habilitación urbana Cusco Sur",          monto: 1500000, entidadContratante: "COFOPRI",             vigencia: "Finalizado mar. 2024" },
        // F011 → E007
        { id: "CT011", type: "contract", entidadId: "E007", fecha: "2023-04-05", descripcion: "Construcción de losas deportivas Áncash", monto: 980000, entidadContratante: "IPD",                vigencia: "Finalizado nov. 2023" },
        { id: "CT012", type: "contract", entidadId: "E007", fecha: "2023-12-01", descripcion: "Mejoramiento de pistas y veredas",       monto: 1200000, entidadContratante: "Municipalidad Áncash", vigencia: "Vigente desde dic. 2023" },
        // F012 → E008
        { id: "CT013", type: "contract", entidadId: "E008", fecha: "2024-01-20", descripcion: "Asesoría en contrataciones del Estado",  monto: 240000,  entidadContratante: "PCM",                 vigencia: "Vigente desde ene. 2024" },
        // F014 → E009
        { id: "CT014", type: "contract", entidadId: "E009", fecha: "2023-05-10", descripcion: "Construcción hospital de campaña",       monto: 890000,  entidadContratante: "MINSA",               vigencia: "Finalizado oct. 2023" },
        { id: "CT015", type: "contract", entidadId: "E009", fecha: "2024-02-28", descripcion: "Construcción puesto de salud La Libertad", monto: 620000, entidadContratante: "GR La Libertad",     vigencia: "Vigente desde feb. 2024" },
        // F015 → E010
        { id: "CT016", type: "contract", entidadId: "E010", fecha: "2023-08-15", descripcion: "Provisión de fertilizantes – Agrorural", monto: 380000,  entidadContratante: "AGRORURAL",           vigencia: "Finalizado ene. 2024" },
        // F018 → E011
        { id: "CT017", type: "contract", entidadId: "E011", fecha: "2023-10-01", descripcion: "Consultoría plan de desarrollo regional", monto: 1100000, entidadContratante: "CEPLAN",             vigencia: "Vigente desde oct. 2023" },
        { id: "CT018", type: "contract", entidadId: "E011", fecha: "2024-04-01", descripcion: "Asesoría en gestión de inversiones",     monto: 750000,  entidadContratante: "MEF",                 vigencia: "Vigente desde abr. 2024" },
        // F020 → E012
        { id: "CT019", type: "contract", entidadId: "E012", fecha: "2023-06-05", descripcion: "Construcción mercado de abastos Arequipa", monto: 720000, entidadContratante: "Municipalidad Arequipa", vigencia: "Finalizado dic. 2023" },
        // F022 → E013
        { id: "CT020", type: "contract", entidadId: "E013", fecha: "2023-09-01", descripcion: "Transporte fluvial de carga – Loreto",   monto: 180000,  entidadContratante: "DIREPRO Loreto",      vigencia: "Finalizado feb. 2024" },
        // F023 → E014
        { id: "CT021", type: "contract", entidadId: "E014", fecha: "2023-07-20", descripcion: "Construcción colegio secundario Cusco",  monto: 2100000, entidadContratante: "MINEDU",              vigencia: "Vigente desde jul. 2023" },
        { id: "CT022", type: "contract", entidadId: "E014", fecha: "2024-01-05", descripcion: "Ampliación centro de salud Wanchaq",     monto: 1400000, entidadContratante: "GR Cusco",            vigencia: "Vigente desde ene. 2024" },
        // F027 → E015
        { id: "CT023", type: "contract", entidadId: "E015", fecha: "2023-11-15", descripcion: "Logística vacunas campaña nacional",     monto: 980000,  entidadContratante: "MINSA",               vigencia: "Finalizado mar. 2024" },
        { id: "CT024", type: "contract", entidadId: "E015", fecha: "2024-03-01", descripcion: "Distribución insumos programa social",   monto: 740000,  entidadContratante: "MIDIS",               vigencia: "Vigente desde mar. 2024" }
    ],
    links: [
        // Congresistas → Familiares
        { source: "C001", target: "F001", type: "congressperson-familiar" },
        { source: "C001", target: "F002", type: "congressperson-familiar" },
        { source: "C001", target: "F003", type: "congressperson-familiar" },
        { source: "C002", target: "F004", type: "congressperson-familiar" },
        { source: "C002", target: "F005", type: "congressperson-familiar" },
        { source: "C003", target: "F006", type: "congressperson-familiar" },
        { source: "C004", target: "F007", type: "congressperson-familiar" },
        { source: "C004", target: "F008", type: "congressperson-familiar" },
        { source: "C005", target: "F009", type: "congressperson-familiar" },
        { source: "C006", target: "F010", type: "congressperson-familiar" },
        { source: "C006", target: "F011", type: "congressperson-familiar" },
        { source: "C007", target: "F012", type: "congressperson-familiar" },
        { source: "C008", target: "F013", type: "congressperson-familiar" },
        { source: "C008", target: "F014", type: "congressperson-familiar" },
        { source: "C009", target: "F015", type: "congressperson-familiar" },
        { source: "C010", target: "F016", type: "congressperson-familiar" },
        { source: "C011", target: "F017", type: "congressperson-familiar" },
        { source: "C012", target: "F018", type: "congressperson-familiar" },
        { source: "C012", target: "F019", type: "congressperson-familiar" },
        { source: "C013", target: "F020", type: "congressperson-familiar" },
        { source: "C014", target: "F021", type: "congressperson-familiar" },
        { source: "C015", target: "F022", type: "congressperson-familiar" },
        { source: "C016", target: "F023", type: "congressperson-familiar" },
        { source: "C017", target: "F024", type: "congressperson-familiar" },
        { source: "C018", target: "F025", type: "congressperson-familiar" },
        { source: "C019", target: "F026", type: "congressperson-familiar" },
        { source: "C020", target: "F027", type: "congressperson-familiar" },
        // Familiares → Contratos
        { source: "F002", target: "CT001", type: "familiar-contract" },
        { source: "F002", target: "CT002", type: "familiar-contract" },
        { source: "F004", target: "CT003", type: "familiar-contract" },
        { source: "F004", target: "CT004", type: "familiar-contract" },
        { source: "F005", target: "CT005", type: "familiar-contract" },
        { source: "F006", target: "CT006", type: "familiar-contract" },
        { source: "F006", target: "CT007", type: "familiar-contract" },
        { source: "F007", target: "CT008", type: "familiar-contract" },
        { source: "F007", target: "CT009", type: "familiar-contract" },
        { source: "F008", target: "CT010", type: "familiar-contract" },
        { source: "F011", target: "CT011", type: "familiar-contract" },
        { source: "F011", target: "CT012", type: "familiar-contract" },
        { source: "F012", target: "CT013", type: "familiar-contract" },
        { source: "F014", target: "CT014", type: "familiar-contract" },
        { source: "F014", target: "CT015", type: "familiar-contract" },
        { source: "F015", target: "CT016", type: "familiar-contract" },
        { source: "F018", target: "CT017", type: "familiar-contract" },
        { source: "F018", target: "CT018", type: "familiar-contract" },
        { source: "F020", target: "CT019", type: "familiar-contract" },
        { source: "F022", target: "CT020", type: "familiar-contract" },
        { source: "F023", target: "CT021", type: "familiar-contract" },
        { source: "F023", target: "CT022", type: "familiar-contract" },
        { source: "F027", target: "CT023", type: "familiar-contract" },
        { source: "F027", target: "CT024", type: "familiar-contract" },
        // Contratos → Entidades
        { source: "CT001", target: "E001", type: "contract-entity" },
        { source: "CT002", target: "E001", type: "contract-entity" },
        { source: "CT003", target: "E002", type: "contract-entity" },
        { source: "CT004", target: "E002", type: "contract-entity" },
        { source: "CT005", target: "E003", type: "contract-entity" },
        { source: "CT006", target: "E004", type: "contract-entity" },
        { source: "CT007", target: "E004", type: "contract-entity" },
        { source: "CT008", target: "E005", type: "contract-entity" },
        { source: "CT009", target: "E005", type: "contract-entity" },
        { source: "CT010", target: "E006", type: "contract-entity" },
        { source: "CT011", target: "E007", type: "contract-entity" },
        { source: "CT012", target: "E007", type: "contract-entity" },
        { source: "CT013", target: "E008", type: "contract-entity" },
        { source: "CT014", target: "E009", type: "contract-entity" },
        { source: "CT015", target: "E009", type: "contract-entity" },
        { source: "CT016", target: "E010", type: "contract-entity" },
        { source: "CT017", target: "E011", type: "contract-entity" },
        { source: "CT018", target: "E011", type: "contract-entity" },
        { source: "CT019", target: "E012", type: "contract-entity" },
        { source: "CT020", target: "E013", type: "contract-entity" },
        { source: "CT021", target: "E014", type: "contract-entity" },
        { source: "CT022", target: "E014", type: "contract-entity" },
        { source: "CT023", target: "E015", type: "contract-entity" },
        { source: "CT024", target: "E015", type: "contract-entity" }
    ]
};

// ============================================
// CLASE PRINCIPAL
// ============================================
class NetworkVisualization {
    constructor(containerId, data) {
        this.container = d3.select(`#${containerId}`);
        this.data = this.processData(data);
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.selectedNode = null;
        this.expandedCongresspersonId = null; // currently expanded congressperson
        
        this.init();
    }
    
    processData(data) {
        return {
            nodes: data.nodes.map(n => ({...n})),
            links: data.links.map(l => ({...l}))
        };
    }
    
    init() {
        this.setupSVG();
        this.setupDefs();
        this.setupSimulation();
        this.createLinks();
        this.createNodes();
        this.setupEvents();
        this.updateStats();
        this.buildSearchIndex();
        this.hideLoader();
    }

    // ==================== SVG SETUP ====================
    
    setupSVG() {
        this.container
            .attr('width', this.width)
            .attr('height', this.height);
        
        this.g = this.container.append('g');
        
        this.zoom = d3.zoom()
            .scaleExtent([0.05, 5])
            .on('zoom', (event) => {
                this.g.attr('transform', event.transform);
            });
        
        this.container.call(this.zoom);
    }
    
    setupDefs() {
        const defs = this.container.append('defs');
        
        defs.append('marker')
            .attr('id', 'arrow-gray')
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', 8).attr('refY', 0)
            .attr('markerWidth', 6).attr('markerHeight', 6)
            .attr('orient', 'auto')
            .append('path').attr('d', 'M0,-5L10,0L0,5').attr('fill', '#9ca3af');
        
        defs.append('marker')
            .attr('id', 'arrow-green')
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', 8).attr('refY', 0)
            .attr('markerWidth', 6).attr('markerHeight', 6)
            .attr('orient', 'auto')
            .append('path').attr('d', 'M0,-5L10,0L0,5').attr('fill', '#10b981');

        // Photo patterns for congresspersons
        this.data.nodes
            .filter(n => n.type === 'congressperson' && n.photo)
            .forEach(node => {
                const r = CONFIG.nodeRadius.congressperson;
                defs.append('pattern')
                    .attr('id', `photo-${node.id}`)
                    .attr('patternUnits', 'objectBoundingBox')
                    .attr('width', 1).attr('height', 1)
                    .append('image')
                    .attr('xlink:href', node.photo)
                    .attr('width', r * 2).attr('height', r * 2)
                    .attr('preserveAspectRatio', 'xMidYMid slice');
            });

        // Glow gradients
        Object.entries(CONFIG.colors).forEach(([type, color]) => {
            const g = defs.append('radialGradient')
                .attr('id', `glow-${type}`)
                .attr('cx', '50%').attr('cy', '50%').attr('r', '50%');
            g.append('stop').attr('offset', '0%').attr('stop-color', color).attr('stop-opacity', 0.4);
            g.append('stop').attr('offset', '100%').attr('stop-color', color).attr('stop-opacity', 0);
        });

        // Clip path for circular photo
        this.data.nodes.filter(n => n.type === 'congressperson').forEach(node => {
            const r = CONFIG.nodeRadius.congressperson;
            defs.append('clipPath')
                .attr('id', `clip-${node.id}`)
                .append('circle')
                .attr('r', r - 2);
        });
    }
    
    setupSimulation() {
        const charge = CONFIG.forces.chargeCollapsed;
        this.simulation = d3.forceSimulation(this.data.nodes)
            .force('link', d3.forceLink(this.data.links)
                .id(d => d.id)
                .distance(d => CONFIG.forces.link.distance[d.type] || 110)
                .strength(d => d.type === 'congressperson-familiar' ? 0 : CONFIG.forces.link.strength)) // links inactive initially
            .force('charge', d3.forceManyBody()
                .strength(d => charge[d.type] || -120))
            .force('center', d3.forceCenter(this.width / 2, this.height / 2))
            .force('collision', d3.forceCollide()
                .radius(d => CONFIG.nodeRadius[d.type] + CONFIG.forces.collisionCollapsed))
            .alphaDecay(0.025)
            .velocityDecay(0.45);
        
        this.simulation.on('tick', () => this.tick());
    }

    // Transition forces between collapsed (clustered) and expanded states
    _setExpandedForces(isExpanded) {
        const charge = isExpanded ? CONFIG.forces.chargeExpanded : CONFIG.forces.chargeCollapsed;
        const coll   = isExpanded ? CONFIG.forces.collisionExpanded : CONFIG.forces.collisionCollapsed;
        const linkStrength = isExpanded ? CONFIG.forces.link.strength : 0;

        this.simulation
            .force('charge', d3.forceManyBody()
                .strength(d => charge[d.type] || (isExpanded ? -160 : -120)))
            .force('collision', d3.forceCollide()
                .radius(d => CONFIG.nodeRadius[d.type] + coll))
            .force('link', d3.forceLink(this.data.links)
                .id(d => d.id)
                .distance(d => CONFIG.forces.link.distance[d.type] || 110)
                .strength(d => d.type === 'congressperson-familiar' ? linkStrength : linkStrength));

        this.simulation.alpha(0.6).restart();
    }

    // ==================== GRAPH CREATION ====================
    
    createLinks() {
        this.linkGroup = this.g.append('g').attr('class', 'links');
        
        this.links = this.linkGroup.selectAll('path')
            .data(this.data.links)
            .enter()
            .append('path')
            .attr('class', d => `link link-${d.type}`)
            .attr('data-source', d => d.source.id || d.source)
            .attr('data-target', d => d.target.id || d.target)
            .attr('marker-end', d => {
                if (d.type === 'congressperson-familiar') return 'url(#arrow-gray)';
                if (d.type === 'contract-entity') return 'url(#arrow-green)';
                return null;
            })
            // All links hidden by default
            .style('opacity', 0)
            .style('pointer-events', 'none');
    }
    
    createNodes() {
        this.nodeGroup = this.g.append('g').attr('class', 'nodes');
        
        this.nodes = this.nodeGroup.selectAll('g')
            .data(this.data.nodes)
            .enter()
            .append('g')
            .attr('class', d => `node node-${d.type}`)
            .attr('data-id', d => d.id)
            .call(d3.drag()
                .on('start', (event, d) => this.dragStarted(event, d))
                .on('drag', (event, d) => this.dragged(event, d))
                .on('end', (event, d) => this.dragEnded(event, d)));

        this.nodes.each((d, i, nodes) => {
            const node = d3.select(nodes[i]);
            const r = CONFIG.nodeRadius[d.type];
            const color = CONFIG.colors[d.type];
            
            if (d.type === 'congressperson') {
                this._buildCongresspersonNode(node, d, r, color);
            } else if (d.type === 'familiar') {
                this._buildFamiliarNode(node, d, r, color);
            } else if (d.type === 'entity') {
                this._buildEntityNode(node, d, r, color);
            } else if (d.type === 'contract') {
                this._buildContractNode(node, d, r, color);
            }
        });

        // Hide all non-congressperson nodes initially
        this.nodes.filter(d => d.type !== 'congressperson')
            .style('opacity', 0)
            .style('pointer-events', 'none')
            .attr('transform', d => `translate(${d.x || 0},${d.y || 0}) scale(0)`);
    }

    _buildCongresspersonNode(node, d, r, color) {
        // Glow ring
        node.append('circle')
            .attr('class', 'node-glow')
            .attr('r', r + 18)
            .attr('fill', `url(#glow-congressperson)`)
            .style('opacity', 0);

        // Outer ring (pulse animation)
        node.append('circle')
            .attr('class', 'node-pulse-ring')
            .attr('r', r + 8)
            .attr('fill', 'none')
            .attr('stroke', color)
            .attr('stroke-width', 1.5)
            .attr('stroke-opacity', 0.3);

        // Inner ring
        node.append('circle')
            .attr('class', 'node-ring')
            .attr('r', r + 4);

        // Face circle
        node.append('circle')
            .attr('class', 'node-circle')
            .attr('r', r);

        // Photo or initials
        if (d.photo) {
            node.append('circle')
                .attr('r', r - 2)
                .attr('fill', `url(#photo-${d.id})`);
        } else {
            // Initials fallback
            const initials = d.name.split(' ').slice(0, 2).map(w => w[0]).join('');
            node.append('text')
                .attr('class', 'node-initials')
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'central')
                .attr('font-size', r * 0.5)
                .attr('font-weight', '700')
                .attr('fill', 'white')
                .attr('font-family', "'DM Sans', sans-serif")
                .text(initials);
        }

        // Name label below
        const labelY = r + 16;
        node.append('text')
            .attr('class', 'node-label')
            .attr('y', labelY)
            .text(this.truncateName(d.name, 22));
        
        if (d.party) {
            node.append('text')
                .attr('class', 'node-sublabel')
                .attr('y', labelY + 13)
                .text(this.truncateName(d.party, 20));
        }
    }

    _buildFamiliarNode(node, d, r, color) {
        const hexSize = r * 1.1;
        node.append('path').attr('class', 'node-ring').attr('d', getHexagonPath(hexSize + 5)).attr('fill', 'none');
        node.append('path').attr('class', 'node-shape node-hexagon').attr('d', getHexagonPath(hexSize)).attr('fill', color);
        
        const ig = node.append('g').attr('class', 'node-svg-icon').attr('transform', 'scale(0.85)');
        ig.append('circle').attr('cx', 0).attr('cy', -6).attr('r', 5).attr('fill', 'white');
        ig.append('path').attr('d', 'M0 2c-5 0-9 2.5-9 6v3h18v-3c0-3.5-4-6-9-6z').attr('fill', 'white');

        const labelY = r * 1.1 + 16;
        node.append('text').attr('class', 'node-label').attr('y', labelY).text(this.truncateName(d.name));
        if (d.parentesco) node.append('text').attr('class', 'node-sublabel').attr('y', labelY + 13).text(d.parentesco);
    }

    _buildEntityNode(node, d, r, color) {
        const diamondSize = r * 1.15;
        node.append('path').attr('class', 'node-ring').attr('d', getDiamondPath(diamondSize + 5)).attr('fill', 'none');
        node.append('path').attr('class', 'node-shape node-diamond').attr('d', getDiamondPath(diamondSize)).attr('fill', color);
        
        const ig = node.append('g').attr('class', 'node-svg-icon').attr('transform', 'scale(0.7)');
        ig.append('rect').attr('x', -10).attr('y', -14).attr('width', 20).attr('height', 26).attr('rx', 1).attr('fill', 'white');
        [{x:-7,y:-10},{x:1,y:-10},{x:-7,y:-2},{x:1,y:-2}].forEach(p => {
            ig.append('rect').attr('x', p.x).attr('y', p.y).attr('width', 5).attr('height', 5).attr('fill', color);
        });
        ig.append('rect').attr('x', -3).attr('y', 5).attr('width', 6).attr('height', 8).attr('fill', color);

        const labelY = r * 1.15 + 16;
        node.append('text').attr('class', 'node-label').attr('y', labelY).text(this.truncateName(d.name));
        if (d.rubro) node.append('text').attr('class', 'node-sublabel').attr('y', labelY + 13).text(this.truncateName(d.rubro, 22));
    }

    _buildContractNode(node, d, r, color) {
        const sq = r * 1.1;
        node.append('path').attr('class', 'node-ring').attr('d', getRoundedSquarePath(sq + 4, 4)).attr('fill', 'none');
        node.append('path').attr('class', 'node-shape node-square').attr('d', getRoundedSquarePath(sq, 4)).attr('fill', color);
        
        const ig = node.append('g').attr('class', 'node-svg-icon').attr('transform', 'scale(0.55)');
        ig.append('rect').attr('x', -10).attr('y', -14).attr('width', 20).attr('height', 26).attr('rx', 2).attr('fill', 'white');
        [[-6,-6,6,-6],[-6,0,6,0],[-6,6,2,6]].forEach(([x1,y1,x2,y2]) => {
            ig.append('line').attr('x1',x1).attr('y1',y1).attr('x2',x2).attr('y2',y2)
              .attr('stroke', color).attr('stroke-width', 2.5).attr('stroke-linecap', 'round');
        });

        const labelY = sq + 16;
        node.append('text').attr('class', 'node-label').attr('y', labelY).text(this.formatAmount(d.monto));
        if (d.vigencia) node.append('text').attr('class', 'node-sublabel').attr('y', labelY + 13).text(this.truncateName(d.vigencia, 20));
    }

    tick() {
        this.links.attr('d', d => {
            const sourceR = CONFIG.nodeRadius[d.source.type] || 20;
            const targetR = CONFIG.nodeRadius[d.target.type] || 20;
            const dx = d.target.x - d.source.x;
            const dy = d.target.y - d.source.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const nx = dx / dist; const ny = dy / dist;
            const startX = d.source.x + nx * sourceR * 0.8;
            const startY = d.source.y + ny * sourceR * 0.8;
            const endX = d.target.x - nx * (targetR + 10);
            const endY = d.target.y - ny * (targetR + 10);
            const dr = dist * 1.5;
            return `M${startX},${startY}A${dr},${dr} 0 0,1 ${endX},${endY}`;
        });

        // For congressperson nodes, just translate (no scale in transform)
        this.nodes.filter(d => d.type === 'congressperson')
            .attr('transform', d => `translate(${d.x},${d.y})`);

        // For expanded nodes, update position without changing scale
        this.nodes.filter(d => d.type !== 'congressperson' && d._visible)
            .attr('transform', d => `translate(${d.x},${d.y}) scale(1)`);
        
        // For collapsed nodes, keep at position but scale 0
        this.nodes.filter(d => d.type !== 'congressperson' && !d._visible)
            .attr('transform', d => `translate(${d.x},${d.y}) scale(0)`);
    }

    // ==================== EXPAND / COLLAPSE ====================

    /**
     * Get all nodes that belong to a specific congressperson's network.
     * If familiarId is provided, only return that familiar's sub-chain.
     */
    getCongresspersonNetwork(congresspersonId, familiarId = null) {
        const familiars = this.data.links
            .filter(l => (l.source.id || l.source) === congresspersonId && l.type === 'congressperson-familiar')
            .map(l => l.target.id || l.target);

        const targetFamiliars = familiarId ? [familiarId] : familiars;

        const contracts = new Set();
        const entities = new Set();

        targetFamiliars.forEach(fid => {
            this.data.links
                .filter(l => (l.source.id || l.source) === fid && l.type === 'familiar-contract')
                .forEach(l => {
                    const ctId = l.target.id || l.target;
                    contracts.add(ctId);
                    // find entity for this contract
                    this.data.links
                        .filter(l2 => (l2.source.id || l2.source) === ctId && l2.type === 'contract-entity')
                        .forEach(l2 => entities.add(l2.target.id || l2.target));
                });
        });

        return {
            familiars: new Set(targetFamiliars),
            contracts,
            entities
        };
    }

    expandCongressperson(d) {
        const cid = d.id;
        const wasExpanded = this.expandedCongresspersonId === cid;

        // Collapse any previously expanded network
        if (this.expandedCongresspersonId) {
            this._collapseNetwork(this.expandedCongresspersonId);
        }

        if (wasExpanded) {
            // Toggle: clicking same one collapses
            this.expandedCongresspersonId = null;
            this.selectedNode = null;
            this._dimCongresspersons(null);
            this.closeSidebar();
            // Return to clustered forces
            this._setExpandedForces(false);
            return;
        }

        this.expandedCongresspersonId = cid;
        this._dimCongresspersons(cid);

        // Increase repulsion so nodes spread apart to make room
        this._setExpandedForces(true);

        const { familiars, contracts, entities } = this.getCongresspersonNetwork(cid);
        const allNetworkIds = new Set([...familiars, ...contracts, ...entities]);

        // Show nodes with staggered animation
        let delay = 0;
        const order = [
            ...this.data.nodes.filter(n => familiars.has(n.id)),
            ...this.data.nodes.filter(n => contracts.has(n.id)),
            ...this.data.nodes.filter(n => entities.has(n.id))
        ];

        order.forEach(node => {
            node._visible = true;
            delay += 60;
            d3.select(`.node[data-id="${node.id}"]`)
                .transition().delay(delay).duration(400)
                .ease(d3.easeCubicOut)
                .style('opacity', 1)
                .style('pointer-events', 'all')
                .attr('transform', `translate(${node.x},${node.y}) scale(1)`);
        });

        // Show relevant links
        this.links.each(function(l) {
            const src = l.source.id || l.source;
            const tgt = l.target.id || l.target;
            const belongs =
                (src === cid && familiars.has(tgt)) ||
                (familiars.has(src) && contracts.has(tgt)) ||
                (contracts.has(src) && entities.has(tgt));
            if (belongs) {
                d3.select(this)
                    .transition().delay(200).duration(500)
                    .ease(d3.easeLinear)
                    .style('opacity', 1)
                    .style('pointer-events', 'all');
            }
        });

        // Glow effect on selected congressperson
        d3.select(`.node[data-id="${cid}"] .node-glow`)
            .transition().duration(400).style('opacity', 0.7);

        this.selectedNode = d;
        this.showSidebar(d);
    }

    expandFamiliar(d) {
        // When a familiar is selected, only show ITS sub-network
        const cid = d.congresspersonId;
        if (!cid) return;

        // Hide all links first, then show only this familiar's chain
        this.links.transition().duration(200).style('opacity', 0).style('pointer-events', 'none');

        // Hide all non-congressperson nodes
        this.data.nodes.filter(n => n.type !== 'congressperson').forEach(n => { n._visible = false; });
        this.nodes.filter(n => n.type !== 'congressperson')
            .transition().duration(200)
            .style('opacity', 0).style('pointer-events', 'none')
            .attr('transform', n => `translate(${n.x},${n.y}) scale(0)`);

        // Re-expand the congressperson's full familiars but only this familiar's contracts/entities
        const { familiars } = this.getCongresspersonNetwork(cid);
        const { contracts, entities } = this.getCongresspersonNetwork(cid, d.id);
        const allNetworkIds = new Set([...familiars, ...contracts, ...entities]);

        let delay = 0;
        const order = [
            ...this.data.nodes.filter(n => familiars.has(n.id)),
            ...this.data.nodes.filter(n => contracts.has(n.id)),
            ...this.data.nodes.filter(n => entities.has(n.id))
        ];

        order.forEach(node => {
            node._visible = true;
            delay += 50;
            const isFocus = node.id === d.id;
            d3.select(`.node[data-id="${node.id}"]`)
                .transition().delay(delay).duration(350)
                .ease(d3.easeCubicOut)
                .style('opacity', isFocus ? 1 : 0.55)
                .style('pointer-events', 'all')
                .attr('transform', `translate(${node.x},${node.y}) scale(${isFocus ? 1.1 : 1})`);
        });

        // Show links
        this.links.each(function(l) {
            const src = l.source.id || l.source;
            const tgt = l.target.id || l.target;
            const belongsFamiliar =
                (src === cid && familiars.has(tgt)) ||
                (src === d.id && contracts.has(tgt)) ||
                (contracts.has(src) && entities.has(tgt));
            if (belongsFamiliar) {
                d3.select(this)
                    .transition().delay(150).duration(400)
                    .style('opacity', 1)
                    .style('pointer-events', 'all');
            }
        });

        this.selectedNode = d;
        this.showSidebar(d);
    }

    _collapseNetwork(congresspersonId) {
        const { familiars, contracts, entities } = this.getCongresspersonNetwork(congresspersonId);
        const allIds = new Set([...familiars, ...contracts, ...entities]);

        allIds.forEach(id => {
            const node = this.data.nodes.find(n => n.id === id);
            if (node) node._visible = false;
            d3.select(`.node[data-id="${id}"]`)
                .transition().duration(250)
                .ease(d3.easeCubicIn)
                .style('opacity', 0)
                .style('pointer-events', 'none')
                .attr('transform', n => `translate(${n ? n.x : 0},${n ? n.y : 0}) scale(0)`);
        });

        this.links.each(function(l) {
            const src = l.source.id || l.source;
            const tgt = l.target.id || l.target;
            if (src === congresspersonId || allIds.has(src) || allIds.has(tgt)) {
                d3.select(this).transition().duration(200).style('opacity', 0).style('pointer-events', 'none');
            }
        });

        d3.select(`.node[data-id="${congresspersonId}"] .node-glow`)
            .transition().duration(300).style('opacity', 0);

        // Restore clustered forces after a short delay (let collapse animation play first)
        setTimeout(() => this._setExpandedForces(false), 300);
    }

    _dimCongresspersons(activeCid) {
        this.nodes.filter(d => d.type === 'congressperson')
            .transition().duration(300)
            .style('opacity', d => activeCid === null ? 1 : (d.id === activeCid ? 1 : 0.35));
    }

    // ==================== EVENTS ====================
    
    setupEvents() {
        const self = this;
        
        this.nodes
            .on('mouseenter', function(event, d) {
                d._fx = d.fx; d._fy = d.fy;
                d.fx = d.x; d.fy = d.y;
                self.showTooltip(event, d);
                if (d.type === 'congressperson') {
                    d3.select(this).select('.node-glow')
                        .transition().duration(200).style('opacity', 0.5);
                }
            })
            .on('mouseleave', function(event, d) {
                d.fx = d._fx; d.fy = d._fy;
                delete d._fx; delete d._fy;
                self.hideTooltip();
                if (d.type === 'congressperson' && d.id !== self.expandedCongresspersonId) {
                    d3.select(this).select('.node-glow')
                        .transition().duration(300).style('opacity', 0);
                }
            })
            .on('mousemove', function(event) { self.updateTooltipPosition(event); })
            .on('click', function(event, d) {
                event.stopPropagation();
                if (d.type === 'congressperson') {
                    self.expandCongressperson(d);
                } else if (d.type === 'familiar') {
                    self.expandFamiliar(d);
                } else {
                    self.selectedNode = d;
                    self.showSidebar(d);
                }
            });
        
        this.container.on('click', () => {
            if (this.expandedCongresspersonId) {
                this._collapseNetwork(this.expandedCongresspersonId);
                this.expandedCongresspersonId = null;
                this._dimCongresspersons(null);
                this.closeSidebar();
            }
        });
        
        d3.select('#zoom-in').on('click', () => this.zoomIn());
        d3.select('#zoom-out').on('click', () => this.zoomOut());
        d3.select('#reset-view').on('click', () => this.resetView());
        d3.select('#clear-selection').on('click', () => this.clearSelection());
        d3.select('#sidebar-close').on('click', () => this.closeSidebar());
        d3.select('#file-input').on('change', function() { self.loadFile(this.files[0]); });
        
        window.addEventListener('resize', () => this.handleResize());
        
        // Search input with dropdown
        const searchInput = document.getElementById('search-input');
        const dropdown = document.getElementById('search-dropdown');

        searchInput.addEventListener('input', () => {
            this.handleSearchInput(searchInput.value);
        });

        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeSearchDropdown();
                searchInput.blur();
            } else if (e.key === 'Enter') {
                this.commitSearch(searchInput.value);
                this.closeSearchDropdown();
            }
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-wrapper')) {
                this.closeSearchDropdown();
            }
        });
    }

    // ==================== SEARCH ====================

    buildSearchIndex() {
        // Index: normalized name/dni/ruc → node
        this.searchIndex = this.data.nodes.map(n => ({
            node: n,
            normName: normalizeText(n.name || ''),
            dni: n.dni || '',
            ruc: n.ruc || ''
        }));

        // List of congressperson names for dropdown
        this.congresspersonList = this.data.nodes
            .filter(n => n.type === 'congressperson')
            .map(n => ({ id: n.id, name: n.name, normName: normalizeText(n.name) }));
    }

    handleSearchInput(value) {
        const dropdown = document.getElementById('search-dropdown');
        const normValue = normalizeText(value.trim());
        
        if (!normValue) {
            this.closeSearchDropdown();
            return;
        }

        // Filter congresspersons by name
        const matches = this.congresspersonList.filter(c =>
            c.normName.includes(normValue)
        );

        if (matches.length === 0) {
            // Try any node by DNI/RUC
            const nodeMatches = this.searchIndex.filter(e =>
                e.dni.includes(value.trim()) || e.ruc.includes(value.trim())
            );
            if (nodeMatches.length > 0) {
                this.closeSearchDropdown();
                this.commitSearch(value.trim());
            } else {
                dropdown.innerHTML = `<div class="search-dropdown-empty">Sin resultados</div>`;
                dropdown.classList.add('open');
            }
            return;
        }

        // Render dropdown with congressperson names
        dropdown.innerHTML = matches.slice(0, 8).map(c => `
            <div class="search-dropdown-item" data-id="${c.id}">
                <span class="search-dropdown-icon">👤</span>
                <span class="search-dropdown-name">${this._highlightMatch(c.name, value.trim())}</span>
            </div>
        `).join('');
        dropdown.classList.add('open');

        // Click on dropdown item
        dropdown.querySelectorAll('.search-dropdown-item').forEach(el => {
            el.addEventListener('click', () => {
                const id = el.dataset.id;
                const node = this.data.nodes.find(n => n.id === id);
                if (node) {
                    document.getElementById('search-input').value = node.name;
                    this.closeSearchDropdown();
                    this.focusNode(node);
                }
            });
        });
    }

    _highlightMatch(name, query) {
        const normName = normalizeText(name);
        const normQuery = normalizeText(query);
        const idx = normName.indexOf(normQuery);
        if (idx === -1) return name;
        return name.substring(0, idx) +
            `<mark>${name.substring(idx, idx + query.length)}</mark>` +
            name.substring(idx + query.length);
    }

    closeSearchDropdown() {
        const dropdown = document.getElementById('search-dropdown');
        if (dropdown) dropdown.classList.remove('open');
    }

    commitSearch(value) {
        const normValue = normalizeText(value.trim());
        if (!normValue) { this.clearSelection(); return; }

        // Search across all nodes: name, DNI, RUC
        const match = this.searchIndex.find(e =>
            e.normName.includes(normValue) ||
            e.dni === value.trim() ||
            e.ruc === value.trim()
        );

        if (match) this.focusNode(match.node);
    }

    focusNode(node) {
        // If congressperson, expand it; otherwise find its parent congressperson
        if (node.type === 'congressperson') {
            this.expandCongressperson(node);
        } else if (node.type === 'familiar') {
            // Make sure parent is expanded first
            const cid = node.congresspersonId;
            const congress = this.data.nodes.find(n => n.id === cid);
            if (congress && this.expandedCongresspersonId !== cid) {
                this.expandCongressperson(congress);
            }
            setTimeout(() => this.expandFamiliar(node), 400);
        } else {
            this.selectedNode = node;
            this.showSidebar(node);
        }

        // Pan to node
        setTimeout(() => {
            const transform = d3.zoomIdentity
                .translate(this.width / 2 - node.x, this.height / 2 - node.y)
                .scale(1.2);
            this.container.transition().duration(600).call(this.zoom.transform, transform);
        }, 100);
    }

    clearSelection() {
        if (this.expandedCongresspersonId) {
            this._collapseNetwork(this.expandedCongresspersonId);
            this.expandedCongresspersonId = null;
        }
        this._dimCongresspersons(null);
        this._setExpandedForces(false);
        this.selectedNode = null;
        this.closeSidebar();
        document.getElementById('search-input').value = '';
        this.closeSearchDropdown();
    }

    // ==================== TOOLTIP ====================
    
    showTooltip(event, d) {
        const tooltip = d3.select('#tooltip');
        let content = '';
        const typeLabels = { congressperson: 'CONGRESISTA', familiar: 'FAMILIAR', entity: 'ENTIDAD', contract: 'CONTRATO' };
        
        switch(d.type) {
            case 'congressperson':
                content = `
                    <div class="tooltip-type ${d.type}">${typeLabels[d.type]}</div>
                    <div class="tooltip-title">${d.name}</div>
                    <div class="tooltip-grid">
                        <div class="tooltip-row"><span class="tooltip-key">DNI</span><span class="tooltip-value">${d.dni}</span></div>
                        <div class="tooltip-row"><span class="tooltip-key">Partido</span><span class="tooltip-value">${d.party || 'N/A'}</span></div>
                        <div class="tooltip-row"><span class="tooltip-key">Comisión</span><span class="tooltip-value">${d.commission || 'N/A'}</span></div>
                        <div class="tooltip-row"><span class="tooltip-key">Departamento</span><span class="tooltip-value">${d.department || 'N/A'}</span></div>
                    </div>`;
                break;
            case 'familiar':
                content = `
                    <div class="tooltip-type ${d.type}">${typeLabels[d.type]}</div>
                    <div class="tooltip-title">${d.name}</div>
                    <div class="tooltip-grid">
                        <div class="tooltip-row"><span class="tooltip-key">DNI</span><span class="tooltip-value">${d.dni}</span></div>
                        <div class="tooltip-row"><span class="tooltip-key">Parentesco</span><span class="tooltip-value">${d.parentesco || 'N/A'}</span></div>
                        ${d.ocupacion ? `<div class="tooltip-row"><span class="tooltip-key">Ocupación</span><span class="tooltip-value">${d.ocupacion}</span></div>` : ''}
                        ${d.lugarTrabajo ? `<div class="tooltip-row"><span class="tooltip-key">Lugar de trabajo</span><span class="tooltip-value">${d.lugarTrabajo}</span></div>` : ''}
                    </div>`;
                break;
            case 'entity':
                content = `
                    <div class="tooltip-type ${d.type}">${typeLabels[d.type]}</div>
                    <div class="tooltip-title">${d.name}</div>
                    <div class="tooltip-grid">
                        <div class="tooltip-row"><span class="tooltip-key">RUC</span><span class="tooltip-value">${d.ruc}</span></div>
                        <div class="tooltip-row"><span class="tooltip-key">Rubro</span><span class="tooltip-value">${d.rubro || 'N/A'}</span></div>
                        <div class="tooltip-row"><span class="tooltip-key">Monto Total</span><span class="tooltip-value">${this.formatAmount(d.montoTotal)}</span></div>
                        <div class="tooltip-row"><span class="tooltip-key">N° Contratos</span><span class="tooltip-value">${d.numContratos || 0}</span></div>
                    </div>`;
                break;
            case 'contract':
                content = `
                    <div class="tooltip-type ${d.type}">${typeLabels[d.type]}</div>
                    <div class="tooltip-title">${this.formatAmount(d.monto)}</div>
                    <div class="tooltip-grid">
                        <div class="tooltip-row"><span class="tooltip-key">Entidad</span><span class="tooltip-value">${d.entidadContratante || 'N/A'}</span></div>
                        <div class="tooltip-row"><span class="tooltip-key">Fecha</span><span class="tooltip-value">${this.formatDate(d.fecha)}</span></div>
                        ${d.vigencia ? `<div class="tooltip-row"><span class="tooltip-key">Estado</span><span class="tooltip-value">${d.vigencia}</span></div>` : ''}
                        <div class="tooltip-row"><span class="tooltip-key">Descripción</span><span class="tooltip-value">${d.descripcion || 'N/A'}</span></div>
                    </div>`;
                break;
        }
        
        tooltip.html(content).style('opacity', 1);
        this.updateTooltipPosition(event);
    }

    updateTooltipPosition(event) {
        const tooltip = d3.select('#tooltip');
        const node = tooltip.node();
        const tw = node.offsetWidth, th = node.offsetHeight;
        let left = event.clientX + 15, top = event.clientY + 15;
        if (left + tw > window.innerWidth - 20) left = event.clientX - tw - 15;
        if (top + th > window.innerHeight - 20) top = event.clientY - th - 15;
        tooltip.style('left', left + 'px').style('top', top + 'px');
    }
    
    hideTooltip() { d3.select('#tooltip').style('opacity', 0); }

    // ==================== SIDEBAR ====================
    
    showSidebar(d) {
        const sidebar = d3.select('#sidebar');
        const content = d3.select('#sidebar-content');
        const typeLabel = this.getTypeLabel(d.type);
        const color = CONFIG.colors[d.type];
        
        let html = `
            <div class="sidebar-header">
                <span class="sidebar-type" style="background:${color}20;color:${color}">${typeLabel}</span>
                <h2 class="sidebar-title">${d.name || this.formatAmount(d.monto)}</h2>
                <p class="sidebar-subtitle">${d.party || d.parentesco || d.rubro || d.entidadContratante || ''}</p>
            </div>`;
        
        switch(d.type) {
            case 'congressperson':
                html += `<div class="sidebar-section"><h3 class="sidebar-section-title">Información</h3>
                    <div class="sidebar-stat"><span>DNI</span><span class="sidebar-stat-value">${d.dni}</span></div>
                    <div class="sidebar-stat"><span>Partido</span><span>${d.party || 'N/A'}</span></div>
                    <div class="sidebar-stat"><span>Comisión</span><span>${d.commission || 'N/A'}</span></div>
                    <div class="sidebar-stat"><span>Departamento</span><span>${d.department || 'N/A'}</span></div>
                </div>`;
                break;
            case 'familiar':
                html += `<div class="sidebar-section"><h3 class="sidebar-section-title">Información</h3>
                    <div class="sidebar-stat"><span>DNI</span><span class="sidebar-stat-value">${d.dni}</span></div>
                    <div class="sidebar-stat"><span>Parentesco</span><span>${d.parentesco || 'N/A'}</span></div>
                    <div class="sidebar-stat"><span>Ocupación</span><span>${d.ocupacion || 'N/A'}</span></div>
                    ${d.lugarTrabajo ? `<div class="sidebar-stat"><span>Lugar de Trabajo</span><span>${d.lugarTrabajo}</span></div>` : ''}
                    ${d.ruc ? `<div class="sidebar-stat"><span>RUC</span><span>${d.ruc}</span></div>` : ''}
                </div>`;
                break;
            case 'entity':
                html += `<div class="sidebar-section"><h3 class="sidebar-section-title">Información</h3>
                    <div class="sidebar-stat"><span>RUC</span><span class="sidebar-stat-value">${d.ruc}</span></div>
                    <div class="sidebar-stat"><span>Rubro</span><span>${d.rubro || 'N/A'}</span></div>
                    <div class="sidebar-stat"><span>Monto Total</span><span class="sidebar-stat-value">${this.formatAmount(d.montoTotal)}</span></div>
                    <div class="sidebar-stat"><span>N° Contratos</span><span>${d.numContratos || 0}</span></div>
                </div>`;
                break;
            case 'contract':
                html += `<div class="sidebar-section"><h3 class="sidebar-section-title">Información</h3>
                    <div class="sidebar-stat"><span>Monto</span><span class="sidebar-stat-value">${this.formatAmount(d.monto)}</span></div>
                    <div class="sidebar-stat"><span>Fecha</span><span>${this.formatDate(d.fecha)}</span></div>
                    ${d.vigencia ? `<div class="sidebar-stat"><span>Estado</span><span>${d.vigencia}</span></div>` : ''}
                    <div class="sidebar-stat"><span>Entidad Contratante</span><span>${d.entidadContratante || 'N/A'}</span></div>
                </div>
                <div class="sidebar-section"><h3 class="sidebar-section-title">Descripción</h3>
                    <p style="font-size:0.85rem;color:var(--text-secondary)">${d.descripcion || 'Sin descripción'}</p>
                </div>`;
                break;
        }

        // Connections
        const connections = this.getDirectConnections(d);
        if (connections.length > 0) {
            html += `<div class="sidebar-section"><h3 class="sidebar-section-title">Conexiones (${connections.length})</h3><div class="sidebar-connections">`;
            connections.forEach(conn => {
                const cc = CONFIG.colors[conn.type];
                const emoji = conn.type === 'congressperson' ? '👤' : conn.type === 'familiar' ? '👥' : conn.type === 'entity' ? '🏢' : '📄';
                html += `<div class="sidebar-connection" data-id="${conn.id}">
                    <div class="sidebar-connection-icon" style="background:${cc}20;color:${cc}">${emoji}</div>
                    <div class="sidebar-connection-info">
                        <div class="sidebar-connection-name">${conn.name || this.formatAmount(conn.monto)}</div>
                        <div class="sidebar-connection-type">${this.getTypeLabel(conn.type)}</div>
                    </div>
                </div>`;
            });
            html += `</div></div>`;
        }
        
        content.html(html);
        sidebar.classed('open', true);
        
        content.selectAll('.sidebar-connection').on('click', (event) => {
            const id = event.currentTarget.dataset.id;
            const node = this.data.nodes.find(n => n.id === id);
            if (node) this.focusNode(node);
        });
    }
    
    closeSidebar() { d3.select('#sidebar').classed('open', false); }
    
    getDirectConnections(d) {
        const conns = [];
        this.data.links.forEach(l => {
            if (l.source.id === d.id) conns.push(l.target);
            else if (l.target.id === d.id) conns.push(l.source);
        });
        return conns;
    }

    // ==================== CONTROLS ====================
    
    zoomIn() { this.container.transition().call(this.zoom.scaleBy, 1.4); }
    zoomOut() { this.container.transition().call(this.zoom.scaleBy, 0.7); }
    resetView() {
        this.container.transition().duration(750)
            .call(this.zoom.transform, d3.zoomIdentity.translate(0, 0).scale(1));
    }
    
    loadFile(file) {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                this.reloadData(data);
            } catch (err) { alert('Error al cargar el archivo JSON: ' + err.message); }
        };
        reader.readAsText(file);
    }
    
    reloadData(data) {
        this.g.selectAll('*').remove();
        this.simulation.stop();
        this.data = this.processData(data);
        this.expandedCongresspersonId = null;
        this.setupDefs();
        this.setupSimulation();
        this.createLinks();
        this.createNodes();
        this.updateStats();
        this.buildSearchIndex();
        this.clearSelection();
    }
    
    updateStats() {
        const counts = { congressperson: 0, familiar: 0, entity: 0, contract: 0 };
        let totalAmount = 0;
        this.data.nodes.forEach(n => {
            counts[n.type]++;
            if (n.type === 'contract' && n.monto) totalAmount += n.monto;
        });
        d3.select('#stat-congresspersons').text(counts.congressperson);
        d3.select('#stat-familiars').text(counts.familiar);
        d3.select('#stat-entities').text(counts.entity);
        d3.select('#stat-contracts').text(counts.contract);
        d3.select('#stat-total-amount').text(this.formatAmount(totalAmount));
    }

    // ==================== UTILS ====================
    
    dragStarted(event, d) {
        if (!event.active) this.simulation.alphaTarget(0.3).restart();
        d.fx = d.x; d.fy = d.y;
        this.hideTooltip();
    }
    dragged(event, d) { d.fx = event.x; d.fy = event.y; }
    dragEnded(event, d) {
        if (!event.active) this.simulation.alphaTarget(0);
        if (!d._fx && !d._fy) { d.fx = null; d.fy = null; }
    }
    handleResize() {
        this.width = window.innerWidth; this.height = window.innerHeight;
        this.container.attr('width', this.width).attr('height', this.height);
        this.simulation.force('center', d3.forceCenter(this.width / 2, this.height / 2));
        this.simulation.alpha(0.3).restart();
    }
    hideLoader() {
        setTimeout(() => { d3.select('#loader').classed('hidden', true); }, 600);
    }
    getTypeLabel(type) {
        return { congressperson: 'Congresista', familiar: 'Familiar', entity: 'Entidad', contract: 'Contrato' }[type] || type;
    }
    formatAmount(amount) {
        if (!amount) return 'S/ 0';
        return `S/ ${amount.toLocaleString('es-PE', { minimumFractionDigits: 0 })}`;
    }
    formatDate(dateStr) {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('es-PE', { year: 'numeric', month: 'short', day: 'numeric' });
    }
    truncateName(name, maxLen = 25) {
        if (!name) return '';
        return name.length > maxLen ? name.substring(0, maxLen - 2) + '...' : name;
    }
}

// ============================================
// INICIALIZAR
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    window.networkViz = new NetworkVisualization('network-container', SAMPLE_DATA);
});