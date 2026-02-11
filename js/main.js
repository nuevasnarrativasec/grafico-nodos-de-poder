// ============================================
// CONFIGURACIÓN GLOBAL
// ============================================
const CONFIG = {
    nodeRadius: {
        congressperson: 42,
        familiar: 30,
        contract: 26,
        entity: 28
    },
    // Tamaños para formas no circulares
    nodeSize: {
        familiar: { width: 50, height: 44 },      // Hexágono
        contract: { width: 48, height: 32 },      // Rectángulo redondeado
        entity: { width: 44, height: 44 }         // Rombo
    },
    forces: {
        link: { 
            distance: { 
                'congressperson-familiar': 150, 
                'familiar-contract': 120, 
                'contract-entity': 90 
            }, 
            strength: 0.7 
        },
        charge: { congressperson: -800, familiar: -400, contract: -250, entity: -200 },
        collision: 30
    },
    colors: {
        congressperson: '#f59e0b',
        familiar: '#3b82f6',
        contract: '#10b981',
        entity: '#8b5cf6'
    },
    icons: {
        congressperson: '👤',
        familiar: '👥',
        contract: '📄',
        entity: '🏢'
    }
};

// ============================================
// DATOS DE EJEMPLO - NUEVO ORDEN: Congresista → Familiar → Contrato → Empresa
// ============================================
const SAMPLE_DATA = {
    nodes: [
        // Congresistas
        { id: "C001", type: "congressperson", name: "Ana María Zegarra López", dni: "42628319", party: "Alianza para el Progreso", commission: "Comisión de Economía", department: "Lima", photo: "./img/ana-zegarra.png" },
        { id: "C002", type: "congressperson", name: "José Luis Elías Ávalos", dni: "21569935", party: "Podemos Perú", commission: "Comisión de Transportes", department: "Ica", photo: "./img/jose-luis-elias.png" },
        { id: "C003", type: "congressperson", name: "Patricia Rosa Chirinos Venegas", dni: "10280036", party: "Avanza País", commission: "Junta de Portavoces", department: "Callao", photo: "./img/patricia-chirinos.png" },
        
        // Familiares
        { id: "F001", type: "familiar", name: "Hugo Hermilio Alvarado Apaza", dni: "04632989", parentesco: "Padre del Cónyuge", ocupacion: "Pescador Artesanal", congresspersonId: "C001" },
        { id: "F002", type: "familiar", name: "José Alfredo Alvarado Mamani", dni: "40448882", parentesco: "Cuñado(a)", ocupacion: "Chofer", lugarTrabajo: "Transportes Halcon SRL", ruc: "20456789012", congresspersonId: "C001" },
        { id: "F003", type: "familiar", name: "Deisy Paola Alvarado Mamani", dni: "42067814", parentesco: "Cuñado(a)", ocupacion: "Promotora Educativa", lugarTrabajo: "Programa Educación Básica", congresspersonId: "C001" },
        { id: "F004", type: "familiar", name: "Carlos Elías Mendoza", dni: "21234567", parentesco: "Hermano", ocupacion: "Gerente General", lugarTrabajo: "Constructora del Sur SAC", ruc: "20567891234", congresspersonId: "C002" },
        { id: "F005", type: "familiar", name: "María Elena Ávalos de Elías", dni: "21345678", parentesco: "Madre", ocupacion: "Comerciante", lugarTrabajo: "Distribuidora Ávalos EIRL", ruc: "20123456789", congresspersonId: "C002" },
        { id: "F006", type: "familiar", name: "Ricardo Venegas Pérez", dni: "10345678", parentesco: "Hermano", ocupacion: "Abogado", lugarTrabajo: "Estudio Venegas & Asociados", ruc: "20789012345", congresspersonId: "C003" },
        
        // Contratos (ahora conectados a familiares)
        { 
            id: "CT001", type: "contract", familiarId: "F002",
            fechaFirma: "2023-05-15", fechaFin: "2024-05-15", vigente: false,
            descripcion: "Servicio de transporte de materiales para PRONIED", 
            monto: 320000, entidadContratante: "PRONIED", 
            documentUrl: "https://osce.gob.pe/doc/123" 
        },
        { 
            id: "CT002", type: "contract", familiarId: "F002",
            fechaFirma: "2023-08-20", fechaFin: "2025-08-20", vigente: true,
            descripcion: "Transporte de equipos médicos - MINSA", 
            monto: 185000, entidadContratante: "MINSA", 
            documentUrl: "#" 
        },
        { 
            id: "CT003", type: "contract", familiarId: "F002",
            fechaFirma: "2024-01-10", fechaFin: null, vigente: true,
            descripcion: "Distribución de materiales educativos", 
            monto: 245000, entidadContratante: "MINEDU", 
            documentUrl: "#" 
        },
        { 
            id: "CT004", type: "contract", familiarId: "F004",
            fechaFirma: "2023-03-10", fechaFin: "2025-12-31", vigente: true,
            descripcion: "Construcción de puente vehicular - Ica", 
            monto: 2150000, entidadContratante: "MTC", 
            documentUrl: "#" 
        },
        { 
            id: "CT005", type: "contract", familiarId: "F004",
            fechaFirma: "2023-11-05", fechaFin: "2024-11-05", vigente: false,
            descripcion: "Mejoramiento de carretera regional", 
            monto: 1850000, entidadContratante: "Gobierno Regional Ica", 
            documentUrl: "#" 
        },
        { 
            id: "CT006", type: "contract", familiarId: "F005",
            fechaFirma: "2024-01-15", fechaFin: "2024-12-15", vigente: true,
            descripcion: "Provisión de alimentos - Qali Warma", 
            monto: 520000, entidadContratante: "Qali Warma", 
            documentUrl: "#" 
        },
        { 
            id: "CT007", type: "contract", familiarId: "F006",
            fechaFirma: "2023-06-20", fechaFin: "2023-12-20", vigente: false,
            descripcion: "Asesoría legal para proceso de licitación", 
            monto: 180000, entidadContratante: "ESSALUD", 
            documentUrl: "#" 
        },
        { 
            id: "CT008", type: "contract", familiarId: "F006",
            fechaFirma: "2024-02-01", fechaFin: null, vigente: true,
            descripcion: "Servicios de consultoría jurídica", 
            monto: 220000, entidadContratante: "Municipalidad del Callao", 
            documentUrl: "#" 
        },
        
        // Empresas (ahora conectadas a contratos)
        { id: "E001", type: "entity", name: "Transportes Halcon SRL", ruc: "20456789012", rubro: "Transporte de carga", montoTotal: 750000, numContratos: 3 },
        { id: "E002", type: "entity", name: "Constructora del Sur SAC", ruc: "20567891234", rubro: "Construcción", montoTotal: 4000000, numContratos: 2 },
        { id: "E003", type: "entity", name: "Distribuidora Ávalos EIRL", ruc: "20123456789", rubro: "Comercialización", montoTotal: 520000, numContratos: 1 },
        { id: "E004", type: "entity", name: "Estudio Venegas & Asociados", ruc: "20789012345", rubro: "Servicios legales", montoTotal: 400000, numContratos: 2 }
    ],
    links: [
        // Congresista → Familiares
        { source: "C001", target: "F001", type: "congressperson-familiar" },
        { source: "C001", target: "F002", type: "congressperson-familiar" },
        { source: "C001", target: "F003", type: "congressperson-familiar" },
        { source: "C002", target: "F004", type: "congressperson-familiar" },
        { source: "C002", target: "F005", type: "congressperson-familiar" },
        { source: "C003", target: "F006", type: "congressperson-familiar" },
        
        // Familiares → Contratos (NUEVO ORDEN)
        { source: "F002", target: "CT001", type: "familiar-contract" },
        { source: "F002", target: "CT002", type: "familiar-contract" },
        { source: "F002", target: "CT003", type: "familiar-contract" },
        { source: "F004", target: "CT004", type: "familiar-contract" },
        { source: "F004", target: "CT005", type: "familiar-contract" },
        { source: "F005", target: "CT006", type: "familiar-contract" },
        { source: "F006", target: "CT007", type: "familiar-contract" },
        { source: "F006", target: "CT008", type: "familiar-contract" },
        
        // Contratos → Empresas (NUEVO ORDEN)
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
        
        this.zoom = d3.zoom()
            .scaleExtent([0.1, 5])
            .on('zoom', (event) => {
                this.g.attr('transform', event.transform);
            });
        
        this.container.call(this.zoom);
    }
    
    setupDefs() {
        const defs = this.container.append('defs');
        
        // Patrones de fotos para congresistas
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
                .attr('stop-opacity', 0.6);
            
            gradient.append('stop')
                .attr('offset', '100%')
                .attr('stop-color', color)
                .attr('stop-opacity', 0);
        });
        
        // Filtro de sombra
        const filter = defs.append('filter')
            .attr('id', 'drop-shadow')
            .attr('x', '-50%')
            .attr('y', '-50%')
            .attr('width', '200%')
            .attr('height', '200%');
        
        filter.append('feDropShadow')
            .attr('dx', 0)
            .attr('dy', 2)
            .attr('stdDeviation', 4)
            .attr('flood-color', 'rgba(0,0,0,0.3)');
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
            .force('x', d3.forceX(this.width / 2).strength(0.03))
            .force('y', d3.forceY(this.height / 2).strength(0.03))
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
            .attr('data-target', d => d.target.id || d.target);
    }
    
    // Función para crear path de hexágono
    createHexagonPath(size) {
        const w = size.width / 2;
        const h = size.height / 2;
        return `M ${w} 0 L ${w * 0.5} ${-h} L ${-w * 0.5} ${-h} L ${-w} 0 L ${-w * 0.5} ${h} L ${w * 0.5} ${h} Z`;
    }
    
    // Función para crear path de rombo
    createDiamondPath(size) {
        const w = size.width / 2;
        const h = size.height / 2;
        return `M 0 ${-h} L ${w} 0 L 0 ${h} L ${-w} 0 Z`;
    }
    
    // Función para crear rectángulo redondeado
    createRoundedRectPath(size, radius = 6) {
        const w = size.width / 2;
        const h = size.height / 2;
        const r = Math.min(radius, w, h);
        return `M ${-w + r} ${-h} 
                L ${w - r} ${-h} 
                Q ${w} ${-h} ${w} ${-h + r}
                L ${w} ${h - r}
                Q ${w} ${h} ${w - r} ${h}
                L ${-w + r} ${h}
                Q ${-w} ${h} ${-w} ${h - r}
                L ${-w} ${-h + r}
                Q ${-w} ${-h} ${-w + r} ${-h} Z`;
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
        
        // Crear diferentes formas según el tipo
        this.nodes.each((d, i, nodes) => {
            const node = d3.select(nodes[i]);
            
            if (d.type === 'congressperson') {
                // CÍRCULO para congresistas
                const r = CONFIG.nodeRadius.congressperson;
                
                // Anillo exterior
                node.append('circle')
                    .attr('class', 'node-ring')
                    .attr('r', r + 6);
                
                // Círculo principal
                node.append('circle')
                    .attr('class', 'node-circle')
                    .attr('r', r);
                
                // Foto o icono
                if (d.photo) {
                    node.append('circle')
                        .attr('r', r - 4)
                        .attr('fill', `url(#photo-${d.id})`);
                } else {
                    node.append('text')
                        .attr('class', 'node-icon')
                        .attr('text-anchor', 'middle')
                        .attr('dominant-baseline', 'central')
                        .attr('font-size', '20px')
                        .text(CONFIG.icons.congressperson);
                }
                
            } else if (d.type === 'familiar') {
                // HEXÁGONO para familiares
                const size = CONFIG.nodeSize.familiar;
                const hexPath = this.createHexagonPath(size);
                
                // Anillo exterior
                const outerSize = { width: size.width + 12, height: size.height + 10 };
                node.append('path')
                    .attr('class', 'node-ring')
                    .attr('d', this.createHexagonPath(outerSize));
                
                // Hexágono principal
                node.append('path')
                    .attr('class', 'node-shape')
                    .attr('d', hexPath);
                
                // Icono
                node.append('text')
                    .attr('class', 'node-icon')
                    .attr('text-anchor', 'middle')
                    .attr('dominant-baseline', 'central')
                    .attr('font-size', '16px')
                    .text(CONFIG.icons.familiar);
                    
            } else if (d.type === 'contract') {
                // RECTÁNGULO REDONDEADO para contratos
                const size = CONFIG.nodeSize.contract;
                const rectPath = this.createRoundedRectPath(size, 8);
                
                // Anillo exterior
                const outerSize = { width: size.width + 10, height: size.height + 10 };
                node.append('path')
                    .attr('class', 'node-ring')
                    .attr('d', this.createRoundedRectPath(outerSize, 10));
                
                // Rectángulo principal
                node.append('path')
                    .attr('class', 'node-shape')
                    .attr('d', rectPath);
                
                // Indicador de vigencia
                if (d.vigente) {
                    node.append('circle')
                        .attr('class', 'vigencia-indicator vigente')
                        .attr('cx', size.width / 2 - 4)
                        .attr('cy', -size.height / 2 + 4)
                        .attr('r', 5);
                }
                
                // Icono
                node.append('text')
                    .attr('class', 'node-icon')
                    .attr('text-anchor', 'middle')
                    .attr('dominant-baseline', 'central')
                    .attr('font-size', '14px')
                    .text(CONFIG.icons.contract);
                    
            } else if (d.type === 'entity') {
                // ROMBO para empresas
                const size = CONFIG.nodeSize.entity;
                const diamondPath = this.createDiamondPath(size);
                
                // Anillo exterior
                const outerSize = { width: size.width + 12, height: size.height + 12 };
                node.append('path')
                    .attr('class', 'node-ring')
                    .attr('d', this.createDiamondPath(outerSize));
                
                // Rombo principal
                node.append('path')
                    .attr('class', 'node-shape')
                    .attr('d', diamondPath);
                
                // Icono
                node.append('text')
                    .attr('class', 'node-icon')
                    .attr('text-anchor', 'middle')
                    .attr('dominant-baseline', 'central')
                    .attr('font-size', '14px')
                    .text(CONFIG.icons.entity);
            }
            
            // Etiquetas para todos
            const labelY = this.getLabelOffset(d.type);
            
            // Texto principal
            if (d.type === 'contract') {
                // Para contratos: monto + vigencia
                node.append('text')
                    .attr('class', 'node-label')
                    .attr('y', labelY)
                    .text(this.formatAmount(d.monto));
                
                // Sublabel con vigencia
                const vigenciaText = this.getVigenciaText(d);
                node.append('text')
                    .attr('class', 'node-sublabel vigencia-text')
                    .attr('y', labelY + 12)
                    .text(vigenciaText);
            } else {
                node.append('text')
                    .attr('class', 'node-label')
                    .attr('y', labelY)
                    .text(this.truncateName(d.name));
                
                // Sublabel
                const sublabel = d.party || d.parentesco || d.rubro || '';
                if (sublabel) {
                    node.append('text')
                        .attr('class', 'node-sublabel')
                        .attr('y', labelY + 12)
                        .text(this.truncateName(sublabel, 20));
                }
            }
        });
    }
    
    getLabelOffset(type) {
        const offsets = {
            congressperson: CONFIG.nodeRadius.congressperson + 14,
            familiar: CONFIG.nodeSize.familiar.height / 2 + 14,
            contract: CONFIG.nodeSize.contract.height / 2 + 14,
            entity: CONFIG.nodeSize.entity.height / 2 + 14
        };
        return offsets[type] || 30;
    }
    
    getVigenciaText(contract) {
        if (contract.vigente) {
            if (contract.fechaFin) {
                return `Vigente hasta ${this.formatDateShort(contract.fechaFin)}`;
            }
            return `Vigente desde ${this.formatDateShort(contract.fechaFirma)}`;
        } else {
            return `Finalizado ${this.formatDateShort(contract.fechaFin || contract.fechaFirma)}`;
        }
    }
    
    tick() {
        this.links.attr('d', d => {
            const dx = d.target.x - d.source.x;
            const dy = d.target.y - d.source.y;
            const dr = Math.sqrt(dx * dx + dy * dy) * 1.5;
            return `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`;
        });
        
        this.nodes.attr('transform', d => `translate(${d.x},${d.y})`);
    }
    
    setupEvents() {
        const self = this;
        
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
        
        this.container.on('click', () => this.clearSelection());
        
        d3.select('#zoom-in').on('click', () => this.zoomIn());
        d3.select('#zoom-out').on('click', () => this.zoomOut());
        d3.select('#reset-view').on('click', () => this.resetView());
        d3.select('#clear-selection').on('click', () => this.clearSelection());
        
        d3.select('#sidebar-close').on('click', () => this.closeSidebar());
        
        d3.select('#search-input').on('input', function() {
            self.search(this.value);
        });
        
        d3.select('#file-input').on('change', function() {
            self.loadFile(this.files[0]);
        });
        
        window.addEventListener('resize', () => this.handleResize());
    }
    
    // ==================== INTERACCIONES ====================
    
    selectNode(d) {
        this.selectedNode = d;
        this.highlightConnections(d);
        this.showSidebar(d);
    }
    
    highlightConnections(d) {
        this.highlightedNodes.clear();
        this.highlightedLinks.clear();
        
        const findConnections = (nodeId, visited = new Set()) => {
            if (visited.has(nodeId)) return;
            visited.add(nodeId);
            this.highlightedNodes.add(nodeId);
            
            this.data.links.forEach(link => {
                const sourceId = link.source.id || link.source;
                const targetId = link.target.id || link.target;
                
                if (sourceId === nodeId || targetId === nodeId) {
                    this.highlightedLinks.add(`${sourceId}-${targetId}`);
                    findConnections(sourceId === nodeId ? targetId : sourceId, visited);
                }
            });
        };
        
        findConnections(d.id);
        this.applyHighlight();
    }
    
    applyHighlight() {
        this.nodes
            .classed('highlighted', n => this.highlightedNodes.has(n.id))
            .classed('dimmed', n => this.highlightedNodes.size > 0 && !this.highlightedNodes.has(n.id));
        
        this.links
            .classed('highlighted', l => {
                const key = `${l.source.id || l.source}-${l.target.id || l.target}`;
                return this.highlightedLinks.has(key);
            })
            .classed('dimmed', l => {
                if (this.highlightedLinks.size === 0) return false;
                const key = `${l.source.id || l.source}-${l.target.id || l.target}`;
                return !this.highlightedLinks.has(key);
            });
    }
    
    clearSelection() {
        this.selectedNode = null;
        this.highlightedNodes.clear();
        this.highlightedLinks.clear();
        this.applyHighlight();
        this.closeSidebar();
    }
    
    // ==================== TOOLTIP ====================
    
    showTooltip(event, d) {
        const tooltip = d3.select('#tooltip');
        let content = `<span class="tooltip-badge ${d.type}">${this.getTypeLabel(d.type)}</span>`;
        content += `<div class="tooltip-title">${d.name || this.formatAmount(d.monto)}</div>`;
        content += '<div class="tooltip-grid">';
        
        const rows = this.getTooltipRows(d);
        rows.forEach(([key, value, highlight]) => {
            content += `<div class="tooltip-row">
                <span class="tooltip-key">${key}</span>
                <span class="tooltip-value${highlight ? ' highlight' : ''}">${value}</span>
            </div>`;
        });
        
        content += '</div>';
        
        if (d.documentUrl && d.documentUrl !== '#') {
            content += `<a href="${d.documentUrl}" class="tooltip-action" target="_blank">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                    <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
                Ver documento
            </a>`;
        }
        
        tooltip.html(content);
        
        const tooltipNode = tooltip.node();
        const tooltipRect = tooltipNode.getBoundingClientRect();
        let left = event.pageX + 20;
        let top = event.pageY - 10;
        
        if (left + tooltipRect.width > window.innerWidth - 20) {
            left = event.pageX - tooltipRect.width - 20;
        }
        if (top + tooltipRect.height > window.innerHeight - 20) {
            top = window.innerHeight - tooltipRect.height - 20;
        }
        if (top < 20) top = 20;
        
        tooltip
            .style('left', `${left}px`)
            .style('top', `${top}px`)
            .classed('visible', true);
    }
    
    hideTooltip() {
        d3.select('#tooltip').classed('visible', false);
    }
    
    updateTooltipPosition(event) {
        const tooltip = d3.select('#tooltip');
        if (tooltip.classed('visible')) {
            const tooltipNode = tooltip.node();
            const tooltipRect = tooltipNode.getBoundingClientRect();
            let left = event.pageX + 20;
            let top = event.pageY - 10;
            
            if (left + tooltipRect.width > window.innerWidth - 20) {
                left = event.pageX - tooltipRect.width - 20;
            }
            if (top + tooltipRect.height > window.innerHeight - 20) {
                top = window.innerHeight - tooltipRect.height - 20;
            }
            if (top < 20) top = 20;
            
            tooltip
                .style('left', `${left}px`)
                .style('top', `${top}px`);
        }
    }
    
    getTooltipRows(d) {
        const rows = [];
        switch (d.type) {
            case 'congressperson':
                rows.push(['DNI', d.dni]);
                rows.push(['Partido', d.party]);
                if (d.commission) rows.push(['Comisión', d.commission]);
                if (d.department) rows.push(['Departamento', d.department]);
                break;
            case 'familiar':
                rows.push(['DNI', d.dni]);
                rows.push(['Parentesco', d.parentesco]);
                rows.push(['Ocupación', d.ocupacion]);
                if (d.lugarTrabajo) rows.push(['Lugar de trabajo', d.lugarTrabajo]);
                if (d.ruc) rows.push(['RUC empresa', d.ruc]);
                break;
            case 'entity':
                rows.push(['RUC', d.ruc]);
                rows.push(['Rubro', d.rubro]);
                rows.push(['Monto total', this.formatAmount(d.montoTotal), true]);
                rows.push(['N° contratos', d.numContratos]);
                break;
            case 'contract':
                rows.push(['Fecha firma', this.formatDate(d.fechaFirma)]);
                if (d.fechaFin) {
                    rows.push(['Fecha fin', this.formatDate(d.fechaFin)]);
                }
                rows.push(['Estado', d.vigente ? '✅ Vigente' : '⏹️ Finalizado', true]);
                rows.push(['Descripción', d.descripcion]);
                rows.push(['Monto', this.formatAmount(d.monto), true]);
                rows.push(['Entidad contratante', d.entidadContratante]);
                break;
        }
        return rows;
    }
    
    // ==================== SIDEBAR ====================
    
    showSidebar(d) {
        const sidebar = d3.select('#sidebar');
        const content = d3.select('#sidebar-content');
        
        let html = `
            <div class="sidebar-header">
                <span class="sidebar-badge tooltip-badge ${d.type}">${this.getTypeLabel(d.type)}</span>
                <h2 class="sidebar-title">${d.name || this.formatAmount(d.monto)}</h2>
                <p class="sidebar-subtitle">${d.party || d.parentesco || d.rubro || d.entidadContratante || ''}</p>
            </div>
        `;
        
        html += '<div class="sidebar-section"><h3 class="sidebar-section-title">Información</h3>';
        const rows = this.getTooltipRows(d);
        rows.forEach(([key, value, highlight]) => {
            html += `<div class="sidebar-stat">
                <span>${key}</span>
                <span class="sidebar-stat-value" style="${highlight ? '' : 'color: var(--text-primary)'}">${value}</span>
            </div>`;
        });
        html += '</div>';
        
        // Sección especial de vigencia para contratos
        if (d.type === 'contract') {
            html += `
                <div class="sidebar-section">
                    <h3 class="sidebar-section-title">Vigencia del Contrato</h3>
                    <div class="vigencia-card ${d.vigente ? 'vigente' : 'finalizado'}">
                        <div class="vigencia-status">
                            <span class="vigencia-icon">${d.vigente ? '🟢' : '🔴'}</span>
                            <span class="vigencia-label">${d.vigente ? 'CONTRATO VIGENTE' : 'CONTRATO FINALIZADO'}</span>
                        </div>
                        <div class="vigencia-dates">
                            <div class="vigencia-date">
                                <span class="date-label">Inicio:</span>
                                <span class="date-value">${this.formatDate(d.fechaFirma)}</span>
                            </div>
                            ${d.fechaFin ? `
                            <div class="vigencia-date">
                                <span class="date-label">Fin:</span>
                                <span class="date-value">${this.formatDate(d.fechaFin)}</span>
                            </div>
                            ` : `
                            <div class="vigencia-date">
                                <span class="date-label">Fin:</span>
                                <span class="date-value">Sin fecha definida</span>
                            </div>
                            `}
                        </div>
                    </div>
                </div>
            `;
        }
        
        const connections = this.getConnections(d);
        if (connections.length > 0) {
            html += '<div class="sidebar-section"><h3 class="sidebar-section-title">Conexiones</h3>';
            html += '<div class="sidebar-connections">';
            connections.forEach(conn => {
                const bgColor = `rgba(${this.hexToRgb(CONFIG.colors[conn.type])}, 0.15)`;
                const shapeClass = conn.type === 'familiar' ? 'hexagon' : 
                                   conn.type === 'contract' ? 'rectangle' : 
                                   conn.type === 'entity' ? 'diamond' : 'circle';
                html += `<div class="sidebar-connection" data-id="${conn.id}">
                    <div class="sidebar-connection-icon shape-${shapeClass}" style="background: ${bgColor}">${CONFIG.icons[conn.type]}</div>
                    <div class="sidebar-connection-info">
                        <div class="sidebar-connection-name">${conn.name || this.formatAmount(conn.monto)}</div>
                        <div class="sidebar-connection-type">${this.getTypeLabel(conn.type)}</div>
                    </div>
                </div>`;
            });
            html += '</div></div>';
        }
        
        content.html(html);
        sidebar.classed('visible', true);
        
        const self = this;
        content.selectAll('.sidebar-connection').on('click', function() {
            const id = this.getAttribute('data-id');
            const node = self.data.nodes.find(n => n.id === id);
            if (node) self.selectNode(node);
        });
    }
    
    closeSidebar() {
        d3.select('#sidebar').classed('visible', false);
    }
    
    getConnections(d) {
        const connected = [];
        this.data.links.forEach(link => {
            const sourceId = link.source.id || link.source;
            const targetId = link.target.id || link.target;
            
            if (sourceId === d.id) {
                const node = this.data.nodes.find(n => n.id === targetId);
                if (node) connected.push(node);
            } else if (targetId === d.id) {
                const node = this.data.nodes.find(n => n.id === sourceId);
                if (node) connected.push(node);
            }
        });
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
        this.g.selectAll('*').remove();
        this.simulation.stop();
        
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
            entity: 'Empresa',
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
    
    formatDateShort(dateStr) {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-PE', { year: '2-digit', month: 'short' });
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