// ============================================================
// DESCARGOS POR CONGRESISTA
// Mapea el ID del congresista (CP_DNI) al contenido del acordeón.
//
// DOS FORMATOS:
//
// 1) Solo texto (sin enlace "VER OTROS DESCARGOS"):
//    "CP_XXXXX": `<p>...</p>`,
//
// 2) Con enlace hacia una sección de la landing:
//    "CP_XXXXX": {
//        html:          `<p>...</p>`,
//        linkDescargos: '#seccion-descargos'   // ID o URL del ancla
//    },
//
// El enlace aparece sobre el card, alineado a la derecha,
// solo cuando está definido linkDescargos.
// ============================================================

const DISCLAIMERS = {

    // Rosio Torres Salinas
    "CP_05618705": `<p><strong>El Comercio</strong> contactó a la congresista para recoger sus descargos; sin embargo, hasta la publicación de este especial no se obtuvo respuesta.</p>`,

    // Roberto Chiabra
    "CP_40728264": {
        html:          `<p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. <br> Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p>`,
        linkDescargos: '#seccion-descargos'
    },

    // Patricia Juárez Gallegos
    "CP_07831436": `<p><strong>El Comercio</strong> contactó a la congresista para recoger sus descargos; sin embargo, hasta la publicación de este especial no se obtuvo respuesta.</p>`,

    // Nilza Chacón Trujillo
    "CP_32971154": `<p><strong>El Comercio</strong> contactó a la congresista para recoger sus descargos; sin embargo, hasta la publicación de este especial no se obtuvo respuesta.</p>`,

    // Flavio Cruz Mamani
    "CP_01311614": `<p><strong>El Comercio</strong> contactó al congresista para recoger sus descargos; sin embargo, hasta la publicación de este especial no se obtuvo respuesta.</p>`,

    // Ana Zegarra
    "CP_42628319": `<p><strong>El Comercio</strong> contactó a la congresista para recoger sus descargos; sin embargo, hasta la publicación de este especial no se obtuvo respuesta.</p>`,

    // Miguel Ciccia
    "CP_06049853": `<p><strong>El Comercio</strong> contactó al congresista para recoger sus descargos; sin embargo, hasta la publicación de este especial no se obtuvo respuesta.</p>`,

    // Elizabeth Taipe
    "CP_41005490": `<p><strong>El Comercio</strong> contactó a la congresista para recoger sus descargos; sin embargo, hasta la publicación de este especial no se obtuvo respuesta.</p>`,

    // Guido Bellido Ugarte
    "CP_44649199": `<p><strong>El Comercio</strong> contactó al congresista para recoger sus descargos; sin embargo, hasta la publicación de este especial no se obtuvo respuesta.</p>`,

    // Francis Paredes Castro
    "CP_40858548": `<p><strong>El Comercio</strong> contactó al congresista para recoger sus descargos; sin embargo, hasta la publicación de este especial no se obtuvo respuesta.</p>`,

    // Abel Reyes Cam
    "CP_42377791": `<p><strong>El Comercio</strong> contactó al congresista para recoger sus descargos; sin embargo, hasta la publicación de este especial no se obtuvo respuesta.</p>`,

    // Esdras Medina Minaya
    "CP_29423212": `<p><strong>El Comercio</strong> contactó al congresista para recoger sus descargos; sin embargo, hasta la publicación de este especial no se obtuvo respuesta.</p>`,

    // Roberto Sánchez Palomino
    "CP_16002918": `<p><strong>El Comercio</strong> contactó al congresista para recoger sus descargos; sin embargo, hasta la publicación de este especial no se obtuvo respuesta.</p>`,

    // Cheryl Trigozo
    "CP_44886100": `<p><strong>El Comercio</strong> contactó a la congresista para recoger sus descargos; sin embargo, hasta la publicación de este especial no se obtuvo respuesta.</p>`,

    // Alejandro Soto Reyes
    "CP_23901989": `<p><strong>El Comercio</strong> contactó al congresista para recoger sus descargos; sin embargo, hasta la publicación de este especial no se obtuvo respuesta.</p>`,

    // Enrique Castillo Rivas
    "CP_44807108": `<p><strong>El Comercio</strong> contactó al congresista para recoger sus descargos; sin embargo, hasta la publicación de este especial no se obtuvo respuesta.</p>`,

    // Bernardo Quito Sarmiento
    "CP_29632775": `<p><strong>El Comercio</strong> contactó al congresista para recoger sus descargos; sin embargo, hasta la publicación de este especial no se obtuvo respuesta.</p>`,

    // Esmeralda Limachi Quispe
    "CP_41258762": `<p><strong>El Comercio</strong> contactó a la congresista para recoger sus descargos; sin embargo, hasta la publicación de este especial no se obtuvo respuesta.</p>`,

    // César Revilla Villanueva
    "CP_44275599": `<p><strong>El Comercio</strong> contactó a la congresista para recoger sus descargos; sin embargo, hasta la publicación de este especial no se obtuvo respuesta.</p>`,

    // Palacios Margot
    "CP_42134579": `<p><strong>El Comercio</strong> contactó a la congresista para recoger sus descargos; sin embargo, hasta la publicación de este especial no se obtuvo respuesta.</p>`,

    // Alex Paredes
    "CP_29299579": `<p><strong>El Comercio</strong> contactó al congresista para recoger sus descargos; sin embargo, hasta la publicación de este especial no se obtuvo respuesta.</p>`,

    // Javier Padilla Romero
    "CP_10691398": `<p><strong>El Comercio</strong> contactó al congresista para recoger sus descargos; sin embargo, hasta la publicación de este especial no se obtuvo respuesta.</p>`,

    // Elías Varas
    "CP_32923902": `<p><strong>El Comercio</strong> contactó a la congresista para recoger sus descargos; sin embargo, hasta la publicación de este especial no se obtuvo respuesta.</p>`,

    // Jorge Montoya
    "CP_43328757": `<p><strong>El Comercio</strong> contactó al congresista para recoger sus descargos; sin embargo, hasta la publicación de este especial no se obtuvo respuesta.</p>`,

    // Diana Gonzales
    "CP_70546213": `<p><strong>El Comercio</strong> contactó a la congresista para recoger sus descargos; sin embargo, hasta la publicación de este especial no se obtuvo respuesta.</p>`,

    // Rosangella Barbarán
    "CP_76030152": `<p><strong>El Comercio</strong> contactó a la congresista para recoger sus descargos; sin embargo, hasta la publicación de este especial no se obtuvo respuesta.</p>`,

    // Elizabeth Medina Hermosilla
    "CP_22510256": `<p><strong>El Comercio</strong> contactó a la congresista para recoger sus descargos; sin embargo, hasta la publicación de este especial no se obtuvo respuesta.</p>`,

    // Ruth Luque
    "CP_40204874": `<p><strong>El Comercio</strong> contactó a la congresista para recoger sus descargos; sin embargo, hasta la publicación de este especial no se obtuvo respuesta.</p>`,

    // Tania Ramírez García
    "CP_70094373": `<p><strong>El Comercio</strong> contactó a la congresista para recoger sus descargos; sin embargo, hasta la publicación de este especial no se obtuvo respuesta.</p>`,

    // Héctor Valer Pinto
    "CP_25567150": `<p><strong>El Comercio</strong> contactó a la congresista para recoger sus descargos; sin embargo, hasta la publicación de este especial no se obtuvo respuesta.</p>`,

    // Kelly Portalatino
    "CP_42699423": `<p><strong>El Comercio</strong> contactó a la congresista para recoger sus descargos; sin embargo, hasta la publicación de este especial no se obtuvo respuesta.</p>`,

    // Víctor Flores Ruiz
    "CP_17896798": `<p><strong>El Comercio</strong> contactó a la congresista para recoger sus descargos; sin embargo, hasta la publicación de este especial no se obtuvo respuesta.</p>`,

    // José Arriola Tueros
    "CP_25542661": `<p><strong>El Comercio</strong> contactó a la congresista para recoger sus descargos; sin embargo, hasta la publicación de este especial no se obtuvo respuesta.</p>`,

    // Elva Julón Irigoin
    "CP_46130369": `<p><strong>El Comercio</strong> contactó a la congresista para recoger sus descargos; sin embargo, hasta la publicación de este especial no se obtuvo respuesta.</p>`,

    // Raúl Huamán Coronado
    "CP_21564196": `<p><strong>El Comercio</strong> contactó a la congresista para recoger sus descargos; sin embargo, hasta la publicación de este especial no se obtuvo respuesta.</p>`,

    // Isaac Mita Alanoca
    "CP_00434972": `<p><strong>El Comercio</strong> contactó al congresista para recoger sus descargos; sin embargo, hasta la publicación de este especial no se obtuvo respuesta.</p>`,

    // Arturo Alegría García
    "CP_45382589": `<p><strong>El Comercio</strong> contactó al congresista para recoger sus descargos; sin embargo, hasta la publicación de este especial no se obtuvo respuesta.</p>`,

    // Ana Obando Morgan
    "CP_07737110": `<p><strong>El Comercio</strong> contactó a la congresista para recoger sus descargos; sin embargo, hasta la publicación de este especial no se obtuvo respuesta.</p>`,

    // Ernesto Bustamante Donayre
    "CP_08232920": `<p><strong>El Comercio</strong> contactó al congresista para recoger sus descargos; sin embargo, hasta la publicación de este especial no se obtuvo respuesta.</p>`,

    // Américo Gonza
    "CP_41187802": `<p><strong>El Comercio</strong> contactó a la congresista para recoger sus descargos; sin embargo, hasta la publicación de este especial no se obtuvo respuesta.</p>`,

    // Silvana Robles
    "CP_42750152": `<p><strong>El Comercio</strong> contactó a la congresista para recoger sus descargos; sin embargo, hasta la publicación de este especial no se obtuvo respuesta.</p>`,

    // Nivardo Tello
    "CP_09575873": `<p><strong>El Comercio</strong> contactó al congresista para recoger sus descargos; sin embargo, hasta la publicación de este especial no se obtuvo respuesta.</p>`,

    // Jeny López Morales
    "CP_09980339": `<p><strong>El Comercio</strong> contactó a la congresista para recoger sus descargos; sin embargo, hasta la publicación de este especial no se obtuvo respuesta.</p>`,

    // Pasión Dávila
    "CP_25700579": `<p><strong>El Comercio</strong> contactó a la congresista para recoger sus descargos; sin embargo, hasta la publicación de este especial no se obtuvo respuesta.</p>`,

    // Patricia Chirinos Venegas
    "CP_10280036": `<p><strong>El Comercio</strong> contactó a la congresista para recoger sus descargos; sin embargo, hasta la publicación de este especial no se obtuvo respuesta.</p>`,

    // Victor Cutipa Ccama
    "CP_04647085": `<p><strong>El Comercio</strong> contactó al congresista para recoger sus descargos; sin embargo, hasta la publicación de este especial no se obtuvo respuesta.</p>`,

    // Mery Infantes Castañeda
    "CP_16448130": `<p><strong>El Comercio</strong> contactó a la congresista para recoger sus descargos; sin embargo, hasta la publicación de este especial no se obtuvo respuesta.</p>`,

    // José Luna Gálvez
    "CP_07246887": `<p><strong>El Comercio</strong> contactó a la congresista para recoger sus descargos; sin embargo, hasta la publicación de este especial no se obtuvo respuesta.</p>`,

    // Gladys Echaíz de Nuñez Izaga
    "CP_16429203": `<p><strong>El Comercio</strong> contactó a la congresista para recoger sus descargos; sin embargo, hasta la publicación de este especial no se obtuvo respuesta.</p>`,

    // Alejandro Muñante
    "CP_45209282": `<p><strong>El Comercio</strong> contactó al congresista para recoger sus descargos; sin embargo, hasta la publicación de este especial no se obtuvo respuesta.</p>`,

    // Jorge Marticorena Mendoza
    "CP_21456255": `<p><strong>El Comercio</strong> contactó al congresista para recoger sus descargos; sin embargo, hasta la publicación de este especial no se obtuvo respuesta.</p>`,

    // Angel Aragón Carreño
    "CP_23977149": `<p><strong>El Comercio</strong> contactó al congresista para recoger sus descargos; sin embargo, hasta la publicación de este especial no se obtuvo respuesta.</p>`,

    // Ariana Orué
    "CP_48164963": `<p><strong>El Comercio</strong> contactó a la congresista para recoger sus descargos; sin embargo, hasta la publicación de este especial no se obtuvo respuesta.</p>`,

    // Rosselli Amuruz
    "CP_44756974": `<p><strong>El Comercio</strong> contactó a la congresista para recoger sus descargos; sin embargo, hasta la publicación de este especial no se obtuvo respuesta.</p>`,

    // José Cueto
    "CP_06783615": `<p><strong>El Comercio</strong> contactó a la congresista para recoger sus descargos; sin embargo, hasta la publicación de este especial no se obtuvo respuesta.</p>`,

};

// Texto por defecto si el ID no está en el mapa
DISCLAIMERS._default = `<p><strong>El Comercio</strong> contactó al congresista para recoger sus descargos; sin embargo, hasta la publicación de este especial no se obtuvo respuesta.</p>`;