import json
import urllib.request

def generar_json():
    # API pública con datos científicos de la tabla periódica
    url = "https://raw.githubusercontent.com/Bowserinator/Periodic-Table-JSON/master/PeriodicTableJSON.json"
    
    # Diccionario de traducción al español
    traducciones = {
        "Hydrogen":"Hidrógeno", "Helium":"Helio", "Lithium":"Litio", "Beryllium":"Berilio", "Boron":"Boro",
        "Carbon":"Carbono", "Nitrogen":"Nitrógeno", "Oxygen":"Oxígeno", "Fluorine":"Flúor", "Neon":"Neón",
        "Sodium":"Sodio", "Magnesium":"Magnesio", "Aluminum":"Aluminio", "Silicon":"Silicio", "Phosphorus":"Fósforo",
        "Sulfur":"Azufre", "Chlorine":"Cloro", "Argon":"Argón", "Potassium":"Potasio", "Calcium":"Calcio",
        "Scandium":"Escandio", "Titanium":"Titanio", "Vanadium":"Vanadio", "Chromium":"Cromo", "Manganese":"Manganeso",
        "Iron":"Hierro", "Cobalt":"Cobalto", "Nickel":"Níquel", "Copper":"Cobre", "Zinc":"Zinc",
        "Gallium":"Galio", "Germanium":"Germanio", "Arsenic":"Arsénico", "Selenium":"Selenio", "Bromine":"Bromo",
        "Krypton":"Kriptón", "Rubidium":"Rubidio", "Strontium":"Estroncio", "Yttrium":"Itrio", "Zirconium":"Circonio",
        "Niobium":"Niobio", "Molybdenum":"Molibdeno", "Technetium":"Tecnecio", "Ruthenium":"Rutenio", "Rhodium":"Rodio",
        "Palladium":"Paladio", "Silver":"Plata", "Cadmium":"Cadmio", "Indium":"Indio", "Tin":"Estaño",
        "Antimony":"Antimonio", "Tellurium":"Telurio", "Iodine":"Yodo", "Xenon":"Xenón", "Cesium":"Cesio",
        "Barium":"Bario", "Lanthanum":"Lantano", "Cerium":"Cerio", "Praseodymium":"Praseodimio", "Neodymium":"Neodimio",
        "Promethium":"Prometio", "Samarium":"Samario", "Europium":"Europio", "Gadolinium":"Gadolinio", "Terbium":"Terbio",
        "Dysprosium":"Disprosio", "Holmium":"Holmio", "Erbium":"Erbio", "Thulium":"Tulio", "Ytterbium":"Iterbio",
        "Lutetium":"Lutecio", "Hafnium":"Hafnio", "Tantalum":"Tantalio", "Tungsten":"Wolframio", "Rhenium":"Renio",
        "Osmium":"Osmio", "Iridium":"Iridio", "Platinum":"Platino", "Gold":"Oro", "Mercury":"Mercurio",
        "Thallium":"Talio", "Lead":"Plomo", "Bismuth":"Bismuto", "Polonium":"Polonio", "Astatine":"Astato",
        "Radon":"Radón", "Francium":"Francio", "Radium":"Radio", "Actinium":"Actinio", "Thorium":"Torio",
        "Protactinium":"Protactinio", "Uranium":"Uranio", "Neptunium":"Neptunio", "Plutonium":"Plutonio", "Americium":"Americio",
        "Curium":"Curio", "Berkelium":"Berkelio", "Californium":"Californio", "Einsteinium":"Einstenio", "Fermium":"Fermio",
        "Mendelevium":"Mendelevio", "Nobelium":"Nobelio", "Lawrencium":"Lawrencio", "Rutherfordium":"Rutherfordio", "Dubnium":"Dubnio",
        "Seaborgium":"Seaborgio", "Bohrium":"Bohrio", "Hassium":"Hassio", "Meitnerium":"Meitnerio", "Darmstadtium":"Darmstadtio",
        "Roentgenium":"Roentgenio", "Copernicium":"Copernicio", "Nihonium":"Nihonio", "Flerovium":"Flerovio", "Moscovium":"Moscovio",
        "Livermorium":"Livermorio", "Tennessine":"Teneso", "Oganesson":"Oganesón"
    }

    # Mapa de colores neón por familia química
    colores = {
        "diatomic nonmetal": "#00f0ff", "noble gas": "#ff3366", "alkali metal": "#ff6666",
        "alkaline earth metal": "#ffaa00", "metalloid": "#99ccff", "polyatomic nonmetal": "#00ff00",
        "post-transition metal": "#cccccc", "transition metal": "#ffd700", "lanthanide": "#ffbfff",
        "actinide": "#c299ff"
    }

    print("Descargando datos de la tabla periódica...")
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    
    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            
        elementos_finales = []
        
        for el in data['elements']:
            # Mapeo de estado natural (Fase)
            estado_en = el.get('phase', 'Solid')
            estado = "Gas" if estado_en == "Gas" else "Líquido" if estado_en == "Liquid" else "Sólido"
            
            # Asignación de color procedural
            cat = el.get('category', '').lower()
            color = "#ffffff"
            for key, val in colores.items():
                if key in cat:
                    color = val
                    break
                    
            # Traducción del nombre
            nombre_en = el.get('name', '')
            nombre_es = traducciones.get(nombre_en, nombre_en)
            
            # Descripción genérica en español
            cat_es = cat.replace("noble gas", "gas noble").replace("transition metal", "metal de transición").replace("alkali metal", "metal alcalino").replace("diatomic nonmetal", "no metal").replace("metalloid", "metaloide").replace("actinide", "actínido").replace("lanthanide", "lantánido")
            desc = f"El {nombre_es} es un elemento químico de número atómico {el.get('number')}, clasificado como {cat_es}."
            
            # Ensamblado del JSON estructurado para la UI
            elemento = {
                "numero_atomico": el.get('number'),
                "simbolo": el.get('symbol'),
                "nombre": nombre_es,
                "masa_atomica": round(el.get('atomic_mass', 0), 3) if el.get('atomic_mass') else "Desconocida",
                "estado_natural": estado,
                "configuracion_electronica": el.get('electron_configuration', 'N/A'),
                "electronegatividad": el.get('electronegativity_pauling', 0) or 0,
                "descripcion": desc,
                "color_tema": color
            }
            elementos_finales.append(elemento)

        # Sobreescribir el archivo JSON local
        with open('data/elementos.json', 'w', encoding='utf-8') as f:
            json.dump(elementos_finales, f, ensure_ascii=False, indent=2)
            
        print(f"¡Éxito! Se generaron {len(elementos_finales)} elementos en data/elementos.json")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    generar_json()