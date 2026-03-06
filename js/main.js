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
        this.expandedCongresspersonId = null; // currently expanded congressperson
        
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
            this._setExpandedForces(false);
            return;
        }

        this.expandedCongresspersonId = cid;
        this._dimCongresspersons(cid);

        d.fx = d.x;
        d.fy = d.y;
        this._pinnedNode = d;

        const { familiars, contracts, entities } = this.getCongresspersonNetwork(cid);
        const allNetworkIds = new Set([...familiars, ...contracts, ...entities]);

        // Pre-position all network nodes near the congressperson before revealing them
        this.data.nodes.forEach(n => {
            if (allNetworkIds.has(n.id)) {
                n.x = d.x + (Math.random() - 0.5) * 10;
                n.y = d.y + (Math.random() - 0.5) * 10;
                n.vx = 0;
                n.vy = 0;
            }
        });

        this._setExpandedForces(true);
        this._centerOnNode(d);

        const order = [
            ...this.data.nodes.filter(n => familiars.has(n.id)),
            ...this.data.nodes.filter(n => contracts.has(n.id)),
            ...this.data.nodes.filter(n => entities.has(n.id))
        ];

        order.forEach(node => {
            node._visible = true;
            d3.select(`.node[data-id="${node.id}"]`)
                .style('pointer-events', 'all')
                .transition().duration(300)
                .ease(d3.easeCubicOut)
                .style('opacity', 1)
                .attr('transform', `translate(${node.x},${node.y}) scale(1)`);
        });

        this.links.each(function(l) {
            const src = l.source.id || l.source;
            const tgt = l.target.id || l.target;
            const belongs =
                (src === cid && familiars.has(tgt)) ||
                (familiars.has(src) && contracts.has(tgt)) ||
                (contracts.has(src) && entities.has(tgt));
            if (belongs) {
                d3.select(this)
                    .transition().delay(150).duration(400)
                    .style('opacity', 1)
                    .style('pointer-events', 'all');
            }
        });

        d3.select(`.node[data-id="${cid}"] .node-glow`)
            .transition().duration(400).style('opacity', 0.7);

        this.selectedNode = d;
        this.updateStats(cid);
    }

    expandFamiliar(d) {
        const cid = d.congresspersonId;
        if (!cid) return;

        this.links.transition().duration(200).style('opacity', 0).style('pointer-events', 'none');
        this.data.nodes.filter(n => n.type !== 'congressperson').forEach(n => { n._visible = false; });
        this.nodes.filter(n => n.type !== 'congressperson')
            .transition().duration(200)
            .style('opacity', 0).style('pointer-events', 'none')
            .attr('transform', n => `translate(${n.x},${n.y}) scale(0)`);

        const { familiars } = this.getCongresspersonNetwork(cid);
        const { contracts, entities } = this.getCongresspersonNetwork(cid, d.id);

        // Pre-position contract/entity nodes near the familiar
        this.data.nodes.forEach(n => {
            if (contracts.has(n.id) || entities.has(n.id)) {
                n.x = d.x + (Math.random() - 0.5) * 10;
                n.y = d.y + (Math.random() - 0.5) * 10;
                n.vx = 0;
                n.vy = 0;
            }
        });

        const order = [
            ...this.data.nodes.filter(n => familiars.has(n.id)),
            ...this.data.nodes.filter(n => contracts.has(n.id)),
            ...this.data.nodes.filter(n => entities.has(n.id))
        ];

        order.forEach(node => {
            node._visible = true;
            const isFocus = node.id === d.id;
            d3.select(`.node[data-id="${node.id}"]`)
                .style('pointer-events', 'all')
                .transition().duration(300)
                .ease(d3.easeCubicOut)
                .style('opacity', isFocus ? 1 : 0.55)
                .attr('transform', `translate(${node.x},${node.y}) scale(${isFocus ? 1.1 : 1})`);
        });

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

        // Release the pinned node so it can float freely again
        if (this._pinnedNode) {
            this._pinnedNode.fx = null;
            this._pinnedNode.fy = null;
            this._pinnedNode = null;
        }

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
    
    zoomIn() { this.container.transition().call(this.zoom.scaleBy, 1.4); }
    zoomOut() { this.container.transition().call(this.zoom.scaleBy, 0.7); }
    resetView() {
        const initialScale = 0.42;
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

        if (congresspersonId) {
            // Show stats only for the selected network
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

        // Animate number transitions
        const animate = (sel, val) => {
            const el = document.getElementById(sel);
            if (!el) return;
            const isAmount = sel === 'stat-total-amount';
            const prev = isAmount ? 0 : parseInt(el.textContent.replace(/\D/g, '')) || 0;
            const next = isAmount ? val : val;
            if (isAmount) {
                el.textContent = this.formatAmount(next);
            } else {
                el.textContent = next;
            }
            el.style.transform = 'scale(1.15)';
            el.style.transition = 'transform 0.25s ease';
            setTimeout(() => { el.style.transform = 'scale(1)'; }, 250);
        };

        animate('stat-congresspersons', counts.congressperson);
        animate('stat-familiars', counts.familiar);
        animate('stat-entities', counts.entity);
        animate('stat-contracts', counts.contract);
        animate('stat-total-amount', totalAmount);
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
        setTimeout(() => {
            d3.select('#loader').classed('hidden', true);
            // Zoom out to fit the full network on screen on initial load
            const initialScale = 0.42;
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
}

// ============================================
// INICIALIZAR
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    window.networkViz = new NetworkVisualization('network-container', NETWORK_DATA);
});