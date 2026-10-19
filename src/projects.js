// *palabras* en sections[].text = marcador lima.
// Archivos con hash del contenido en el nombre (nombre.hash.ext): al sustituir uno,
// renómbralo con su nuevo hash para que ninguna caché mezcle versiones.
// El poster de un vídeo es SU PRIMER FOTOGRAMA (ffmpeg -frames:v 1): si no, al
// empezar a reproducirse la imagen salta del poster al fotograma 0.
// Imágenes en /public/projects/ (vertical, ~4:5). `video` opcional (usa `image` como poster).
// `category`: claves de `categories`, una o varias; el filtro de la home las usa.
// `as[categoría]`: lo que cambia al abrir el proyecto desde ese filtro (tags, role,
// tools, intro, introLabel, sections, image/video…). Cada versión habla solo de ese rol; sin
// `as`, o desde "All", sale la versión general de arriba. `ratio` (ancho/alto) da
// la forma del media en la columna centrada de Product Design (por defecto 4/5).
// `shots`: muestras bajo la descripción en Product Design, repartidas sobre la
// rejilla de 4 columnas (el orden fija el sitio: la primera, arriba a la derecha).
// Cada una es una imagen o un vídeo (`video` + `image` de póster); `width`/`height`
// dan la forma. Con `parallax` la caja es más baja que el media y este se desplaza
// dentro con el scroll, de su borde de arriba al de abajo.
// `es`: la traducción, campo a campo (i18n.js); lo que no tenga, sale en inglés.

// Orden del filtro. Una categoría sin proyectos no sale.
export const categories = [
  { key: 'product', label: 'Product Design', es: { label: 'Diseño de producto' } },
  { key: 'frontend', label: 'Front-end' },
  // Diseño de interfaz y prototipo: ni lanzado ni con código detrás.
  { key: 'concept', label: 'Concept', es: { label: 'Concepto' } },
]

export const projects = [
  {
    slug: 'beside',
    title: 'Beside',
    year: 2026, // confirmar
    status: 'MVP', // confirmar
    tags: 'macOS App · Product Design · AI',
    category: ['product'],
    image: '/projects/beside-poster.86d4f9a3.jpg',
    video: '/projects/beside.e7d541b9.mp4',
    // Sin dominio todavía: la fila Web no sale.
    role: 'Product design, development',
    tools: ['Swift', 'SwiftUI', 'Claude API', 'Supabase', 'Figma'], // confirmar
    intro:
      'A macOS app that keeps everything you are working on organised in modes, with an AI that knows each one inside out.',
    sections: [
      {
        heading: 'One mode for each thing',
        text: 'A personal project, a round of *sending out CVs* with the files you need at hand, a *subject you are studying*. Each lives in its own mode, so every one stays organised *independently* of the rest.',
      },
      {
        heading: 'An AI with the whole context',
        text: 'The assistant knows *everything inside the mode* you are in, so it can *answer, create, edit or delete* content for you, without you explaining it all again.',
      },
      {
        heading: 'Specialised agents',
        text: 'Behind it, *agents built for specific tasks* help you go deeper on exactly what you want to focus on.',
      },
    ],
    as: {
      product: {
        role: 'Product design',
        tools: ['Figma'], // confirmar
      },
    },
    es: {
      tags: 'App de macOS · Diseño de producto · IA',
      role: 'Diseño de producto, desarrollo',
      intro: 'Una app de macOS que mantiene organizado en modos todo aquello en lo que trabajas, con una IA que conoce cada uno al detalle.',
      sections: [
        {
          heading: 'Un modo para cada cosa',
          text: 'Un proyecto personal, una tanda de *envío de CV* con los archivos que necesitas a mano, una *asignatura que estás estudiando*. Cada cosa vive en su propio modo, así que cada una se mantiene organizada *independientemente* del resto.',
        },
        {
          heading: 'Una IA con todo el contexto',
          text: 'El asistente conoce *todo lo que hay dentro del modo* en el que estás, así que puede *responder, crear, editar o borrar* contenido por ti, sin que tengas que explicárselo todo otra vez.',
        },
        {
          heading: 'Agentes especializados',
          text: 'Detrás, *agentes creados para tareas concretas* te ayudan a profundizar justo en aquello en lo que te quieres centrar.',
        },
      ],
      as: { product: { role: 'Diseño de producto' } },
    },
  },
  {
    slug: 'mockp',
    title: 'Mockp',
    year: 2026, // CV: Jul 2026 – presente
    status: 'Live',
    tags: 'Web Platform · Product Design · Front-end',
    category: ['product', 'frontend'],
    image: '/projects/mockp.4838e38a.jpg',
    url: 'https://mockp.com',
    role: 'Product design, full-stack development',
    tools: ['React', 'TypeScript', 'Vite', 'Supabase', 'Stripe'],
    intro: 'A Pinterest of mockups, where anyone can browse, design and download their own high-quality mockups. Free, for everyone.',
    sections: [
      {
        heading: 'A catalogue, not a template pack',
        text: 'The idea was a huge catalogue, big enough that every user can *define their own style* as precisely as they want, finding *the scene that fits their work* instead of settling for the one that is close enough.',
      },
      {
        heading: 'Browse, design, download',
        text: 'Discover mockups the way you browse a moodboard, open one, drop your design in and *download it at full quality*. *No paywall* in front of the work.',
      },
      {
        heading: 'Built on',
        text: 'A *React + Vite* front-end, *Supabase* as the backend and *Stripe* as the payment gateway.',
      },
    ],
    as: {
      product: {
        tags: 'Web Platform · Product Design',
        // Grabación de mockp.com (oct 19): solo la página: sin la barra de Safari, esquinas rectas.
        image: '/projects/mockp-flow-poster.bd8961b5.jpg',
        video: '/projects/mockp-flow.b4f73e7b.mp4',
        ratio: 1600 / 988,
        role: 'Product design',
        tools: undefined,
        // Muestras hechas con Mockp.
        shots: [
          { image: '/projects/mockp-laptop.f9513025.jpg', width: 1800, height: 1238, alt: 'Mockp open on a laptop on a wooden table' },
          { image: '/projects/mockp-app-icon.b400739c.jpg', width: 1024, height: 1024, alt: 'Mockp’s icon on a phone’s home screen' },
          {
            // Recortado a 6:5 del original 4K: el móvil entero. `parallax`: se ve en
            // una ventana más baja y se recorre de arriba abajo con el scroll.
            parallax: true,
            video: '/projects/mockp-hands-wide.69874c69.mp4',
            image: '/projects/mockp-hands-wide-poster.95708d63.jpg',
            width: 1600,
            height: 1334,
            alt: 'Browsing mockups on mockp.com on a phone held in both hands',
          },
          {
            // Grabación del editor (oct 19), sin la barra de Safari y a 4:3 desde
            // la derecha: el mockup entero y el panel de ajustes.
            video: '/projects/mockp-editing.827df528.mp4',
            image: '/projects/mockp-editing-poster.a4eff15c.jpg',
            width: 1440,
            height: 1080,
            alt: 'Tuning the reflections, brightness and sofa colour of a mockup in the Mockp editor',
          },
          // Los precios, junto al paso del modelo.
          {
            video: '/projects/mockp-hand.5b63b44f.mp4',
            image: '/projects/mockp-hand-poster.8235c421.jpg',
            width: 1440,
            height: 1080,
            alt: 'Scrolling Mockp’s pricing and questions on a phone held in hand',
          },
        ],
        // Caso de estudio contado por Adrián (oct 2026): el problema arriba (con
        // `introLabel`), luego enfoque → decisiones → modelo (gratis, de pago
        // por volumen, anuncios más adelante). Precios según la página de precios de mockp.com.
        introLabel: 'The problem',
        intro:
          'More and more, trying a new tool means *signing up for a subscription first*. I’ve always felt a product should *prove its value before asking you to pay*. Only by using it do you find out whether it fits, whether it has the style you’re after and works with your visual identity.',
        // `notes`: párrafos entre las muestras, cada uno con la suya: el primero
        // bajo la primera (derecha), el segundo bajo la segunda (izquierda), el
        // tercero bajo el vídeo grande (y sobre el vídeo del editor) y el cuarto
        // junto a la foto, a su izquierda.
        notes: [
          {
            heading: 'The approach',
            text: 'Inspired by Pinterest, *I designed Mockp* as a huge catalogue of mockups, *free for anyone*. You find a scene, make it yours and download it, so the product proves itself before it asks for anything.',
          },
          {
            heading: 'A catalogue like Pinterest',
            text: 'The way in is browsing, with scenes in a grid you scroll *like a moodboard*, with search for when you already know what you want. A catalogue wide enough that everyone can find *the scene that fits their style*, instead of a pack picked by someone else.',
          },
          {
            heading: 'An editor for the last mile',
            text: 'The editor does two jobs. One, still internal, is *creating* the catalogue’s mockups. The other is yours. You *drop your design in* and tune it to your taste, from *reflections* and *brightness* to the *colours* of the scene, recoloured with one picked from the photo.',
          },
          {
            heading: 'Designed to stay free',
            text: 'Mockp has *no running cost*, so the free plan can be generous. *5 downloads a day*, every mockup in 4K, is more than enough for personal use. Professional work needs more, so a *subscription lifts the limit*, with Plus at 3 € a month for 20 a day and Studio at 9 € with no limit. As traffic grows, the plan is to earn through *ads* rather than more subscriptions, so the catalogue stays free.',
          },
        ],
        // Lo que eran las últimas secciones está condensado en la última nota.
        sections: [],
      },
      frontend: {
        tags: 'Web Platform · Front-end',
        role: 'Front-end development',
        intro:
          'A Pinterest of mockups, with a catalogue to browse, a place to drop your design into a scene, and a full-quality download.',
        sections: [
          {
            heading: 'The stack',
            text: 'A *React + TypeScript* front-end built with *Vite*, *Supabase* as the backend and *Stripe* as the payment gateway.',
          },
          {
            heading: 'Browse, design, download',
            text: 'The front-end carries the whole flow, from a *catalogue you browse like a moodboard*, to a mockup where you *drop your design in* and the *full-quality download* at the end.',
          },
        ],
      },
    },
    es: {
      status: 'En producción',
      tags: 'Plataforma web · Diseño de producto · Front-end',
      role: 'Diseño de producto, desarrollo full-stack',
      intro: 'Un Pinterest de mockups donde cualquiera puede explorar, diseñar y descargar sus propios mockups en alta calidad. Gratis, para todo el mundo.',
      sections: [
        {
          heading: 'Un catálogo, no un pack de plantillas',
          text: 'La idea era un catálogo enorme, tan grande que cada persona pudiera *definir su propio estilo* con toda la precisión que quisiera, encontrando *la escena que encaja con su trabajo* en lugar de conformarse con la que se acerca.',
        },
        {
          heading: 'Explorar, diseñar, descargar',
          text: 'Descubres mockups como quien recorre un moodboard, abres uno, colocas tu diseño y *lo descargas a máxima calidad*. *Sin muro de pago* delante del trabajo.',
        },
        {
          heading: 'Hecho con',
          text: 'Un front-end en *React + Vite*, *Supabase* como backend y *Stripe* como pasarela de pago.',
        },
      ],
      as: {
        product: {
          tags: 'Plataforma web · Diseño de producto',
          role: 'Diseño de producto',
          shots: [
            { alt: 'Mockp abierto en un portátil sobre una mesa de madera' },
            { alt: 'El icono de Mockp en la pantalla de inicio de un móvil' },
            { alt: 'Explorando mockups en mockp.com en un móvil sujeto con las dos manos' },
            { alt: 'Ajustando los reflejos, el brillo y el color del sofá de un mockup en el editor de Mockp' },
            { alt: 'Recorriendo los precios y las preguntas de Mockp en un móvil en la mano' },
          ],
          introLabel: 'El problema',
          intro:
            'Cada vez más, probar una herramienta nueva implica *suscribirte primero*. Siempre he sentido que un producto debería *demostrar su valor antes de cobrarte*. Solo usándolo descubres si encaja contigo, si tiene el estilo que buscas y si funciona con tu identidad visual.',
          notes: [
            {
              heading: 'El enfoque',
              text: 'Inspirándome en Pinterest, *diseñé Mockp* como un catálogo enorme de mockups, *gratis para cualquiera*. Encuentras una escena, la haces tuya y la descargas, así el producto se demuestra antes de pedirte nada.',
            },
            {
              heading: 'Un catálogo como Pinterest',
              text: 'Se entra explorando, con escenas en una cuadrícula que recorres *como un moodboard*, con búsqueda para cuando ya sabes lo que quieres. Un catálogo tan amplio que cada persona encuentre *la escena que encaja con su estilo*, en lugar de un pack elegido por otro.',
            },
            {
              heading: 'Un editor para el último tramo',
              text: 'El editor hace dos trabajos. Uno, todavía interno, es *crear* los mockups del catálogo. El otro es tuyo. *Colocas tu diseño* y lo ajustas a tu gusto, desde los *reflejos* y el *brillo* hasta los *colores* de la escena, recoloreada con uno tomado de la foto.',
            },
            {
              heading: 'Pensado para seguir siendo gratis',
              text: 'Mockp *no tiene coste de funcionamiento*, así que el plan gratuito puede ser generoso. *5 descargas al día*, todos los mockups en 4K, van sobradas para uso personal. El trabajo profesional necesita más, así que una *suscripción quita el límite*, con Plus a 3 € al mes para 20 al día y Studio a 9 € sin límite. Cuando crezca el tráfico, el plan es monetizar con *anuncios* en lugar de con más suscripciones, para que el catálogo siga siendo gratis.',
            },
          ],
          sections: [],
        },
        frontend: {
          tags: 'Plataforma web · Front-end',
          role: 'Desarrollo front-end',
          intro:
            'Un Pinterest de mockups, con un catálogo para explorar, un sitio donde colocar tu diseño en una escena y una descarga a máxima calidad.',
          sections: [
            {
              heading: 'El stack',
              text: 'Un front-end en *React + TypeScript* construido con *Vite*, *Supabase* como backend y *Stripe* como pasarela de pago.',
            },
            {
              heading: 'Explorar, diseñar, descargar',
              text: 'El front-end lleva todo el flujo, desde un *catálogo que recorres como un moodboard* hasta un mockup donde *colocas tu diseño* y la *descarga a máxima calidad* al final.',
            },
          ],
        },
      },
    },
  },
  {
    slug: 'dakubo',
    title: 'Dakubo',
    year: 2026, // confirmar
    status: 'Live', // confirmar
    tags: 'Agency Website · Branding · Motion',
    category: ['frontend'],
    image: '/projects/dakubo-poster.6096a958.jpg',
    video: '/projects/dakubo.d8e2aa7d.mp4',
    url: 'https://dakubo.com',
    role: 'Logo, interface design, motion design, development',
    // tools: [...]: pendiente: la fila Stack sale cuando exista
    intro:
      'The website of Dakubo, a studio that designs and builds websites and apps. It shows the studio’s work, what it does and a built-in budget calculator.',
    sections: [
      {
        heading: 'A portfolio for the studio',
        text: 'The *projects* up front, the services explained without jargon, and a *built-in budget calculator* so a client can price their idea before writing a single email.',
      },
      {
        heading: 'One pair of hands',
        text: 'The *logo*, the *interface*, the *motion design* and the *code*. Designed, programmed and shipped by me, from the first sketch to production.',
      },
    ],
    as: {
      frontend: {
        tags: 'Agency Website · Front-end · Motion',
        role: 'Front-end development, motion',
        sections: [
          {
            heading: 'What runs in the browser',
            text: 'The *projects* up front, the services, and a *built-in budget calculator* that prices an idea on the spot, before the client writes a single email.',
          },
          {
            heading: 'Built and shipped',
            text: 'The interface and its *motion*, *programmed by me* and taken to production.',
          },
        ],
      },
    },
    es: {
      status: 'Publicado',
      tags: 'Web de agencia · Branding · Motion',
      role: 'Logo, diseño de interfaz, motion design, desarrollo',
      intro:
        'La web de Dakubo, un estudio que diseña y desarrolla webs y apps. Muestra su trabajo, lo que hace y una calculadora de presupuesto integrada.',
      sections: [
        {
          heading: 'Un portfolio para el estudio',
          text: 'Los *proyectos* delante, los servicios explicados sin jerga y una *calculadora de presupuesto integrada* para que un cliente pueda poner precio a su idea antes de escribir un solo email.',
        },
        {
          heading: 'Un solo par de manos',
          text: 'El *logo*, la *interfaz*, el *motion design* y el *código*. Diseñado, programado y publicado por mí, del primer boceto a producción.',
        },
      ],
      as: {
        frontend: {
          tags: 'Web de agencia · Front-end · Motion',
          role: 'Desarrollo front-end, motion',
          sections: [
            {
              heading: 'Lo que corre en el navegador',
              text: 'Los *proyectos* delante, los servicios y una *calculadora de presupuesto integrada* que pone precio a una idea al momento, antes de que el cliente escriba un solo email.',
            },
            {
              heading: 'Construido y publicado',
              text: 'La interfaz y su *motion*, *programados por mí* y llevados a producción.',
            },
          ],
        },
      },
    },
  },
]

// The project as seen from one category: its `as[lens]` over the general version.
export const lensed = (p, lens) => (lens && p.as?.[lens] ? { ...p, ...p.as[lens] } : p)

export const site = {
  name: 'Adrián García',
  role: 'Front-end Developer & Designer',
  // *palabra* = subrayada con el marcador lima
  bio: 'Front-end developer with a background in *product design*. I build interfaces caring as much about the *technical implementation* as about the *experience* of the people who end up using them.',
  now: 'mockp', // "Now building …": slug del proyecto en curso
  email: 'hello.adrian.gar@gmail.com',
  nav: [
    { label: 'Work', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: 'mailto:hello.adrian.gar@gmail.com' },
  ],
  es: {
    role: 'Desarrollador front-end y diseñador',
    bio: 'Desarrollador front-end con formación en *diseño de producto*. Construyo interfaces cuidando tanto la *implementación técnica* como la *experiencia* de las personas que acaban usándolas.',
    nav: [{ label: 'Trabajo' }, { label: 'Sobre mí' }, { label: 'Contacto' }],
  },
}
