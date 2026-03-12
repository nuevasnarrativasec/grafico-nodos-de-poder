// ============================================
// DATOS: cargados desde js/data.js
// Asegúrate de incluir <script src="./js/data.js"></script>
// antes de este archivo en el HTML.
// ============================================

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
        link: { distance: { 'congressperson-familiar': 90, 'familiar-contract': 120, 'contract-entity': 100 }, strength: 0.5 },
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
        this.expandedCongresspersonId = null;

        // ── Detección de dispositivo móvil / táctil ──
        this.isMobile = window.matchMedia('(max-width: 768px)').matches
                     || ('ontouchstart' in window)
                     || (navigator.maxTouchPoints > 0);

        // Frame counter para throttle de tick en móvil
        this._tickFrame = 0;
        this._rafPending = false;
        
        this.init();
    }
    
    processData(data) {
        const nodes = [];
        const links = [];
        const ctExpansionMap = new Map();

        data.nodes.forEach(n => {
            if (n.type === 'contract' && n.detalles && n.detalles.length > 0) {
                const individualIds = [];
                n.detalles.forEach((det, i) => {
                    const newId = `${n.id}_${i}`;
                    individualIds.push(newId);
                    nodes.push({
                        ...n,
                        id: newId,
                        monto: det.monto,
                        fecha: det.fecha,
                        descripcion: det.descripcion || det.objeto || '',
                        objeto: det.objeto || '',
                        entidadContratante: det.entidad_contratante || n.entidadContratante,
                        estado: det.estado || '',
                        numContratos: 1,
                        detalles: [det],
                        tipo: det.tipo,
                        _originalCtId: n.id
                    });
                });
                ctExpansionMap.set(n.id, individualIds);
            } else {
                nodes.push({...n});
            }
        });

        data.links.forEach(l => {
            const src = typeof l.source === 'object' ? l.source.id : l.source;
            const tgt = typeof l.target === 'object' ? l.target.id : l.target;
            if (l.type === 'familiar-contract' && ctExpansionMap.has(tgt)) {
                ctExpansionMap.get(tgt).forEach(newId => {
                    links.push({ source: src, target: newId, type: 'familiar-contract' });
                });
            } else if (l.type === 'contract-entity' && ctExpansionMap.has(src)) {
                ctExpansionMap.get(src).forEach(newId => {
                    links.push({ source: newId, target: tgt, type: 'contract-entity' });
                });
            } else {
                links.push({ source: src, target: tgt, type: l.type });
            }
        });

        return { nodes, links };
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
        
        // En móvil el zoom mínimo es ligeramente mayor para evitar perder nodos
        const minScale = this.isMobile ? 0.08 : 0.05;
        this.zoom = d3.zoom()
            .scaleExtent([minScale, 5])
            .on('zoom', (event) => {
                this.g.attr('transform', event.transform);
            });
        
        this.container.call(this.zoom);

        // Habilitar touch drag sin interferir con el scroll del navegador
        const svgEl = this.container.node();
        svgEl.style.touchAction = 'none';
        svgEl.style.webkitTapHighlightColor = 'transparent';
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

        // En móvil: convergencia más rápida para no bloquear el hilo principal
        const alphaDecay    = this.isMobile ? 0.05  : 0.028;
        const velocityDecay = this.isMobile ? 0.65  : 0.45;
        const collRadius    = this.isMobile
            ? CONFIG.forces.collisionCollapsed * 0.8
            : CONFIG.forces.collisionCollapsed;

        this.simulation = d3.forceSimulation(this.data.nodes)
            .force('link', d3.forceLink(this.data.links)
                .id(d => d.id)
                .distance(d => CONFIG.forces.link.distance[d.type] || 110)
                .strength(d => d.type === 'congressperson-familiar' ? 0 : CONFIG.forces.link.strength))
            .force('charge', d3.forceManyBody()
                .strength(d => charge[d.type] || -120)
                // En móvil, limitar el alcance del forceManyBody para reducir O(n²) cálculos
                .distanceMax(this.isMobile ? 350 : Infinity))
            .force('center', d3.forceCenter(this.width / 2, this.height / 2))
            .force('collision', d3.forceCollide()
                .radius(d => CONFIG.nodeRadius[d.type] + collRadius))
            .alphaDecay(alphaDecay)
            .velocityDecay(velocityDecay)
            // Stop simulation once physics settle — prevents infinite CPU burn
            // and the slow floating effect on congressperson nodes
            .alphaMin(0.001);

        // ── Throttle de renderizado con RAF en móvil ──
        // Solo pintamos cada 2 ticks de la simulación (≈ 30fps efectivos),
        // pero la física sigue corriendo cada tick. Esto alivia la GPU en móvil.
        if (this.isMobile) {
            this.simulation.on('tick', () => {
                this._tickFrame++;
                if (this._tickFrame % 2 !== 0) return;
                if (!this._rafPending) {
                    this._rafPending = true;
                    requestAnimationFrame(() => {
                        this.tick();
                        this._rafPending = false;
                    });
                }
            });
        } else {
            this.simulation.on('tick', () => this.tick());
        }

        // ── When physics settle: pin all CP nodes so they stay fixed,
        //    do a final render pass, then stop the simulation entirely.
        //    This is the key optimization: no more continuous tick() means
        //    pan/zoom is pure SVG transform — no JS overhead at all.
        this.simulation.on('end', () => this._onSimulationEnd());
    }

    _onSimulationEnd() {
        // Pin each congressperson at its final physics position
        this.data.nodes
            .filter(n => n.type === 'congressperson' && n.fx == null)
            .forEach(n => { n.fx = n.x; n.fy = n.y; });
        // One final render so positions are committed to DOM
        this.tick();
    }

    // ==================== LAYOUT CALCULATOR ====================

    /**
     * Compute fixed (x,y) positions for an expanded congressperson network
     * using concentric rings — no physics, fully deterministic.
     */
    _calcNetworkLayout(cx, cy, familiars, contracts, entities) {
        const positions = {};

        const familiarArr = [...familiars];
        const nFam = familiarArr.length;

        // Ring 1: familiars evenly around the congressperson
        const famRadius = Math.max(130, nFam * 28);
        familiarArr.forEach((fid, i) => {
            const angle = (2 * Math.PI * i / nFam) - Math.PI / 2;
            positions[fid] = {
                x: cx + famRadius * Math.cos(angle),
                y: cy + famRadius * Math.sin(angle),
                angle
            };
        });

        // Ring 2: contracts fanned around each familiar
        familiarArr.forEach(fid => {
            const fp = positions[fid];
            const famContracts = this.data.links
                .filter(l => (l.source.id || l.source) === fid && l.type === 'familiar-contract')
                .map(l => l.target.id || l.target)
                .filter(id => contracts.has(id));

            const nCt = famContracts.length;
            if (nCt === 0) return;

            const ctRadius = Math.max(100, nCt * 22);
            const spreadAngle = Math.min(Math.PI * 0.9, nCt * 0.38);
            const baseAngle = fp.angle; // fan outward from congressperson

            famContracts.forEach((ctId, i) => {
                const t = nCt === 1 ? 0 : (i / (nCt - 1) - 0.5);
                const angle = baseAngle + t * spreadAngle;
                positions[ctId] = {
                    x: fp.x + ctRadius * Math.cos(angle),
                    y: fp.y + ctRadius * Math.sin(angle),
                    angle
                };
            });
        });

        // Ring 3: entities placed beyond their contract
        [...entities].forEach(eid => {
            // Find the contract(s) pointing to this entity
            const srcLink = this.data.links.find(l =>
                (l.target.id || l.target) === eid && l.type === 'contract-entity'
            );
            if (!srcLink) return;
            const ctId = srcLink.source.id || srcLink.source;
            const cp = positions[ctId];
            if (!cp) return;
            const angle = cp.angle;
            positions[eid] = {
                x: cp.x + 90 * Math.cos(angle),
                y: cp.y + 90 * Math.sin(angle),
                angle
            };
        });

        return positions;
    }

    // ==================== EXPAND / COLLAPSE ====================

    _pinExpandedNodes(positions) {
        // Pin each node at its calculated position using fx/fy
        // The simulation keeps running so tick() redraws links correctly
        Object.entries(positions).forEach(([id, pos]) => {
            const node = this.data.nodes.find(n => n.id === id);
            if (!node) return;
            node.x = pos.x; node.y = pos.y;
            node.fx = pos.x; node.fy = pos.y;
        });
    }

    _unpinNetworkNodes(nodeIds) {
        // Release fx/fy so nodes can move freely again in the simulation
        nodeIds.forEach(id => {
            const node = this.data.nodes.find(n => n.id === id);
            if (node && node.type !== 'congressperson') {
                node.fx = null; node.fy = null;
            }
        });
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
            if (d.type === 'congressperson-familiar') {
                return `M${startX},${startY}L${endX},${endY}`;
            }
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

        if (this.expandedCongresspersonId) {
            this._collapseNetwork(this.expandedCongresspersonId);
        }

        if (wasExpanded) {
            this.expandedCongresspersonId = null;
            this.selectedNode = null;
            this._dimCongresspersons(null);
            this.closeSidebar();
            this.hidePinnedPanel();
            this.updateStats(null);
            return;
        }

        this.expandedCongresspersonId = cid;
        this._dimCongresspersons(cid);

        // Pin the congressperson in place
        d.fx = d.x; d.fy = d.y;
        this._pinnedNode = d;

        const { familiars, contracts, entities } = this.getCongresspersonNetwork(cid);
        const positions = this._calcNetworkLayout(d.x, d.y, familiars, contracts, entities);

        // Pin all network nodes at calculated positions
        this._pinExpandedNodes(positions);

        // Commit link paths immediately using pinned positions — no need
        // to keep the simulation running just to redraw them
        this.tick();

        const allNetworkNodes = [
            ...this.data.nodes.filter(n => familiars.has(n.id)),
            ...this.data.nodes.filter(n => contracts.has(n.id)),
            ...this.data.nodes.filter(n => entities.has(n.id))
        ];

        allNetworkNodes.forEach(node => {
            node._visible = true;
            const pos = positions[node.id];
            if (!pos) return;
            d3.select(`.node[data-id="${node.id}"]`)
                .style('pointer-events', 'all')
                .transition().duration(450).ease(d3.easeCubicOut)
                .style('opacity', 1)
                .attr('transform', `translate(${pos.x},${pos.y}) scale(1)`);
        });

        // Fade in links — paths are already correct from the tick() above
        this.links.each(function(l) {
            const src = l.source.id || l.source;
            const tgt = l.target.id || l.target;
            const belongs =
                (src === cid && familiars.has(tgt)) ||
                (familiars.has(src) && contracts.has(tgt)) ||
                (contracts.has(src) && entities.has(tgt));
            if (belongs) {
                d3.select(this)
                    .transition().delay(180).duration(350)
                    .style('opacity', 1).style('pointer-events', 'all');
            }
        });

        d3.select(`.node[data-id="${cid}"] .node-glow`)
            .transition().duration(400).style('opacity', 0.7);

        this._centerOnNode(d);
        this.selectedNode = d;
        this.updateStats(cid);
    }

    expandFamiliar(d) {
        const cid = d.congresspersonId;
        if (!cid) return;

        this.links.transition().duration(200).style('opacity', 0).style('pointer-events', 'none');
        this.data.nodes.filter(n => n.type !== 'congressperson').forEach(n => {
            n._visible = false; n.fx = null; n.fy = null;
        });
        this.nodes.filter(n => n.type !== 'congressperson')
            .transition().duration(200)
            .style('opacity', 0).style('pointer-events', 'none')
            .attr('transform', n => `translate(${n.x},${n.y}) scale(0)`);

        const congress = this.data.nodes.find(n => n.id === cid);
        const { familiars } = this.getCongresspersonNetwork(cid);
        const { contracts, entities } = this.getCongresspersonNetwork(cid, d.id);
        const positions = this._calcNetworkLayout(congress.x, congress.y, familiars, contracts, entities);

        // Pin nodes at calculated positions, then commit link paths statically
        this._pinExpandedNodes(positions);
        this.tick();

        const order = [
            ...this.data.nodes.filter(n => familiars.has(n.id)),
            ...this.data.nodes.filter(n => contracts.has(n.id)),
            ...this.data.nodes.filter(n => entities.has(n.id))
        ];

        order.forEach(node => {
            const pos = positions[node.id];
            if (!pos) return;
            node._visible = true;
            const isFocus = node.id === d.id;
            d3.select(`.node[data-id="${node.id}"]`)
                .style('pointer-events', 'all')
                .transition().duration(350).ease(d3.easeCubicOut)
                .style('opacity', isFocus ? 1 : 0.55)
                .attr('transform', `translate(${pos.x},${pos.y}) scale(${isFocus ? 1.1 : 1})`);
        });

        this.links.each(function(l) {
            const src = l.source.id || l.source;
            const tgt = l.target.id || l.target;
            const belongs =
                (src === cid && familiars.has(tgt)) ||
                (src === d.id && contracts.has(tgt)) ||
                (contracts.has(src) && entities.has(tgt));
            if (belongs) {
                d3.select(this)
                    .transition().delay(150).duration(350)
                    .style('opacity', 1).style('pointer-events', 'all');
            }
        });

        this.selectedNode = d;
        this._panToNode(d);
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

        // Release the pinned congressperson so it can be re-pinned below
        if (this._pinnedNode) {
            this._pinnedNode.fx = null;
            this._pinnedNode.fy = null;
            this._pinnedNode = null;
        }

        // Unpin expanded nodes — re-pin CP node so it stays exactly where it is
        // No simulation restart needed: next expand uses deterministic layout anyway
        setTimeout(() => {
            this._unpinNetworkNodes([...allIds]);
            // Re-pin the congressperson at its current position so it doesn't drift
            const cpNode = this.data.nodes.find(n => n.id === congresspersonId);
            if (cpNode) { cpNode.fx = cpNode.x; cpNode.fy = cpNode.y; }
        }, 300);
    }

    _dimCongresspersons(activeCid) {
        this.nodes.filter(d => d.type === 'congressperson')
            .transition().duration(300)
            .style('opacity', d => activeCid === null ? 1 : (d.id === activeCid ? 1 : 0.35));
    }

    // ==================== EVENTS ====================
    
    setupEvents() {
        const self = this;

        // ── En escritorio: eventos hover para tooltip ──
        // En táctil: no hay hover real; el tooltip se muestra brevemente al tocar
        if (!this.isMobile) {
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
                .on('mousemove', function(event) { self.updateTooltipPosition(event); });
        } else {
            // En móvil: mostrar tooltip brevemente al tocar (se oculta solo)
            this.nodes.on('touchstart', function(event, d) {
                event.stopPropagation();
                self.showTooltip(event.touches[0] || event, d);
                clearTimeout(self._tooltipTimeout);
                self._tooltipTimeout = setTimeout(() => self.hideTooltip(), 2200);
            }, { passive: true });
        }

        // ── Click / tap: expandir nodos ──
        this.nodes.on('click', function(event, d) {
            event.stopPropagation();
            if (self.isMobile) self.hideTooltip();
            if (d.type === 'congressperson') {
                self.expandCongressperson(d);
            } else if (d.type === 'familiar') {
                self.expandFamiliar(d);
            } else {
                self.selectedNode = d;
                self._panToNode(d);
            }
        });
        
        this.container.on('click', () => {
            if (this.expandedCongresspersonId) {
                this._collapseNetwork(this.expandedCongresspersonId);
                this.expandedCongresspersonId = null;
                this._dimCongresspersons(null);
                this.closeSidebar();
                this.hidePinnedPanel();
                this.updateStats(null);
            }
        });
        
        d3.select('#zoom-in').on('click', () => this.zoomIn());
        d3.select('#zoom-out').on('click', () => this.zoomOut());
        d3.select('#reset-view').on('click', () => this.resetView());
        d3.select('#clear-selection').on('click', () => this.clearSelection());
        d3.select('#sidebar-close').on('click', () => this.closeSidebar());
        d3.select('#file-input').on('change', function() { self.loadFile(this.files[0]); });
        // ── Disclaimer acordeón: el toggle vive en el HTML inline script,
        //    pero vinculamos el chevron button también desde aquí por robustez ──
        const disclaimerChevron = document.getElementById('disclaimer-chevron');
        const disclaimerAccordion = document.getElementById('disclaimer-accordion');
        if (disclaimerChevron && disclaimerAccordion) {
            disclaimerChevron.addEventListener('click', (e) => {
                e.stopPropagation();
                disclaimerAccordion.classList.toggle('collapsed');
            });
        }
        
        // ── Resize y orientación ──
        let resizeTimer;
        const onResize = () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => this.handleResize(), 120);
        };
        window.addEventListener('resize', onResize);
        // Cambio de orientación en móvil (landscape ↔ portrait)
        if (screen.orientation) {
            screen.orientation.addEventListener('change', () => {
                setTimeout(() => this.handleResize(), 200);
            });
        } else {
            window.addEventListener('orientationchange', () => {
                setTimeout(() => this.handleResize(), 300);
            });
        }
        
        // Search input with dropdown
        const searchInput = document.getElementById('search-input');

        searchInput.addEventListener('input', () => {
            this.handleSearchInput(searchInput.value);
        });

        searchInput.addEventListener('focus', () => {
            if (!searchInput.value.trim()) {
                this.showAllCongresspersons();
            } else {
                this.handleSearchInput(searchInput.value);
            }
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

        // En móvil: cerrar dropdown al tocar fuera
        if (this.isMobile) {
            document.addEventListener('touchstart', (e) => {
                if (!e.target.closest('.search-wrapper')) {
                    this.closeSearchDropdown();
                    searchInput.blur();
                }
            }, { passive: true });
        }
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

        // List of congressperson names for dropdown — sorted alphabetically
        this.congresspersonList = this.data.nodes
            .filter(n => n.type === 'congressperson')
            .map(n => ({ id: n.id, name: n.name, normName: normalizeText(n.name), photo: n.photo || '' }))
            .sort((a, b) => a.normName.localeCompare(b.normName));
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

        // Render dropdown with congressperson photos and names
        dropdown.innerHTML = matches.slice(0, 8).map(c => {
            const avatarHtml = c.photo
                ? `<img class="search-dropdown-photo" src="${c.photo}" alt="${c.name}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
                : '';
            const initials = c.name.split(' ').slice(0, 2).map(w => w[0]).join('');
            const fallbackHtml = `<span class="search-dropdown-initials" style="${c.photo ? 'display:none' : ''}">${initials}</span>`;
            return `
            <div class="search-dropdown-item" data-id="${c.id}">
                <div class="search-dropdown-avatar">${avatarHtml}${fallbackHtml}</div>
                <span class="search-dropdown-name">${this._highlightMatch(c.name, value.trim())}</span>
            </div>`;
        }).join('');
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

    showAllCongresspersons() {
        const dropdown = document.getElementById('search-dropdown');
        dropdown.innerHTML = this.congresspersonList.map(c => {
            const avatarHtml = c.photo
                ? `<img class="search-dropdown-photo" src="${c.photo}" alt="${c.name}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
                : '';
            const initials = c.name.split(' ').slice(0, 2).map(w => w[0]).join('');
            const fallbackHtml = `<span class="search-dropdown-initials" style="${c.photo ? 'display:none' : ''}">${initials}</span>`;
            return `
            <div class="search-dropdown-item" data-id="${c.id}">
                <div class="search-dropdown-avatar">${avatarHtml}${fallbackHtml}</div>
                <span class="search-dropdown-name">${c.name}</span>
            </div>`;
        }).join('');
        dropdown.classList.add('open');

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
        if (!name || !query) return name;
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
        }

        // Pan to node (after a short delay to let expansion start)
        setTimeout(() => this._centerOnNode(node), 150);
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
        this.hidePinnedPanel();
        this.updateStats(null);
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
            case 'contract': {
                const tipoLabel = d.tipo === 'contrato' ? 'CONTRATO' : 'ORDEN DE SERVICIO';
                content = `
                    <div class="tooltip-type ${d.type}">${tipoLabel}</div>
                    <div class="tooltip-title">${this.formatAmount(d.monto)}</div>
                    <div class="tooltip-grid">
                        <div class="tooltip-row"><span class="tooltip-key">Entidad</span><span class="tooltip-value">${d.entidadContratante || 'N/A'}</span></div>
                        <div class="tooltip-row"><span class="tooltip-key">Fecha</span><span class="tooltip-value">${this.formatDate(d.fecha)}</span></div>
                        <div class="tooltip-row"><span class="tooltip-key">Objeto</span><span class="tooltip-value">${d.descripcion || d.objeto || 'N/A'}</span></div>
                        ${d.estado ? `<div class="tooltip-row"><span class="tooltip-key">Estado</span><span class="tooltip-value">${d.estado}</span></div>` : ''}
                    </div>`;
                break;
            }
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

    // ==================== PANEL POPUP (replaces sidebar) ====================

    _centerOnNode(node, scale = null) {
        // Center the viewport on a node.
        // If scale is null, keep current zoom (min 0.75 so node is visible).
        const currentT = d3.zoomTransform(this.container.node());
        const k = scale !== null ? scale : Math.max(currentT.k, 0.75);
        const tx = this.width  / 2 - node.x * k;
        const ty = this.height / 2 - node.y * k;
        this.container.transition().duration(650).ease(d3.easeCubicInOut)
            .call(this.zoom.transform, d3.zoomIdentity.translate(tx, ty).scale(k));
    }

    _panToNode(node) {
        this._centerOnNode(node);
    }

    _buildPanelHTML(d) {
        const color = CONFIG.colors[d.type];
        let typeLabel = this.getTypeLabel(d.type).toUpperCase();
        if (d.type === 'contract') {
            typeLabel = d.tipo === 'contrato' ? 'CONTRATO' : (d.tipo === 'orden' ? 'ORDEN DE SERVICIO' : 'CONTRATO/ORDEN');
        }
        let html = `
            <div class="panel-header">
                <span class="panel-badge" style="background:${color}22;color:${color};border:1px solid ${color}44">${typeLabel}</span>
                <button class="panel-close" id="panel-close-btn" title="Cerrar">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
            </div>
            <div class="panel-title">${d.name || this.formatAmount(d.monto)}</div>`;

        switch(d.type) {
            case 'congressperson': {
                const net = this.getCongresspersonNetwork(d.id);
                const netMonto = [...net.contracts].reduce((sum, cid) => {
                    const cn = this.data.nodes.find(n => n.id === cid);
                    return sum + (cn ? cn.monto || 0 : 0);
                }, 0);
                html += `
                <div class="panel-kv-grid">
                    <div class="panel-kv"><span class="panel-k">DNI</span><span class="panel-v">${d.dni}</span></div>
                    <div class="panel-kv"><span class="panel-k">Partido</span><span class="panel-v">${d.party || 'N/A'}</span></div>
                    <div class="panel-kv"><span class="panel-k">Comisión</span><span class="panel-v">${d.commission || 'N/A'}</span></div>
                    <div class="panel-kv"><span class="panel-k">Departamento</span><span class="panel-v">${d.department || 'N/A'}</span></div>
                </div>
                <div class="panel-divider"></div>
                <div class="panel-summary-row">
                    <div class="panel-summary-item"><span class="panel-summary-val" style="color:${CONFIG.colors.familiar}">${net.familiars.size}</span><span class="panel-summary-lbl">Familiares</span></div>
                    <div class="panel-summary-item"><span class="panel-summary-val" style="color:${CONFIG.colors.contract}">${net.contracts.size}</span><span class="panel-summary-lbl">Contratos</span></div>
                    <div class="panel-summary-item"><span class="panel-summary-val" style="color:${CONFIG.colors.entity}">${net.entities.size}</span><span class="panel-summary-lbl">Entidades</span></div>
                </div>
                <div class="panel-total-row"><span class="panel-total-lbl">Monto total de la red</span><span class="panel-total-val">${this.formatAmount(netMonto)}</span></div>`;
                break;
            }
            case 'familiar': {
                // Aggregate from individual expanded contract nodes
                const familiarCtNodes = this.data.nodes.filter(n =>
                    n.type === 'contract' && n._originalCtId === `CT_${d.ruc}`
                );
                const totalMonto = familiarCtNodes.reduce((s, n) => s + (n.monto || 0), 0);
                const nContratos = familiarCtNodes.filter(n => n.tipo === 'contrato').length;
                const nOrdenes   = familiarCtNodes.filter(n => n.tipo === 'orden').length;
                let registrosStr = '';
                if (nContratos > 0 && nOrdenes > 0) registrosStr = `${nContratos} contrato${nContratos > 1 ? 's' : ''} · ${nOrdenes} orden${nOrdenes > 1 ? 'es' : ''} de servicio`;
                else if (nContratos > 0) registrosStr = `${nContratos} contrato${nContratos > 1 ? 's' : ''}`;
                else if (nOrdenes > 0)   registrosStr = `${nOrdenes} orden${nOrdenes > 1 ? 'es' : ''} de servicio`;
                html += `
                <div class="panel-kv-grid">
                    <div class="panel-kv"><span class="panel-k">RUC/DNI</span><span class="panel-v">${d.ruc || d.dni}</span></div>
                    <div class="panel-kv"><span class="panel-k">Parentesco</span><span class="panel-v">${d.parentesco || 'N/A'}</span></div>
                    <div class="panel-kv"><span class="panel-k">Principal entidad</span><span class="panel-v">${(d.lugarTrabajo || 'N/A').substring(0,55)}</span></div>
                </div>`;
                if (familiarCtNodes.length > 0) {
                    html += `<div class="panel-divider"></div>
                    <div class="panel-total-row"><span class="panel-total-lbl">Monto total contratado</span><span class="panel-total-val">${this.formatAmount(totalMonto)}</span></div>
                    <div class="panel-total-row" style="margin-top:0.3rem"><span class="panel-total-lbl">Registros</span><span class="panel-total-val" style="color:var(--text-primary)">${registrosStr}</span></div>`;
                }
                break;
            }
            case 'entity': {
                html += `
                <div class="panel-kv-grid">
                    <div class="panel-kv"><span class="panel-k">RUC</span><span class="panel-v">${d.ruc}</span></div>
                    <div class="panel-kv"><span class="panel-k">Rubro</span><span class="panel-v">${d.rubro || 'N/A'}</span></div>
                </div>
                <div class="panel-divider"></div>
                <div class="panel-total-row"><span class="panel-total-lbl">Monto total contratado</span><span class="panel-total-val">${this.formatAmount(d.montoTotal)}</span></div>
                <div class="panel-total-row" style="margin-top:0.3rem"><span class="panel-total-lbl">N° contratos/órdenes</span><span class="panel-total-val" style="color:var(--text-primary)">${d.numContratos}</span></div>`;
                break;
            }
            case 'contract': {
                const tipoColor = d.tipo === 'contrato' ? 'var(--accent-gold)' : 'var(--accent-blue)';
                const tipoLbl   = d.tipo === 'contrato' ? 'CONTRATO' : 'ORDEN DE SERVICIO';
                html += `
                <div class="panel-kv-grid">
                    <div class="panel-kv"><span class="panel-k">Tipo</span><span class="panel-v"><span style="background:${tipoColor}22;color:${tipoColor};padding:2px 8px;border-radius:4px;font-size:0.75rem;font-weight:600">${tipoLbl}</span></span></div>
                    <div class="panel-kv"><span class="panel-k">Fecha</span><span class="panel-v">${this.formatDate(d.fecha)}</span></div>
                    <div class="panel-kv"><span class="panel-k">Entidad contratante</span><span class="panel-v">${(d.entidadContratante || 'N/A').substring(0,70)}</span></div>
                    ${d.estado ? `<div class="panel-kv"><span class="panel-k">Estado</span><span class="panel-v">${d.estado}</span></div>` : ''}
                </div>
                <div class="panel-divider"></div>
                <div class="panel-total-row"><span class="panel-total-lbl">Monto</span><span class="panel-total-val">${this.formatAmount(d.monto)}</span></div>
                ${d.descripcion ? `<div class="panel-divider"></div><div class="panel-section-title">Objeto / Descripción</div><div style="font-size:0.82rem;color:var(--text-secondary);line-height:1.5;padding:0 0.25rem">${d.descripcion}</div>` : ''}`;
                break;
            }
        }
        return html;
    }

    showPinnedPanel(d) {
        this.pinnedNode = d;
        const panel = document.getElementById('node-panel');
        panel.innerHTML = this._buildPanelHTML(d);
        panel.classList.add('visible');
        // Close button
        document.getElementById('panel-close-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.hidePinnedPanel();
        });
    }

    hidePinnedPanel() {
        this.pinnedNode = null;
        const panel = document.getElementById('node-panel');
        if (panel) panel.classList.remove('visible');
    }

    closeSidebar() {
        d3.select('#sidebar').classed('open', false);
        this.hidePinnedPanel();
    }

    getDirectConnections(d) {
        const conns = [];
        this.data.links.forEach(l => {
            if (l.source.id === d.id) conns.push(l.target);
            else if (l.target.id === d.id) conns.push(l.source);
        });
        return conns;
    }

    // ==================== CONTROLS ====================
    
    zoomIn() { this.container.transition().call(this.zoom.scaleBy, this.isMobile ? 1.6 : 1.4); }
    zoomOut() { this.container.transition().call(this.zoom.scaleBy, this.isMobile ? 0.6 : 0.7); }
    resetView() {
        const initialScale = this.isMobile ? 0.28 : 0.42;
        const tx = this.width  / 2 * (1 - initialScale);
        const ty = this.height / 2 * (1 - initialScale);
        this.container.transition().duration(750).ease(d3.easeCubicInOut)
            .call(this.zoom.transform, d3.zoomIdentity.translate(tx, ty).scale(initialScale));
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
    
    updateStats(congresspersonId = null) {
        let counts = { congressperson: 0, familiar: 0, entity: 0, contract: 0 };
        let totalAmount = 0;
        let selectedName = null;

        if (congresspersonId) {
            const cp = this.data.nodes.find(n => n.id === congresspersonId);
            selectedName = cp ? cp.name : null;
            const { familiars, contracts, entities } = this.getCongresspersonNetwork(congresspersonId);
            counts.congressperson = 1;
            counts.familiar = familiars.size;
            counts.contract = contracts.size;
            counts.entity = entities.size;
            contracts.forEach(cid => {
                const cn = this.data.nodes.find(n => n.id === cid);
                if (cn && cn.monto) totalAmount += cn.monto;
            });
        } else {
            this.data.nodes.forEach(n => {
                counts[n.type]++;
                if (n.type === 'contract' && n.monto) totalAmount += n.monto;
            });
        }

        // ── First stat item: name when selected, count otherwise ──
        const cpStatEl = document.getElementById('stat-congresspersons');
        const cpLabelEl = cpStatEl ? cpStatEl.nextElementSibling : null;
        if (cpStatEl) {
            if (selectedName) {
                const shortName = this._shortCongressName(selectedName);
                cpStatEl.textContent = shortName;
                const len = shortName.length;
                cpStatEl.style.fontSize = len > 16 ? '0.6rem' : len > 12 ? '0.72rem' : len > 9 ? '0.88rem' : '1.2rem';
                cpStatEl.style.color = '#000';
                cpStatEl.style.letterSpacing = '-0.01em';
                cpStatEl.style.lineHeight = '1.15';
                if (cpLabelEl) cpLabelEl.textContent = 'Congresista';
            } else {
                cpStatEl.textContent = counts.congressperson;
                cpStatEl.style.fontSize = '';
                cpStatEl.style.color = '';
                cpStatEl.style.letterSpacing = '';
                cpStatEl.style.lineHeight = '';
                if (cpLabelEl) cpLabelEl.textContent = 'Congresistas';
            }
            cpStatEl.style.transform = 'scale(1.12)';
            cpStatEl.style.transition = 'transform 0.25s ease';
            setTimeout(() => { cpStatEl.style.transform = 'scale(1)'; }, 250);
        }

        // Animate number transitions (skip stat-congresspersons, handled above)
        const animate = (sel, val) => {
            const el = document.getElementById(sel);
            if (!el) return;
            const isAmount = sel === 'stat-total-amount';
            if (isAmount) {
                el.textContent = this.formatAmount(val);
            } else {
                el.textContent = val;
            }
            el.style.transform = 'scale(1.15)';
            el.style.transition = 'transform 0.25s ease';
            setTimeout(() => { el.style.transform = 'scale(1)'; }, 250);
        };

        animate('stat-familiars', counts.familiar);
        animate('stat-entities', counts.entity);
        animate('stat-contracts', counts.contract);
        animate('stat-total-amount', totalAmount);
    }

    _shortCongressName(fullName) {
        // Abbreviate to fit: keep first 2 words (typically APELLIDO NOMBRE or NOMBRE APELLIDO)
        if (!fullName) return '';
        const parts = fullName.trim().split(/\s+/);
        if (parts.length <= 2) return fullName;
        // Return first two words – usually covers surname + first name
        return parts.slice(0, 2).join(' ');
    }

    // ==================== UTILS ====================
    
    dragStarted(event, d) {
        if (!event.active) this.simulation.alphaTarget(0.1).restart();
        d.fx = d.x; d.fy = d.y;
        this.hideTooltip();
    }
    dragged(event, d) {
        d.fx = event.x; d.fy = event.y;
        // Immediately redraw links to the drag position — no need to wait for a tick
        this.tick();
    }
    dragEnded(event, d) {
        if (!event.active) this.simulation.alphaTarget(0);
        // Keep the node pinned at its dropped position so it doesn't drift
        // (simulation will stop naturally via alphaMin, firing _onSimulationEnd)
        d.fx = event.x; d.fy = event.y;
    }
    handleResize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        // Recalcular isMobile por si cambió la orientación
        this.isMobile = window.matchMedia('(max-width: 768px)').matches
                     || ('ontouchstart' in window)
                     || (navigator.maxTouchPoints > 0);
        this.container
            .attr('width', this.width)
            .attr('height', this.height);
        // Only nudge the force center; all nodes are pinned so this is a no-op
        // in practice but prevents stale center coordinates
        this.simulation.force('center', d3.forceCenter(this.width / 2, this.height / 2));
        this.tick();
    }
    hideLoader() {
        setTimeout(() => {
            d3.select('#loader').classed('hidden', true);
            // En móvil, zoom inicial más cercano para que los nodos sean más grandes
            const initialScale = this.isMobile ? 0.28 : 0.42;
            const tx = this.width  / 2 * (1 - initialScale);
            const ty = this.height / 2 * (1 - initialScale);
            this.container
                .call(this.zoom.transform, d3.zoomIdentity.translate(tx, ty).scale(initialScale));
        }, 650);
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
    // ==================== DISCLAIMER ====================

    showDisclaimer() {
        // Toggle del acordeón (el header ya tiene su propio listener inline,
        // pero mantenemos este método por compatibilidad con llamadas externas)
        const acc = document.getElementById('disclaimer-accordion');
        if (acc) acc.classList.remove('collapsed');
    }

    hideDisclaimer() {
        const acc = document.getElementById('disclaimer-accordion');
        if (acc) acc.classList.add('collapsed');
    }
}

// ============================================
// INICIALIZAR
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    window.networkViz = new NetworkVisualization('network-container', NETWORK_DATA);
});