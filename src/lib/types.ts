export type PostType = "totw" | "potm" | "stats" | "result" | "goal" | "matchday" | "transfer" | "renewal" | "speed" | "welcome" | "press" | "form" | "clip";

export const POST_TYPES: { id: PostType; label: string; kicker: string; alts?: string[] }[] = [
  // `label` is the app's own (Portuguese) wording; `kicker` / `alts` are printed inside the edit and
  // are always English, so the posts read the same for an international audience.
  { id: "totw", label: "Equipa da Semana", kicker: "TEAM OF THE WEEK", alts: ["XI OF THE WEEK"] },
  { id: "goal", label: "Golo", kicker: "GOAL" },
  { id: "result", label: "Melhor em campo", kicker: "MAN OF THE MATCH", alts: ["PLAYER OF THE MATCH", "MVP"] },
  { id: "matchday", label: "Dia de jogo", kicker: "MATCHDAY" },
  { id: "stats", label: "Estatísticas", kicker: "IN FORM", alts: ["ON FIRE", "BY THE NUMBERS"] },
  { id: "potm", label: "Jogador do Mês", kicker: "PLAYER OF THE MONTH" },
  { id: "transfer", label: "Transferência", kicker: "NEW SIGNING", alts: ["IT'S OFFICIAL", "WELCOME"] },
  { id: "renewal", label: "Renovação", kicker: "NEW DEAL", alts: ["SIGNED", "HERE TO STAY"] },
  { id: "speed", label: "Velocidade", kicker: "TOP SPEED" },
  { id: "welcome", label: "Apresentação NEYOD", kicker: "WELCOME" },
  { id: "press", label: "Na imprensa", kicker: "IN THE NEWS", alts: ["MAKING HEADLINES"] },
  { id: "form", label: "Carrossel · forma (3 imagens)", kicker: "IN FORM" },
  { id: "clip", label: "Vídeo · golo / assistência", kicker: "GOAL" },
];

/**
 * Same post, different title from one variant to the next ("DIA DE JOGO", "HOJE HÁ JOGO"…).
 * Only swaps the default title: one the user typed, or a live "BIS" / "HAT-TRICK", is kept.
 */
export function variedContent(content: EditContent, postType: PostType, seed: number | undefined): EditContent {
  const t = POST_TYPES.find((p) => p.id === postType);
  if (!t?.alts || seed == null || content.kicker !== t.kicker) return content;
  const all = [t.kicker, ...t.alts];
  return { ...content, kicker: all[seed % all.length] };
}

export type TemplateId =
  | "shield"
  | "jersey"
  | "sideword"
  | "duel"
  | "syllables"
  | "gilded"
  | "roundel"
  | "spotlight"
  | "poster"
  | "monumental"
  | "data"
  | "halftone"
  | "neon"
  | "card"
  | "editorial"
  | "announce"
  | "fixture"
  | "stretch"
  | "repeat"
  | "closeup"
  | "torn"
  | "brush"
  | "frame"
  | "city"
  | "portrait"
  | "crests"
  | "archive"
  | "kaleido"
  | "sequence"
  | "serif"
  | "windows"
  | "smear"
  | "stamp"
  | "arch"
  | "skyline"
  | "postcard"
  | "exposure"
  | "streetposter"
  | "slices"
  | "ticket"
  | "magazine"
  | "riso"
  | "tactics"
  | "programme"
  | "infographic"
  | "calendar"
  | "rising"
  | "steps"
  | "pitch"
  | "floor"
  | "cinematic"
  | "panels"
  | "checker"
  | "gothic"
  | "speed"
  | "doodle"
  | "memory"
  | "waves"
  | "halo"
  | "burst"
  | "comic"
  | "sticker"
  | "gaze"
  | "scorecol"
  | "silhouette"
  | "paperlight"
  | "script"
  | "mono"
  | "window"
  | "matchserif"
  | "scoreline"
  | "broadcast"
  | "simple"
  | "outline"
  | "ghost"
  | "gameday"
  | "sky"
  | "mist"
  | "headline"
  | "collage"
  | "debut"
  | "bokeh"
  | "strip"
  | "glow"
  | "dispersion"
  | "sepia"
  | "notes"
  | "crestmark"
  | "upnext"
  | "caption"
  | "numbers"
  | "award"
  | "cutletters"
  | "backlit"
  | "twoscale"
  | "bignumber"
  | "brushday"
  | "motion"
  | "studio"
  | "wall"
  | "graffiti"
  | "damask"
  | "diagonal"
  | "versus"
  | "chrome"
  | "tape"
  | "night"
  | "strokes"
  | "tallname"
  | "breakout"
  | "statboxes"
  | "column"
  | "splitnumber"
  | "notebook"
  | "swoosh"
  | "tilt"
  | "backpanel"
  | "blurduo"
  | "faceday"
  | "arc"
  | "tunnel"
  | "cheer"
  | "sideband"
  | "band"
  | "pillar"
  | "blueprint"
  | "glowline"
  | "greyday"
  | "triangles"
  | "emblemart"
  | "reflect"
  | "minimal"
  | "profile"
  | "screenprint"
  | "bighead"
  | "swirl"
  | "splitbw"
  | "hollow"
  | "selective"
  | "dotscript"
  | "roughname"
  | "infobox"
  | "condensed"
  | "shards"
  | "clubname"
  | "curvepanel"
  | "emblemfade"
  | "cutpaper"
  | "petals"
  | "gradient"
  | "ring"
  | "glass"
  | "boxtitle"
  | "softglow"
  | "blurrun"
  | "nextmatch"
  | "redgrain"
  | "halfline"
  | "statserif"
  | "sepiaday"
  | "topspeed"
  | "colorblock"
  | "cover"
  | "panelscript"
  | "pride"
  | "playoff"
  | "slats"
  | "vhs"
  | "triptych"
  | "tiles"
  | "zoomburst"
  | "tagcard"
  | "stencil"
  | "swiss"
  | "gallery"
  | "sidecol"
  | "serene"
  | "datefirst"
  | "inset"
  | "micro"
  | "filmframe"
  | "aura"
  | "backline"
  | "namefield"
  | "diptych"
  | "pressphoto"
  | "horizon"
  | "lockup"
  | "orbit"
  | "vertname"
  | "monoaccent"
  | "timetable"
  | "twoblock"
  | "autograph"
  | "tonal"
  | "widetitle"
  | "clock"
  | "goalwide"
  | "goalscore"
  | "goalnet"
  | "goalbug"
  | "goalserene"
  | "goalflash"
  | "goalrows"
  | "goallight"
  | "goaldots"
  | "crestline"
  | "stage"
  | "edgebar"
  | "monogram"
  | "thirds"
  | "stub"
  | "goalmono"
  | "goaltonal"
  | "goalvert"
  | "footnote"
  | "echoline"
  | "pills"
  | "corner"
  | "shadow"
  | "goalecho"
  | "goalcircle"
  | "goalcrop"
  | "goalbar"
  | "goalnumber"
  | "seal"
  | "fixtureboard"
  | "lowerthird"
  | "fixturelist"
  | "dotgrid"
  | "goalticker"
  | "goalaura"
  | "goalinset"
  | "goalswiss"
  | "goalorbit"
  | "namecorners"
  | "pinstripe"
  | "crestpair"
  | "datecard"
  | "frostband"
  | "goalsidecol"
  | "goalgallery"
  | "goallockup"
  | "goalboard"
  | "goalname"
  | "offsetshadow"
  | "kickoff"
  | "pitchlines"
  | "sunrise"
  | "contour"
  | "goalhorizon"
  | "goalmicro"
  | "goalmonogram"
  | "goalstage"
  | "goaloffset"
  | "medallion"
  | "matchbar"
  | "ringlight"
  | "widescreen"
  | "underline"
  | "goalringlight"
  | "goalmedallion"
  | "goalunderline"
  | "goalwidescreen"
  | "goalcrestpair"
  | "sentence"
  | "signage"
  | "datestamp"
  | "hairslash"
  | "viewfinder"
  | "goalsentence"
  | "goalcamera"
  | "goalslash"
  | "goalviewfinder"
  | "goalframe"
  | "notify"
  | "marker"
  | "chapter"
  | "subtitle"
  | "parens"
  | "goalnotify"
  | "goalmarker"
  | "goalparens"
  | "goalsubtitle"
  | "goalpunct"
  | "totwgallery"
  | "totwcard"
  | "totwswiss"
  | "totwcallout"
  | "totwsplit"
  | "totwstack"
  | "totwmicro"
  | "totwtonal"
  | "search"
  | "chat"
  | "receipt"
  | "instant"
  | "measure"
  | "goalsearch"
  | "goalchat"
  | "goalreceipt"
  | "goalinstant"
  | "goalmeasure"
  | "nowplaying"
  | "locator"
  | "invite"
  | "toggle"
  | "emboss"
  | "goalnowplaying"
  | "goalemboss"
  | "goaltoggle"
  | "goalpulse"
  | "goalunlock"
  | "cropmarks"
  | "folder"
  | "keycaps"
  | "postit"
  | "specimen"
  | "goalcropmarks"
  | "goalkeycaps"
  | "goalpostit"
  | "goalspecimen"
  | "goaltally"
  | "halffill"
  | "circletext"
  | "strike"
  | "superscript"
  | "quotes"
  | "goalhalffill"
  | "goalcircletext"
  | "goalstrike"
  | "goalsuperscript"
  | "goalquotes"
  | "bordertext"
  | "weights"
  | "bounce"
  | "fadeword"
  | "tracking"
  | "goalbordertext"
  | "goalweights"
  | "goalbounce"
  | "goalfade"
  | "goaltracking"
  | "dropcap"
  | "crossword"
  | "hyphen"
  | "ellipsis"
  | "arrow"
  | "goaldropcap"
  | "goalcrossword"
  | "goalellipsis"
  | "goalarrow"
  | "goalcolon"
  | "bleedword"
  | "textsquare"
  | "circled"
  | "redacted"
  | "oneline"
  | "goalbleed"
  | "goaltextsquare"
  | "goalcircled"
  | "goalredacted"
  | "goaloneline"
  | "castshadow"
  | "mirrorecho"
  | "overlap"
  | "fillprogress"
  | "twotone"
  | "goalcastshadow"
  | "goalmirrorecho"
  | "goaloverlap"
  | "goalfillprogress"
  | "goaltwotone"
  | "typesilhouette"
  | "giantsilhouette"
  | "linesilhouette"
  | "rippleecho"
  | "rimlight"
  | "goaltypesilhouette"
  | "goalgiantsilhouette"
  | "goallinesilhouette"
  | "goalrippleecho"
  | "goalrimlight"
  | "dotsilhouette"
  | "crestsilhouette"
  | "splitsilhouette"
  | "doubleline"
  | "risingecho"
  | "goaldotsilhouette"
  | "goalcrestsilhouette"
  | "goalsplitsilhouette"
  | "goaldoubleline"
  | "goalrisingecho"
  | "paperecho"
  | "dashecho"
  | "gradientsilhouette"
  | "duosilhouette"
  | "stepsilhouette"
  | "goalpaperecho"
  | "goaldashecho"
  | "goalgradientsilhouette"
  | "goalduosilhouette"
  | "goalstepsilhouette"
  | "paperripple"
  | "papertype"
  | "paperdouble"
  | "paperstep"
  | "papergiant"
  | "goalpaperripple"
  | "goalpapertype"
  | "goalpaperdouble"
  | "goalpaperstep"
  | "goalpapergiant"
  | "echotitle"
  | "echodate"
  | "echotime"
  | "echoname"
  | "echocrest"
  | "goalechotitle"
  | "goalechoname"
  | "goalechocrest"
  | "goalechobar"
  | "goalechocorner"
  | "echoswiss"
  | "echoserif"
  | "echotable"
  | "echoorbit"
  | "echolockup"
  | "goalechoswiss"
  | "goalechoserif"
  | "goalechoorbit"
  | "goalechomono"
  | "goalechoflash"
  | "echoinset"
  | "echogallery"
  | "echosidecol"
  | "echohorizon"
  | "echowidetitle"
  | "goalechobug"
  | "goalechoserene"
  | "goalechohorizon"
  | "goalechowide"
  | "goalechotonal"
  | "echomicro"
  | "echoaura"
  | "echobackline"
  | "echonamefield"
  | "echozoom"
  | "goalechoaura"
  | "goalechobackline"
  | "goalechonamefield"
  | "goalechozoom"
  | "goalechovert"
  | "paperechodate"
  | "paperechotime"
  | "paperechoname"
  | "paperechoserif"
  | "paperechowide"
  | "goalpaperechoname"
  | "goalpaperechoserif"
  | "goalpaperechowide"
  | "goalpaperechovert"
  | "goalpaperechobar"
  | "goalherobarlow"
  | "goalheroanton"
  | "goalheroarchivo"
  | "goalherodela"
  | "goalheroslab"
  | "goalherobodoni"
  | "goalherobebas"
  | "welcome"
  | "pressstack"
  | "pressclip"
  | "presshero"
  | "presswall"
  | "welcomeplay"
  | "welcomeduo"
  | "welcomehalo"
  | "heromatch"
  | "herotime"
  | "herodate"
  | "heromatchdark"
  | "herobehind"
  | "goalherodark"
  | "goalherosplit"
  | "goalherobehind"
  | "goalherofoot"
  | "goalheroband"
  | "herostack"
  | "herocaps"
  | "heroframe"
  | "herovs"
  | "heronumber"
  | "goalherostack"
  | "goalherocaps"
  | "goalheroframe"
  | "goalherotint"
  | "goalheroduo"
  | "heromatchbodoni"
  | "heromatchdela"
  | "heromatchslab"
  | "heromatchbebas"
  | "heromatcharchivo"
  | "goalheroghost"
  | "goalherooutline"
  | "goalherotwotone"
  | "goalheroserif"
  | "goalherolower"
  | "heroghost"
  | "herooutline"
  | "herotwotone"
  | "heroserif"
  | "herolower"
  | "goalheroshadow"
  | "goalherogradient"
  | "goalherostagger"
  | "goalherotally"
  | "goalheroaura"
  | "heroduo"
  | "herotint"
  | "heroshadow"
  | "herogradient"
  | "heroaura"
  | "goalheroname"
  | "goalheroboxed"
  | "goalherosticker"
  | "goalherocrest"
  | "goalherofill"
  | "heroboxed"
  | "herosticker"
  | "heroband"
  | "heroname"
  | "herofoot"
  | "goalherotop"
  | "goalherobw"
  | "goalheroduotone"
  | "goalheroexclaim"
  | "goalherohalf"
  | "coachhero"
  | "coachpress"
  | "coachboard"
  | "coachserif"
  | "coachtouchline"
  | "coachdark"
  | "coachname"
  | "coachduo"
  | "coachframe"
  | "coachcard"
  | "coachsheet"
  | "coachlowkey"
  | "coachmono"
  | "coachclipboard"
  | "goalherocount"
  | "welcomelight"
  | "welcomeclub"
  | "welcomecolumn"
  | "welcomecareer"
  | "coachwelcome"
  | "coachwelcomelight"
  | "natword"
  | "natfold"
  | "goalnatfold"
  | "natspine"
  | "goalnatspine"
  | "natmix"
  | "goalnatmix"
  | "natlabel"
  | "goalnatlabel"
  | "natspaced"
  | "goalnatspaced"
  | "natmarks"
  | "goalnatmarks"
  | "natdot"
  | "goalnatdot"
  | "natcut"
  | "goalnatcut"
  | "natlegend"
  | "goalnatlegend"
  | "natcols"
  | "goalnatcols"
  | "natfoot"
  | "goalnatfoot"
  | "natfade"
  | "goalnatfade"
  | "natarrow"
  | "goalnatarrow"
  | "natrule"
  | "goalnatrule"
  | "natquiet"
  | "goalnatquiet"
  | "natoverline"
  | "goalnatoverline"
  | "natcolumn"
  | "goalnatcolumn"
  | "natwatermark"
  | "goalnatwatermark"
  | "nattab"
  | "goalnattab"
  | "natsentence"
  | "goalnatsentence"
  | "natbracket"
  | "goalnatbracket"
  | "natdotline"
  | "goalnatdotline"
  | "nathead"
  | "goalnathead"
  | "natbadge"
  | "goalnatbadge"
  | "natbar"
  | "goalnatbar"
  | "natends"
  | "goalnatends"
  | "natlist"
  | "goalnatlist"
  | "natduel"
  | "goalnatduel"
  | "natdiag"
  | "goalnatdiag"
  | "natsidebar"
  | "goalnatsidebar"
  | "natpennant"
  | "goalnatpennant"
  | "natangle"
  | "goalnatangle"
  | "natlines"
  | "goalnatlines"
  | "natcrestbleed"
  | "goalnatcrestbleed"
  | "natnav"
  | "goalnatnav"
  | "natecho"
  | "goalnatecho"
  | "natflag"
  | "goalnatflag"
  | "nattag"
  | "goalnattag"
  | "natbreakout"
  | "goalnatbreakout"
  | "natstripe"
  | "goalnatstripe"
  | "natvline"
  | "goalnatvline"
  | "natoverprint"
  | "goalnatoverprint"
  | "natkickoff"
  | "goalnatkickoff"
  | "natunderbar"
  | "goalnatunderbar"
  | "natsticker"
  | "goalnatsticker"
  | "natsplitword"
  | "goalnatsplitword"
  | "natcorners4"
  | "goalnatcorners4"
  | "natmicro2"
  | "goalnatmicro2"
  | "natinset"
  | "goalnatinset"
  | "natbigletter"
  | "goalnatbigletter"
  | "natchips"
  | "goalnatchips"
  | "natslab"
  | "goalnatslab"
  | "natcrestbox"
  | "goalnatcrestbox"
  | "natrepeatline"
  | "goalnatrepeatline"
  | "natoffset"
  | "goalnatoffset"
  | "natcredits"
  | "goalnatcredits"
  | "natpilltop"
  | "goalnatpilltop"
  | "natfadebar"
  | "goalnatfadebar"
  | "natbaseline"
  | "goalnatbaseline"
  | "natoutlinebox"
  | "goalnatoutlinebox"
  | "natfootcols"
  | "goalnatfootcols"
  | "natdotsgrid"
  | "goalnatdotsgrid"
  | "natvs"
  | "goalnatvs"
  | "natcaptionbar"
  | "goalnatcaptionbar"
  | "nattight"
  | "goalnattight"
  | "nattopline"
  | "goalnattopline"
  | "natrails"
  | "goalnatrails"
  | "natbigdate"
  | "goalnatbigdate"
  | "natplus"
  | "goalnatplus"
  | "natsyllable"
  | "goalnatsyllable"
  | "natcrestrow"
  | "goalnatcrestrow"
  | "natwidefont"
  | "goalnatwidefont"
  | "natfig"
  | "goalnatfig"
  | "natcornerribbon"
  | "goalnatcornerribbon"
  | "natsides"
  | "goalnatsides"
  | "natdashed"
  | "goalnatdashed"
  | "natcapsule"
  | "goalnatcapsule"
  | "natlower3"
  | "goalnatlower3"
  | "natballicon"
  | "goalnatballicon"
  | "natslash"
  | "goalnatslash"
  | "natweightmix"
  | "goalnatweightmix"
  | "natgrid4"
  | "goalnatgrid4"
  | "natclockicon"
  | "goalnatclockicon"
  | "natpin"
  | "goalnatpin"
  | "natdoublerule"
  | "goalnatdoublerule"
  | "natpointer"
  | "goalnatpointer"
  | "natserifcaps"
  | "goalnatserifcaps"
  | "natgradword"
  | "goalnatgradword"
  | "natdotsep"
  | "goalnatdotsep"
  | "natdatestack"
  | "goalnatdatestack"
  | "nattypewriter"
  | "goalnattypewriter"
  | "natinfobox2"
  | "goalnatinfobox2"
  | "nathighlighter"
  | "goalnathighlighter"
  | "natcrestsplit"
  | "goalnatcrestsplit"
  | "natcrestring"
  | "goalnatcrestring"
  | "natnumero"
  | "goalnatnumero"
  | "nattilted"
  | "goalnattilted"
  | "natclubword"
  | "goalnatclubword"
  | "natglasscard"
  | "goalnatglasscard"
  | "natoffsetframe"
  | "goalnatoffsetframe"
  | "natitalicbig"
  | "goalnatitalicbig"
  | "natknockbox"
  | "goalnatknockbox"
  | "natunderscore"
  | "goalnatunderscore"
  | "natfactrow"
  | "goalnatfactrow"
  | "natcols3"
  | "goalnatcols3"
  | "natbracev"
  | "goalnatbracev"
  | "natarrowup"
  | "goalnatarrowup"
  | "nattimedisc"
  | "goalnattimedisc"
  | "natrightrule"
  | "goalnatrightrule"
  | "natheaderbox"
  | "goalnatheaderbox"
  | "natinitialcolor"
  | "goalnatinitialcolor"
  | "natrulebox"
  | "goalnatrulebox"
  | "natfadeword"
  | "goalnatfadeword"
  | "natleaders"
  | "goalnatleaders"
  | "natcresttop"
  | "goalnatcresttop"
  | "natthickline"
  | "goalnatthickline"
  | "natroundbox"
  | "goalnatroundbox"
  | "natnamesbig"
  | "goalnatnamesbig"
  | "natedgebar"
  | "goalnatedgebar"
  | "natdatepill"
  | "goalnatdatepill"
  | "nattoprule"
  | "goalnattoprule"
  | "natcolorfoot"
  | "goalnatcolorfoot"
  | "nattriangle"
  | "goalnattriangle"
  | "natpullbar"
  | "goalnatpullbar"
  | "natstadium"
  | "goalnatstadium"
  | "natwhenwhere"
  | "goalnatwhenwhere"
  | "natstretch"
  | "goalnatstretch"
  | "natchip"
  | "goalnatchip"
  | "natfadestack"
  | "goalnatfadestack"
  | "natthirds"
  | "goalnatthirds"
  | "natvdate"
  | "goalnatvdate"
  | "natlr"
  | "goalnatlr"
  | "natversus"
  | "goalnatversus"
  | "natmidside"
  | "goalnatmidside"
  | "natserifstack"
  | "goalnatserifstack"
  | "natduoline"
  | "goalnatduoline"
  | "natfolio"
  | "goalnatfolio"
  | "natstrike"
  | "goalnatstrike"
  | "natblockshadow"
  | "goalnatblockshadow"
  | "natlettertiles"
  | "goalnatlettertiles"
  | "natdiamond"
  | "goalnatdiamond"
  | "natbubble"
  | "goalnatbubble"
  | "natbullets"
  | "goalnatbullets"
  | "natoutlinetime"
  | "goalnatoutlinetime"
  | "natvletters"
  | "goalnatvletters"
  | "natthin"
  | "goalnatthin"
  | "natcascade"
  | "goalnatcascade"
  | "natsup"
  | "goalnatsup"
  | "natsplitline"
  | "goalnatsplitline"
  | "natunderdots"
  | "goalnatunderdots"
  | "nattimeline"
  | "goalnattimeline"
  | "natfraction"
  | "goalnatfraction"
  | "natperiod"
  | "goalnatperiod"
  | "natcresttower"
  | "goalnatcresttower"
  | "natlinesides"
  | "goalnatlinesides"
  | "nattopcorner"
  | "goalnattopcorner"
  | "natwhitefade"
  | "goalnatwhitefade"
  | "natjustify"
  | "goalnatjustify"
  | "natmagcaption"
  | "goalnatmagcaption"
  | "natsplitfill"
  | "goalnatsplitfill"
  | "natasterisk"
  | "goalnatasterisk"
  | "natpaired"
  | "goalnatpaired"
  | "natsmallcrest"
  | "goalnatsmallcrest"
  | "natsmallcaps"
  | "goalnatsmallcaps"
  | "natdropline"
  | "goalnatdropline"
  | "natruler"
  | "goalnatruler"
  | "natrows"
  | "goalnatrows"
  | "natblockcorners"
  | "goalnatblockcorners"
  | "natellipse"
  | "goalnatellipse"
  | "natheaderline"
  | "goalnatheaderline"
  | "natsidenote"
  | "goalnatsidenote"
  | "natunderlinefat"
  | "goalnatunderlinefat"
  | "natframeline"
  | "goalnatframeline"
  | "natbadgeline"
  | "goalnatbadgeline"
  | "natmixcase"
  | "goalnatmixcase"
  | "natshadowword"
  | "goalnatshadowword"
  | "natquotebar"
  | "goalnatquotebar"
  | "natbigv"
  | "goalnatbigv"
  | "natstep"
  | "goalnatstep"
  | "natnumbered"
  | "goalnatnumbered"
  | "natcircletag"
  | "goalnatcircletag"
  | "natslashdate"
  | "goalnatslashdate"
  | "natboxedname"
  | "goalnatboxedname"
  | "natfadeline"
  | "goalnatfadeline"
  | "natpipe"
  | "goalnatpipe"
  | "natwave"
  | "goalnatwave"
  | "nataboveunder"
  | "goalnataboveunder"
  | "natemdash"
  | "goalnatemdash"
  | "natcheck"
  | "goalnatcheck"
  | "natjustifyrow"
  | "goalnatjustifyrow"
  | "natchevrons"
  | "goalnatchevrons"
  | "natslashes"
  | "goalnatslashes"
  | "natplusline"
  | "goalnatplusline"
  | "natbars"
  | "goalnatbars"
  | "natlcorner"
  | "goalnatlcorner"
  | "natdotgrid9"
  | "goalnatdotgrid9"
  | "natsquaremark"
  | "goalnatsquaremark"
  | "natdashes"
  | "goalnatdashes"
  | "nattilde"
  | "goalnattilde"
  | "natarcmark"
  | "goalnatarcmark"
  | "natfirstfill"
  | "goalnatfirstfill"
  | "natlastcolor"
  | "goalnatlastcolor"
  | "natboxletter"
  | "goalnatboxletter"
  | "natcolorsub"
  | "goalnatcolorsub"
  | "natcolorword"
  | "goalnatcolorword"
  | "natbebas"
  | "goalnatbebas"
  | "natbodoni"
  | "goalnatbodoni"
  | "natunbounded"
  | "goalnatunbounded"
  | "natgrotesk"
  | "goalnatgrotesk"
  | "natalfaslab"
  | "goalnatalfaslab"
  | "natanton"
  | "goalnatanton"
  | "natbarlow"
  | "goalnatbarlow"
  | "natarchivo"
  | "goalnatarchivo"
  | "natdela"
  | "goalnatdela"
  | "natitalicserif"
  | "goalnatitalicserif"
  | "natmontserrat"
  | "goalnatmontserrat"
  | "natfraunces"
  | "goalnatfraunces"
  | "natarchivolight"
  | "goalnatarchivolight"
  | "natrubikmono"
  | "goalnatrubikmono"
  | "natfrauncesit"
  | "goalnatfrauncesit"
  | "natfreecol"
  | "goalnatfreecol"
  | "natcutoff"
  | "goalnatcutoff"
  | "natcornerpair"
  | "goalnatcornerpair"
  | "natmirror"
  | "goalnatmirror"
  | "natbehindword"
  | "goalnatbehindword"
  | "natbehindoutline"
  | "goalnatbehindoutline"
  | "natbehindcolor"
  | "goalnatbehindcolor"
  | "natbehindserif"
  | "goalnatbehindserif"
  | "natbehindtall"
  | "goalnatbehindtall"
  | "natcutoffoutline"
  | "goalnatcutoffoutline"
  | "natcutoffcolor"
  | "goalnatcutoffcolor"
  | "natcutofftall"
  | "goalnatcutofftall"
  | "natcutoffserif"
  | "goalnatcutoffserif"
  | "natbehindbodoni"
  | "goalnatbehindbodoni"
  | "natbehindgrotesk"
  | "goalnatbehindgrotesk"
  | "natcornerbodoni"
  | "goalnatcornerbodoni"
  | "natcornertall"
  | "goalnatcornertall"
  | "natmirrorserif"
  | "goalnatmirrorserif"
  | "natmirrorcolor"
  | "goalnatmirrorcolor"
  | "natfreecolserif"
  | "goalnatfreecolserif"
  | "natcorneroutline"
  | "goalnatcorneroutline"
  | "natcornercolor"
  | "goalnatcornercolor"
  | "natfreecolbodoni"
  | "goalnatfreecolbodoni"
  | "natfreecoltall"
  | "goalnatfreecoltall"
  | "natmirrorbodoni"
  | "goalnatmirrorbodoni"
  | "natcorner"
  | "natgrass"
  | "goalnatword"
  | "goalnatcorner"
  | "goalnatlight"
  | "natclean"
  | "natstrip"
  | "natdate"
  | "goalnatclean"
  | "goalnatname"
  | "goalnatstrip"
  | "nattime"
  | "natvert"
  | "natborder"
  | "goalnatvert"
  | "goalnatborder"
  | "goalnatsplit"
  | "natcrest"
  | "natnumber"
  | "goalnatcrest"
  | "goalnatnumber"
  | "natstamp"
  | "goalnatstamp"
  | "natcaption"
  | "goalnatcaption"
  | "natoutline"
  | "goalnatoutline"
  | "natbug"
  | "goalnatbug"
  | "natfocus"
  | "goalnatfocus"
  | "nathorizon"
  | "goalnathorizon"
  | "natserif"
  | "goalnatserif"
  | "natvenue"
  | "natarc"
  | "goalnatarc"
  | "goalnatcallout"
  | "natmono"
  | "goalnatmono"
  | "natticket"
  | "natstack"
  | "goalnatstack"
  | "goalnatinitial"
  | "natmasthead"
  | "goalnatmasthead"
  | "natclock"
  | "goalnatitalic"
  | "natpill"
  | "goalnatpill"
  | "natglass"
  | "goalnatglass"
  | "natquad"
  | "goalnatquad"
  | "natflank"
  | "goalnatflank"
  | "natsubtitle"
  | "goalnatsubtitle"
  | "natled"
  | "goalnatled"
  | "natticker"
  | "goalnatticker"
  | "natlocation"
  | "goalnatwide"
  | "natcalendar"
  | "nathashtag"
  | "goalnathashtag"
  | "goalnatquote"
  | "natslant"
  | "goalnatslant"
  | "natboxed"
  | "goalnatboxed"
  | "natunderline"
  | "goalnatunderline"
  | "natknockout"
  | "goalnatknockout"
  | "natdymo"
  | "goalnatdymo"
  | "natturf"
  | "goalnatturf"
  | "natswatch"
  | "goalnatswatch"
  | "natneon"
  | "goalnatneon"
  | "natcinema"
  | "goalnatcinema"
  | "natlit"
  | "natsand"
  | "goalnatsand"
  | "natstarring"
  | "goalnatstarring"
  | "natbeam"
  | "goalnatbeam"
  | "natring"
  | "goalnatring"
  | "natpanel"
  | "goalnatpanel"
  | "natmoody"
  | "goalnatmoody"
  | "natfog"
  | "goalnatfog"
  | "natpaper"
  | "goalnatpaper"
  | "natfight"
  | "goalnatfight"
  | "nateditorial"
  | "goalnateditorial"
  | "natchest"
  | "goalnatchest"
  | "natgothic"
  | "goalnatgothic"
  | "nattall"
  | "goalnattall"
  | "natribbon"
  | "goalnatribbon"
  | "natduo"
  | "goalnatduo"
  | "natblur"
  | "natsill"
  | "natpassepartout"
  | "natteams"
  | "goalnatairy"
  | "goalnatglow"
  | "bignumeral"
  | "goalshirtno"
  | "matchcard"
  | "goalpaper"
  | "goallowerthird"
  | "natsheet"
  | "natpitchpaint"
  | "natdatehero"
  | "goalnatletters"
  | "goalnattopbar"
  | "scorebug"
  | "goalscorebug"
  | "colorfield"
  | "airspace"
  | "goalsidename"
  | "natvsline"
  | "natmilestones"
  | "natskycrests"
  | "goalnatseal"
  | "goalnatheadline"
  | "atmosrule"
  | "goalatmos"
  | "gridlines"
  | "goalcolorframe"
  | "tagstack"
  | "natfrost"
  | "natfootstrip"
  | "natfieldset"
  | "goalnatfrost"
  | "goalnatfieldset"
  | "matchprogramme"
  | "monoposter"
  | "versusband"
  | "goalband"
  | "goalmonoposter"
  | "natdualclock"
  | "natweekday"
  | "natcaptionserif"
  | "goalnatnook"
  | "goalnatweights"
  | "cornertab"
  | "goalcornertab"
  | "accentword"
  | "crestcrown"
  | "goaltape"
  | "nathomeaway"
  | "natcompetition"
  | "natarrowdown"
  | "goalnatclubbar"
  | "goalnatcontext"
  | "thinarc"
  | "goalthinarc"
  | "bicolortitle"
  | "goalbicolor"
  | "nextup"
  | "natgolden"
  | "goalnatgolden"
  | "natcresthair"
  | "natstagger"
  | "goalnatstagger"
  | "gradwash"
  | "goalgradwash"
  | "swissleft"
  | "goalswissleft"
  | "swissindex"
  | "natseasondots"
  | "natform"
  | "natvenuepin"
  | "goalnatseason"
  | "goalnatprofile"
  | "lineupdots"
  | "goallineupdots"
  | "daynight"
  | "chromeaccent"
  | "goalchromeaccent"
  | "natcrestmark"
  | "goalnatcrestmark"
  | "natlastmeet"
  | "goalnatstreak"
  | "natmonogram"
  | "swatchcard"
  | "goalswatchcard"
  | "geotype"
  | "goalgeotype"
  | "goalnetline"
  | "natdayline"
  | "natflankrules"
  | "natpager"
  | "goalnathairlines"
  | "goalnatsplitrule"
  | "weightramp"
  | "goalweightramp"
  | "motiontrail"
  | "goalmotiontrail"
  | "lineball"
  | "natcountdown"
  | "natbackname"
  | "natcityline"
  | "goalnathomeaway"
  | "goalnatkitring"
  | "angle34"
  | "goalangle34"
  | "terraces"
  | "crestinline"
  | "goalcrestinline"
  | "natteamstack"
  | "natroundring"
  | "natlowercase"
  | "goalnatlowercase"
  | "goalnatclubhero"
  | "jstripes"
  | "goaljstripes"
  | "gateplate"
  | "goalgateplate"
  | "gateposts"
  | "natseasonline"
  | "natkickoffpill"
  | "natcornerfacts"
  | "goalnatseasonline"
  | "goalnatcornerfacts"
  | "chevronitalic"
  | "goalchevronitalic"
  | "diamondcrest"
  | "goaldiamondcrest"
  | "checkerrow"
  | "natcrestflank"
  | "goalnatcrestflank"
  | "natbreadcrumb"
  | "goalnatbreadcrumb"
  | "goalnatagainst"
  | "subwaysign"
  | "goalsubwaysign"
  | "routeline"
  | "kitnumeral"
  | "goalkitnumeral"
  | "natmistlight"
  | "goalnatmistlight"
  | "natcrestcoins"
  | "nathighlight"
  | "goalnathighlight"
  | "ironband"
  | "goalironband"
  | "roundsans"
  | "heraldsplit"
  | "goalheraldsplit"
  | "natcolorbar"
  | "goalnatcolorbar"
  | "natnextgames"
  | "natornament"
  | "goalnatornament"
  | "serifrule"
  | "goalserifrule"
  | "stripecard"
  | "goalstripecard"
  | "goaltifocards"
  | "natsplitflap"
  | "goalnatsplitflap"
  | "natprevious"
  | "natkickoffword"
  | "goalnatplacard"
  | "wingbars"
  | "goalwingbars"
  | "goldcrest"
  | "goalgoldcrest"
  | "estyear"
  | "natnation"
  | "goalnatnation"
  | "natfloodlit"
  | "goalnatfloodlit"
  | "goalnatlive"
  | "backslant"
  | "goalbackslant"
  | "widthpair"
  | "goalwidthpair"
  | "gothicinitial"
  | "natscarf"
  | "goalnatscarf"
  | "natbunting"
  | "goalnatbunting"
  | "natrosette"
  | "feriaposter"
  | "goalferiaposter"
  | "rallyline"
  | "goalrallyline"
  | "hoopsblock"
  | "natcornerflag"
  | "goalnatcornerflag"
  | "natpass"
  | "natkithanger"
  | "goalnatkithanger"
  | "billboard"
  | "goalbillboard"
  | "dynamicstripes"
  | "goaldynamicstripes"
  | "framedprint"
  | "natmegaphone"
  | "goalnatmegaphone"
  | "natdrum"
  | "goalnatdrum"
  | "natbeanie"
  | "stoneplaque"
  | "goalstoneplaque"
  | "fieldboard"
  | "goalfieldboard"
  | "seatnumber"
  | "natfoamfinger"
  | "goalnatfoamfinger"
  | "natfloodtower"
  | "natboot"
  | "goalnatboot"
  | "marqueesign"
  | "goalmarqueesign"
  | "lanternsign"
  | "goallanternsign"
  | "keytag"
  | "natshinpad"
  | "goalnatshinpad"
  | "natwhistle"
  | "goalnatwhistle"
  | "goalnatgoalframe"
  | "concreteslab"
  | "goalconcreteslab"
  | "bentotiles"
  | "patchbadge"
  | "goalpatchbadge"
  | "natbus"
  | "natkitbag"
  | "goalnatmic"
  | "goalnatstopwatch"
  | "goalnathorn"
  | "shipcontainer"
  | "goalshipcontainer"
  | "steellamellas"
  | "goalsteellamellas"
  | "stadiumtruss"
  | "natbottle"
  | "natcone"
  | "natbinoculars"
  | "goalnatvar"
  | "goalnattarget"
  | "citadel"
  | "goalcitadel"
  | "holofoil"
  | "goalholofoil"
  | "goalazulejo"
  | "natheadphones"
  | "natdugout"
  | "goalnatrocket"
  | "goalnatbolt"
  | "goalnatheart"
  | "arcade"
  | "goalarcade"
  | "denimpanel"
  | "goaldenimpanel"
  | "espressocup"
  | "natbattery"
  | "nathourglass"
  | "goalnatcrown"
  | "goalnatsiren"
  | "goalnatpopper"
  | "passport"
  | "umbrella"
  | "stainedglass"
  | "goalstainedglass"
  | "goalstarfield"
  | "usscriptblock"
  | "usvarsitynumber"
  | "usneongameday"
  | "usdiamondplate"
  | "us3dgameday"
  | "usfansign"
  | "goalusneon"
  | "goalusmotion"
  | "goalus3d"
  | "resultusfinal"
  | "natalarmclock"
  | "natplane"
  | "nattrafficlight"
  | "goalnatboxing"
  | "goalnatgem"
  | "lighthouse"
  | "goallighthouse"
  | "usslidingbars"
  | "usletterpatch"
  | "goalusstatcard"
  | "usduoarena"
  | "usangled"
  | "uskitband"
  | "usscoreboard"
  | "usposter"
  | "usglass"
  | "goalusduo"
  | "goalusflare"
  | "goalusglass"
  | "resultusduo"
  | "usstackedword"
  | "usbignumber"
  | "useditorialmd"
  | "usbandvertical"
  | "usgoldword"
  | "usrepeatname"
  | "goalusstatcol"
  | "goalusscript"
  | "goalusecho"
  | "resultuscolumn"
  | "prosurname"
  | "protwoscale"
  | "proframenum"
  | "proangled"
  | "proportrait"
  | "proradial"
  | "promatchword"
  | "usitsvertical"
  | "usgamegiant"
  | "usgamemixed"
  | "usduotone"
  | "usgameside"
  | "usresultframe"
  | "agencynextmatch"
  | "goalnatrefoutline"
  | "ushosting"
  | "agencygoalgrid"
  | "agencyserifmatch"
  | "portraitstripes"
  | "usgamestack"
  | "ussplitpanel"
  | "procrestblocks"
  | "goalprotwoscale"
  | "goalpropanels"
  | "goalproportrait"
  | "resultproarc"
  | "prostrips"
  | "proarch"
  | "proeditorial"
  | "prosplit"
  | "produo"
  | "pronamevertical"
  | "goalprocircle"
  | "goalprocard"
  | "goalprobands"
  | "resultproboard"
  | "prodiagonal"
  | "procrestwindow"
  | "proring"
  | "protypegrid"
  | "propolaroid"
  | "prostadium"
  | "goalproband"
  | "goalpromixed"
  | "goalpronumber"
  | "resultprodigits"
  | "prominimal"
  | "profaceoff"
  | "proletterphoto"
  | "procover"
  | "promonogram"
  | "prospotlight"
  | "goalprocover"
  | "goalproblock"
  | "goalproserif"
  | "resultprofinal"
  | "prokickoff"
  | "protriptych"
  | "proticket"
  | "pronameband"
  | "proweek"
  | "prooutlinenum"
  | "goalprovertical"
  | "goalpromosaic"
  | "goalprobrackets"
  | "resultprolower"
  | "prostathero"
  | "proinitial"
  | "prolongshadow"
  | "prorivalry"
  | "proswiss"
  | "proplayercard"
  | "goalprolongshadow"
  | "goalprotimeline"
  | "goalprostar"
  | "resultproscorers"
  | "promirror"
  | "proorb"
  | "prooppname"
  | "proroof"
  | "prowindow"
  | "proawayday"
  | "goalproquote"
  | "goalprostack"
  | "goalproitalic"
  | "resultproletter"
  | "prostacked"
  | "procountdown"
  | "proquad"
  | "pronumcircle"
  | "prostripeframe"
  | "profloodrow"
  | "goalprocount"
  | "goalprodiagonal"
  | "goalpropodium"
  | "resultproword"
  | "proslicednum"
  | "proreflect"
  | "proarc"
  | "prolineup"
  | "prohalfcrests"
  | "prodatehero"
  | "goalproscoreline"
  | "goalproeditorial"
  | "goalprocloseup"
  | "resultprovictory"
  | "prochevron"
  | "protricolour"
  | "promedallion"
  | "prosplitportrait"
  | "proquote"
  | "prokitsplit"
  | "goalprominute"
  | "goalproduotone"
  | "goalprofacts"
  | "resultprostacked"
  | "proglassbars"
  | "proclubword"
  | "proprogramme"
  | "prostoryboard"
  | "probadge"
  | "prokickhours"
  | "goalprosidenames"
  | "goalprosplitword"
  | "goalprorows"
  | "resultproflip"
  | "propill"
  | "proribbon"
  | "prooutline"
  | "progrid"
  | "progradient"
  | "procardstack"
  | "goalproserifname"
  | "goalpropill"
  | "goalprooutline"
  | "resultprostrip"
  | "proclubinitial"
  | "prostepthrough"
  | "prohorizon"
  | "proversus"
  | "projersey"
  | "proweekline"
  | "goalproletters"
  | "goalprohorizon"
  | "goalproversus"
  | "resultproft"
  | "proletterbox"
  | "procolumnname"
  | "prozigzag"
  | "proshield"
  | "prodropcap"
  | "prochevronstack"
  | "goalproserifcount"
  | "goalproletterbox"
  | "goalprocolumn"
  | "resultprosplitrule"
  | "prooffset"
  | "prostadiumwindow"
  | "procoverstory"
  | "prohoops"
  | "procrestrows"
  | "prominimalbar"
  | "goalprotriptych"
  | "goalprowindow"
  | "goalprohoops"
  | "resultprocircle"
  | "prosidebars"
  | "prohugeword"
  | "propanorama"
  | "proprofile"
  | "procirclehalves"
  | "propagenumber"
  | "goalproradial"
  | "goalprosidebars"
  | "goalpropanorama"
  | "resultprosplitscreen"
  | "prolframe"
  | "procalendar"
  | "procrestgrid"
  | "prospotduo"
  | "protwocolour"
  | "proladder"
  | "goalprointerlock"
  | "goalprolframe"
  | "goalprotwocolour"
  | "resultprobetween"
  | "proampersand"
  | "prokickoffsplit"
  | "pronested"
  | "promarquee"
  | "procrestcircles"
  | "protimeofday"
  | "goalprog"
  | "goalpromarquee"
  | "goalprocrests"
  | "resultprowdl"
  | "proarchwindow"
  | "protwobands"
  | "procorners"
  | "proplate"
  | "prospine"
  | "proschedule"
  | "goalprodiagnum"
  | "goalprostackletters"
  | "goalproarch"
  | "resultprofinallabel"
  | "natrefserif"
  | "goalnatrefserif"
  | "natreffoot"
  | "natrefthinbold"
  | "resultnatquiet"
  | "natrefvert"
  | "goalnatrefvert"
  | "goalnatreffirst"
  | "resultnatrefserif"
  | "resultnatrefvertical"
  | "resultnatreffinal"
  | "goalnatrefpanel"
  | "goalnatrefvictoire"
  | "natrefmixed"
  | "natrefmixedclean"
  | "natrefnext"
  | "natrefredlight"
  | "natrefpan"
  | "natrefghost"
  | "natrefbacklit"
  | "natrefsplit"
  | "natrefnightlights"
  | "natrefgametime"
  | "natrefsunset"
  | "natrefsunlit"
  | "natrefhighkey"
  | "natrefpitchnumber"
  | "natrefwinegameday"
  | "natrefmistmatch"
  | "resultnatrefhalftime"
  | "resultnatrefsideband"
  | "resultnatrefcyanfog"
  | "natrefedgetitle"
  | "goalnatrefstack"
  | "natreftiltmatch"
  | "resultnatrefstackscore"
  | "goalnatrefsplitgo"
  | "goalnatrefcover"
  | "goalnatblur"
  | "natrepeat"
  | "goalnatrepeat"
  | "natcard"
  | "goalnatcard"
  | "natgrid"
  | "goalnatgrid"
  | "natnotes"
  | "goalnatnotes"
  | "natedge"
  | "goalnatedge"
  | "natcircle"
  | "goalnatcircle"
  | "goalnatlit"
  | "formfire"
  | "formnatural"
  | "formpanel"
  | "formgold"
  | "clipnight"
  | "clipclub"
  | "clippaper"
  | "clipbold"
  | "formfiregold";
export type BgStyle = "rays" | "pitch" | "photo";

/** Visual parameters of an edit. A player's style profile is a saved set of these. */
export type TemplateParams = {
  templateId: TemplateId;
  /** Carousel looks (form posts): which of the 3 slides to draw (1 cover, 2 record, 3 numbers). */
  slide?: 1 | 2 | 3;
  /** Form posts: how many of his latest games count (default 6). */
  formGames?: number;
  side: "left" | "right";
  primary: string;
  accent: string;
  text: string;
  bgStyle: BgStyle;
  insetTilt: number;
  grain: boolean;
  /** Agency-service edits: the client agency (its logo replaces NEYOD's) and the week (Monday) it is for. */
  agencyId?: string;
  agencyWeek?: string;
  /** Video stories: the clip (clips table) whose ball-following crop fills the look's video slot. */
  clipId?: string;
  /** Fine adjustments (mostly set by the AI assistant). Offsets in canvas px. */
  playerX?: number;
  playerY?: number;
  playerScale?: number;
  textScale?: number;
  /** Crests in their own colours where a look would otherwise draw them as white marks. */
  crestColor?: boolean;
  /** Size of the agency logo relative to the look's own (1 = as designed). */
  logoScale?: number;
  /** Moves the agency logo from where the look puts it, in canvas px (right / down positive), for every look
   *  alike; it is kept inside the canvas. */
  logoMoveX?: number;
  logoMoveY?: number;
  /** Moves the title block up (negative) or down, in canvas px. */
  textY?: number;
  /** Moves the agency logo down (positive) or up, in canvas px. */
  logoY?: number;
  /** How much of the player is shown: whole body, or cropped big at the knees / waist / chest. */
  framing?: Framing;
  /** Colour finish over the whole edit (duotone in club colours, black & white, film, vivid). */
  finish?: Finish;
  /** Random number picked per variant: looks use it for small layout choices, so no two grids look alike. */
  seed?: number;
  /** A scene generated for this edit only (its URL): used as the stadium / backdrop by every look. */
  scene?: string;
  /** Typeface of the big words (video looks read it; unset = the look's own). */
  font?: TitleFont;
};

export type TitleFont = "anton" | "bebas" | "barlow" | "bodoni" | "dmserif" | "archivo" | "unbounded" | "dela" | "slab";

/** Typefaces the user can pick for the big words. `adv` = rough advance per capital (× size), to fit a line. */
export const TITLE_FONTS: { id: TitleFont; label: string; family: string; weight: number; adv: number }[] = [
  { id: "anton", label: "Anton", family: "var(--font-anton), Impact, sans-serif", weight: 400, adv: 0.48 },
  { id: "bebas", label: "Bebas", family: "var(--font-bebas), Impact, sans-serif", weight: 400, adv: 0.42 },
  { id: "barlow", label: "Barlow condensada", family: "var(--font-barlow), 'Arial Narrow', sans-serif", weight: 800, adv: 0.46 },
  { id: "bodoni", label: "Bodoni (serifa)", family: "var(--font-bodoni), 'Didot', serif", weight: 700, adv: 0.74 },
  { id: "dmserif", label: "DM Serif", family: "var(--font-dmserif), Georgia, serif", weight: 400, adv: 0.64 },
  { id: "archivo", label: "Archivo Black", family: "var(--font-archivo-black), sans-serif", weight: 400, adv: 0.76 },
  { id: "unbounded", label: "Unbounded", family: "var(--font-unbounded), sans-serif", weight: 800, adv: 0.9 },
  { id: "dela", label: "Dela Gothic", family: "var(--font-dela), sans-serif", weight: 400, adv: 0.92 },
  { id: "slab", label: "Slab", family: "var(--font-slab), serif", weight: 400, adv: 0.72 },
];

export type Finish = "none" | "duo" | "noir" | "film" | "vivid" | "glow" | "glowstrong" | "pro";

export const FINISHES: { id: Finish; label: string }[] = [
  { id: "none", label: "Normal" },
  { id: "duo", label: "Duotone" },
  { id: "noir", label: "Preto e branco" },
  { id: "film", label: "Filme" },
  { id: "vivid", label: "Vivo" },
  { id: "glow", label: "Brilho suave" },
  { id: "glowstrong", label: "Brilho suave forte" },
  { id: "pro", label: "Tom profissional" },
];

export type Framing = "full" | "knees" | "waist" | "chest";

/** What the app has learned about a player's taste, plus explicit choices. */
export type PlayerPrefs = {
  /** How many times each look was exported, keyed "templateId|side|bgStyle". */
  picks: Record<string, number>;
  /** How many times each framing / colour finish was exported, keyed "framing:waist" / "finish:duo". */
  taste?: Record<string, number>;
  side?: "auto" | "left" | "right";
  tone?: "club" | "dark";
  /** Players the agency doesn't represent: their edits carry no NEYOD logo. */
  hideAgency?: boolean;
  /** Second clock next to the local kick-off (IANA zone, see REF_ZONES); Portugal when unset. */
  refTz?: string;
  /** Style notes learned from reference edits (AI analysis). */
  referenceNotes?: string[];
  /** Body poses seen in the reference edits the user sent: photos in those poses come first. */
  referencePoses?: Pose[];
};

export type StatItem = { label: string; value: string };

/** A news article about the player (press post): outlet name, headline as published, optional standfirst / date / image. */
export type PressArticle = { source: string; title: string; subtitle?: string; date?: string; url?: string; image?: string | null };

/** Text and data shown in an edit; independent of the visual template. */
/** Goal / assist video story: what happened and the score shown under the name. */
export type ClipContent = { kind: "goal" | "assist"; score: string };

export type EditContent = {
  /** Video stories (post type "clip"). */
  clip?: ClipContent;
  /** Form carousel: the photo of each of its 3 slides (null = the main photo). */
  slidePhotos?: (string | null)[];
  kicker: string;
  subline: string;
  firstName: string;
  lastName: string;
  insetPhotoId?: string | null;
  /** Where the player appears in the official graphic, in % of its size. */
  /** Highlight ring on the official graphic: centre x/y and ring radius r, all in % (r of the graphic's width). r is set when the click snapped to his photo + labels, or by the size control. */
  insetHighlight?: { x: number; y: number; r?: number } | null;
  stats: StatItem[];
  fromClubId?: string | null;
  toClubId?: string | null;
  until?: string;
  /** Welcome post: the clubs he came through, most recent first (name + crest URL). */
  career?: { name: string; crest?: string | null }[];
  /** Welcome post: the club he plays for now (a career entry's name), drawn larger than the others. */
  currentClub?: string;
  /** Welcome post: the photo of him playing laid over the portrait (else picked automatically). */
  actionPhotoId?: string | null;
  /** Welcome post: size of the photo of him playing and of the black-and-white photo (1 = default). */
  actionScale?: number;
  ghostScale?: number;
  /** Press post: news articles about him, newest first (headlines kept exactly as published). */
  articles?: PressArticle[];
  /** Speed post: top speed in km/h ("36.1"). */
  speed?: string;
  /** Speed post: only the number and "km/h", no title or subtitle. */
  speedOnly?: boolean;
  /** Any of the player's photos used whole as the backdrop (a motion-blurred shot), instead of the main photo blurred. */
  backdropPhotoId?: string | null;
  homeTeam?: string;
  awayTeam?: string;
  homeGoals?: string;
  awayGoals?: string;
  date?: string;
  time?: string;
  /** Abroad only (set when rendering): the local kick-off and the player's second clock (Portugal unless
   * he chose another zone), e.g. "15:00" / "13:00", and that clock's tag ("PT", "SWE"). */
  timeLocal?: string;
  timePt?: string;
  timeRef?: string;
  /** The zone `time` is written in: '' / unset = Portugal (zerozero); a US school's zone for college games. */
  timeTz?: string;
  venue?: string;
  /** zerozero id of the game this edit is about: its ground's real photos lead the stadium backdrops. */
  gameId?: string | null;
  /** Crest image URLs for the two teams (matchday / result). */
  /** Matchday: true when the player's team plays at home. */
  home?: boolean;
  homeCrest?: string | null;
  awayCrest?: string | null;
};

export type Club = {
  id: string;
  name: string;
  league: string;
  crest: string | null;
  primary_color: string;
  secondary_color: string;
  source_url: string | null;
  city: string;
  founded: string;
  stadium: string;
  city_image: string | null;
  city_lat: number | null;
  city_lon: number | null;
  short_name: string;
  /** IANA time zone of the club ("Europe/Malta"); empty = guessed from the league, else Portugal. */
  timezone?: string;
  /** JSON array of stored city photo paths. */
  city_images: string | null;
  /** JSON array of stored stadium photo paths. */
  stadium_images: string | null;
  backdrops: string | null;
};

/** Face box in 0..1 of the cutout: [x, y, w, h]. */
export type FaceBox = [number, number, number, number];
/** Edges where the original photo frame cuts the player (0..1 = how much of that edge). */
export type CutEdges = { top?: number; bottom?: number; left?: number; right?: number };
export type PhotoMeta = {
  width: number;
  height: number;
  upscaled: boolean;
  face: FaceBox | null;
  kit?: string[];
  cut?: CutEdges;
  /** Faces in the photo and separate people in the cutout: anything but 1 makes a bad edit photo. */
  faces?: number;
  people?: number;
  /** Original photo size before upscaling. */
  src_width?: number;
  src_height?: number;
  face_px?: number;
  /** Detail of the player at the size the camera captured him (below ~20 = blurred / too far). */
  sharpness?: number;
  /** Detail inside the face at its captured size (null without a visible face). */
  face_sharpness?: number | null;
  /** Body pose from the photo, used to match photos with looks. */
  pose?: Pose;
  /** Which way the head points in the picture. */
  facing?: "left" | "right" | "front";
  back?: boolean;
  /** Other players' joints left inside the cutout (an opponent's arm across him). */
  intruders?: number;
  /** The user looked at this cutout and said it is fine: no automatic flag applies any more. */
  approved_by_user?: boolean;
  /** The user said which kit this is: true = his current club (an alternate kit the colours missed), false = another club. Beats the colour match. */
  kit_club?: boolean;
  /** Knees visible in the cutout (false = head-and-shoulders or upper body only). */
  legs?: boolean;
  /** Where the cutout sits in the original (image matching, for the NATURAL looks); `cut` = the cutout it was measured on. */
  nat_align?: { x: number; y: number; k: number; w: number; h: number; cw: number; ch: number; cut: string };
  /** Other people in the shot (team-mates, opponents), boxes 0..1 of the original photo [x0, y0, x1, y1] (services/cutout/others.py). */
  others?: number[][];
  /** His own box in the same frame (the detection that is him), or null when none matched. */
  him_box?: number[] | null;
};

export type Pose = "standing" | "action" | "celebrate" | "open" | "crouch" | "back" | "bust" | "unknown";

export const POSE_LABELS: Record<Pose, string> = {
  standing: "Parado",
  action: "Em ação",
  celebrate: "A festejar",
  open: "Braços abertos",
  crouch: "Agachado",
  back: "De costas",
  bust: "Busto",
  unknown: "—",
};

export type Player = {
  id: string;
  first_name: string;
  last_name: string;
  position: string;
  number: string;
  club_id: string | null;
  style: TemplateParams | null;
  prefs: PlayerPrefs;
  notes: string;
  zerozero_url: string | null;
  transfermarkt_url: string | null;
  full_name: string;
  birth_date: string;
  nationality: string;
  foot: string;
  height_cm: number | null;
  market_value: string;
  contract_until: string;
  agent: string;
  /** JSON array of { name, crest } (crest = stored file), most recent club first. */
  career: string;
  /** "player" (default) or "coach": coaches are listed apart, under Treinadores. */
  role: string;
  /** 1 = the club was set by hand: syncing never changes it (zerozero lags or is wrong). */
  club_locked: number;
  photo_url: string | null;
  last_sync: string | null;
  last_photo_hunt: string | null;
  sync_error: string | null;
};

export type Match = {
  id: string;
  player_id: string;
  date: string;
  competition: string;
  matchday: string;
  opponent: string;
  home: number;
  goals_for: number;
  goals_against: number;
  minutes: number;
  goals: number;
  assists: number;
  rating: number | null;
  totw: number;
  motm: number;
  source: string;
  external_id: string | null;
  team: string;
  yellow: number;
  red: number;
  match_url: string | null;
  photos_url: string | null;
  opponent_crest: string | null;
};

export type Fixture = {
  id: string;
  player_id: string;
  external_id: string;
  date: string;
  time: string;
  /** The zone date / time are in: '' = Portugal (zerozero), else IANA (a US school's own zone). */
  time_tz: string;
  /** Where it is played, when the source says (college schedules). */
  venue: string;
  competition: string;
  matchday: string;
  team: string;
  opponent: string;
  home: number;
  match_url: string | null;
  opponent_crest: string | null;
  live_home: number | null;
  live_away: number | null;
  live_goals: number;
  live_updated: string | null;
};

export type Suggestion = {
  id: string;
  player_id: string;
  post_type: PostType;
  title: string;
  reason: string;
  match_id: string | null;
  fixture_id: string | null;
  dedupe_key: string;
  status: "new" | "done" | "dismissed";
  created_at: string;
};

export type PhotoKind = "player" | "inset" | "reference";

export type Photo = {
  id: string;
  player_id: string | null;
  kind: PhotoKind;
  file: string;
  cutout: string | null;
  cutout_status: "none" | "pending" | "done" | "error";
  meta: string | null;
  source: "upload" | "auto";
  /** Automatic finds must be approved before edits use them. */
  approved: number;
  source_url: string | null;
  created_at: string;
};

export type Edit = {
  id: string;
  player_id: string;
  post_type: PostType;
  photo_id: string | null;
  params: TemplateParams;
  content: EditContent;
  output: string | null;
  chat: ChatMessage[];
  created_at: string;
  /** When it was chosen to be posted ("Usar no fim de semana"); null when not. */
  posted_at?: string | null;
  /** 1 when its look was made available again for the player (Histórico → Recuperar). */
  released?: number;
};

export type ChatMessage = { role: "user" | "assistant"; text: string };

export const FEEDBACK_TAGS = [
  { id: "face-cut", label: "Cara / cabeça cortada", photo: false },
  { id: "text-over-face", label: "Texto por cima da cara", photo: false },
  { id: "text-cut", label: "Texto cortado ou fora", photo: false },
  { id: "overlap", label: "Coisas sobrepostas", photo: false },
  { id: "pixelated", label: "Foto pixelizada", photo: true },
  { id: "bad-cutout", label: "Recorte mal feito", photo: true },
  { id: "colors", label: "Cores feias", photo: false },
  { id: "wrong-data", label: "Dados / emblema errados", photo: false },
  { id: "dislike", label: "Não gosto do estilo", photo: false },
] as const;

export type FeedbackTag = (typeof FEEDBACK_TAGS)[number]["id"];

export type Feedback = {
  id: string;
  player_id: string | null;
  edit_id: string | null;
  photo_id: string | null;
  post_type: PostType;
  template_id: TemplateId;
  params: TemplateParams;
  content: EditContent | null;
  tags: FeedbackTag[];
  note: string;
  resolved: number;
  resolution?: string;
  resolved_by?: string;
  resolved_at?: string | null;
  created_at: string;
};

export type Settings = {
  agency_name: string;
  agency_logo: string | null;
  agency_logo_dark: string | null;
  /** Line under the logo, drawn as real text (crisp at any zoom) when the logo file has it removed. */
  agency_tagline: string;
  /** Pinterest board addresses (one per line) read once a day for new references. */
  pinterest_boards: string;
  /** "1" while scenery generation is paused (it uses the Mac's GPU and heats it up). */
  scenes_paused: string;
  /** JSON array of look ids the user removed for good: never proposed, hidden in the editor. */
  hidden_looks: string;
  /** The user's own studio Instagram handle, shown small on his personal clients' edits. */
  studio_handle: string;
};
