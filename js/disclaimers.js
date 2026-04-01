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
    "CP_05618705": `<p>El Comercio solicitó al congresista su descargo sobre los contratos y órdenes de servicio de sus familiares; hasta el cierre de esta publicación no se obtuvo respuesta.</p>`,

    // Roberto Chiabra
    "CP_40728264": `<p>Al ser consultado sobre los contratos y órdenes de servicio de sus familiares, el congresista Roberto Chiabra manifestó su disposición para brindar sus descargos de manera presencial. <br> Según los registros revisados, en el caso de su hermano, Guillermo Enrique Chiabra León, 30 de sus 32 órdenes de servicio se ubican entre 2014 y mayo de 2021, es decir, antes del inicio del actual periodo parlamentario. Una situación similar se observa en su yerno, Aníbal Quiroga León, quien registra 35 de sus 42 contratos y órdenes de servicio antes de enero de 2021. <br> No obstante, en el caso de su tía, Nancy Josefina Chiabra Rondón, si bien su único contrato data de 2010, se identifican 4 órdenes de servicio que se ubican a partir de julio de 2022, ya durante la actual gestión parlamentaria. <br> Cabe precisar que la tía no se encuentra dentro de los grados de consanguinidad o afinidad contemplados en los impedimentos establecidos por la normativa de contrataciones vigente para el periodo analizado. En ese sentido, los registros identificados se presentan como parte del mapeo de vínculos consignados en las declaraciones juradas de intereses, sin que ello implique, por sí mismo, una infracción a la normativa.</p>`,    

    // Patricia Juárez Gallegos
    "CP_07831436": `<p>El Comercio solicitó al congresista su descargo sobre los contratos y órdenes de servicio de sus familiares; hasta el cierre de esta publicación no se obtuvo respuesta.</p>`,

    // Nilza Chacón Trujillo
    "CP_32971154": `<p>Al ser consultada sobre los contratos y órdenes de servicio de sus familiares, la congresista Nilza Chacón señaló que no tenía conocimiento de las actividades de sus familiares, con excepción de uno de ellos. Cabe precisar que los familiares mencionados no se encuentran dentro de los grados de consanguinidad o afinidad contemplados en los impedimentos establecidos por la normativa de contrataciones vigente para el periodo analizado. En ese sentido, los registros identificados se presentan como parte del mapeo de vínculos consignados en las declaraciones juradas de intereses, sin que ello implique, por sí mismo, una infracción a la normativa.</p>`,

    // Flavio Cruz Mamani
    "CP_01311614": `<p>El Comercio solicitó al congresista su descargo sobre los contratos y órdenes de servicio de sus familiares; hasta el cierre de esta publicación no se obtuvo respuesta.</p>`,

    // Ana Zegarra
    "CP_42628319": `<p>El Comercio solicitó al congresista su descargo sobre los contratos y órdenes de servicio de sus familiares; hasta el cierre de esta publicación no se obtuvo respuesta.</p>`,

    // Miguel Ciccia
    "CP_06049853": `<p>El Comercio solicitó al congresista su descargo sobre los contratos y órdenes de servicio de sus familiares; hasta el cierre de esta publicación no se obtuvo respuesta.</p>`,

    // Elizabeth Taipe
    "CP_41005490": `<p>El Comercio solicitó al congresista su descargo sobre los contratos y órdenes de servicio de sus familiares; hasta el cierre de esta publicación no se obtuvo respuesta.</p>`,

    // Guido Bellido Ugarte
    "CP_44649199": `<p>El Comercio solicitó al congresista su descargo sobre los contratos y órdenes de servicio de sus familiares; hasta el cierre de esta publicación no se obtuvo respuesta.</p>`,

    // Francis Paredes Castro
    "CP_40858548": `<p>El Comercio solicitó al congresista su descargo sobre los contratos y órdenes de servicio de sus familiares; hasta el cierre de esta publicación no se obtuvo respuesta.</p>`,

    // Abel Reyes Cam
    "CP_42377791": `<p>El Comercio solicitó al congresista su descargo sobre los contratos y órdenes de servicio de sus familiares; hasta el cierre de esta publicación no se obtuvo respuesta.</p>`,

    // Esdras Medina Minaya
    "CP_29423212": `<p>El Comercio solicitó al congresista su descargo sobre los contratos y órdenes de servicio de sus familiares; hasta el cierre de esta publicación no se obtuvo respuesta.</p>`,

    // Roberto Sánchez Palomino
    "CP_16002918": `<p>El Comercio solicitó al congresista su descargo sobre los contratos y órdenes de servicio de sus familiares; hasta el cierre de esta publicación no se obtuvo respuesta.</p>`,

    // Cheryl Trigozo
    "CP_44886100": `<p>El Comercio solicitó al congresista su descargo sobre los contratos y órdenes de servicio de sus familiares; hasta el cierre de esta publicación no se obtuvo respuesta.</p>`,

    // Alejandro Soto Reyes
    "CP_23901989": `<p>Al ser consultado sobre las órdenes de servicio de sus familiares, el congresista Alejandro Soto Reyes respondió, mediante un documento remitido por un bufete legal privado, que estos contratos corresponden a periodos previos al inicio de su gestión legislativa. <br> Según los registros revisados, se identifican órdenes de servicio asociadas a sus familiares tanto antes como después del inicio del periodo parlamentario en julio de 2021. En el caso de su sobrina, María Luisa Soto Solano, 41 de sus 52 órdenes se registran antes de dicha fecha. Por su parte, su primo José Ángel Zevallos registra 26 de sus 33 órdenes durante la actual gestión; su prima Mónica Reyes Castillo, 23 de sus 25 contratos; y, en el caso de su prima Yoseling Reyes Chirinos, la totalidad de sus tres órdenes de servicio se ubican a partir de febrero de 2024. <br> Cabe precisar que los familiares mencionados no se encuentran dentro de los grados de consanguinidad o afinidad contemplados en los impedimentos establecidos por la normativa de contrataciones vigente para el periodo analizado. En ese sentido, los registros identificados se presentan como parte del mapeo de vínculos consignados en las declaraciones juradas de intereses, sin que ello implique, por sí mismo, una infracción a la normativa.</p>`,

    // Enrique Castillo Rivas
    "CP_44807108": `<p>El Comercio solicitó al congresista su descargo sobre los contratos y órdenes de servicio de sus familiares; hasta el cierre de esta publicación no se obtuvo respuesta.</p>`,

    // Bernardo Quito Sarmiento
    "CP_29632775": `<p>El Comercio solicitó al congresista su descargo sobre los contratos y órdenes de servicio de sus familiares; hasta el cierre de esta publicación no se obtuvo respuesta.</p>`,

    // Esmeralda Limachi Quispe
    "CP_41258762": `<p>Al ser consultada sobre las órdenes de servicio de sus familiares, la congresista Esmeralda Limachi señaló que estos no se encuentran dentro del segundo grado de consanguinidad y que las órdenes de su hermano se iniciaron antes de que asumiera el cargo. <br> Según los registros revisados, se identifican órdenes de servicio asociadas a sus familiares con posterioridad al inicio del periodo parlamentario en julio de 2021. En el caso de su hermano, Vittorio Felipe Limachi Quispe, sus dos órdenes de servicio se registran a partir de agosto de 2021, coincidiendo con el inicio de la actual gestión. Asimismo, su cuñada, Soledad Lupaca Lupaca, registra 10 órdenes de servicio que se ubican a partir de agosto de 2024. <br> Estos registros se ubican dentro del periodo en el que la normativa de contrataciones públicas establecía impedimentos para la contratación de familiares hasta el segundo grado de consanguinidad y afinidad, como es el caso del hermano y la cuñada.</p>`,

    // César Revilla Villanueva
    "CP_44275599": `<p>Al ser consultado sobre los contratos y órdenes de servicio de sus familiares, el congresista César Revilla calificó la información como un “refrito malintencionado” en el contexto de la campaña electoral e indicó que sustenta su posición en una sentencia del Tribunal Constitucional.</p>`,

    // Palacios Margot
    "CP_42134579": `<p>El Comercio solicitó al congresista su descargo sobre los contratos y órdenes de servicio de sus familiares; hasta el cierre de esta publicación no se obtuvo respuesta.</p>`,

    // Alex Paredes
    "CP_29299579": `<p>El Comercio solicitó al congresista su descargo sobre los contratos y órdenes de servicio de sus familiares; hasta el cierre de esta publicación no se obtuvo respuesta.</p>`,

    // Javier Padilla Romero
    "CP_10691398": `<p>El Comercio solicitó al congresista su descargo sobre los contratos y órdenes de servicio de sus familiares; hasta el cierre de esta publicación no se obtuvo respuesta.</p>`,

    // Elías Varas
    "CP_32923902": `<p>Al ser consultado sobre los contratos y órdenes de servicio de sus familiares, el congresista Elías Varas señaló que no existen restricciones legales que le resulten aplicables y negó haber intervenido en dichas contrataciones. Cabe precisar que los familiares mencionados no se encuentran dentro de los grados de consanguinidad o afinidad contemplados en los impedimentos establecidos por la normativa de contrataciones vigente para el periodo analizado. En ese sentido, los registros identificados se presentan como parte del mapeo de vínculos consignados en las declaraciones juradas de intereses, sin que ello implique, por sí mismo, una infracción a la normativa.</p>`,

    // Jorge Montoya
    "CP_43328757": `<p>El Comercio solicitó al congresista su descargo sobre los contratos y órdenes de servicio de sus familiares; hasta el cierre de esta publicación no se obtuvo respuesta.</p>`,

    // Diana Gonzales
    "CP_70546213": `<p>Al ser consultada sobre los contratos y órdenes de servicio de sus familiares, la congresista Diana Gonzales señaló que no ha intercedido en favor de ellos para la obtención de dichos contratos. <br> Cabe precisar que los familiares mencionados no se encuentran dentro de los grados de consanguinidad o afinidad contemplados en los impedimentos establecidos por la normativa de contrataciones vigente para el periodo analizado. En ese sentido, los registros identificados se presentan como parte del mapeo de vínculos consignados en las declaraciones juradas de intereses, sin que ello implique, por sí mismo, una infracción a la normativa.</p>`,

    // Rosangella Barbarán
    "CP_76030152": `<p>El Comercio solicitó al congresista su descargo sobre los contratos y órdenes de servicio de sus familiares; hasta el cierre de esta publicación no se obtuvo respuesta.</p>`,

    // Elizabeth Medina Hermosilla
    "CP_22510256": `<p>El Comercio solicitó al congresista su descargo sobre los contratos y órdenes de servicio de sus familiares; hasta el cierre de esta publicación no se obtuvo respuesta.</p>`,

    // Ruth Luque
    "CP_40204874": `<p>El Comercio solicitó al congresista su descargo sobre los contratos y órdenes de servicio de sus familiares; hasta el cierre de esta publicación no se obtuvo respuesta.</p>`,

    // Tania Ramírez García
    "CP_70094373": `<p>El Comercio solicitó al congresista su descargo sobre los contratos y órdenes de servicio de sus familiares; hasta el cierre de esta publicación no se obtuvo respuesta.</p>`,

    // Héctor Valer Pinto
    "CP_25567150": `<p>Al ser consultado sobre los contratos y órdenes de servicio de sus familiares, el congresista Héctor Valer señaló que cada persona es responsable de sus propias acciones. Asimismo, se remitió a descargos previos en los que se pronunció sobre la situación de su hija, quien fue sancionada por el Tribunal del Organismo Supervisor de las Contrataciones del Estado (OSCE).</p>`,

    // Kelly Portalatino
    "CP_42699423": `<p>Al ser consultada sobre las órdenes de servicio de sus familiares, la congresista Kelly Portalatino señaló que no se encuentra impedida por ley ni ha intercedido en dichas contrataciones, las cuales calificó como labores de naturaleza técnica. Asimismo, indicó que sus familiares mantienen vínculos contractuales con el Estado desde antes de su gestión y exhortó a que se mantenga la rigurosidad en el manejo de la información. <br> Según los registros revisados, se identifican órdenes de servicio asociadas a sus familiares con posterioridad al inicio del periodo parlamentario en julio de 2021. En el caso de su suegra, Orfelinda Benites de Ramos, tres de sus cuatro órdenes se ubican a partir de diciembre de 2021. Por su parte, su suegro, Gudelio Heracleo Ramos Parra, registra una nueva orden en marzo de 2025, luego de una pausa desde 2019. Asimismo, su prima, Melissa Ivonne Avalos Tubico, registra una orden de servicio en agosto de 2023. <br> Estos registros se ubican dentro del periodo en el que la normativa de contrataciones públicas establecía impedimentos para la contratación de familiares hasta el segundo grado de afinidad, como es el caso de la suegra y el suegro. En el caso de la prima, al no encontrarse dentro de los grados contemplados en la normativa, el registro se presenta como parte del mapeo de vínculos consignados en las declaraciones juradas de intereses, sin que ello implique, por sí mismo, una infracción a la normativa.</p>`,

    // Víctor Flores Ruiz
    "CP_17896798": `<p>El Comercio solicitó al congresista su descargo sobre los contratos y órdenes de servicio de sus familiares; hasta el cierre de esta publicación no se obtuvo respuesta.</p>`,

    // José Arriola Tueros
    "CP_25542661": `<p>Al ser consultado sobre los contratos y órdenes de servicio de sus familiares, el congresista José Arriola señaló que la información debe ser evaluada de manera rigurosa, a fin de evitar afectaciones a su honor.</p>`,

    // Elva Julón Irigoin
    "CP_46130369": `<p>Al ser consultada sobre las órdenes de servicio de sus familiares, la congresista Elva Julón señaló que el servicio observado corresponde al alquiler de un inmueble, precisando que dicha relación contractual se inició en el año 2013, antes de que ejerciera funciones legislativas. <br> Según los registros revisados, en el caso de su abuela paterna, Elva Rosa Díaz Delgado, 4 de sus 6 órdenes de servicio se ubican entre julio de 2018 y marzo de 2021, es decir, antes del inicio del actual periodo parlamentario. <br> No obstante, se identifican 2 órdenes de servicio adicionales emitidas con posterioridad al 28 de julio de 2021, ya durante su gestión. <br> Estos registros se ubican dentro del periodo en el que la normativa de contrataciones públicas establecía impedimentos para la contratación de familiares hasta el segundo grado de consanguinidad, como es el caso de la abuela.</p>`,

    // Raúl Huamán Coronado
    "CP_21564196": `<p>Al ser consultado sobre las órdenes de servicio de sus familiares, el congresista Raúl Huamán señaló que sustenta su posición en un fallo del Tribunal Constitucional sobre la materia. El presente análisis se basa en los registros identificados dentro del periodo evaluado, en el que la normativa de contrataciones públicas establecía impedimentos para la contratación de familiares de congresistas.</p>`,

    // Isaac Mita Alanoca
    "CP_00434972": `<p>El Comercio solicitó al congresista su descargo sobre los contratos y órdenes de servicio de sus familiares; hasta el cierre de esta publicación no se obtuvo respuesta.</p>`,

    // Arturo Alegría García
    "CP_45382589": `<p>Al ser consultado sobre las órdenes de servicio de sus familiares, el congresista Luis Alegría sostuvo que los contratos cuestionados corresponden a periodos previos al inicio de su gestión legislativa y que, por ello, no existiría prohibición alguna. <br> Según los registros revisados, en el caso de su hermano, Víctor Antonio Alegría García, 11 de sus 12 órdenes de servicio se ubican entre septiembre de 2013 y abril de 2021, es decir, antes del inicio del actual periodo parlamentario. <br> No obstante, en el caso de su padre, Víctor Alegría Gonzales, se identifican órdenes de servicio cuya emisión comienza en mayo de 2022, fecha posterior al inicio de la actual gestión parlamentaria. Estos registros se ubican dentro del periodo en el que la normativa de contrataciones públicas establecía impedimentos para la contratación de familiares directos de congresistas, como es el caso del padre.</p>`,

    // Ana Obando Morgan
    "CP_07737110": `<p>El Comercio solicitó al congresista su descargo sobre los contratos y órdenes de servicio de sus familiares; hasta el cierre de esta publicación no se obtuvo respuesta.</p>`,

    // Ernesto Bustamante Donayre
    "CP_08232920": `<p>El Comercio solicitó al congresista su descargo sobre los contratos y órdenes de servicio de sus familiares; hasta el cierre de esta publicación no se obtuvo respuesta.</p>`,

    // Américo Gonza
    "CP_41187802": `<p>El Comercio solicitó al congresista su descargo sobre los contratos y órdenes de servicio de sus familiares; hasta el cierre de esta publicación no se obtuvo respuesta.</p>`,

    // Silvana Robles
    "CP_42750152": `<p>El Comercio solicitó al congresista su descargo sobre los contratos y órdenes de servicio de sus familiares; hasta el cierre de esta publicación no se obtuvo respuesta.</p>`,

    // Nivardo Tello
    "CP_09575873": `<p>El Comercio solicitó al congresista su descargo sobre los contratos y órdenes de servicio de sus familiares; hasta el cierre de esta publicación no se obtuvo respuesta.</p>`,

    // Jeny López Morales
    "CP_09980339": `<p>Al ser consultada sobre los contratos y órdenes de servicio de sus familiares, la congresista Jeny López señaló que la municipalidad es la entidad responsable de las contrataciones y que, de identificarse irregularidades, solicitaría las acciones de control correspondientes.</p>`,

    // Pasión Dávila
    "CP_25700579": `<p>El Comercio solicitó al congresista su descargo sobre los contratos y órdenes de servicio de sus familiares; hasta el cierre de esta publicación no se obtuvo respuesta.</p>`,

    // Patricia Chirinos Venegas
    "CP_10280036": `<p>Al ser consultada sobre las órdenes de servicio de sus familiares, la congresista Patricia Chirinos solicitó mayor información para emitir un descargo detallado. Asimismo, señaló que no reconoce el nombre de uno de los familiares mencionados en la consulta. Sin embargo, dicho familiar aparece en su declaración jurada de 2022. <br> Cabe precisar que el familiar mencionado no se encuentra dentro de los grados de consanguinidad o afinidad contemplados en los impedimentos establecidos por la normativa de contrataciones vigente para el periodo analizado. En ese sentido, los registros identificados se presentan como parte del mapeo de vínculos consignados en las declaraciones juradas de intereses, sin que ello implique, por sí mismo, una infracción a la normativa.</p>`,

    // Victor Cutipa Ccama
    "CP_04647085": `<p>El Comercio solicitó al congresista su descargo sobre los contratos y órdenes de servicio de sus familiares; hasta el cierre de esta publicación no se obtuvo respuesta.</p>`,

    // Mery Infantes Castañeda
    "CP_16448130": `<p>El Comercio solicitó al congresista su descargo sobre los contratos y órdenes de servicio de sus familiares; hasta el cierre de esta publicación no se obtuvo respuesta.</p>`,

    // José Luna Gálvez
    "CP_07246887": `<p>El Comercio solicitó al congresista su descargo sobre los contratos y órdenes de servicio de sus familiares; hasta el cierre de esta publicación no se obtuvo respuesta.</p>`,

    // Gladys Echaíz de Nuñez Izaga
    "CP_16429203": `<p>Al ser consultada sobre los contratos y órdenes de servicio de sus familiares, la congresista Gladys Echaíz señaló que, conforme a la Constitución, todos los ciudadanos tienen derecho a trabajar. Asimismo, indicó que sus familiares no se encuentran impedidos por ley para contratar con el Estado. Cabe precisar que los familiares mencionados no se encuentran dentro de los grados de consanguinidad o afinidad contemplados en los impedimentos establecidos por la normativa de contrataciones vigente para el periodo analizado. En ese sentido, los registros identificados se presentan como parte del mapeo de vínculos consignados en las declaraciones juradas de intereses, sin que ello implique, por sí mismo, una infracción a la normativa.</p>`,

    // Alejandro Muñante
    "CP_45209282": `<p>El Comercio solicitó al congresista su descargo sobre los contratos y órdenes de servicio de sus familiares; hasta el cierre de esta publicación no se obtuvo respuesta.</p>`,

    // Jorge Marticorena Mendoza
    "CP_21456255": `<p>Al ser consultado sobre las órdenes de servicio de sus familiares, el congresista Alfonso Marticorena señaló que no existe impedimento legal para que estos contraten con el Estado, indicando que cuentan con experiencia previa y vínculos contractuales anteriores a su gestión legislativa. <br> Según los registros revisados, en el caso de su madre, Lastenia Mendoza de Marticorena, 96 de sus 494 órdenes de servicio se ubican entre septiembre de 2020 y julio de 2021, es decir, antes del inicio del actual periodo parlamentario. <br> En el caso de su hija, Milagros Marticorena Monge, 3 de sus 4 órdenes se registran en 2015, mientras que una orden adicional se ubica en abril de 2024, ya durante la actual gestión. <br> Este último registro se ubica dentro del periodo en el que la normativa de contrataciones públicas establecía impedimentos para la contratación de familiares directos de congresistas, como es el caso de la hija.</p>`,

    // Angel Aragón Carreño
    "CP_23977149": `<p>El Comercio solicitó al congresista su descargo sobre los contratos y órdenes de servicio de sus familiares; hasta el cierre de esta publicación no se obtuvo respuesta.</p>`,

    // Ariana Orué
    "CP_48164963": `<p>Al ser consultada sobre los contratos y órdenes de servicio de sus familiares, la congresista Ariana Orué señaló que no ha tenido injerencia en dichas contrataciones y que cumple con sus obligaciones de transparencia.</p>`,

    // Rosselli Amuruz
    "CP_44756974": `<p>El Comercio solicitó al congresista su descargo sobre los contratos y órdenes de servicio de sus familiares; hasta el cierre de esta publicación no se obtuvo respuesta.</p>`,

    // José Cueto
    "CP_06783615": `<p>Al ser consultado sobre los contratos y órdenes de servicio de sus familiares, el congresista José Cueto señaló que la persona mencionada no corresponde a su entorno familiar, sino que se trataría de un caso de homonimia. <br> Sin embargo, según los registros revisados, el DNI asociado a dicha persona coincide con el consignado en la declaración jurada del propio congresista, lo que permite establecer la vinculación familiar para efectos del presente análisis.</p>`,

};

// Texto por defecto si el ID no está en el mapa
DISCLAIMERS._default = `<p><strong>El Comercio</strong> contactó al congresista para recoger sus descargos; sin embargo, hasta la publicación de este especial no se obtuvo respuesta.</p>`;