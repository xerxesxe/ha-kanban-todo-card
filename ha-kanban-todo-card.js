/*
  ha-kanban-todo-card
  --------------------------------------------------------------------
  Home Assistant Lovelace card for todo.* entities:
  Kanban-Layout with drag-and-drop between lists.

  Fork of Raptor Todo Hub Card by Inter-Raptor (Vivien Jardot)
  Original: https://github.com/Inter-Raptor/raptor-todo-hub-card

  Kanban layout + Drag-and-Drop additions by xerxesxe (2026).
  Licensed under MIT.
  --------------------------------------------------------------------
*/

/* "Raptor" ASCII logo ---------------------------------------------------- */
//                                   .,.                                          
//                       *******                        *#### (#####              
//                  ******                          / ########     .#####.        
//              ,*****                          //////##########   #####  /####   
//           .*****                           // /////*#####################  ##  
//         ******                             //// /// ######*      *############ 
//       ******                               ////// /   ###########,            
//     .*****                                 ////////     ##################     
//    ******                                  //////// #                         
//   *****.                                  ## ////// ###                       
//  *****,                              #########/ /// #####/                  , 
// ,*****                           ################ /.######                  
// *****                       (####################   (#####                  
// ******                   #####   ########   ////////   ###                   .*
//,******             .*** ######### #####*   /////////     # /                 *
// *********    .******* ############ ###### ////////       ////                *
//  ******************* (############# #####///////      *///// ##              *
//   ****************** //// ,######### ###  /########       #########          *
//     ****************  ////////  #####/(       #######.          ####         *
//                       /////// /////  ##     //    (####           ###       **
//                        ///// //////////, /////     .####       /*(##       **
//                       ////// ///////    / ////   ## ###         ,         ,**
//                     ////////////       // ///      #                     ***.
//    .              /////////,         ////,/                             ***   
//                   ///               ......                            ****    
//       ,           ,///##              /////                         ****.     
//         *.         // ###              ,/// /                     *****       
//           ,*       / ####                /*/// ///             *****          
//              **,    ####( ####             ///// ///        ******            
//                 ****  ##### #####                      ,*******               
//                     ******.                      **********                   
//                           ***************************                         

// ---- Raptor Todo Hub Card - multi-list todo hub (grocery / tasks / rooms) ----




const LovelaceView =
  customElements.get("hui-masonry-view") || customElements.get("hui-view");
const LitElementBase = LovelaceView
  ? Object.getPrototypeOf(LovelaceView)
  : HTMLElement;

const html = LitElementBase.prototype.html;
const css = LitElementBase.prototype.css;

// Tag de suppression auto stocké dans le summary : #rtrm(start,delay)
const AUTO_REMOVE_TAG_REGEX = /#rtrm\((\d+),(\d+)\)/;

const HA_KANBAN_TODO_CARD_VERSION = "1.5.0";

// Minimum gap between adjacent manual positions before we must renumber
// (float precision exhaustion — after ~52 midpoint inserts at the same spot).
const MIN_POSITION_GAP = 0.001;

// Presets intégrés
const KANBAN_TODO_PRESETS = {
  // ----- COURSES : ~20 RAYONS -----
  grocery: [
    {
      key: "fruits_legumes",
      match: "#fruits",
      labels: {
        en: "Fruit & vegetables",
        fr: "Fruits & légumes",
        de: "Obst & Gemüse",
        es: "Frutas y verduras",
      },
      icon: "mdi:fruit-watermelon",
      color_off: "#9ca3af",
      color_on: "#22c55e",
    },
    {
      key: "frais",
      match: "#frais",
      labels: {
        en: "Chilled / Fresh",
        fr: "Frais",
        de: "Frische Produkte",
        es: "Frescos",
      },
      icon: "mdi:food-apple",
      color_off: "#9ca3af",
      color_on: "#4ade80",
    },
    {
      key: "surgeles",
      match: "#surg",
      labels: {
        en: "Frozen",
        fr: "Surgelés",
        de: "Tiefkühl",
        es: "Congelados",
      },
      icon: "mdi:snowflake",
      color_off: "#9ca3af",
      color_on: "#0ea5e9",
    },
    {
      key: "boucherie",
      match: "#bouch",
      labels: {
        en: "Butchery",
        fr: "Boucherie",
        de: "Metzgerei",
        es: "Carnicería",
      },
      icon: "mdi:food-steak",
      color_off: "#9ca3af",
      color_on: "#f97316",
    },
    {
      key: "poissonnerie",
      match: "#poiss",
      labels: {
        en: "Fish",
        fr: "Poissonnerie",
        de: "Fisch",
        es: "Pescadería",
      },
      icon: "mdi:fish",
      color_off: "#9ca3af",
      color_on: "#22c55e",
    },
    {
      key: "boulangerie",
      match: "#boul",
      labels: {
        en: "Bakery",
        fr: "Boulangerie",
        de: "Bäckerei",
        es: "Panadería",
      },
      icon: "mdi:bread-slice",
      color_off: "#9ca3af",
      color_on: "#eab308",
    },
    {
      key: "epicerie_salee",
      match: "#epis",
      labels: {
        en: "Savory grocery",
        fr: "Épicerie salée",
        de: "Herzhafte Lebensmittel",
        es: "Ultramarinos salados",
      },
      icon: "mdi:food-variant",
      color_off: "#9ca3af",
      color_on: "#f97316",
    },
    {
      key: "epicerie_sucree",
      match: "#epid",
      labels: {
        en: "Sweet grocery",
        fr: "Épicerie sucrée",
        de: "Süße Lebensmittel",
        es: "Ultramarinos dulces",
      },
      icon: "mdi:candy",
      color_off: "#9ca3af",
      color_on: "#a855f7",
    },
    {
      key: "pates_riz",
      match: "#pates",
      labels: {
        en: "Pasta & rice",
        fr: "Pâtes / Riz",
        de: "Nudeln & Reis",
        es: "Pasta y arroz",
      },
      icon: "mdi:noodles",
      color_off: "#9ca3af",
      color_on: "#facc15",
    },
    {
      key: "conserves",
      match: "#cons",
      labels: {
        en: "Canned food",
        fr: "Conserves",
        de: "Konserven",
        es: "Conservas",
      },
      icon: "mdi:food-can",
      color_off: "#9ca3af",
      color_on: "#f97316",
    },
    {
      key: "boissons",
      match: "#boiss",
      labels: {
        en: "Drinks",
        fr: "Boissons",
        de: "Getränke",
        es: "Bebidas",
      },
      icon: "mdi:bottle-soda",
      color_off: "#9ca3af",
      color_on: "#22c55e",
    },
    {
      key: "eau",
      match: "#eau",
      labels: {
        en: "Water",
        fr: "Eau",
        de: "Wasser",
        es: "Agua",
      },
      icon: "mdi:cup-water",
      color_off: "#9ca3af",
      color_on: "#0ea5e9",
    },
    {
      key: "petit_dej",
      match: "#dej",
      labels: {
        en: "Breakfast",
        fr: "Petit déj",
        de: "Frühstück",
        es: "Desayuno",
      },
      icon: "mdi:coffee-outline",
      color_off: "#9ca3af",
      color_on: "#f59e0b",
    },
    {
      key: "snacking",
      match: "#snack",
      labels: {
        en: "Snacks",
        fr: "Snacking",
        de: "Snacks",
        es: "Snacks",
      },
      icon: "mdi:food",
      color_off: "#9ca3af",
      color_on: "#f97316",
    },
    {
      key: "hygiene",
      match: "#hyg",
      labels: {
        en: "Hygiene",
        fr: "Hygiène",
        de: "Hygiene",
        es: "Higiene",
      },
      icon: "mdi:shower-head",
      color_off: "#9ca3af",
      color_on: "#6366f1",
    },
    {
      key: "beaute",
      match: "#beaute",
      labels: {
        en: "Beauty",
        fr: "Beauté",
        de: "Kosmetik",
        es: "Belleza",
      },
      icon: "mdi:lipstick",
      color_off: "#9ca3af",
      color_on: "#db2777",
    },
    {
      key: "bebe",
      match: "#bebe",
      labels: {
        en: "Baby",
        fr: "Bébé",
        de: "Baby",
        es: "Bebé",
      },
      icon: "mdi:baby-face-outline",
      color_off: "#9ca3af",
      color_on: "#22c55e",
    },
    {
      key: "animaux",
      match: "#anim",
      labels: {
        en: "Pets",
        fr: "Animaux",
        de: "Haustiere",
        es: "Mascotas",
      },
      icon: "mdi:paw",
      color_off: "#9ca3af",
      color_on: "#22c55e",
    },
    {
      key: "menage",
      match: "#men",
      labels: {
        en: "Cleaning",
        fr: "Ménage",
        de: "Haushalt",
        es: "Limpieza",
      },
      icon: "mdi:spray-bottle",
      color_off: "#9ca3af",
      color_on: "#6366f1",
    },
    {
      key: "entretien",
      match: "#entretien",
      labels: {
        en: "Maintenance",
        fr: "Entretien",
        de: "Wartung",
        es: "Mantenimiento",
      },
      icon: "mdi:tools",
      color_off: "#9ca3af",
      color_on: "#10b981",
    },
  ],

  // ----- URGENCE -----
  urgency: [
    {
      key: "no_due",
      match: "#nodue",
      labels: {
        en: "No deadline",
        fr: "Sans date",
        de: "Keine Frist",
        es: "Sin fecha",
      },
      icon: "mdi:calendar-remove-outline",
      color_off: "#9ca3af",
      color_on: "#6b7280",
    },
    {
      key: "long",
      match: "#long",
      labels: {
        en: "Long term",
        fr: "Long terme",
        de: "Langfristig",
        es: "Largo plazo",
      },
      icon: "mdi:calendar-month-outline",
      color_off: "#9ca3af",
      color_on: "#3b82f6",
      max_days: 30,
      warning_start_days: 7,
    },
    {
      key: "normal",
      match: "#norm",
      labels: {
        en: "Normal",
        fr: "Normal",
        de: "Normal",
        es: "Normal",
      },
      icon: "mdi:checkbox-blank-circle-outline",
      color_off: "#9ca3af",
      color_on: "#22c55e",
      max_days: 7,
      warning_start_days: 3,
    },
    {
      key: "bientot",
      match: "#soon",
      labels: {
        en: "Soon",
        fr: "Bientôt",
        de: "Bald",
        es: "Pronto",
      },
      icon: "mdi:clock-alert-outline",
      color_off: "#9ca3af",
      color_on: "#f97316",
      max_days: 4,
    },
    {
      key: "urgent",
      match: "#urg",
      labels: {
        en: "Urgent",
        fr: "Urgent",
        de: "Dringend",
        es: "Urgente",
      },
      icon: "mdi:alert",
      color_off: "#9ca3af",
      color_on: "#ef4444",
      max_days: 2,
      warning_start_days: 1,
    },
  ],

  // ----- HORIZON -----
  timeframe: [
    {
      key: "anytime",
      match: "#any",
      labels: {
        en: "Whenever",
        fr: "Quand on veut",
        de: "Wann man will",
        es: "Cuando sea",
      },
      icon: "mdi:infinity",
      color_off: "#9ca3af",
      color_on: "#6b7280",
    },
    {
      key: "today",
      match: "#today",
      labels: {
        en: "Today",
        fr: "Dans la journée",
        de: "Heute",
        es: "Hoy",
      },
      icon: "mdi:calendar-today",
      color_off: "#9ca3af",
      color_on: "#22c55e",
      max_days: 1,
    },
    {
      key: "week",
      match: "#week",
      labels: {
        en: "This week",
        fr: "Dans la semaine",
        de: "Diese Woche",
        es: "Esta semana",
      },
      icon: "mdi:calendar-week",
      color_off: "#9ca3af",
      color_on: "#22c55e",
      max_days: 7,
    },
    {
      key: "twoweeks",
      match: "#2w",
      labels: {
        en: "Within 2 weeks",
        fr: "Dans 2 semaines",
        de: "In 2 Wochen",
        es: "En 2 semanas",
      },
      icon: "mdi:calendar-range",
      color_off: "#9ca3af",
      color_on: "#f59e0b",
      max_days: 14,
    },
    {
      key: "month",
      match: "#month",
      labels: {
        en: "This month",
        fr: "Dans le mois",
        de: "Diesen Monat",
        es: "Este mes",
      },
      icon: "mdi:calendar-month",
      color_off: "#9ca3af",
      color_on: "#f97316",
      max_days: 30,
    },
    {
      key: "year",
      match: "#year",
      labels: {
        en: "This year",
        fr: "Dans l'année",
        de: "Dieses Jahr",
        es: "Este año",
      },
      icon: "mdi:calendar-star",
      color_off: "#9ca3af",
      color_on: "#3b82f6",
      max_days: 365,
    },
  ],

  // ----- PIECES -----
  rooms: [
    {
      key: "salon",
      match: "#salon",
      labels: {
        en: "Living room",
        fr: "Salon",
        de: "Wohnzimmer",
        es: "Salón",
      },
      icon: "mdi:sofa",
      color_off: "#9ca3af",
      color_on: "#f97316",
    },
    {
      key: "cuisine",
      match: "#cuisine",
      labels: {
        en: "Kitchen",
        fr: "Cuisine",
        de: "Küche",
        es: "Cocina",
      },
      icon: "mdi:stove",
      color_off: "#9ca3af",
      color_on: "#22c55e",
    },
    {
      key: "sdb",
      match: "#sdb",
      labels: {
        en: "Bathroom",
        fr: "Salle de bain",
        de: "Badezimmer",
        es: "Baño",
      },
      icon: "mdi:shower",
      color_off: "#9ca3af",
      color_on: "#0ea5e9",
    },
    {
      key: "wc",
      match: "#wc",
      labels: {
        en: "Toilet",
        fr: "WC",
        de: "WC",
        es: "WC",
      },
      icon: "mdi:toilet",
      color_off: "#9ca3af",
      color_on: "#6366f1",
    },
    {
      key: "ch_parents",
      match: "#ch_par",
      labels: {
        en: "Parents' room",
        fr: "Ch. parents",
        de: "Elternzimmer",
        es: "Dorm. padres",
      },
      icon: "mdi:bed-king",
      color_off: "#9ca3af",
      color_on: "#a855f7",
    },
    {
      key: "ch_enfant",
      match: "#ch_enf",
      labels: {
        en: "Kids' room",
        fr: "Ch. enfant",
        de: "Kinderzimmer",
        es: "Dorm. niño",
      },
      icon: "mdi:bed-single",
      color_off: "#9ca3af",
      color_on: "#22c55e",
    },
    {
      key: "bureau",
      match: "#bureau",
      labels: {
        en: "Office",
        fr: "Bureau",
        de: "Büro",
        es: "Despacho",
      },
      icon: "mdi:desk",
      color_off: "#9ca3af",
      color_on: "#3b82f6",
    },
    {
      key: "garage",
      match: "#garage",
      labels: {
        en: "Garage",
        fr: "Garage",
        de: "Garage",
        es: "Garaje",
      },
      icon: "mdi:garage",
      color_off: "#9ca3af",
      color_on: "#f97316",
    },
    {
      key: "buanderie",
      match: "#buand",
      labels: {
        en: "Laundry",
        fr: "Buanderie",
        de: "Waschküche",
        es: "Lavadero",
      },
      icon: "mdi:washing-machine",
      color_off: "#9ca3af",
      color_on: "#0ea5e9",
    },
    {
      key: "couloir",
      match: "#couloir",
      labels: {
        en: "Hallway",
        fr: "Couloir",
        de: "Flur",
        es: "Pasillo",
      },
      icon: "mdi:arrow-right-bold",
      color_off: "#9ca3af",
      color_on: "#6b7280",
    },
    {
      key: "exterieur",
      match: "#ext",
      labels: {
        en: "Outside",
        fr: "Extérieur",
        de: "Außenbereich",
        es: "Exterior",
      },
      icon: "mdi:tree",
      color_off: "#9ca3af",
      color_on: "#22c55e",
    },
  ],
};

// couleurs par défaut pour la barre de progression (en % réalisés)
const DEFAULT_PROGRESS_COLORS = [
  { threshold: 90, color: "#3b82f6" }, // bleu
  { threshold: 60, color: "#22c55e" }, // vert
  { threshold: 40, color: "#f97316" }, // orange
  { threshold: 0, color: "#ef4444" }, // rouge
];

// couleur neutre (listes vides)
const DEFAULT_EMPTY_LIST_COLOR = "#9ca3af";

// ---- SortableJS dynamic ESM loader (cached at module level) ----
let _SortablePromise = null;
function loadSortable() {
  if (!_SortablePromise) {
    _SortablePromise = import(
      "https://cdn.jsdelivr.net/npm/sortablejs@1.15.6/+esm"
    ).then((m) => m.default || m.Sortable || m);
  }
  return _SortablePromise;
}

// ---- UI translations (only UI strings, not your todo content) ----
const UI_LABELS = {
  en: {
    config_missing_lists: "HA Kanban Todo Card needs a 'lists' field.",
    default_title: "Tasks & shopping",
    subtitle: (done, total, percent, isEmpty) =>
      isEmpty ? "No tasks in this list." : `${done}/${total} completed (${percent}%)`,
    active: "ACTIVE",
    completed: "COMPLETED",
    empty_active: "No active task 🎉",
    empty_completed: "No completed task.",
    add_placeholder: "Add…",
    add_button: "Add",
    no_list: "No list configured.",
    entity_missing: (id) => `Entity not found: ${id}`,
    confirm_delete: (label) => `Permanently delete this task?\n\n"${label}"`,
    due_prefix: "Due",
    edit_hint: "Click to edit",
    edit_title: "Edit task",
    edit_summary: "Title",
    edit_description: "Description",
    edit_completed: "Completed",
    edit_labels: "Labels",
    edit_save: "Save",
    edit_cancel: "Cancel",
    edit_delete: "Delete",
    edit_due: "Due date",
    edit_due_clear: "Clear",
    due_today: "Today",
    due_tomorrow: "Tomorrow",
    due_yesterday: "Yesterday",
    due_in_n_days: "in {n} days",
    due_n_days_ago: "{n} days ago",
    filter_placeholder: "Filter…",
  },
  fr: {
    config_missing_lists:
      "La carte HA Kanban Todo a besoin d'un champ 'lists'.",
    default_title: "Tâches & courses",
    subtitle: (done, total, percent, isEmpty) =>
      isEmpty ? "Aucune tâche dans cette liste." : `${done}/${total} tâches terminées (${percent}%)`,
    active: "ACTIFS",
    completed: "COMPLÉTÉS",
    empty_active: "Aucune tâche active 🎉",
    empty_completed: "Aucune tâche complétée.",
    add_placeholder: "Ajouter…",
    add_button: "Ajouter",
    no_list: "Aucune liste configurée.",
    entity_missing: (id) => `Entité introuvable : ${id}`,
    confirm_delete: (label) =>
      `Supprimer définitivement la tâche :\n\n"${label}" ?`,
    due_prefix: "Échéance",
    edit_hint: "Cliquer pour modifier",
    edit_title: "Modifier la tâche",
    edit_summary: "Titre",
    edit_description: "Description",
    edit_completed: "Terminée",
    edit_labels: "Étiquettes",
    edit_save: "Enregistrer",
    edit_cancel: "Annuler",
    edit_delete: "Supprimer",
    edit_due: "Date d'échéance",
    edit_due_clear: "Effacer",
    due_today: "Aujourd'hui",
    due_tomorrow: "Demain",
    due_yesterday: "Hier",
    due_in_n_days: "dans {n} jours",
    due_n_days_ago: "il y a {n} jours",
    filter_placeholder: "Filtrer…",
  },
  de: {
    config_missing_lists: "HA Kanban Todo Card benötigt ein 'lists'-Feld.",
    default_title: "Aufgaben & Einkäufe",
    subtitle: (done, total, percent, isEmpty) =>
      isEmpty ? "Keine Aufgaben in dieser Liste." : `${done}/${total} erledigt (${percent}%)`,
    active: "OFFEN",
    completed: "ERLEDIGT",
    empty_active: "Keine offenen Aufgaben 🎉",
    empty_completed: "Keine erledigten Aufgaben.",
    add_placeholder: "Hinzufügen…",
    add_button: "Hinzufügen",
    no_list: "Keine Liste konfiguriert.",
    entity_missing: (id) => `Entität nicht gefunden: ${id}`,
    confirm_delete: (label) => `Diese Aufgabe dauerhaft löschen?\n\n"${label}"`,
    due_prefix: "Fällig",
    edit_hint: "Klicken zum Bearbeiten",
    edit_title: "Aufgabe bearbeiten",
    edit_summary: "Titel",
    edit_description: "Beschreibung",
    edit_completed: "Erledigt",
    edit_labels: "Labels",
    edit_save: "Speichern",
    edit_cancel: "Abbrechen",
    edit_delete: "Löschen",
    edit_due: "Fälligkeitsdatum",
    edit_due_clear: "Löschen",
    due_today: "Heute",
    due_tomorrow: "Morgen",
    due_yesterday: "Gestern",
    due_in_n_days: "in {n} Tagen",
    due_n_days_ago: "vor {n} Tagen",
    filter_placeholder: "Filtern…",
  },
  es: {
    config_missing_lists: "HA Kanban Todo Card necesita un campo 'lists'.",
    default_title: "Tareas y compras",
    subtitle: (done, total, percent, isEmpty) =>
      isEmpty ? "Sin tareas en esta lista." : `${done}/${total} completadas (${percent}%)`,
    active: "ACTIVAS",
    completed: "COMPLETADAS",
    empty_active: "Sin tareas activas 🎉",
    empty_completed: "Sin tareas completadas.",
    add_placeholder: "Añadir…",
    add_button: "Añadir",
    no_list: "Ninguna lista configurada.",
    entity_missing: (id) => `Entidad no encontrada: ${id}`,
    confirm_delete: (label) => `¿Eliminar esta tarea permanentemente?\n\n"${label}"`,
    due_prefix: "Vence",
    edit_hint: "Pulsa para editar",
    edit_title: "Editar tarea",
    edit_summary: "Título",
    edit_description: "Descripción",
    edit_completed: "Completada",
    edit_labels: "Etiquetas",
    edit_save: "Guardar",
    edit_cancel: "Cancelar",
    edit_delete: "Eliminar",
    edit_due: "Fecha de vencimiento",
    edit_due_clear: "Borrar",
    due_today: "Hoy",
    due_tomorrow: "Mañana",
    due_yesterday: "Ayer",
    due_in_n_days: "en {n} días",
    due_n_days_ago: "hace {n} días",
    filter_placeholder: "Filtrar…",
  },
};

class HaKanbanTodoCard extends LitElementBase {
  static get properties() {
    return {
      hass: {},
      _config: {},
      _activeIndex: { type: Number },
      _itemsByEntity: { type: Object },
      _newText: { type: String },
      _newTextByEntity: { type: Object },
      _selectedCatByEntity: { type: Object },
      _holdTimer: { type: Object },
      _holdActive: { type: Boolean },
      _dragging: { type: Boolean },
      _editingItem: { type: Object },
      _filterText: { type: String },
    };
  }

  setConfig(config) {
    if (!config.lists || !Array.isArray(config.lists) || !config.lists.length) {
      const langGuess = (config.language || "en").toLowerCase().split(/[-_]/)[0];
      const langKey = UI_LABELS[langGuess] ? langGuess : "en";
      throw new Error(UI_LABELS[langKey].config_missing_lists);
    }

    config.lists.forEach((list, i) => {
      if (!list.entity || typeof list.entity !== "string") {
        throw new Error(`ha-kanban-todo-card: lists[${i}] is missing 'entity'`);
      }
      if (list.layout !== undefined) {
        console.warn(`ha-kanban-todo-card: 'layout' belongs at the top level, not under lists[${i}]`);
      }
    });

    // Layout mode: 'kanban' (default) or 'tabs' (legacy Raptor behavior)
    const layout = config.layout || "kanban";
    if (layout !== "kanban" && layout !== "tabs") {
      throw new Error(
        `ha-kanban-todo-card: layout must be 'kanban' or 'tabs', got '${layout}'`
      );
    }

    const rawLang = config.language || config.languages || "en";
    const lang = String(rawLang).toLowerCase().split("-")[0];
    const langKey = UI_LABELS[lang] ? lang : "en";

    this._config = {
      title: config.title || UI_LABELS[langKey].default_title,
      title_mode: config.title_mode || "static",
      language: rawLang,
      lists: config.lists,
      progress_colors: config.progress_colors || DEFAULT_PROGRESS_COLORS,
      layout,
    };

    this._activeIndex = 0;
    this._itemsByEntity = {};
    this._newText = "";
    this._newTextByEntity = {};
    this._selectedCatByEntity = {};
    this._holdTimer = null;
    this._holdActive = false;
    this._kanbanUiState = {};
    this._dragging = false;
    this._filterText = "";
    // Verbose console logging for DnD — enable via `debug: true` in card config.
    this._kanbanDebug = !!config.debug;
  }

  set hass(hass) {
    this._hass = hass;
    this.requestUpdate();
  }

  get hass() {
    return this._hass;
  }

  getCardSize() {
    return 4;
  }

  // ------------------ HELPERS LANGUE ------------------

  _getLang() {
    if (this._config && this._config.language) {
      return this._normalizeLang(this._config.language);
    }
    const h = this.hass;
    if (h) {
      const cand = (h.locale && h.locale.language) || h.language || "en";
      return this._normalizeLang(cand);
    }
    return "en";
  }

  _normalizeLang(code) {
    if (!code) return "en";
    const short = String(code).toLowerCase().split("-")[0];
    return ["en", "fr", "de", "es"].includes(short) ? short : "en";
  }

  _getCategoryLabel(cat) {
    if (!cat) return "";
    const lang = this._getLang();
    if (cat.labels && cat.labels[lang]) return cat.labels[lang];
    if (cat.label) return cat.label;
    return cat.key || "";
  }

  _ui(key, ...args) {
    const lang = this._getLang();
    const dict = UI_LABELS[lang] || UI_LABELS.en;
    const val = dict[key] ?? UI_LABELS.en[key];
    return typeof val === "function" ? val(...args) : val;
  }

  // ------------------ HELPERS AUTO-REMOVE ------------------

  _parseAutoRemoveMeta(summary) {
    if (!summary) return null;
    const m = summary.match(AUTO_REMOVE_TAG_REGEX);
    if (!m) return null;
    return {
      start: parseInt(m[1], 10),
      delay: parseInt(m[2], 10),
    };
  }

  _stripAutoRemoveMeta(summary) {
    if (!summary) return summary;
    return summary.replace(AUTO_REMOVE_TAG_REGEX, "").trim();
  }

  _getAutoRemoveDelaySeconds(list) {
    const seconds = list.auto_remove_completed_seconds;
    if (!seconds || seconds <= 0) return 0;
    return seconds;
  }

  async _processAutoRemovalsForEntity(entityId, items) {
    if (!this._config || !this._config.lists) return;
    const list = this._config.lists.find((l) => l.entity === entityId);
    if (!list) return;

    const nowSec = Math.floor(Date.now() / 1000);
    const toRemove = [];

    for (const item of items) {
      if (item.status !== "completed") continue;
      const meta = this._parseAutoRemoveMeta(item.summary || "");
      if (!meta) {
        const delay = this._getAutoRemoveDelaySeconds(list);
        if (delay > 0) {
          const base = this._stripAutoRemoveMeta(item.summary || "");
          const newSummary = `${base} #rtrm(${nowSec},${delay})`;
          try {
            await this._recreateItemWithSummaryAndStatus(
              entityId,
              item,
              newSummary,
              "completed"
            );
          } catch (err) {
            console.error("HaKanbanTodoCard: erreur ajout tag rtrm", err);
          }
        }
        continue;
      }

      const end = meta.start + meta.delay;
      if (nowSec >= end) {
        toRemove.push(item);
      }
    }

    if (toRemove.length) {
      for (const item of toRemove) {
        try {
          await this.hass.callService("todo", "remove_item", {
            entity_id: entityId,
            item: item.uid || item.summary,
          });
        } catch (err) {
          console.error(
            "HaKanbanTodoCard: erreur remove_item auto (persistant)",
            err
          );
        }
      }
      await this._fetchItemsFor(entityId, true);
    }
  }

  // helper pour recréer un item avec nouveau summary + statut (compatible HA récent)
  async _recreateItemWithSummaryAndStatus(entityId, item, newSummary, status) {
    const oldId = item.uid || item.summary;
    const due = item.due || item.due_date || null;

    // 1) supprimer l'ancien
    await this.hass.callService("todo", "remove_item", {
      entity_id: entityId,
      item: oldId,
    });

    // 2) recréer le nouvel item avec le texte mis à jour
    const addData = {
      entity_id: entityId,
      item: newSummary,
    };
    if (due) {
      addData.due_date = due;
    }
    await this.hass.callService("todo", "add_item", addData);

    // 3) remettre le statut souhaité
    if (status && status !== "needs_action") {
      await this.hass.callService("todo", "update_item", {
        entity_id: entityId,
        item: newSummary,
        status: status,
      });
    }
  }

  // ------------------ HELPERS DUE (sort_by: due / show_due_date) ------------------

  _getItemDueDate(item) {
    const dueStr = item?.due || item?.due_date;
    if (!dueStr) return null;
    const d = new Date(dueStr);
    if (Number.isNaN(d.getTime())) return null;
    return d;
  }

  _hasMeaningfulTime(dueStr) {
    if (!dueStr || typeof dueStr !== "string") return false;
    if (!dueStr.includes("T")) return false;
    const d = new Date(dueStr);
    if (Number.isNaN(d.getTime())) return false;
    return !(d.getHours() === 0 && d.getMinutes() === 0 && d.getSeconds() === 0);
  }

  _formatDue(item) {
    const dueStr = item?.due || item?.due_date;
    const d = this._getItemDueDate(item);
    if (!d) return "";

    const lang = this._getLang();
    const locale = this.hass?.locale?.language ? this.hass.locale.language : lang;

    const includeTime = this._hasMeaningfulTime(dueStr);
    const opts = includeTime
      ? { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }
      : { year: "numeric", month: "2-digit", day: "2-digit" };

    try {
      return new Intl.DateTimeFormat(locale, opts).format(d);
    } catch (_e) {
      return d.toLocaleString();
    }
  }

  // ------------------ TRI (sort_by) ------------------

  // Tri par urgence (preset: urgency) selon ordre A:
  // URGENT → SOON → NORMAL → LONG TERM → NO DUE
  _getUrgencyRank(list, item) {
    const summary = this._stripAutoRemoveMeta(item?.summary || "");
    const cats = this._getCategories(list);
    const cat = this._resolveCategory(cats, summary);
    if (!cat) return 999;

    const key = String(cat.key || "").toLowerCase();

    // mapping basé sur les keys du preset "urgency"
    const map = {
      urgent: 0,
      bientot: 1,
      normal: 2,
      long: 3,
      no_due: 4,
    };

    if (map[key] === undefined) return 998;
    return map[key];
  }

  // ------------------ POSITION (manual ordering) ------------------

  _getItemPosition(item) {
    const desc = item?.description || "";
    const m = desc.match(/(?:^|\n)position:\s*(-?\d+(?:\.\d+)?)(?:\n|$)/);
    return m ? parseFloat(m[1]) : null;
  }

  _setPositionInDescription(desc, pos) {
    const cleaned = (desc || "")
      .replace(/(?:^|\n)position:\s*-?\d+(?:\.\d+)?\s*/g, "\n")
      .replace(/^\n+/, "")
      .replace(/\n+$/, "")
      .trim();
    return cleaned ? `${cleaned}\nposition: ${pos}` : `position: ${pos}`;
  }

  _sortItemsForList(list, items) {
    if (!items || items.length <= 1) return items || [];

    const layout = (this._config && this._config.layout) || "kanban";
    const explicit = list && list.sort_by;
    const mode = explicit || (layout === "kanban" ? "manual" : "none");

    // 0) Tri manuel par position (default in Kanban)
    if (mode === "manual") {
      const arr = [...items];
      arr.sort((a, b) => {
        const pa = this._getItemPosition(a);
        const pb = this._getItemPosition(b);
        if (pa === null && pb === null) return 0;
        if (pa === null) return 1;
        if (pb === null) return -1;
        return pa - pb;
      });
      return arr;
    }

    // 1) Tri par date d'échéance HA
    if (mode === "due") {
      const arr = [...items];
      arr.sort((a, b) => {
        const da = this._getItemDueDate(a);
        const db = this._getItemDueDate(b);
        if (!da && !db) return String(a.summary || "").localeCompare(String(b.summary || ""));
        if (!da) return 1;
        if (!db) return -1;
        const diff = da.getTime() - db.getTime();
        if (diff !== 0) return diff;
        return String(a.summary || "").localeCompare(String(b.summary || ""));
      });
      return arr;
    }

    // 2) Tri par urgence (tags/catégories), ordre A
    if (mode === "urgency") {
      const arr = [...items];
      arr.sort((a, b) => {
        const ra = this._getUrgencyRank(list, a);
        const rb = this._getUrgencyRank(list, b);
        if (ra !== rb) return ra - rb;

        // Si même urgence: due d'abord si présent, sinon texte
        const da = this._getItemDueDate(a);
        const db = this._getItemDueDate(b);
        if (da && db) {
          const diff = da.getTime() - db.getTime();
          if (diff !== 0) return diff;
        } else if (da && !db) {
          return -1;
        } else if (!da && db) {
          return 1;
        }

        return String(a.summary || "").localeCompare(String(b.summary || ""));
      });
      return arr;
    }

    return items;
  }

  // ------------------ STYLES ------------------

  static get styles() {
    return css`
      :host {
        display: block;
      }
      ha-card {
        padding: 16px;
      }

      .header {
        display: flex;
        flex-direction: column;
        gap: 4px;
        margin-bottom: 8px;
      }
      .title-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .title {
        font-size: 1.2rem;
        font-weight: 600;
      }
      .subtitle {
        font-size: 0.85rem;
        color: var(--secondary-text-color);
      }

      .tabs {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-top: 6px;
        -webkit-tap-highlight-color: transparent;
      }
      .tab {
        display: flex;
        flex-direction: column;
        gap: 2px;
        padding: 4px 10px 6px;
        border-radius: 12px;
        font-size: 0.8rem;
        background: var(--ha-card-background, #f3f4f6);
        color: var(--primary-text-color);
        cursor: pointer;
        border: 1px solid transparent;
        min-width: 90px;
        transition: border-width 0.15s, box-shadow 0.15s;
      }
      .tab-main {
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      .tab ha-icon {
        --mdc-icon-size: 16px;
      }
      .tab-count {
        font-size: 0.75rem;
        opacity: 0.7;
      }
      .tab.active {
        border-width: 2px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.25);
      }

      .tab-progress {
        width: 100%;
        height: 4px;
        border-radius: 999px;
        background: rgba(0, 0, 0, 0.08);
        overflow: hidden;
      }
      .tab-progress-bar {
        height: 100%;
        border-radius: inherit;
        transition: width 0.2s ease-out, background-color 0.2s;
      }

      .divider {
        height: 1px;
        margin: 8px 0;
        background: var(--divider-color);
      }

      .add-row {
        display: flex;
        gap: 8px;
        align-items: center;
        margin: 8px 0 4px;
      }
      .add-row input {
        flex: 1;
        border-radius: 999px;
        border: 1px solid var(--divider-color);
        padding: 6px 10px;
        font-size: 0.9rem;
        background: var(--ha-card-background, #fff);
        color: var(--primary-text-color);
      }
      .add-row button {
        border-radius: 999px;
        border: none;
        padding: 6px 14px;
        font-size: 0.85rem;
        cursor: pointer;
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
      }

      .cat-row {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-bottom: 8px;
      }
      .cat-chip {
        padding: 2px 8px;
        border-radius: 999px;
        font-size: 0.7rem;
        font-weight: 600;
        cursor: pointer;
        color: #ffffff;
        background: #6b7280;
        opacity: 0.8;
        text-transform: uppercase;
        letter-spacing: 0.03em;
        border: 1px solid transparent;
      }
      .cat-chip.selected {
        opacity: 1;
        border-width: 2px;
        border-style: solid;
        border-color: #ffffff;
        box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.3);
      }

      .section-label {
        font-size: 0.8rem;
        font-weight: 600;
        margin: 4px 0;
        text-transform: uppercase;
        color: var(--secondary-text-color);
      }
      .empty {
        font-size: 0.85rem;
        color: var(--secondary-text-color);
        padding: 4px 0;
      }

      .item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 4px 0;
      }
      .item-icon {
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .item-main {
        flex: 1;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 6px;
        cursor: pointer;
      }
      .item-label {
        font-size: 0.92rem;
      }
      .item-label.completed {
        text-decoration: line-through;
        opacity: 0.7;
      }

      .cat-pill {
        padding: 2px 6px;
        border-radius: 999px;
        font-size: 0.7rem;
        font-weight: 600;
        color: #ffffff;
        background: #6b7280;
        text-transform: uppercase;
        letter-spacing: 0.03em;
      }

      /* due badge — color-coded urgency */
      .due-pill {
        font-size: 0.72em;
        font-weight: 600;
        padding: 2px 8px;
        border-radius: 999px;
        text-transform: uppercase;
        letter-spacing: 0.03em;
        display: inline-block;
      }
      .due-pill-overdue {
        background: var(--error-color, #ef4444);
        color: white;
      }
      .due-pill-today {
        background: #f97316;
        color: white;
      }
      .due-pill-soon {
        background: #eab308;
        color: black;
      }
      .due-pill-future {
        background: var(--secondary-background-color);
        color: var(--secondary-text-color);
        border: 1px solid var(--divider-color);
      }

      .edit-due-row {
        display: flex;
        gap: 8px;
        align-items: center;
      }

      /* ============ Kanban layout ============ */
      .kanban-header {
        padding: 12px 16px 8px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
      }
      .kanban-header .title {
        font-weight: 600;
        font-size: 1.2em;
      }
      .kanban-filter {
        font: inherit;
        padding: 6px 12px;
        border-radius: 999px;
        border: 1px solid var(--divider-color);
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        width: 240px;
        max-width: 50%;
      }
      .kanban-filter:focus {
        outline: 2px solid var(--primary-color);
        outline-offset: -2px;
      }
      .kanban-grid {
        display: grid;
        gap: 12px;
        padding: 8px 12px 16px;
        align-items: start;
      }
      .kanban-col {
        background: var(--secondary-background-color, rgba(0, 0, 0, 0.04));
        border-radius: 8px;
        padding: 8px;
        display: flex;
        flex-direction: column;
        gap: 6px;
        min-width: 0;
      }
      .col-header {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 4px 8px;
        font-weight: 600;
        border-bottom: 1px solid var(--divider-color);
        margin-bottom: 4px;
      }
      .col-label {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .col-count {
        background: var(--primary-color);
        color: var(--text-primary-color, white);
        border-radius: 10px;
        padding: 2px 8px;
        font-size: 0.8em;
        font-weight: 500;
      }
      .col-items {
        display: flex;
        flex-direction: column;
        gap: 4px;
        min-height: 40px;
      }

      /* Responsive: stack columns vertically on narrow viewport */
      @media (max-width: 700px) {
        .kanban-grid {
          grid-template-columns: 1fr !important;
        }
      }

      /* SortableJS load-failure banner */
      .load-error {
        padding: 12px 16px;
        background: color-mix(in srgb, var(--error-color, #ef4444) 15%, transparent);
        border-left: 3px solid var(--error-color, #ef4444);
        color: var(--primary-text-color);
        font-size: 0.9em;
        margin: 0 12px 12px;
        border-radius: 4px;
      }

      /* Collapsible "Completed" section in each Kanban column */
      .col-completed-toggle {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 6px 8px;
        margin-top: 8px;
        font-size: 0.85em;
        color: var(--secondary-text-color);
        cursor: pointer;
        border-top: 1px solid var(--divider-color);
        user-select: none;
      }
      .col-completed-toggle:hover {
        color: var(--primary-text-color);
      }
      .col-completed {
        display: flex;
        flex-direction: column;
        gap: 4px;
        opacity: 0.75;
      }

      /* ============ Drag-and-Drop (SortableJS) ============ */
      .kanban-col .item {
        cursor: grab;
        user-select: none;
      }
      /* Ghost = placeholder that shows where item will land */
      .kanban-col .item.sortable-ghost {
        opacity: 1;
        background: transparent;
        border: 2px dashed var(--primary-color);
        box-shadow: none;
        transform: none;
      }
      .kanban-col .item.sortable-ghost * {
        visibility: hidden;
      }
      /* Drag = the item visually following the cursor */
      .kanban-col .item.sortable-drag {
        opacity: 0.95;
        transform: rotate(1deg);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
        cursor: grabbing;
      }
      .sortable-chosen {
        cursor: grabbing;
      }
      /* Fallback clone (forceFallback=true) */
      .sortable-fallback {
        opacity: 0.9 !important;
        transform: rotate(1deg);
      }

      /* ============ Edit dialog ============ */
      .edit-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
      }
      .edit-dialog {
        background: var(--card-background-color, white);
        color: var(--primary-text-color);
        border-radius: 12px;
        padding: 20px;
        min-width: 320px;
        max-width: 480px;
        width: 90vw;
        max-height: 85vh;
        overflow-y: auto;
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .edit-title {
        font-weight: 600;
        font-size: 1.15em;
        margin-bottom: 4px;
      }
      .edit-label {
        font-size: 0.85em;
        color: var(--secondary-text-color);
        margin-top: 8px;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .edit-input,
      .edit-textarea {
        font: inherit;
        color: inherit;
        padding: 8px 10px;
        border: 1px solid var(--divider-color);
        border-radius: 6px;
        background: var(--secondary-background-color, transparent);
      }
      .edit-textarea {
        resize: vertical;
        min-height: 80px;
        font-family: inherit;
      }
      .edit-input:focus,
      .edit-textarea:focus {
        outline: 2px solid var(--primary-color);
        outline-offset: -2px;
      }
      .edit-buttons {
        display: flex;
        gap: 8px;
        margin-top: 16px;
        align-items: center;
      }
      .edit-spacer {
        flex: 1;
      }
      .edit-btn {
        font: inherit;
        padding: 8px 16px;
        border: 1px solid var(--divider-color);
        border-radius: 6px;
        background: var(--secondary-background-color, transparent);
        color: inherit;
        cursor: pointer;
      }
      .edit-btn:hover {
        background: var(--divider-color);
      }
      .edit-btn-primary {
        background: var(--primary-color);
        color: var(--text-primary-color, white);
        border-color: var(--primary-color);
      }
      .edit-btn-primary:hover {
        opacity: 0.9;
      }
      .edit-btn-danger {
        color: var(--error-color, #ef4444);
        border-color: var(--error-color, #ef4444);
      }
      .edit-btn-danger:hover {
        background: color-mix(in srgb, var(--error-color, #ef4444) 15%, transparent);
      }
      .edit-labels {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .edit-label-chip {
        font: inherit;
        font-size: 0.8em;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.03em;
        padding: 4px 10px;
        border-radius: 999px;
        border: 2px solid;
        cursor: pointer;
        transition: background 0.1s ease;
      }

      .edit-md-preview {
        background: var(--secondary-background-color);
        border-radius: 6px;
        padding: 8px 12px;
        font-size: 0.9em;
        color: var(--secondary-text-color);
        margin-bottom: 4px;
        border-left: 3px solid var(--primary-color);
        max-height: 200px;
        overflow-y: auto;
      }
      .edit-md-preview h3 { margin: 6px 0; font-size: 1em; }
      .edit-md-preview p { margin: 4px 0; }
      .edit-md-preview ul { margin: 4px 0; padding-left: 20px; }
      .edit-md-preview code {
        font-family: monospace;
        background: var(--code-editor-background, rgba(0,0,0,0.06));
        padding: 1px 4px;
        border-radius: 3px;
      }
      .edit-md-preview a { color: var(--primary-color); }

      /* ============ Kanban item cards ============ */
      /* In Kanban mode, each item is its own visually separated card. */
      .kanban-col .item {
        background: var(--card-background-color, #ffffff);
        border-radius: 8px;
        padding: 10px 12px;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08),
                    0 1px 3px rgba(0, 0, 0, 0.05);
        border: 1px solid var(--divider-color);
        transition: transform 0.1s ease, box-shadow 0.1s ease;
      }
      .kanban-col .item:hover {
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12),
                    0 3px 6px rgba(0, 0, 0, 0.08);
        transform: translateY(-1px);
      }
      .kanban-col .item-label {
        line-height: 1.35;
      }
    `;
  }

  // ------------------ RENDER ------------------

  render() {
    if (!this.hass || !this._config) return html``;
    const layout = this._config.layout || "kanban";
    if (layout === "kanban") {
      return this._renderKanban();
    }
    return this._renderTabs();
  }

  _renderKanban() {
    const errBanner = this._sortableLoadFailed
      ? html`<div class="load-error">Drag-and-drop unavailable: SortableJS failed to load from CDN. Check your internet connection or browser CSP, then reload.</div>`
      : "";

    const lists = this._config.lists;
    if (!lists?.length) {
      return html`<ha-card>${this._ui("no_list")}</ha-card>`;
    }

    const title = this._config.title || this._ui("default_title");

    return html`
      <ha-card>
        <div class="kanban-header">
          <div class="title">${title}</div>
          <input
            class="kanban-filter"
            type="search"
            placeholder="${this._ui("filter_placeholder")}"
            .value=${this._filterText || ""}
            @input=${(ev) => (this._filterText = ev.target.value)}
          />
        </div>
        ${errBanner}
        <div
          class="kanban-grid"
          style="grid-template-columns: repeat(${lists.length}, minmax(0, 1fr));"
        >
          ${lists.map((l) => this._renderKanbanColumn(l))}
        </div>
        ${this._renderEditDialog()}
      </ha-card>
    `;
  }

  _renderKanbanColumn(list) {
    const stateObj = this.hass.states[list.entity];
    if (!stateObj) {
      return html`
        <div class="kanban-col">
          <div class="col-header">
            ${list.icon ? html`<ha-icon icon="${list.icon}"></ha-icon>` : ""}
            <span class="col-label">${list.label || list.entity}</span>
          </div>
          <div class="empty">${this._ui("entity_missing", list.entity)}</div>
        </div>
      `;
    }

    let items = this._itemsByEntity[list.entity];
    if (!items) {
      this._fetchItemsFor(list.entity);
      items = [];
    }

    const activeRaw = items.filter((it) => it.status !== "completed");
    const completedRaw = items.filter((it) => it.status === "completed");
    const active = this._sortItemsForList(list, activeRaw);

    const showCompleted =
      list.show_completed_in_kanban !== false && completedRaw.length > 0;
    const completed = this._sortItemsForList(list, completedRaw);
    const toggleKey = `show_completed_${list.entity}`;
    const showToggle = this._kanbanUiState?.[toggleKey] === true;

    // Filter by search text (case-insensitive across summary + description)
    const filterText = (this._filterText || "").trim().toLowerCase();
    const matchesFilter = (item) => {
      if (!filterText) return true;
      const haystack = [
        item.summary || "",
        item.description || "",
      ].join(" ").toLowerCase();
      return haystack.includes(filterText);
    };
    const visibleActive = active.filter(matchesFilter);
    const visibleCompleted = completed.filter(matchesFilter);

    const countLabel = filterText
      ? `${visibleActive.length}/${active.length}`
      : `${visibleActive.length}`;

    return html`
      <div class="kanban-col" data-entity="${list.entity}">
        <div class="col-header">
          ${list.icon ? html`<ha-icon icon="${list.icon}"></ha-icon>` : ""}
          <span class="col-label">${list.label || list.entity}</span>
          <span class="col-count">${countLabel}</span>
        </div>
        ${this._renderAddRow(list)}
        <div class="col-items">
          ${visibleActive.length === 0
            ? html`<div class="empty">${this._ui("empty_active")}</div>`
            : visibleActive.map((it) => this._renderItem(list, it))
          }
        </div>
        ${showCompleted
          ? html`
            <div class="col-completed-toggle" @click=${() => this._toggleKanbanCompleted(list.entity)}>
              <ha-icon icon="${showToggle ? 'mdi:chevron-down' : 'mdi:chevron-right'}"></ha-icon>
              <span>${this._ui("completed")} (${filterText ? `${visibleCompleted.length}/${completedRaw.length}` : completedRaw.length})</span>
            </div>
            ${showToggle
              ? html`<div class="col-completed">${visibleCompleted.map((it) => this._renderItem(list, it))}</div>`
              : ""
            }
          `
          : ""}
      </div>
    `;
  }

  _toggleKanbanCompleted(entityId) {
    const key = `show_completed_${entityId}`;
    this._kanbanUiState = { ...(this._kanbanUiState || {}), [key]: !(this._kanbanUiState?.[key]) };
    this.requestUpdate();
  }

  _renderTabs() {
    if (!this.hass || !this._config) return html``;

    const lists = this._config.lists;
    const index = this._activeIndex ?? 0;
    const list = lists[index] || lists[0];

    if (!list) {
      return html`<ha-card>${this._ui("no_list")}</ha-card>`;
    }

    const entityId = list.entity;
    const stateObj = this.hass.states[entityId];

    if (!stateObj) {
      return html`<ha-card>${this._ui("entity_missing", entityId)}</ha-card>`;
    }

    let items = this._itemsByEntity[entityId];
    if (!items) {
      this._fetchItemsFor(entityId);
      items = [];
    }

    // Tri optionnel
    const activeRaw = items.filter((it) => it.status !== "completed");
    const completedRaw = items.filter((it) => it.status === "completed");
    const active = this._sortItemsForList(list, activeRaw);
    const completed = this._sortItemsForList(list, completedRaw);

    const total = items.length;
    const done = completedRaw.length;

    const isEmptyList = total === 0;
    const percent = total ? Math.round((done / total) * 100) : null;

    const cardTitle = this._getHeaderTitle(list);

    return html`
      <ha-card>
        <div class="header">
          <div class="title-row">
            <div class="title">${cardTitle}</div>
            <div class="subtitle">
              ${this._ui("subtitle", done, total, percent ?? 0, isEmptyList)}
            </div>
          </div>

          <div class="tabs">${lists.map((l, i) => this._renderTab(l, i))}</div>
        </div>

        <div class="divider"></div>

        ${this._renderAddRow(list)}

        <div class="section-label">
          ${this._ui("active")} (${active.length})
        </div>
        ${active.length === 0
          ? html`<div class="empty">${this._ui("empty_active")}</div>`
          : active.map((item) => this._renderItem(list, item, false))}

        <div class="section-label">
          ${this._ui("completed")} (${completed.length})
        </div>
        ${completed.length === 0
          ? html`<div class="empty">${this._ui("empty_completed")}</div>`
          : completed.map((item) => this._renderItem(list, item, true))}
      </ha-card>
    `;
  }

  _getHeaderTitle(list) {
    const mode = this._config.title_mode || "static";
    if (mode !== "per_list" || !list) {
      return (
        this._config.title ||
        UI_LABELS[this._getLang()]?.default_title ||
        UI_LABELS.en.default_title
      );
    }

    const entityId = list.entity;
    const friendly =
      this.hass?.states?.[entityId]?.attributes?.friendly_name || entityId;

    return list.header_title || list.label || list.name || friendly;
  }

  // ------------------ SOUS-RENDU ------------------

  _renderTab(list, index) {
    const entityId = list.entity;
    let items = this._itemsByEntity[entityId];

    if (!items) {
      this._fetchItemsFor(entityId);
      items = [];
    }

    const active = items.filter((it) => it.status !== "completed");
    const completed = items.filter((it) => it.status === "completed");
    const total = items.length;
    const done = completed.length;

    const percent = total ? Math.round((done / total) * 100) : null;

    const isActive = index === this._activeIndex;
    const label =
      list.label ||
      list.name ||
      this.hass.states[entityId]?.attributes?.friendly_name ||
      entityId;

    const icon = list.icon || "mdi:format-list-checkbox";

    const progressColor = this._getProgressColor(list, percent);
    const severityColor = this._getListSeverityColor(list, items);
    const tabMode = list.tab_color_mode || "mixed";

    let tabColor;
    switch (tabMode) {
      case "progress":
        tabColor = progressColor;
        break;
      case "severity":
        tabColor = severityColor || progressColor;
        break;
      case "mixed":
      default:
        tabColor = severityColor || progressColor;
        break;
    }

    const showBar = list.show_progress_bar !== false;
    const widthPercent = percent == null ? 0 : percent;

    return html`
      <div
        class="tab ${isActive ? "active" : ""}"
        style="border-color:${tabColor};"
        @click=${() => (this._activeIndex = index)}
      >
        <div class="tab-main">
          <ha-icon .icon=${icon} style="color:${tabColor};"></ha-icon>
          <span>${label}</span>
          <span class="tab-count">${active.length}/${total}</span>
        </div>
        ${showBar
          ? html`
              <div class="tab-progress">
                <div
                  class="tab-progress-bar"
                  style="width:${widthPercent}%; background:${progressColor};"
                ></div>
              </div>
            `
          : ""}
      </div>
    `;
  }

  _renderAddRow(list) {
    const entityId = list.entity;
    const cats = this._getCategories(list);
    const selectedKey = this._selectedCatByEntity[entityId] || null;
    // Per-entity input value so 4 columns don't share the same text state.
    const text =
      (this._newTextByEntity && this._newTextByEntity[entityId]) || "";

    const onInput = (e) => {
      this._newTextByEntity = {
        ...(this._newTextByEntity || {}),
        [entityId]: e.target.value,
      };
    };

    return html`
      <div class="add-row">
        <input
          type="text"
          .value=${text}
          placeholder=${this._ui("add_placeholder")}
          @input=${onInput}
          @keydown=${(e) => this._onInputKeydown(e, list)}
        />
        <button @click=${() => this._addItem(list)}>
          ${this._ui("add_button")}
        </button>
      </div>

      ${cats.length && text.trim() !== ""
        ? html`
            <div class="cat-row">
              ${cats.map((cat) => {
                const isSelected = cat.key === selectedKey;
                const bg = cat.color_on || cat.color || "#6b7280";
                const label = this._getCategoryLabel(cat);
                return html`
                  <div
                    class="cat-chip ${isSelected ? "selected" : ""}"
                    style="background:${bg};"
                    @click=${() => this._selectCategory(entityId, cat.key)}
                  >
                    ${label}
                  </div>
                `;
              })}
            </div>
          `
        : ""}
    `;
  }

  _renderItem(list, item, completed) {
    const rawSummary = item.summary || "";
    const withoutAuto = this._stripAutoRemoveMeta(rawSummary);
    const cats = this._getCategories(list);
    const cat = this._resolveCategory(cats, withoutAuto);
    const labelText = this._stripCategory(withoutAuto, cat);
    const colors = this._getItemColors(list, item, cat, completed);

    const icon = cat?.icon || "mdi:checkbox-blank-circle";
    const catLabel = cat ? this._getCategoryLabel(cat) : "";

    const dueDate = item.due || item.due_date;
    const dueInfo = dueDate ? this._formatDueInfo(dueDate) : null;

    return html`
      <div
        class="item"
        data-uid="${item.uid || ""}"
      >
        <div
          class="item-icon"
          @click=${() => this._toggleItem(list, item)}
          @pointerdown=${(e) => this._onItemPointerDown(e, list, item)}
          @pointerup=${() => this._onItemPointerUp()}
          @pointercancel=${() => this._onItemPointerUp()}
          @pointerleave=${() => this._onItemPointerUp()}
        >
          <ha-icon .icon=${icon} style="color:${colors.iconColor};"></ha-icon>
        </div>

        <div
          class="item-main"
          @click=${(e) => this._openItemEditor(e, list, item)}
          title="${this._ui("edit_hint")}"
        >
          <div class="item-label ${completed ? "completed" : ""}">
            ${labelText}
          </div>

          ${catLabel
            ? html`<div class="cat-pill" style="background:${colors.pillColor};">
                ${catLabel}
              </div>`
            : ""}

          ${dueInfo
            ? html`<div class="due-pill due-pill-${dueInfo.urgency}">
                ${dueInfo.label}
              </div>`
            : ""}
        </div>
      </div>
    `;
  }

  _formatDueInfo(dateStr) {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (isNaN(d)) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(d);
    target.setHours(0, 0, 0, 0);
    const diffDays = Math.round((target - today) / 86400000);
    let urgency = "future";
    if (diffDays < 0) urgency = "overdue";
    else if (diffDays === 0) urgency = "today";
    else if (diffDays <= 3) urgency = "soon";

    const lang = (this._config.language || "en").toLowerCase().slice(0, 2);
    const ui = (k) => this._ui(k);
    let label;
    if (diffDays === 0) label = ui("due_today");
    else if (diffDays === 1) label = ui("due_tomorrow");
    else if (diffDays === -1) label = ui("due_yesterday");
    else if (diffDays > 1 && diffDays <= 7) label = ui("due_in_n_days").replace("{n}", diffDays);
    else if (diffDays < -1 && diffDays >= -7) label = ui("due_n_days_ago").replace("{n}", Math.abs(diffDays));
    else {
      label = d.toLocaleDateString(lang, { month: "short", day: "numeric" });
    }
    return { label, urgency, dateStr };
  }

  _renderMarkdown(text) {
    if (!text) return "";
    // Minimal Markdown: paragraphs, **bold**, *italic*, `code`,
    // [link](url), - bullet, ## heading.
    // Safety: we escape every line of user input BEFORE layering only our own
    // safe whitelist of tags on top, then parse via DOMParser so lit-html
    // sees a real DOM fragment. No raw user content ever reaches an HTML
    // parser unescaped.
    const escape = (s) => s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    const lines = text.split("\n");
    const out = [];
    let inList = false;
    for (const raw of lines) {
      const line = raw;
      if (/^- /.test(line)) {
        if (!inList) { out.push("<ul>"); inList = true; }
        let inner = escape(line.slice(2));
        inner = this._inlineMd(inner);
        out.push(`<li>${inner}</li>`);
      } else {
        if (inList) { out.push("</ul>"); inList = false; }
        if (/^## /.test(line)) {
          out.push(`<h3>${this._inlineMd(escape(line.slice(3)))}</h3>`);
        } else if (line.trim() === "") {
          out.push("<br/>");
        } else {
          out.push(`<p>${this._inlineMd(escape(line))}</p>`);
        }
      }
    }
    if (inList) out.push("</ul>");
    const safeHtml = out.join("");
    // DOMParser is the safest way to materialize our own pre-escaped HTML
    // into a DocumentFragment without touching innerHTML on a live element.
    const doc = new DOMParser().parseFromString(
      `<div id="r">${safeHtml}</div>`, "text/html"
    );
    const root = doc.getElementById("r");
    const frag = document.createDocumentFragment();
    if (root) {
      while (root.firstChild) frag.appendChild(root.firstChild);
    }
    return frag;
  }

  _inlineMd(s) {
    // **bold**
    s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    // *italic*
    s = s.replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>");
    // `code`
    s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
    // [text](url)
    s = s.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener">$1</a>'
    );
    return s;
  }

  _openItemEditor(ev, list, item) {
    if (this._dragOpInFlight || this._dragging) return;
    ev.stopPropagation();
    const rawDesc = item.description || "";
    const visibleDesc = rawDesc
      .split("\n")
      .filter((l) => !/^\s*position:\s*-?\d+(?:\.\d+)?\s*$/.test(l))
      .join("\n")
      .trim();
    // Detect which categories are currently active by scanning the summary
    // for hashtag matches.
    const cats = this._getCategories(list);
    const summary = item.summary || "";
    const activeKeys = new Set(
      cats.filter((c) => c.match && summary.includes(c.match)).map((c) => c.key)
    );
    // Normalize due to ISO yyyy-mm-dd for the <input type="date">.
    // HA's local_todo returns either `due` or `due_date`; preserve which one
    // was present so we can mirror it on save.
    const rawDue = item.due || item.due_date || "";
    let isoDue = "";
    if (rawDue) {
      const d = new Date(rawDue);
      if (!isNaN(d)) {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        isoDue = `${yyyy}-${mm}-${dd}`;
      } else if (/^\d{4}-\d{2}-\d{2}/.test(rawDue)) {
        isoDue = rawDue.slice(0, 10);
      }
    }
    this._editingItem = {
      entity: list.entity,
      uid: item.uid,
      summary,
      description: visibleDesc,
      rawDescription: rawDesc,
      status: item.status || "needs_action",
      due: isoDue,
      dueField: item.due_date ? "due_date" : (item.due ? "due" : "due_date"),
      // Snapshot of category list + currently-active keys for the dialog
      cats,
      activeKeys,
    };
  }

  _renderEditDialog() {
    if (!this._editingItem) return "";
    const e = this._editingItem;
    return html`
      <div
        class="edit-backdrop"
        @click=${(ev) => {
          if (ev.target.classList.contains("edit-backdrop"))
            this._editingItem = null;
        }}
      >
        <div class="edit-dialog" @click=${(ev) => ev.stopPropagation()}>
          <div class="edit-title">${this._ui("edit_title")}</div>

          <label class="edit-label">${this._ui("edit_summary")}</label>
          <input
            class="edit-input"
            type="text"
            .value=${e.summary}
            @input=${(ev) => (this._editingItem.summary = ev.target.value)}
          />

          ${e.cats && e.cats.length
            ? html`
                <label class="edit-label">${this._ui("edit_labels")}</label>
                <div class="edit-labels">
                  ${e.cats.map((cat) => {
                    const active = e.activeKeys.has(cat.key);
                    const bg = active
                      ? cat.color_on || cat.color || "#6b7280"
                      : "transparent";
                    const border = cat.color_on || cat.color || "#6b7280";
                    const fg = active ? "white" : border;
                    const label = this._getCategoryLabel(cat);
                    return html`
                      <button
                        type="button"
                        class="edit-label-chip"
                        style="background:${bg};border-color:${border};color:${fg};"
                        @click=${() => this._toggleEditingLabel(cat.key)}
                      >
                        ${label}
                      </button>
                    `;
                  })}
                </div>
              `
            : ""}

          <label class="edit-label">${this._ui("edit_description")}</label>
          ${e.description
            ? html`<div class="edit-md-preview">${this._renderMarkdown(e.description)}</div>`
            : ""}
          <textarea
            class="edit-textarea"
            rows="4"
            .value=${e.description}
            @input=${(ev) => (this._editingItem.description = ev.target.value)}
          ></textarea>

          <label class="edit-label">${this._ui("edit_due")}</label>
          <div class="edit-due-row">
            <input
              class="edit-input"
              type="date"
              .value=${e.due || ""}
              @input=${(ev) => (this._editingItem.due = ev.target.value)}
            />
            ${e.due
              ? html`<button class="edit-btn" @click=${() => {
                  this._editingItem = { ...this._editingItem, due: "" };
                }}>${this._ui("edit_due_clear")}</button>`
              : ""}
          </div>

          <label class="edit-label">
            <input
              type="checkbox"
              .checked=${e.status === "completed"}
              @change=${(ev) =>
                (this._editingItem.status = ev.target.checked
                  ? "completed"
                  : "needs_action")}
            />
            ${this._ui("edit_completed")}
          </label>

          <div class="edit-buttons">
            <button class="edit-btn edit-btn-danger" @click=${() => this._deleteEditingItem()}>
              ${this._ui("edit_delete")}
            </button>
            <div class="edit-spacer"></div>
            <button class="edit-btn" @click=${() => (this._editingItem = null)}>
              ${this._ui("edit_cancel")}
            </button>
            <button class="edit-btn edit-btn-primary" @click=${() => this._saveEditingItem()}>
              ${this._ui("edit_save")}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  _toggleEditingLabel(catKey) {
    if (!this._editingItem) return;
    const next = new Set(this._editingItem.activeKeys);
    if (next.has(catKey)) next.delete(catKey);
    else next.add(catKey);
    // Reactive update — replace the whole object so lit-html re-renders
    this._editingItem = { ...this._editingItem, activeKeys: next };
  }

  async _saveEditingItem() {
    const e = this._editingItem;
    if (!e) return;
    // Re-attach the position line we stripped for editing
    const posLineMatch = (e.rawDescription || "").match(
      /(?:^|\n)(position:\s*-?\d+(?:\.\d+)?)(?:\n|$)/
    );
    const posLine = posLineMatch ? posLineMatch[1] : null;
    const newDesc = (e.description || "").trim();
    const finalDesc = posLine
      ? newDesc
        ? `${newDesc}\n${posLine}`
        : posLine
      : newDesc;
    // Sync hashtag tags in the summary with the active label set.
    let finalSummary = e.summary || "";
    if (e.cats && e.cats.length) {
      // Strip ALL configured category hashtags first
      for (const cat of e.cats) {
        if (cat.match) {
          finalSummary = finalSummary.split(cat.match).join("");
        }
      }
      finalSummary = finalSummary.replace(/\s+/g, " ").trim();
      // Re-append the ones the user kept active
      const tagsToAdd = e.cats
        .filter((c) => c.match && e.activeKeys.has(c.key))
        .map((c) => c.match);
      if (tagsToAdd.length) {
        finalSummary = `${finalSummary} ${tagsToAdd.join(" ")}`.trim();
      }
    }
    const updatePayload = {
      entity_id: e.entity,
      item: e.uid,
      rename: finalSummary,
      status: e.status,
      description: finalDesc,
    };
    // HA local_todo accepts `due_date` (yyyy-mm-dd). If empty/falsy, omit so
    // existing date remains; clearing via update_item is not consistently
    // supported across HA todo backends — log a warning.
    if (e.due) {
      updatePayload.due_date = e.due;
    } else {
      // User may have cleared the date — try sending null but warn that
      // some backends will silently keep the previous value.
      console.warn(
        "ha-kanban-todo-card: clearing due_date is not reliably supported by HA todo backends; existing value may persist"
      );
    }
    try {
      await this.hass.callService("todo", "update_item", updatePayload);
      await this._fetchItemsFor(e.entity);
    } catch (err) {
      console.error("ha-kanban-todo-card: edit save failed", err);
    }
    this._editingItem = null;
  }

  async _deleteEditingItem() {
    const e = this._editingItem;
    if (!e) return;
    if (!confirm(this._ui("confirm_delete", e.summary))) return;
    try {
      await this.hass.callService("todo", "remove_item", {
        entity_id: e.entity,
        item: e.uid,
      });
      await this._fetchItemsFor(e.entity);
    } catch (err) {
      console.error("ha-kanban-todo-card: edit delete failed", err);
    }
    this._editingItem = null;
  }

  _onItemPointerDown(e, list, item) {
    if (this._holdTimer) clearTimeout(this._holdTimer);
    this._holdActive = false;

    this._holdTimer = setTimeout(() => {
      this._holdActive = true;
      this._confirmDelete(list, item);
    }, 650);
  }

  _onItemPointerUp() {
    if (this._holdTimer) clearTimeout(this._holdTimer);
    this._holdTimer = null;
  }

  // ------------------ DRAG & DROP (SortableJS, Kanban only) ------------------

  updated(changedProps) {
    if (super.updated) super.updated(changedProps);
    const layout = (this._config && this._config.layout) || "kanban";
    if (layout === "kanban") {
      this._initSortables();
    } else {
      this._destroySortables();
    }
  }

  // NOTE: We intentionally do NOT override shouldUpdate to block re-renders
  // during drag. Doing so causes a deadlock: post-drop fetch updates
  // _itemsByEntity (property change queued), but shouldUpdate=false silently
  // discards the render. When _dragging flips false, there's no pending
  // update to re-queue, so the DOM stays stale. On the next drop, DOM
  // carries a uid that HA has already re-keyed → "Eintrag nicht gefunden".
  //
  // The Map-based Sortable binding (see _initSortables) already makes
  // Sortable instances survive LitElement re-renders. The _dragging flag
  // is retained only for defensive read access; it no longer gates updates.

  disconnectedCallback() {
    if (super.disconnectedCallback) super.disconnectedCallback();
    this._destroySortables();
  }

  async _initSortables() {
    let Sortable;
    try {
      Sortable = await loadSortable();
    } catch (err) {
      console.error("ha-kanban-todo-card: failed to load SortableJS", err);
      this._sortableLoadFailed = true;
      this.requestUpdate();
      return;
    }
    if (!Sortable) return;

    // Use Map: DOM node → Sortable instance. Survives LitElement re-renders
    // without destroying active Sortables mid-drag. Only new columns get
    // new instances; orphaned instances (column removed from DOM) are cleaned up.
    if (!this._sortablesMap) this._sortablesMap = new Map();

    const cols = Array.from(
      this.renderRoot?.querySelectorAll?.(".col-items") || []
    );
    const seen = new Set(cols);

    // Attach to new columns
    cols.forEach((col) => {
      if (this._sortablesMap.has(col)) return;
      const instance = new Sortable(col, {
        group: "ha-kanban-todos",
        animation: 180,
        supportPointer: true,
        delay: 150,
        delayOnTouchOnly: true,
        touchStartThreshold: 5,
        // Tighter swap math: items reorder as soon as the pointer
        // crosses 65% of a neighbour (default 1.0 requires full overlap,
        // which makes drop-position feel imprecise on small cards).
        swapThreshold: 0.65,
        invertSwap: true,
        ghostClass: "sortable-ghost",
        chosenClass: "sortable-chosen",
        dragClass: "sortable-drag",
        filter: ".item-icon",
        preventOnFilter: false,
        onStart: (ev) => {
          this._dragging = true;
          // Capture uid + source column at drag-start, when DOM still
          // matches our last render.
          this._dragStartUid = ev?.item?.dataset?.uid || null;
          this._dragStartSourceEntity =
            ev?.item?.closest?.(".kanban-col")?.dataset?.entity || null;
          if (this._kanbanDebug) {
            console.log("[ha-kanban] onStart", {
              uid: this._dragStartUid,
              source: this._dragStartSourceEntity,
              oldIndex: ev.oldIndex,
              oldDraggableIndex: ev.oldDraggableIndex,
            });
          }
        },
        onEnd: (ev) => {
          // Capture metadata from the SortableJS event BEFORE we revert
          // its DOM mutation (revert resets indices).
          const meta = {
            uid: this._dragStartUid,
            sourceEntity: this._dragStartSourceEntity,
            targetEntity:
              ev?.to?.closest?.(".kanban-col")?.dataset?.entity || null,
            oldIndex: ev.oldIndex,
            newIndex: ev.newIndex,
            oldDraggableIndex: ev.oldDraggableIndex,
            newDraggableIndex: ev.newDraggableIndex,
            from: ev.from,
            to: ev.to,
            item: ev.item,
          };
          // Revert SortableJS's DOM mutation. Without this, lit-html's
          // internal cache of where each rendered template lives gets
          // out of sync (we render via .map() which is unkeyed). Stale
          // data-uid attributes then leak into onStart of the next drag.
          this._revertSortableMove(ev);
          this._onSortableEnd(meta);
        },
      });
      this._sortablesMap.set(col, instance);
    });

    // Clean up orphans (column removed from DOM, e.g. layout switch)
    for (const [col, instance] of this._sortablesMap.entries()) {
      if (!seen.has(col)) {
        try {
          instance.destroy();
        } catch (_e) {
          /* noop */
        }
        this._sortablesMap.delete(col);
      }
    }
  }

  _destroySortables() {
    if (this._sortablesMap) {
      for (const instance of this._sortablesMap.values()) {
        try {
          instance.destroy();
        } catch (_e) {
          /* noop */
        }
      }
      this._sortablesMap.clear();
    }
    // Legacy cleanup for any older-style array tracking
    if (this._sortables && this._sortables.length) {
      this._sortables.forEach((s) => {
        try {
          s.destroy();
        } catch (_e) {
          /* noop */
        }
      });
      this._sortables = [];
    }
  }

  // Revert SortableJS's DOM mutation. lit-html (.map without keys) cannot
  // reconcile when DOM nodes were moved by an external library, leading to
  // stale data-uid attributes leaking forward. By reverting here, the
  // subsequent re-render places the item at its new position based on data
  // alone (the position field), with lit-html owning the DOM transitions.
  _revertSortableMove(ev) {
    try {
      if (ev.from !== ev.to) {
        // Cross-list: move back to source at its old position.
        const ref = ev.from.children[ev.oldIndex] || null;
        ev.from.insertBefore(ev.item, ref);
      } else if (ev.oldIndex !== ev.newIndex) {
        // Same-list reorder: put back at oldIndex.
        const ref = ev.from.children[ev.oldIndex] || null;
        if (ref !== ev.item) {
          ev.from.insertBefore(ev.item, ref);
        }
      }
    } catch (_e) {
      /* noop — non-fatal, render will reset DOM anyway */
    }
  }

  async _onSortableEnd(meta) {
    if (this._dragOpInFlight) {
      console.warn(
        "ha-kanban-todo-card: drop ignored — previous operation still in flight"
      );
      this._dragging = false;
      return;
    }
    this._dragOpInFlight = true;

    const {
      uid,
      sourceEntity,
      targetEntity,
      oldIndex,
      newIndex,
    } = meta;

    // Clear capture immediately so a stray onEnd later can't reuse it.
    this._dragStartUid = null;
    this._dragStartSourceEntity = null;

    if (this._kanbanDebug) {
      console.log("[ha-kanban] onEnd start", {
        uid,
        source: sourceEntity,
        target: targetEntity,
        oldIndex,
        newIndex,
      });
    }

    if (!uid || !sourceEntity || !targetEntity) {
      console.warn("[ha-kanban] missing uid/entity, abort", { uid, sourceEntity, targetEntity });
      this._dragging = false;
      this._dragOpInFlight = false;
      return;
    }

    // Refresh state BEFORE any service calls — guarantees we operate on
    // the freshest server truth, not a possibly-stale local cache. This
    // is the single most important fix: even if the DOM uid was perfectly
    // captured at onStart, our LOCAL cache may be lagging if an earlier
    // drop's fetch hasn't fully propagated.
    try {
      await Promise.all([
        this._fetchItemsFor(sourceEntity),
        sourceEntity !== targetEntity
          ? this._fetchItemsFor(targetEntity)
          : Promise.resolve(),
      ]);
    } catch (err) {
      console.warn("[ha-kanban] pre-fetch failed", err);
    }

    const sourceItems = this._itemsByEntity[sourceEntity] || [];
    const targetItems = this._itemsByEntity[targetEntity] || [];

    const moved =
      sourceItems.find((i) => i.uid === uid) ||
      targetItems.find((i) => i.uid === uid);
    if (!moved) {
      console.warn(
        `[ha-kanban] uid ${uid} no longer exists in ${sourceEntity} or ${targetEntity} — abort`
      );
      this.requestUpdate();
      try { await this.updateComplete; } catch (_e) { /* noop */ }
      this._dragging = false;
      this._dragOpInFlight = false;
      return;
    }

    // Compute new position from DATA, not DOM — DOM was reverted above
    // so it doesn't reflect the user's drop intent anymore. Build the
    // post-move sorted list mentally and read positions from neighbors.
    const sortedTarget = this._sortItemsForList(
      { sort_by: "manual" },
      targetItems
    ).filter((i) => i.status !== "completed");

    let prevPos = null;
    let nextPos = null;
    if (sourceEntity === targetEntity) {
      // Same-list reorder — moved item still in sortedTarget at oldIndex
      const reordered = [...sortedTarget];
      const movedIdx = reordered.findIndex((i) => i.uid === uid);
      if (movedIdx >= 0) {
        const [item] = reordered.splice(movedIdx, 1);
        reordered.splice(newIndex, 0, item);
      }
      const prev = reordered[newIndex - 1];
      const next = reordered[newIndex + 1];
      if (prev && prev.uid !== uid) prevPos = this._getItemPosition(prev);
      if (next && next.uid !== uid) nextPos = this._getItemPosition(next);
    } else {
      // Cross-list — moved item not yet in sortedTarget. newIndex is the
      // visual position the user dropped it at among target's items.
      const prev = sortedTarget[newIndex - 1];
      const next = sortedTarget[newIndex];
      if (prev) prevPos = this._getItemPosition(prev);
      if (next) nextPos = this._getItemPosition(next);
    }

    let newPos;
    if (prevPos === null && nextPos === null) {
      newPos = (newIndex + 1) * 1000;
    } else if (prevPos === null) {
      newPos = nextPos - 500;
    } else if (nextPos === null) {
      newPos = prevPos + 500;
    } else {
      newPos = (prevPos + nextPos) / 2;
      if (
        Math.abs(newPos - prevPos) < MIN_POSITION_GAP ||
        Math.abs(nextPos - newPos) < MIN_POSITION_GAP
      ) {
        this._pendingRenumber = targetEntity;
        newPos = prevPos + MIN_POSITION_GAP;
      }
    }

    if (this._kanbanDebug) {
      console.log("[ha-kanban] computed position", {
        prevPos, nextPos, newPos,
      });
    }

    const newDesc = this._setPositionInDescription(moved.description, newPos);

    try {
      if (sourceEntity === targetEntity) {
        await this.hass.callService("todo", "update_item", {
          entity_id: sourceEntity,
          item: uid,
          description: newDesc,
        });
        await this._fetchItemsFor(sourceEntity);
      } else {
        const addPayload = {
          entity_id: targetEntity,
          item: moved.summary,
          description: newDesc,
        };
        if (moved.due || moved.due_date) {
          addPayload.due_date = moved.due || moved.due_date;
        }
        await this.hass.callService("todo", "add_item", addPayload);
        await this.hass.callService("todo", "remove_item", {
          entity_id: sourceEntity,
          item: uid,
        });
        await Promise.all([
          this._fetchItemsFor(sourceEntity),
          this._fetchItemsFor(targetEntity),
        ]);
      }
    } catch (err) {
      console.error("ha-kanban-todo-card: sortable end failed", err);
      try {
        await Promise.all([
          this._fetchItemsFor(sourceEntity),
          sourceEntity !== targetEntity
            ? this._fetchItemsFor(targetEntity)
            : Promise.resolve(),
        ]);
      } catch (_e) {
        /* noop */
      }
    } finally {
      if (this._pendingRenumber === targetEntity) {
        this._pendingRenumber = null;
        try {
          await this._renumberList(targetEntity);
        } catch (err) {
          console.warn("ha-kanban-todo-card: renumber failed", err);
        }
      }
      // CRITICAL: force a render and WAIT for DOM to flush BEFORE releasing
      // the in-flight lock. Without this, the user could start another drag
      // against stale DOM (data-uid attributes still pointing at uids the
      // server has already re-keyed), causing "item_not_found" on the next
      // service call.
      this._dragging = false;
      this.requestUpdate();
      try {
        await this.updateComplete;
      } catch (_e) {
        /* noop */
      }
      this._dragOpInFlight = false;
    }
  }

  async _renumberList(entityId) {
    const items = this._itemsByEntity[entityId] || [];
    const sorted = this._sortItemsForList({ sort_by: "manual" }, items);
    for (let i = 0; i < sorted.length; i++) {
      const newPos = (i + 1) * 1000;
      const current = this._getItemPosition(sorted[i]);
      if (current === newPos) continue;
      const newDesc = this._setPositionInDescription(sorted[i].description, newPos);
      try {
        await this.hass.callService("todo", "update_item", {
          entity_id: entityId,
          item: sorted[i].uid,
          description: newDesc,
        });
      } catch (err) {
        console.warn(`ha-kanban-todo-card: renumber failed on ${sorted[i].uid}`, err);
      }
    }
    await this._fetchItemsFor(entityId);
  }

  async _confirmDelete(list, item) {
    const raw = item.summary || "";
    const withoutAuto = this._stripAutoRemoveMeta(raw);
    const cat = this._resolveCategory(this._getCategories(list), withoutAuto);
    const labelText = this._stripCategory(withoutAuto, cat) || raw;

    const ok = window.confirm(this._ui("confirm_delete", labelText));
    if (!ok) return;

    try {
      await this.hass.callService("todo", "remove_item", {
        entity_id: list.entity,
        item: item.uid || item.summary,
      });
      await this._fetchItemsFor(list.entity);
    } catch (err) {
      console.error("HaKanbanTodoCard: erreur suppression manuelle", err);
    }
  }

  // ------------------ CATEGORIES & PRESETS ------------------

  _getCategories(list) {
    const fromPreset = list.preset ? KANBAN_TODO_PRESETS[list.preset] || [] : [];
    const custom = list.categories || [];

    const merged = [...fromPreset];
    custom.forEach((c) => {
      const idx = merged.findIndex((m) => m.key === c.key);
      if (idx >= 0) merged[idx] = { ...merged[idx], ...c };
      else merged.push(c);
    });

    return merged;
  }

  _selectCategory(entityId, key) {
    this._selectedCatByEntity = {
      ...this._selectedCatByEntity,
      [entityId]: key,
    };
  }

  _resolveCategory(cats, summary) {
    if (!cats.length || !summary) return null;
    return cats.find((cat) => cat.match && summary.includes(cat.match)) || null;
  }

  _stripCategory(summary, cat) {
    if (!cat || !summary || !cat.match) return summary;
    return summary.replace(cat.match, "").trim();
  }

  _getDefaultCategory(list) {
    const cats = this._getCategories(list);
    if (!list.default_category) return null;
    return cats.find((c) => c.key === list.default_category) || null;
  }

  // ------------------ COULEURS (progress + urgence) ------------------

  _getProgressColor(list, percent) {
    // liste vide => couleur neutre
    if (percent == null) {
      return list.empty_list_color || DEFAULT_EMPTY_LIST_COLOR;
    }

    const table =
      list.progress_colors ||
      this._config.progress_colors ||
      DEFAULT_PROGRESS_COLORS;
    const sorted = [...table].sort((a, b) => b.threshold - a.threshold);
    const entry = sorted.find((e) => percent >= e.threshold);
    return entry ? entry.color : "#22c55e";
  }

  _getItemUrgencyLevel(list, item, cat) {
    const colorMode = list.color_mode || "category";
    if (colorMode !== "urgency_age") return 0;
    if (!cat || !cat.max_days) return 0;
    if (!item.due && !item.due_date) return 0;

    const dueStr = item.due || item.due_date;
    const due = new Date(dueStr);
    if (Number.isNaN(due.getTime())) return 0;

    const now = new Date();
    const diffMs = now.getTime() - due.getTime();
    const diffDays = diffMs / 86400000;

    if (diffDays <= 0) return 0;

    const maxDays = cat.max_days;
    const warnStart =
      typeof cat.warning_start_days === "number" ? cat.warning_start_days : 0;

    if (maxDays && diffDays >= maxDays) return 2;
    if (warnStart && diffDays >= warnStart) return 1;
    if (!warnStart && diffDays > 0 && diffDays < maxDays) return 1;
    return 0;
  }

  _getItemColors(list, item, cat, completed) {
    const baseOff = cat?.color_off || "#9ca3af";
    const baseOn = cat?.color_on || cat?.color || "#22c55e";

    let iconColor = completed ? baseOn : baseOff;
    let pillColor = baseOn;

    const urgencyLevel = this._getItemUrgencyLevel(list, item, cat);
    const warnColor = list.urgency_warning_color || "#f97316";
    const dangerColor = list.urgency_overdue_color || "#ef4444";

    if (urgencyLevel === 1) {
      iconColor = warnColor;
      pillColor = warnColor;
    } else if (urgencyLevel === 2) {
      iconColor = dangerColor;
      pillColor = dangerColor;
    }

    return { iconColor, pillColor };
  }

  _getListSeverityColor(list, items) {
    const cats = this._getCategories(list);
    let worstLevel = 0;

    for (const item of items) {
      const raw = item.summary || "";
      const withoutAuto = this._stripAutoRemoveMeta(raw);
      const cat = this._resolveCategory(cats, withoutAuto);
      const lvl = this._getItemUrgencyLevel(list, item, cat);
      if (lvl > worstLevel) worstLevel = lvl;
      if (worstLevel === 2) break;
    }

    if (worstLevel === 2) return list.urgency_overdue_color || "#ef4444";
    if (worstLevel === 1) return list.urgency_warning_color || "#f97316";
    return null;
  }

  // ------------------ TODO : LECTURE / AJOUT / TOGGLE ------------------

  async _fetchItemsFor(entityId, skipAutoRemove = false) {
    if (!this.hass || !entityId) return;

    try {
      const result = await this.hass.callWS({
        type: "todo/item/list",
        entity_id: entityId,
      });

      const items =
        result?.items ||
        (result && result[entityId] && result[entityId].items) ||
        [];

      this._itemsByEntity = {
        ...this._itemsByEntity,
        [entityId]: items,
      };

      if (!skipAutoRemove) {
        await this._processAutoRemovalsForEntity(entityId, items);
      }
    } catch (err) {
      console.error(
        "HA Kanban Todo Card: erreur todo/item/list pour",
        entityId,
        err
      );
    }
  }

  _onInputKeydown(e, list) {
    if (e.key === "Enter") {
      e.preventDefault();
      this._addItem(list);
    }
  }

  async _addItem(list) {
    if (!this.hass || !list?.entity) return;

    const entityId = list.entity;
    // Prefer per-entity input value (kanban); fall back to legacy global
    // _newText for tabs layout.
    const fromMap =
      this._newTextByEntity && this._newTextByEntity[entityId];
    let text = (fromMap || this._newText || "").trim();
    if (!text) return;

    const cats = this._getCategories(list);
    const selectedKey = this._selectedCatByEntity[entityId] || null;
    let cat = cats.find((c) => c.key === selectedKey);
    if (!cat) cat = this._getDefaultCategory(list);
    if (cat && cat.match) {
      text = `${text} ${cat.match}`;
    }

    // Compute position so the new item appears at the TOP of its list
    // (kanban convention: newest on top). Use min(existing positions) - 1000.
    const existing = (this._itemsByEntity[entityId] || []).filter(
      (i) => i.status !== "completed"
    );
    let minPos = null;
    for (const i of existing) {
      const p = this._getItemPosition(i);
      if (p !== null && (minPos === null || p < minPos)) minPos = p;
    }
    const newPos = minPos === null ? 1000 : minPos - 1000;
    const description = `position: ${newPos}`;

    try {
      await this.hass.callService("todo", "add_item", {
        entity_id: entityId,
        item: text,
        description,
      });
      // Clear both the per-entity and legacy text states
      if (this._newTextByEntity) {
        const next = { ...this._newTextByEntity };
        delete next[entityId];
        this._newTextByEntity = next;
      }
      this._newText = "";
      await this._fetchItemsFor(entityId);
    } catch (err) {
      console.error("HA Kanban Todo Card: erreur ajout item", err);
    }
  }

  async _toggleItem(list, item) {
    if (!this.hass || !list?.entity) return;

    const entityId = list.entity;
    const isCompleted = item.status === "completed";
    const newStatus = isCompleted ? "needs_action" : "completed";

    let summary = item.summary || "";
    summary = this._stripAutoRemoveMeta(summary);

    if (!isCompleted) {
      const delay = this._getAutoRemoveDelaySeconds(list);
      if (delay > 0) {
        const nowSec = Math.floor(Date.now() / 1000);
        summary = `${summary} #rtrm(${nowSec},${delay})`;
      }
    }

    try {
      await this._recreateItemWithSummaryAndStatus(
        entityId,
        item,
        summary,
        newStatus
      );

      await this._fetchItemsFor(entityId);
    } catch (err) {
      console.error("HaKanbanTodoCard: erreur update item", err);
    }
  }

  static getStubConfig() {
    return {
      title: "Tâches & courses",
      language: "fr",
      lists: [{ entity: "todo.liste_de_course", label: "Courses" }],
    };
  }
}

customElements.define("ha-kanban-todo-card", HaKanbanTodoCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "ha-kanban-todo-card",
  name: "HA Kanban Todo Card",
  description:
    "Multi-list todo hub with Kanban layout and drag-and-drop between lists.",
  preview: true,
});

console.info(
  `%cHA Kanban Todo Card%c v${HA_KANBAN_TODO_CARD_VERSION}`,
  "color: white; background:#22c55e; padding:2px 6px; border-radius:4px;",
  "color:#22c55e;"
);
