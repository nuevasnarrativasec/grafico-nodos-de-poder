#!/usr/bin/env python3
"""
Transformador de datos para visualización de Red de Congresistas
================================================================
Este script convierte los datos de:
- Hojas de vida de congresistas (Excel)
- Declaraciones juradas de familiares (JSON/Excel)
- Contratos OSCE (Excel)

Al formato JSON requerido por la visualización D3.js
"""

import pandas as pd
import json
from pathlib import Path
import hashlib

# Configuración de archivos de entrada
CONFIG = {
    "hojas_vida": "resultados_hojas_de_vida_2021_89_congresistas.xlsx",
    "congresistas_reeleccion": "congresistasreeleccion2026.xlsx",
    "lista_congresistas": "lista1.xlsx",
    "familiares": "familiares_congresistas_reeleccion_ruc.xlsx",  # Si existe
    "contratos_osce": "contratos_consolidado.xlsx",  # Si existe
    "output": "data_red_congresistas.json"
}

def generar_id(tipo, identificador):
    """Genera un ID único basado en tipo y identificador"""
    hash_str = hashlib.md5(f"{tipo}_{identificador}".encode()).hexdigest()[:8]
    prefijos = {
        "congressperson": "C",
        "familiar": "F",
        "entity": "E",
        "contract": "CT"
    }
    return f"{prefijos.get(tipo, 'X')}{hash_str.upper()}"

def normalizar_nombre(nombre):
    """Normaliza nombres para comparación y display"""
    if pd.isna(nombre):
        return ""
    return str(nombre).strip().upper()

def cargar_datos_personales(filepath):
    """Carga datos personales de congresistas desde Excel"""
    try:
        df = pd.read_excel(filepath, sheet_name="Datos_personales")
        congresistas = []
        
        for _, row in df.iterrows():
            if pd.notna(row.get("dni")):
                nombre_completo = " ".join(filter(pd.notna, [
                    row.get("nombres"),
                    row.get("apellido_paterno"),
                    row.get("apellido_materno")
                ]))
                
                congresistas.append({
                    "id": generar_id("congressperson", str(row["dni"])),
                    "type": "congressperson",
                    "dni": str(int(row["dni"])) if pd.notna(row["dni"]) else "",
                    "name": nombre_completo.title(),
                    "party": row.get("organizacion_politica", "No especificado"),
                    "commission": "",  # Agregar si tienes esta data
                    "department": row.get("domicilio_departamento", ""),
                    "photo": f"https://i.pravatar.cc/150?u={row['dni']}"  # Placeholder
                })
        
        return congresistas
    except Exception as e:
        print(f"Error cargando datos personales: {e}")
        return []

def cargar_familiares(filepath_hojas_vida=None, filepath_familiares=None):
    """Carga datos de familiares desde declaraciones juradas"""
    familiares = []
    
    # Intentar cargar desde archivo específico de familiares
    if filepath_familiares and Path(filepath_familiares).exists():
        try:
            df = pd.read_excel(filepath_familiares)
            for _, row in df.iterrows():
                if pd.notna(row.get("dni_familiar")) and pd.notna(row.get("nombre_completo")):
                    familiares.append({
                        "id": generar_id("familiar", str(row["dni_familiar"])),
                        "type": "familiar",
                        "dni": str(row["dni_familiar"]),
                        "name": normalizar_nombre(row["nombre_completo"]).title(),
                        "parentesco": row.get("parentesco", ""),
                        "ocupacion": row.get("ocupacion_profesion", row.get("actividades_ocupaciones", "")),
                        "lugarTrabajo": row.get("lugar_trabajo", ""),
                        "ruc": str(row.get("ruc", "")) if pd.notna(row.get("ruc")) else "",
                        "congresspersonDni": str(row.get("dni_declarante", row.get("dni_congresista", "")))
                    })
        except Exception as e:
            print(f"Error cargando familiares: {e}")
    
    return familiares

def cargar_contratos_osce(filepath):
    """Carga contratos desde archivo consolidado de OSCE"""
    contratos = []
    entidades = {}
    
    if not Path(filepath).exists():
        return [], []
    
    try:
        df = pd.read_excel(filepath)
        
        for _, row in df.iterrows():
            ruc = str(row.get("ruc_proveedor", row.get("ruc", "")))
            if not ruc or ruc == "nan":
                continue
            
            # Agregar/actualizar entidad
            if ruc not in entidades:
                entidades[ruc] = {
                    "id": generar_id("entity", ruc),
                    "type": "entity",
                    "name": row.get("razon_social", row.get("nombre_proveedor", f"Empresa {ruc}")),
                    "ruc": ruc,
                    "rubro": row.get("objeto_contratacion", row.get("rubro", "No especificado")),
                    "montoTotal": 0,
                    "numContratos": 0
                }
            
            monto = float(row.get("monto_contratado", row.get("monto", 0)) or 0)
            entidades[ruc]["montoTotal"] += monto
            entidades[ruc]["numContratos"] += 1
            
            # Crear contrato
            contrato_id = f"{ruc}_{row.get('numero_contrato', len(contratos))}"
            contratos.append({
                "id": generar_id("contract", contrato_id),
                "type": "contract",
                "entidadRuc": ruc,
                "fecha": str(row.get("fecha_contrato", row.get("fecha", ""))),
                "descripcion": str(row.get("descripcion_proceso", row.get("descripcion", "Sin descripción")))[:200],
                "monto": monto,
                "entidadContratante": row.get("entidad", row.get("entidad_contratante", "")),
                "documentUrl": row.get("url_documento", "#")
            })
    
    except Exception as e:
        print(f"Error cargando contratos: {e}")
    
    return list(entidades.values()), contratos

def generar_enlaces(congresistas, familiares, entidades, contratos):
    """Genera los enlaces entre nodos"""
    enlaces = []
    
    # Mapas para búsqueda rápida
    congresistas_por_dni = {c["dni"]: c["id"] for c in congresistas}
    entidades_por_ruc = {e["ruc"]: e["id"] for e in entidades}
    
    # Enlaces: Congresista -> Familiar
    for familiar in familiares:
        dni_congresista = familiar.get("congresspersonDni", "")
        if dni_congresista in congresistas_por_dni:
            enlaces.append({
                "source": congresistas_por_dni[dni_congresista],
                "target": familiar["id"],
                "type": "congressperson-familiar"
            })
    
    # Enlaces: Familiar -> Entidad (por RUC del lugar de trabajo)
    for familiar in familiares:
        ruc = familiar.get("ruc", "")
        if ruc and ruc in entidades_por_ruc:
            enlaces.append({
                "source": familiar["id"],
                "target": entidades_por_ruc[ruc],
                "type": "familiar-entity"
            })
    
    # Enlaces: Entidad -> Contratos
    for contrato in contratos:
        ruc = contrato.get("entidadRuc", "")
        if ruc in entidades_por_ruc:
            # Actualizar contrato con ID de entidad
            contrato["entidadId"] = entidades_por_ruc[ruc]
            enlaces.append({
                "source": entidades_por_ruc[ruc],
                "target": contrato["id"],
                "type": "entity-contract"
            })
    
    return enlaces

def crear_datos_ejemplo():
    """Crea datos de ejemplo para demostración"""
    return {
        "nodes": [
            # Congresistas de ejemplo
            {
                "id": "C001",
                "type": "congressperson",
                "name": "Ana María Zegarra López",
                "dni": "42628319",
                "party": "Alianza para el Progreso",
                "commission": "Comisión de Economía",
                "photo": "https://i.pravatar.cc/150?img=1",
                "department": "Lima"
            },
            {
                "id": "C002",
                "type": "congressperson",
                "name": "José Luis Elías Ávalos",
                "dni": "21569935",
                "party": "Podemos Perú",
                "commission": "Comisión de Transportes",
                "photo": "https://i.pravatar.cc/150?img=3",
                "department": "Ica"
            },
            # Familiares
            {
                "id": "F001",
                "type": "familiar",
                "name": "Hugo Hermilio Alvarado Apaza",
                "dni": "04632989",
                "parentesco": "Padre del Cónyuge",
                "ocupacion": "Pescador Artesanal",
                "congresspersonId": "C001"
            },
            {
                "id": "F002",
                "type": "familiar",
                "name": "José Alfredo Alvarado Mamani",
                "dni": "40448882",
                "parentesco": "Cuñado(a)",
                "ocupacion": "Chofer",
                "lugarTrabajo": "Transportes Halcon SRL",
                "ruc": "20456789012",
                "congresspersonId": "C001"
            },
            # Entidades
            {
                "id": "E001",
                "type": "entity",
                "name": "Transportes Halcon SRL",
                "ruc": "20456789012",
                "rubro": "Transporte de carga",
                "montoTotal": 1250000,
                "numContratos": 8
            },
            # Contratos
            {
                "id": "CT001",
                "type": "contract",
                "entidadId": "E001",
                "fecha": "2023-05-15",
                "descripcion": "Servicio de transporte de materiales para PRONIED",
                "monto": 320000,
                "entidadContratante": "PRONIED",
                "documentUrl": "#"
            }
        ],
        "links": [
            {"source": "C001", "target": "F001", "type": "congressperson-familiar"},
            {"source": "C001", "target": "F002", "type": "congressperson-familiar"},
            {"source": "F002", "target": "E001", "type": "familiar-entity"},
            {"source": "E001", "target": "CT001", "type": "entity-contract"}
        ]
    }

def main():
    """Función principal"""
    print("=" * 60)
    print("Transformador de Datos - Red de Congresistas")
    print("=" * 60)
    
    # Intentar cargar datos reales
    congresistas = []
    familiares = []
    entidades = []
    contratos = []
    
    # Cargar congresistas
    if Path(CONFIG["hojas_vida"]).exists():
        print(f"\n📊 Cargando datos personales de: {CONFIG['hojas_vida']}")
        congresistas = cargar_datos_personales(CONFIG["hojas_vida"])
        print(f"   ✓ {len(congresistas)} congresistas cargados")
    
    # Cargar familiares
    if Path(CONFIG.get("familiares", "")).exists():
        print(f"\n👥 Cargando familiares de: {CONFIG['familiares']}")
        familiares = cargar_familiares(filepath_familiares=CONFIG["familiares"])
        print(f"   ✓ {len(familiares)} familiares cargados")
    
    # Cargar contratos
    if Path(CONFIG.get("contratos_osce", "")).exists():
        print(f"\n📄 Cargando contratos de: {CONFIG['contratos_osce']}")
        entidades, contratos = cargar_contratos_osce(CONFIG["contratos_osce"])
        print(f"   ✓ {len(entidades)} entidades encontradas")
        print(f"   ✓ {len(contratos)} contratos cargados")
    
    # Si no hay datos, usar ejemplo
    if not congresistas:
        print("\n⚠️  No se encontraron archivos de datos. Usando datos de ejemplo.")
        data = crear_datos_ejemplo()
    else:
        # Generar enlaces
        enlaces = generar_enlaces(congresistas, familiares, entidades, contratos)
        
        # Combinar todos los nodos
        all_nodes = congresistas + familiares + entidades + contratos
        
        data = {
            "nodes": all_nodes,
            "links": enlaces
        }
    
    # Guardar JSON
    output_path = CONFIG["output"]
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ Archivo generado: {output_path}")
    print(f"   - Nodos totales: {len(data['nodes'])}")
    print(f"   - Enlaces totales: {len(data['links'])}")
    
    # Estadísticas por tipo
    tipos = {}
    for node in data["nodes"]:
        tipo = node.get("type", "unknown")
        tipos[tipo] = tipos.get(tipo, 0) + 1
    
    print("\n📊 Distribución de nodos:")
    for tipo, cantidad in tipos.items():
        print(f"   - {tipo}: {cantidad}")
    
    return data

if __name__ == "__main__":
    main()
