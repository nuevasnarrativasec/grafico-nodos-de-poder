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
        link: { distance: { 'congressperson-familiar': 140, 'familiar-contract': 100, 'contract-entity': 90 }, strength: 0.7 },
        charge: { congressperson: -700, familiar: -350, entity: -280, contract: -120 },
        collision: 25
    },
    colors: {
        congressperson: '#f59e0b',
        familiar: '#3b82f6',
        entity: '#8b5cf6',
        contract: '#10b981'
    }
};

// ============================================
// FUNCIONES PARA GENERAR FORMAS SVG
// ============================================

// Genera path de hexágono
function getHexagonPath(size) {
    const points = [];
    for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 2;
        points.push([
            size * Math.cos(angle),
            size * Math.sin(angle)
        ]);
    }
    return points.map((p, i) => (i === 0 ? 'M' : 'L') + p[0] + ',' + p[1]).join(' ') + ' Z';
}

// Genera path de rombo (diamante)
function getDiamondPath(size) {
    return `M 0 ${-size} L ${size} 0 L 0 ${size} L ${-size} 0 Z`;
}

// Genera path de cuadrado redondeado
function getRoundedSquarePath(size, radius) {
    const r = radius || size * 0.2;
    const s = size;
    return `M ${-s + r} ${-s}
            H ${s - r}
            Q ${s} ${-s} ${s} ${-s + r}
            V ${s - r}
            Q ${s} ${s} ${s - r} ${s}
            H ${-s + r}
            Q ${-s} ${s} ${-s} ${s - r}
            V ${-s + r}
            Q ${-s} ${-s} ${-s + r} ${-s}
            Z`;
}

// ============================================
// DATOS DE EJEMPLO
// ============================================
const SAMPLE_DATA = {
    nodes: [
        // Congresistas
        { id: "C001", type: "congressperson", name: "Ana María Zegarra López", dni: "42628319", party: "Alianza para el Progreso", commission: "Comisión de Economía", department: "Lima", photo: "./img/ana-zegarra.png" },
        { id: "C002", type: "congressperson", name: "José Luis Elías Ávalos", dni: "21569935", party: "Podemos Perú", commission: "Comisión de Transportes", department: "Ica", photo: "./img/jose-luis-elias.png" },
        { id: "C003", type: "congressperson", name: "Patricia Rosa Chirinos Venegas", dni: "10280036", party: "Avanza País", commission: "Junta de Portavoces", department: "Callao", photo: "./img/patricia-chirinos.png" },
        
        // Familiares - Ana Zegarra
        { id: "F001", type: "familiar", name: "Hugo Hermilio Alvarado Apaza", dni: "04632989", parentesco: "Padre del Cónyuge", ocupacion: "Pescador Artesanal", congresspersonId: "C001" },
        { id: "F002", type: "familiar", name: "José Alfredo Alvarado Mamani", dni: "40448882", parentesco: "Cuñado(a)", ocupacion: "Chofer", lugarTrabajo: "Transportes Halcon SRL", ruc: "20456789012", congresspersonId: "C001" },
        { id: "F003", type: "familiar", name: "Deisy Paola Alvarado Mamani", dni: "42067814", parentesco: "Cuñado(a)", ocupacion: "Promotora Educativa", lugarTrabajo: "Programa Educación Básica", congresspersonId: "C001" },
        
        // Familiares - José Elías
        { id: "F004", type: "familiar", name: "Carlos Elías Mendoza", dni: "21234567", parentesco: "Hermano", ocupacion: "Gerente General", lugarTrabajo: "Constructora del Sur SAC", ruc: "20567891234", congresspersonId: "C002" },
        { id: "F005", type: "familiar", name: "María Elena Ávalos de Elías", dni: "21345678", parentesco: "Madre", ocupacion: "Comerciante", lugarTrabajo: "Distribuidora Ávalos EIRL", ruc: "20123456789", congresspersonId: "C002" },
        
        // Familiares - Patricia Chirinos
        { id: "F006", type: "familiar", name: "Ricardo Venegas Pérez", dni: "10345678", parentesco: "Hermano", ocupacion: "Abogado", lugarTrabajo: "Estudio Venegas & Asociados", ruc: "20789012345", congresspersonId: "C003" },
        
        // Entidades
        { id: "E001", type: "entity", name: "Transportes Halcon SRL", ruc: "20456789012", rubro: "Transporte de carga", montoTotal: 1250000, numContratos: 8 },
        { id: "E002", type: "entity", name: "Constructora del Sur SAC", ruc: "20567891234", rubro: "Construcción", montoTotal: 4580000, numContratos: 12 },
        { id: "E003", type: "entity", name: "Distribuidora Ávalos EIRL", ruc: "20123456789", rubro: "Comercialización", montoTotal: 890000, numContratos: 5 },
        { id: "E004", type: "entity", name: "Estudio Venegas & Asociados", ruc: "20789012345", rubro: "Servicios legales", montoTotal: 560000, numContratos: 7 },
        
        // Contratos
        { id: "CT001", type: "contract", entidadId: "E001", fecha: "2023-05-15", descripcion: "Servicio de transporte de materiales para PRONIED", monto: 320000, entidadContratante: "PRONIED", vigencia: "Finalizado oct. 23", documentUrl: "https://osce.gob.pe/doc/123" },
        { id: "CT002", type: "contract", entidadId: "E001", fecha: "2023-08-20", descripcion: "Transporte de equipos médicos - MINSA", monto: 185000, entidadContratante: "MINSA", vigencia: "Finalizado dic. 23", documentUrl: "#" },
        { id: "CT003", type: "contract", entidadId: "E001", fecha: "2024-01-10", descripcion: "Distribución de materiales educativos", monto: 245000, entidadContratante: "MINEDU", vigencia: "Vigente desde ene. 24", documentUrl: "#" },
        { id: "CT004", type: "contract", entidadId: "E002", fecha: "2023-03-10", descripcion: "Construcción de puente vehicular - Ica", monto: 2150000, entidadContratante: "MTC", vigencia: "Finalizado sep. 23", documentUrl: "#" },
        { id: "CT005", type: "contract", entidadId: "E002", fecha: "2023-11-05", descripcion: "Mejoramiento de carretera regional", monto: 1850000, entidadContratante: "Gobierno Regional Ica", vigencia: "Vigente desde nov. 23", documentUrl: "#" },
        { id: "CT006", type: "contract", entidadId: "E003", fecha: "2024-01-15", descripcion: "Provisión de alimentos - Qali Warma", monto: 520000, entidadContratante: "Qali Warma", vigencia: "Vigente desde ene. 24", documentUrl: "#" },
        { id: "CT007", type: "contract", entidadId: "E004", fecha: "2023-06-20", descripcion: "Asesoría legal para proceso de licitación", monto: 180000, entidadContratante: "ESSALUD", vigencia: "Finalizado dic. 23", documentUrl: "#" },
        { id: "CT008", type: "contract", entidadId: "E004", fecha: "2024-02-01", descripcion: "Servicios de consultoría jurídica", monto: 220000, entidadContratante: "Municipalidad del Callao", vigencia: "Vigente desde ene. 24", documentUrl: "#" }
    ],
    links: [
        // Congresista -> Familiares (con flecha)
        { source: "C001", target: "F001", type: "congressperson-familiar" },
        { source: "C001", target: "F002", type: "congressperson-familiar" },
        { source: "C001", target: "F003", type: "congressperson-familiar" },
        { source: "C002", target: "F004", type: "congressperson-familiar" },
        { source: "C002", target: "F005", type: "congressperson-familiar" },
        { source: "C003", target: "F006", type: "congressperson-familiar" },
        
        // Familiares -> Contratos (línea punteada azul)
        { source: "F002", target: "CT001", type: "familiar-contract" },
        { source: "F002", target: "CT002", type: "familiar-contract" },
        { source: "F002", target: "CT003", type: "familiar-contract" },
        { source: "F004", target: "CT004", type: "familiar-contract" },
        { source: "F004", target: "CT005", type: "familiar-contract" },
        { source: "F005", target: "CT006", type: "familiar-contract" },
        { source: "F006", target: "CT007", type: "familiar-contract" },
        { source: "F006", target: "CT008", type: "familiar-contract" },
        
        // Contratos -> Entidades (con flecha verde)
        { source: "CT001", target: "E001", type: "contract-entity" },
        { source: "CT002", target: "E001", type: "contract-entity" },
        { source: "CT003", target: "E001", type: "contract-entity" },
        { source: "CT004", target: "E002", type: "contract-entity" },
        { source: "CT005", target: "E002", type: "contract-entity" },
        { source: "CT006", target: "E003", type: "contract-entity" },
        { source: "CT007", target: "E004", type: "contract-entity" },
        { source: "CT008", target: "E004", type: "contract-entity" }
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
        this.highlightedNodes = new Set();
        this.highlightedLinks = new Set();
        this.selectedNode = null;
        
        this.init();
    }
    
    processData(data) {
        // Crear copias para no mutar datos originales
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
        this.hideLoader();
    }
    
    setupSVG() {
        this.container
            .attr('width', this.width)
            .attr('height', this.height);
        
        this.g = this.container.append('g');
        
        // Zoom
        this.zoom = d3.zoom()
            .scaleExtent([0.1, 5])
            .on('zoom', (event) => {
                this.g.attr('transform', event.transform);
            });
        
        this.container.call(this.zoom);
    }
    
    setupDefs() {
        const defs = this.container.append('defs');
        
        // Marker de flecha gris (para congressperson-familiar)
        defs.append('marker')
            .attr('id', 'arrow-gray')
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', 8)
            .attr('refY', 0)
            .attr('markerWidth', 6)
            .attr('markerHeight', 6)
            .attr('orient', 'auto')
            .append('path')
            .attr('d', 'M0,-5L10,0L0,5')
            .attr('fill', '#9ca3af');
        
        // Marker de flecha verde (para contract-entity)
        defs.append('marker')
            .attr('id', 'arrow-green')
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', 8)
            .attr('refY', 0)
            .attr('markerWidth', 6)
            .attr('markerHeight', 6)
            .attr('orient', 'auto')
            .append('path')
            .attr('d', 'M0,-5L10,0L0,5')
            .attr('fill', '#10b981');
        
        // Patrones de fotos
        this.data.nodes
            .filter(n => n.type === 'congressperson' && n.photo)
            .forEach(node => {
                const r = CONFIG.nodeRadius.congressperson;
                defs.append('pattern')
                    .attr('id', `photo-${node.id}`)
                    .attr('patternUnits', 'objectBoundingBox')
                    .attr('width', 1)
                    .attr('height', 1)
                    .append('image')
                    .attr('xlink:href', node.photo)
                    .attr('width', r * 2)
                    .attr('height', r * 2)
                    .attr('preserveAspectRatio', 'xMidYMid slice');
            });
        
        // Gradientes para glow
        Object.entries(CONFIG.colors).forEach(([type, color]) => {
            const gradient = defs.append('radialGradient')
                .attr('id', `glow-${type}`)
                .attr('cx', '50%')
                .attr('cy', '50%')
                .attr('r', '50%');
            
            gradient.append('stop')
                .attr('offset', '0%')
                .attr('stop-color', color)
                .attr('stop-opacity', 0.4);
            
            gradient.append('stop')
                .attr('offset', '100%')
                .attr('stop-color', color)
                .attr('stop-opacity', 0);
        });
    }
    
    setupSimulation() {
        this.simulation = d3.forceSimulation(this.data.nodes)
            .force('link', d3.forceLink(this.data.links)
                .id(d => d.id)
                .distance(d => CONFIG.forces.link.distance[d.type] || 100)
                .strength(CONFIG.forces.link.strength))
            .force('charge', d3.forceManyBody()
                .strength(d => CONFIG.forces.charge[d.type] || -200))
            .force('center', d3.forceCenter(this.width / 2, this.height / 2))
            .force('collision', d3.forceCollide()
                .radius(d => CONFIG.nodeRadius[d.type] + CONFIG.forces.collision))
            .alphaDecay(0.02)
            .velocityDecay(0.4);
        
        this.simulation.on('tick', () => this.tick());
    }
    
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
                // Agregar flechas solo a ciertos tipos de conexión
                if (d.type === 'congressperson-familiar') return 'url(#arrow-gray)';
                if (d.type === 'contract-entity') return 'url(#arrow-green)';
                return null;
            });
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
        
        // Crear formas según el tipo de nodo
        this.nodes.each((d, i, nodes) => {
            const node = d3.select(nodes[i]);
            const r = CONFIG.nodeRadius[d.type];
            const color = CONFIG.colors[d.type];
            
            if (d.type === 'congressperson') {
                // Círculo para congresistas (igual que antes)
                node.append('circle')
                    .attr('class', 'node-ring')
                    .attr('r', r + 5);
                
                node.append('circle')
                    .attr('class', 'node-circle')
                    .attr('r', r);
                
                if (d.photo) {
                    node.append('circle')
                        .attr('r', r - 4)
                        .attr('fill', `url(#photo-${d.id})`);
                }
            } else if (d.type === 'familiar') {
                // Hexágono para familiares
                const hexSize = r * 1.1;
                
                // Anillo exterior hexagonal
                node.append('path')
                    .attr('class', 'node-ring')
                    .attr('d', getHexagonPath(hexSize + 5))
                    .attr('fill', 'none');
                
                // Hexágono principal
                node.append('path')
                    .attr('class', 'node-shape node-hexagon')
                    .attr('d', getHexagonPath(hexSize))
                    .attr('fill', color);
                
                // Ícono SVG de grupo de personas
                const iconGroup = node.append('g')
                    .attr('class', 'node-svg-icon')
                    .attr('transform', 'scale(0.85)');
                
                // Persona central
                iconGroup.append('circle')
                    .attr('cx', 0)
                    .attr('cy', -6)
                    .attr('r', 5)
                    .attr('fill', 'white');
                
                iconGroup.append('path')
                    .attr('d', 'M0 2c-5 0-9 2.5-9 6v3h18v-3c0-3.5-4-6-9-6z')
                    .attr('fill', 'white');
                
                // Persona izquierda
                iconGroup.append('circle')
                    .attr('cx', -12)
                    .attr('cy', -3)
                    .attr('r', 3.5)
                    .attr('fill', 'white')
                    .attr('opacity', 0.7);
                
                iconGroup.append('path')
                    .attr('d', 'M-12 3c-3.5 0-6 1.5-6 4v2h7v-3c0-1.5 0.5-2.5 1.5-3h-2.5z')
                    .attr('fill', 'white')
                    .attr('opacity', 0.7);
                
                // Persona derecha
                iconGroup.append('circle')
                    .attr('cx', 12)
                    .attr('cy', -3)
                    .attr('r', 3.5)
                    .attr('fill', 'white')
                    .attr('opacity', 0.7);
                
                iconGroup.append('path')
                    .attr('d', 'M12 3c3.5 0 6 1.5 6 4v2h-7v-3c0-1.5-0.5-2.5-1.5-3h2.5z')
                    .attr('fill', 'white')
                    .attr('opacity', 0.7);
                    
            } else if (d.type === 'entity') {
                // Rombo (diamante) para entidades
                const diamondSize = r * 1.15;
                
                // Anillo exterior
                node.append('path')
                    .attr('class', 'node-ring')
                    .attr('d', getDiamondPath(diamondSize + 5))
                    .attr('fill', 'none');
                
                // Rombo principal
                node.append('path')
                    .attr('class', 'node-shape node-diamond')
                    .attr('d', getDiamondPath(diamondSize))
                    .attr('fill', color);
                
                // Ícono SVG de edificio
                const iconGroup = node.append('g')
                    .attr('class', 'node-svg-icon')
                    .attr('transform', 'scale(0.7)');
                
                // Edificio principal
                iconGroup.append('rect')
                    .attr('x', -10)
                    .attr('y', -14)
                    .attr('width', 20)
                    .attr('height', 26)
                    .attr('rx', 1)
                    .attr('fill', 'white');
                
                // Ventanas
                const windowPositions = [
                    {x: -7, y: -10}, {x: 1, y: -10},
                    {x: -7, y: -2}, {x: 1, y: -2}
                ];
                
                windowPositions.forEach(pos => {
                    iconGroup.append('rect')
                        .attr('x', pos.x)
                        .attr('y', pos.y)
                        .attr('width', 5)
                        .attr('height', 5)
                        .attr('fill', color);
                });
                
                // Puerta
                iconGroup.append('rect')
                    .attr('x', -3)
                    .attr('y', 5)
                    .attr('width', 6)
                    .attr('height', 8)
                    .attr('fill', color);
                    
            } else if (d.type === 'contract') {
                // Cuadrado redondeado para contratos
                const squareSize = r * 1.1;
                
                // Anillo exterior
                node.append('path')
                    .attr('class', 'node-ring')
                    .attr('d', getRoundedSquarePath(squareSize + 4, 4))
                    .attr('fill', 'none');
                
                // Cuadrado principal
                node.append('path')
                    .attr('class', 'node-shape node-square')
                    .attr('d', getRoundedSquarePath(squareSize, 4))
                    .attr('fill', color);
                
                // Ícono SVG de documento
                const iconGroup = node.append('g')
                    .attr('class', 'node-svg-icon')
                    .attr('transform', 'scale(0.55)');
                
                // Documento base
                iconGroup.append('rect')
                    .attr('x', -10)
                    .attr('y', -14)
                    .attr('width', 20)
                    .attr('height', 26)
                    .attr('rx', 2)
                    .attr('fill', 'white');
                
                // Líneas de texto
                iconGroup.append('line')
                    .attr('x1', -6)
                    .attr('y1', -6)
                    .attr('x2', 6)
                    .attr('y2', -6)
                    .attr('stroke', color)
                    .attr('stroke-width', 2.5)
                    .attr('stroke-linecap', 'round');
                
                iconGroup.append('line')
                    .attr('x1', -6)
                    .attr('y1', 0)
                    .attr('x2', 6)
                    .attr('y2', 0)
                    .attr('stroke', color)
                    .attr('stroke-width', 2.5)
                    .attr('stroke-linecap', 'round');
                
                iconGroup.append('line')
                    .attr('x1', -6)
                    .attr('y1', 6)
                    .attr('x2', 2)
                    .attr('y2', 6)
                    .attr('stroke', color)
                    .attr('stroke-width', 2.5)
                    .attr('stroke-linecap', 'round');
            }
            
            // Etiquetas (para todos los tipos)
            const labelY = r + 14;
            node.append('text')
                .attr('class', 'node-label')
                .attr('y', labelY)
                .text(this.truncateName(d.name || this.formatAmount(d.monto)));
            
            // Sublabel para todos los tipos incluyendo contratos
            const sublabel = d.party || d.parentesco || d.rubro || d.vigencia || '';
            if (sublabel) {
                node.append('text')
                    .attr('class', 'node-sublabel')
                    .attr('y', labelY + 12)
                    .text(this.truncateName(sublabel, 22));
            }
        });
    }
    
    tick() {
        this.links.attr('d', d => {
            const sourceR = CONFIG.nodeRadius[d.source.type] || 20;
            const targetR = CONFIG.nodeRadius[d.target.type] || 20;
            
            const dx = d.target.x - d.source.x;
            const dy = d.target.y - d.source.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            // Normalizar dirección
            const nx = dx / dist;
            const ny = dy / dist;
            
            // Ajustar puntos de inicio y fin para que no se superpongan con los nodos
            const startX = d.source.x + nx * sourceR * 0.8;
            const startY = d.source.y + ny * sourceR * 0.8;
            const endX = d.target.x - nx * (targetR + 10); // +10 para espacio de la flecha
            const endY = d.target.y - ny * (targetR + 10);
            
            // Curva suave
            const dr = dist * 1.5;
            return `M${startX},${startY}A${dr},${dr} 0 0,1 ${endX},${endY}`;
        });
        
        this.nodes.attr('transform', d => `translate(${d.x},${d.y})`);
    }
    
    setupEvents() {
        const self = this;
        
        // Hover y click en nodos
        this.nodes
            .on('mouseenter', function(event, d) {
                d._fx = d.fx;
                d._fy = d.fy;
                d.fx = d.x;
                d.fy = d.y;
                self.showTooltip(event, d);
            })
            .on('mouseleave', function(event, d) {
                d.fx = d._fx;
                d.fy = d._fy;
                delete d._fx;
                delete d._fy;
                self.hideTooltip();
            })
            .on('mousemove', function(event, d) {
                self.updateTooltipPosition(event);
            })
            .on('click', function(event, d) {
                event.stopPropagation();
                self.selectNode(d);
            });
        
        // Click en fondo
        this.container.on('click', () => this.clearSelection());
        
        // Controles
        d3.select('#zoom-in').on('click', () => this.zoomIn());
        d3.select('#zoom-out').on('click', () => this.zoomOut());
        d3.select('#reset-view').on('click', () => this.resetView());
        d3.select('#clear-selection').on('click', () => this.clearSelection());
        
        // Sidebar
        d3.select('#sidebar-close').on('click', () => this.closeSidebar());
        
        // Búsqueda
        d3.select('#search-input').on('input', function() {
            self.search(this.value);
        });
        
        // Cargar archivo
        d3.select('#file-input').on('change', function() {
            self.loadFile(this.files[0]);
        });
        
        // Resize
        window.addEventListener('resize', () => this.handleResize());
    }
    
    // ==================== INTERACCIONES ====================
    
    selectNode(d) {
        this.selectedNode = d;
        this.highlightConnections(d);
        this.showSidebar(d);
    }
    
    highlightConnections(d) {
        const connected = this.getConnectedNodes(d);
        connected.add(d.id);
        
        // Actualizar nodos
        this.nodes.classed('highlighted', n => connected.has(n.id));
        this.nodes.classed('dimmed', n => !connected.has(n.id));
        
        // Actualizar links
        this.links.classed('highlighted', l => 
            (l.source.id === d.id || l.target.id === d.id)
        );
        this.links.classed('dimmed', l => 
            !(l.source.id === d.id || l.target.id === d.id) &&
            !(connected.has(l.source.id) && connected.has(l.target.id))
        );
    }
    
    clearSelection() {
        this.selectedNode = null;
        this.nodes.classed('highlighted', false).classed('dimmed', false);
        this.links.classed('highlighted', false).classed('dimmed', false);
        this.closeSidebar();
    }
    
    // ==================== TOOLTIP ====================
    
    showTooltip(event, d) {
        const tooltip = d3.select('#tooltip');
        let content = '';
        
        const typeLabels = {
            congressperson: 'CONGRESISTA',
            familiar: 'FAMILIAR',
            entity: 'ENTIDAD',
            contract: 'CONTRATO'
        };
        
        switch(d.type) {
            case 'congressperson':
                content = `
                    <div class="tooltip-type ${d.type}">${typeLabels[d.type]}</div>
                    <div class="tooltip-title">${d.name}</div>
                    <div class="tooltip-grid">
                        <div class="tooltip-row">
                            <span class="tooltip-key">DNI</span>
                            <span class="tooltip-value">${d.dni}</span>
                        </div>
                        <div class="tooltip-row">
                            <span class="tooltip-key">Partido</span>
                            <span class="tooltip-value">${d.party || 'N/A'}</span>
                        </div>
                        <div class="tooltip-row">
                            <span class="tooltip-key">Comisión</span>
                            <span class="tooltip-value">${d.commission || 'N/A'}</span>
                        </div>
                        <div class="tooltip-row">
                            <span class="tooltip-key">Departamento</span>
                            <span class="tooltip-value">${d.department || 'N/A'}</span>
                        </div>
                    </div>
                `;
                break;
            case 'familiar':
                content = `
                    <div class="tooltip-type ${d.type}">${typeLabels[d.type]}</div>
                    <div class="tooltip-title">${d.name}</div>
                    <div class="tooltip-grid">
                        <div class="tooltip-row">
                            <span class="tooltip-key">DNI</span>
                            <span class="tooltip-value">${d.dni}</span>
                        </div>
                        <div class="tooltip-row">
                            <span class="tooltip-key">Parentesco</span>
                            <span class="tooltip-value">${d.parentesco || 'N/A'}</span>
                        </div>
                        ${d.ocupacion ? `
                        <div class="tooltip-row">
                            <span class="tooltip-key">Ocupación</span>
                            <span class="tooltip-value">${d.ocupacion}</span>
                        </div>` : ''}
                        ${d.lugarTrabajo ? `
                        <div class="tooltip-row">
                            <span class="tooltip-key">Lugar de trabajo</span>
                            <span class="tooltip-value">${d.lugarTrabajo}</span>
                        </div>` : ''}
                    </div>
                `;
                break;
            case 'entity':
                content = `
                    <div class="tooltip-type ${d.type}">${typeLabels[d.type]}</div>
                    <div class="tooltip-title">${d.name}</div>
                    <div class="tooltip-grid">
                        <div class="tooltip-row">
                            <span class="tooltip-key">RUC</span>
                            <span class="tooltip-value">${d.ruc}</span>
                        </div>
                        <div class="tooltip-row">
                            <span class="tooltip-key">Rubro</span>
                            <span class="tooltip-value">${d.rubro || 'N/A'}</span>
                        </div>
                        <div class="tooltip-row">
                            <span class="tooltip-key">Monto Total</span>
                            <span class="tooltip-value">${this.formatAmount(d.montoTotal)}</span>
                        </div>
                        <div class="tooltip-row">
                            <span class="tooltip-key">N° Contratos</span>
                            <span class="tooltip-value">${d.numContratos || 0}</span>
                        </div>
                    </div>
                `;
                break;
            case 'contract':
                content = `
                    <div class="tooltip-type ${d.type}">${typeLabels[d.type]}</div>
                    <div class="tooltip-title">${this.formatAmount(d.monto)}</div>
                    <div class="tooltip-grid">
                        <div class="tooltip-row">
                            <span class="tooltip-key">Entidad</span>
                            <span class="tooltip-value">${d.entidadContratante || 'N/A'}</span>
                        </div>
                        <div class="tooltip-row">
                            <span class="tooltip-key">Fecha</span>
                            <span class="tooltip-value">${this.formatDate(d.fecha)}</span>
                        </div>
                        ${d.vigencia ? `
                        <div class="tooltip-row">
                            <span class="tooltip-key">Estado</span>
                            <span class="tooltip-value">${d.vigencia}</span>
                        </div>` : ''}
                        <div class="tooltip-row">
                            <span class="tooltip-key">Descripción</span>
                            <span class="tooltip-value">${d.descripcion || 'N/A'}</span>
                        </div>
                    </div>
                `;
                break;
        }
        
        tooltip.html(content);
        tooltip.style('opacity', 1);
        this.updateTooltipPosition(event);
    }
    
    updateTooltipPosition(event) {
        const tooltip = d3.select('#tooltip');
        const tooltipNode = tooltip.node();
        const tooltipWidth = tooltipNode.offsetWidth;
        const tooltipHeight = tooltipNode.offsetHeight;
        
        let left = event.clientX + 15;
        let top = event.clientY + 15;
        
        // Ajustar si se sale de la pantalla
        if (left + tooltipWidth > window.innerWidth - 20) {
            left = event.clientX - tooltipWidth - 15;
        }
        if (top + tooltipHeight > window.innerHeight - 20) {
            top = event.clientY - tooltipHeight - 15;
        }
        
        tooltip
            .style('left', left + 'px')
            .style('top', top + 'px');
    }
    
    hideTooltip() {
        d3.select('#tooltip').style('opacity', 0);
    }
    
    // ==================== SIDEBAR ====================
    
    showSidebar(d) {
        const sidebar = d3.select('#sidebar');
        const content = d3.select('#sidebar-content');
        
        let html = '';
        const typeLabel = this.getTypeLabel(d.type);
        const color = CONFIG.colors[d.type];
        
        html += `
            <div class="sidebar-header">
                <span class="sidebar-type" style="background: ${color}20; color: ${color}">${typeLabel}</span>
                <h2 class="sidebar-title">${d.name || this.formatAmount(d.monto)}</h2>
                <p class="sidebar-subtitle">${d.party || d.parentesco || d.rubro || d.entidadContratante || ''}</p>
            </div>
        `;
        
        // Información específica según tipo
        switch(d.type) {
            case 'congressperson':
                html += `
                    <div class="sidebar-section">
                        <h3 class="sidebar-section-title">Información</h3>
                        <div class="sidebar-stat"><span>DNI</span><span class="sidebar-stat-value">${d.dni}</span></div>
                        <div class="sidebar-stat"><span>Partido</span><span>${d.party || 'N/A'}</span></div>
                        <div class="sidebar-stat"><span>Comisión</span><span>${d.commission || 'N/A'}</span></div>
                        <div class="sidebar-stat"><span>Departamento</span><span>${d.department || 'N/A'}</span></div>
                    </div>
                `;
                break;
            case 'familiar':
                html += `
                    <div class="sidebar-section">
                        <h3 class="sidebar-section-title">Información</h3>
                        <div class="sidebar-stat"><span>DNI</span><span class="sidebar-stat-value">${d.dni}</span></div>
                        <div class="sidebar-stat"><span>Parentesco</span><span>${d.parentesco || 'N/A'}</span></div>
                        <div class="sidebar-stat"><span>Ocupación</span><span>${d.ocupacion || 'N/A'}</span></div>
                        ${d.lugarTrabajo ? `<div class="sidebar-stat"><span>Lugar de Trabajo</span><span>${d.lugarTrabajo}</span></div>` : ''}
                        ${d.ruc ? `<div class="sidebar-stat"><span>RUC</span><span>${d.ruc}</span></div>` : ''}
                    </div>
                `;
                break;
            case 'entity':
                html += `
                    <div class="sidebar-section">
                        <h3 class="sidebar-section-title">Información</h3>
                        <div class="sidebar-stat"><span>RUC</span><span class="sidebar-stat-value">${d.ruc}</span></div>
                        <div class="sidebar-stat"><span>Rubro</span><span>${d.rubro || 'N/A'}</span></div>
                        <div class="sidebar-stat"><span>Monto Total</span><span class="sidebar-stat-value">${this.formatAmount(d.montoTotal)}</span></div>
                        <div class="sidebar-stat"><span>N° Contratos</span><span>${d.numContratos || 0}</span></div>
                    </div>
                `;
                break;
            case 'contract':
                html += `
                    <div class="sidebar-section">
                        <h3 class="sidebar-section-title">Información</h3>
                        <div class="sidebar-stat"><span>Monto</span><span class="sidebar-stat-value">${this.formatAmount(d.monto)}</span></div>
                        <div class="sidebar-stat"><span>Fecha</span><span>${this.formatDate(d.fecha)}</span></div>
                        ${d.vigencia ? `<div class="sidebar-stat"><span>Estado</span><span>${d.vigencia}</span></div>` : ''}
                        <div class="sidebar-stat"><span>Entidad Contratante</span><span>${d.entidadContratante || 'N/A'}</span></div>
                    </div>
                    <div class="sidebar-section">
                        <h3 class="sidebar-section-title">Descripción</h3>
                        <p style="font-size: 0.85rem; color: var(--text-secondary);">${d.descripcion || 'Sin descripción'}</p>
                    </div>
                `;
                break;
        }
        
        // Conexiones
        const connections = this.getDirectConnections(d);
        if (connections.length > 0) {
            html += `
                <div class="sidebar-section">
                    <h3 class="sidebar-section-title">Conexiones (${connections.length})</h3>
                    <div class="sidebar-connections">
            `;
            
            connections.forEach(conn => {
                const connColor = CONFIG.colors[conn.type];
                html += `
                    <div class="sidebar-connection" data-id="${conn.id}">
                        <div class="sidebar-connection-icon" style="background: ${connColor}20; color: ${connColor}">
                            ${conn.type === 'congressperson' ? '👤' : conn.type === 'familiar' ? '👥' : conn.type === 'entity' ? '🏢' : '📄'}
                        </div>
                        <div class="sidebar-connection-info">
                            <div class="sidebar-connection-name">${conn.name || this.formatAmount(conn.monto)}</div>
                            <div class="sidebar-connection-type">${this.getTypeLabel(conn.type)}</div>
                        </div>
                    </div>
                `;
            });
            
            html += `</div></div>`;
        }
        
        content.html(html);
        sidebar.classed('open', true);
        
        // Eventos para conexiones clickeables
        content.selectAll('.sidebar-connection').on('click', (event) => {
            const id = event.currentTarget.dataset.id;
            const node = this.data.nodes.find(n => n.id === id);
            if (node) this.selectNode(node);
        });
    }
    
    closeSidebar() {
        d3.select('#sidebar').classed('open', false);
    }
    
    getDirectConnections(d) {
        const connections = [];
        this.data.links.forEach(link => {
            if (link.source.id === d.id) {
                connections.push(link.target);
            } else if (link.target.id === d.id) {
                connections.push(link.source);
            }
        });
        return connections;
    }
    
    getConnectedNodes(d, depth = 2) {
        const connected = new Set();
        const queue = [{node: d, level: 0}];
        
        while (queue.length > 0) {
            const {node, level} = queue.shift();
            if (level > depth) continue;
            
            this.data.links.forEach(link => {
                if (link.source.id === node.id && !connected.has(link.target.id)) {
                    connected.add(link.target.id);
                    if (level < depth) queue.push({node: link.target, level: level + 1});
                } else if (link.target.id === node.id && !connected.has(link.source.id)) {
                    connected.add(link.source.id);
                    if (level < depth) queue.push({node: link.source, level: level + 1});
                }
            });
        }
        return connected;
    }
    
    // ==================== CONTROLES ====================
    
    zoomIn() {
        this.container.transition().call(this.zoom.scaleBy, 1.4);
    }
    
    zoomOut() {
        this.container.transition().call(this.zoom.scaleBy, 0.7);
    }
    
    resetView() {
        this.container.transition().duration(750).call(
            this.zoom.transform,
            d3.zoomIdentity.translate(0, 0).scale(1)
        );
    }
    
    search(query) {
        query = query.toLowerCase().trim();
        
        if (!query) {
            this.clearSelection();
            return;
        }
        
        const matches = this.data.nodes.filter(n =>
            (n.name && n.name.toLowerCase().includes(query)) ||
            (n.dni && n.dni.includes(query)) ||
            (n.ruc && n.ruc.includes(query))
        );
        
        if (matches.length > 0) {
            this.selectNode(matches[0]);
            // Centrar en el nodo
            const node = matches[0];
            const transform = d3.zoomIdentity
                .translate(this.width / 2 - node.x, this.height / 2 - node.y);
            this.container.transition().duration(500).call(this.zoom.transform, transform);
        }
    }
    
    // ==================== DATOS ====================
    
    loadFile(file) {
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                this.reloadData(data);
            } catch (err) {
                alert('Error al cargar el archivo JSON: ' + err.message);
            }
        };
        reader.readAsText(file);
    }
    
    reloadData(data) {
        // Limpiar
        this.g.selectAll('*').remove();
        this.simulation.stop();
        
        // Recargar
        this.data = this.processData(data);
        this.setupDefs();
        this.setupSimulation();
        this.createLinks();
        this.createNodes();
        this.updateStats();
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
    
    // ==================== UTILIDADES ====================
    
    dragStarted(event, d) {
        if (!event.active) this.simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
        this.hideTooltip();
    }
    
    dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }
    
    dragEnded(event, d) {
        if (!event.active) this.simulation.alphaTarget(0);
        if (!d._fx && !d._fy) {
            d.fx = null;
            d.fy = null;
        }
    }
    
    handleResize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.container.attr('width', this.width).attr('height', this.height);
        this.simulation.force('center', d3.forceCenter(this.width / 2, this.height / 2));
        this.simulation.alpha(0.3).restart();
    }
    
    hideLoader() {
        setTimeout(() => {
            d3.select('#loader').classed('hidden', true);
        }, 500);
    }
    
    getTypeLabel(type) {
        const labels = {
            congressperson: 'Congresista',
            familiar: 'Familiar',
            entity: 'Entidad',
            contract: 'Contrato'
        };
        return labels[type] || type;
    }
    
    formatAmount(amount) {
        if (!amount) return 'S/ 0';
        return `S/ ${amount.toLocaleString('es-PE', { minimumFractionDigits: 0 })}`;
    }
    
    formatDate(dateStr) {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-PE', { year: 'numeric', month: 'short', day: 'numeric' });
    }
    
    truncateName(name, maxLen = 25) {
        if (!name) return '';
        return name.length > maxLen ? name.substring(0, maxLen - 2) + '...' : name;
    }
    
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? 
            `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : 
            '255, 255, 255';
    }
}

// ============================================
// INICIALIZAR
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    window.networkViz = new NetworkVisualization('network-container', SAMPLE_DATA);
});