// Estados de Venezuela y sus principales ciudades/municipios.
// Usado en el checkout para el selector Estado -> Ciudad.

export type EstadoVE = { estado: string; ciudades: string[] }

export const VENEZUELA: EstadoVE[] = [
  { estado: 'Amazonas', ciudades: ['Puerto Ayacucho', 'Maroa', 'La Esmeralda', 'San Fernando de Atabapo', 'San Juan de Manapiare', 'Isla Ratón'] },
  { estado: 'Anzoátegui', ciudades: ['Barcelona', 'Puerto La Cruz', 'Lechería', 'El Tigre', 'Anaco', 'Cantaura', 'Puerto Píritu', 'Guanta', 'Aragua de Barcelona', 'Pariaguán', 'San José de Guanipa', 'Clarines', 'Onoto', 'Boca de Uchire', 'Soledad'] },
  { estado: 'Apure', ciudades: ['San Fernando de Apure', 'Guasdualito', 'Achaguas', 'Biruaca', 'Elorza', 'Bruzual', 'San Juan de Payara'] },
  { estado: 'Aragua', ciudades: ['Maracay', 'Turmero', 'La Victoria', 'El Limón', 'Cagua', 'Villa de Cura', 'Palo Negro', 'Santa Rita', 'San Mateo', 'La Colonia Tovar', 'Las Tejerías', 'Magdaleno', 'El Consejo', 'Ocumare de la Costa', 'Choroní'] },
  { estado: 'Barinas', ciudades: ['Barinas', 'Socopó', 'Barinitas', 'Santa Bárbara', 'Sabaneta', 'Ciudad Bolivia', 'Libertad', 'Ciudad de Nutrias'] },
  { estado: 'Bolívar', ciudades: ['Ciudad Guayana', 'Puerto Ordaz', 'Ciudad Bolívar', 'Upata', 'Caicara del Orinoco', 'Santa Elena de Uairén', 'El Callao', 'Tumeremo', 'Guasipati', 'El Palmar', 'Maripa'] },
  { estado: 'Carabobo', ciudades: ['Valencia', 'Puerto Cabello', 'Guacara', 'Naguanagua', 'San Diego', 'Los Guayos', 'Bejuma', 'Morón', 'Mariara', 'Tocuyito', 'Güigüe', 'Montalbán', 'Miranda'] },
  { estado: 'Cojedes', ciudades: ['San Carlos', 'Tinaquillo', 'El Baúl', 'Tinaco', 'El Pao', 'Las Vegas', 'Libertad de Cojedes'] },
  { estado: 'Delta Amacuro', ciudades: ['Tucupita', 'Pedernales', 'Curiapo', 'Sierra Imataca'] },
  { estado: 'Distrito Capital', ciudades: ['Caracas'] },
  { estado: 'Falcón', ciudades: ['Coro', 'Punto Fijo', 'Santa Ana de Coro', 'La Vela de Coro', 'Dabajuro', 'Churuguara', 'Tucacas', 'Chichiriviche', 'Mene de Mauroa', 'Pueblo Nuevo', 'Judibana', 'Cumarebo', 'Píritu', 'Yaracal'] },
  { estado: 'Guárico', ciudades: ['San Juan de los Morros', 'Calabozo', 'Valle de la Pascua', 'Zaraza', 'Altagracia de Orituco', 'Las Mercedes', 'El Sombrero', 'Tucupido', 'Chaguaramas', 'Camaguán', 'Ortiz'] },
  { estado: 'Lara', ciudades: ['Barquisimeto', 'Cabudare', 'Carora', 'El Tocuyo', 'Quíbor', 'Sanare', 'Duaca', 'Sarare', 'Siquisique'] },
  { estado: 'La Guaira', ciudades: ['La Guaira', 'Maiquetía', 'Catia La Mar', 'Naiguatá', 'Caraballeda', 'Macuto', 'Carayaca', 'Camurí Grande'] },
  { estado: 'Mérida', ciudades: ['Mérida', 'El Vigía', 'Ejido', 'Tovar', 'Bailadores', 'Santa Cruz de Mora', 'Lagunillas', 'Timotes', 'Mucuchíes', 'Tabay', 'Nueva Bolivia'] },
  { estado: 'Miranda', ciudades: ['Los Teques', 'Guarenas', 'Guatire', 'Petare', 'Charallave', 'Cúa', 'Ocumare del Tuy', 'Santa Teresa del Tuy', 'San Antonio de los Altos', 'Carrizal', 'Higuerote', 'Río Chico', 'Santa Lucía', 'Baruta', 'Chacao', 'El Hatillo', 'San Francisco de Yare'] },
  { estado: 'Monagas', ciudades: ['Maturín', 'Punta de Mata', 'Caripito', 'Caripe', 'Temblador', 'Aragua de Maturín', 'Barrancas del Orinoco', 'Santa Bárbara', 'Quiriquire', 'Uracoa'] },
  { estado: 'Nueva Esparta', ciudades: ['La Asunción', 'Porlamar', 'Pampatar', 'Juan Griego', 'El Valle del Espíritu Santo', 'San Juan Bautista', 'Santa Ana', 'La Guardia', 'Boca de Río', 'Punta de Piedras'] },
  { estado: 'Portuguesa', ciudades: ['Guanare', 'Acarigua', 'Araure', 'Villa Bruzual', 'Píritu', 'Turén', 'Ospino', 'Biscucuy', 'Guanarito', 'Agua Blanca', 'Papelón'] },
  { estado: 'Sucre', ciudades: ['Cumaná', 'Carúpano', 'Güiria', 'Cariaco', 'Río Caribe', 'Casanay', 'Marigüitar', 'San Antonio del Golfo', 'Yaguaraparo', 'Araya', 'El Pilar', 'Irapa'] },
  { estado: 'Táchira', ciudades: ['San Cristóbal', 'Táriba', 'La Fría', 'Rubio', 'San Antonio del Táchira', 'Ureña', 'Colón', 'La Grita', 'Michelena', 'Palmira', 'Santa Ana', 'Pregonero', 'San Josecito', 'Capacho'] },
  { estado: 'Trujillo', ciudades: ['Trujillo', 'Valera', 'Boconó', 'La Quebrada', 'Sabana de Mendoza', 'Carvajal', 'Pampán', 'Escuque', 'Betijoque', 'Motatán', 'Monay'] },
  { estado: 'Yaracuy', ciudades: ['San Felipe', 'Yaritagua', 'Chivacoa', 'Nirgua', 'Cocorote', 'Independencia', 'Aroa', 'Guama', 'Urachiche', 'Sabana de Parra'] },
  { estado: 'Zulia', ciudades: ['Maracaibo', 'Cabimas', 'Ciudad Ojeda', 'San Francisco', 'Machiques', 'Santa Bárbara del Zulia', 'La Concepción', 'Villa del Rosario', 'Santa Rita', 'Lagunillas', 'Bachaquero', 'San Rafael de El Moján', 'Encontrados', 'Bobures', 'Mene Grande'] },
]
