import { shade, vivid } from "@/lib/color";
import type { Finish, Framing, PlayerPrefs, Pose, PostType, TemplateId, TemplateParams } from "@/lib/types";
import { Film, GradientMapDefs } from "./fx";
import { LogoLift } from "./LogoLift";
import { rng } from "./kit";
import unsafeFramings from "./unsafe-framings.json";
import { Announce } from "./announce";
import { Card } from "./card";
import { DataSheet } from "./data";
import { Editorial } from "./editorial";
import { Fixture } from "./fixture";
import { Halftone } from "./halftone";
import { Monumental } from "./monumental";
import { Neon } from "./neon";
import { Poster } from "./poster";
import { Spotlight } from "./spotlight";
import { Brush } from "./brush";
import { City } from "./city";
import { Closeup } from "./closeup";
import { Crests } from "./crests";
import { Frame } from "./frame";
import { Portrait } from "./portrait";
import { Repeat } from "./repeat";
import { Stretch } from "./stretch";
import { Torn } from "./torn";
import { Arch } from "./arch";
import { Archive } from "./archive";
import { Kaleido } from "./kaleido";
import { Sequence } from "./sequence";
import { Serif } from "./serif";
import { Smear } from "./smear";
import { Stamp } from "./stamp";
import { Windows } from "./windows";
import { Burst } from "./burst";
import { Comic } from "./comic";
import { Gaze } from "./gaze";
import { Halo } from "./halo";
import { ScoreCol } from "./scorecol";
import { Sticker } from "./sticker";
import { Waves } from "./waves";
import { Checker } from "./checker";
import { Cinematic } from "./cinematic";
import { Doodle } from "./doodle";
import { Floor } from "./floor";
import { Gothic } from "./gothic";
import { Memory } from "./memory";
import { Panels } from "./panels";
import { Pitch } from "./pitch";
import { Speed } from "./speed";
import { Calendar } from "./calendar";
import { Infographic } from "./infographic";
import { Magazine } from "./magazine";
import { Programme } from "./programme";
import { Rising } from "./rising";
import { Riso } from "./riso";
import { Steps } from "./steps";
import { Tactics } from "./tactics";
import { Ticket } from "./ticket";
import { Exposure } from "./exposure";
import { Postcard } from "./postcard";
import { Skyline } from "./skyline";
import { Slices } from "./slices";
import { StreetPoster } from "./streetposter";
import { Shield } from "./shield";
import { Jersey } from "./jersey";
import { Sideword } from "./sideword";
import { Duel } from "./duel";
import { Syllables } from "./syllables";
import { Gilded } from "./gilded";
import { Roundel } from "./roundel";
import { Silhouette } from "./silhouette";
import { PaperLight } from "./paperlight";
import { Script } from "./script";
import { Mono } from "./mono";
import { Window } from "./window";
import { MatchSerif } from "./matchserif";
import { Scoreline } from "./scoreline";
import { Broadcast } from "./broadcast";
import { Simple } from "./simple";
import { Natcrest } from "./natcrest";
import { Natnumber } from "./natnumber";
import { Goalnatcrest } from "./goalnatcrest";
import { Goalnatnumber } from "./goalnatnumber";
import { Natstamp } from "./natstamp";
import { Goalnatstamp } from "./goalnatstamp";
import { Natcaption } from "./natcaption";
import { Goalnatcaption } from "./goalnatcaption";
import { Natoutline } from "./natoutline";
import { Goalnatoutline } from "./goalnatoutline";
import { Natbug } from "./natbug";
import { Goalnatbug } from "./goalnatbug";
import { Natfocus } from "./natfocus";
import { Goalnatfocus } from "./goalnatfocus";
import { Nathorizon } from "./nathorizon";
import { Goalnathorizon } from "./goalnathorizon";
import { Natserif } from "./natserif";
import { Goalnatserif } from "./goalnatserif";
import { Natvenue } from "./natvenue";
import { Natarc } from "./natarc";
import { Goalnatarc } from "./goalnatarc";
import { Goalnatcallout } from "./goalnatcallout";
import { Natmono } from "./natmono";
import { Goalnatmono } from "./goalnatmono";
import { Natticket } from "./natticket";
import { Natstack } from "./natstack";
import { Goalnatstack } from "./goalnatstack";
import { Goalnatinitial } from "./goalnatinitial";
import { Natmasthead } from "./natmasthead";
import { Goalnatmasthead } from "./goalnatmasthead";
import { Natclock } from "./natclock";
import { Goalnatitalic } from "./goalnatitalic";
import { Natpill } from "./natpill";
import { Goalnatpill } from "./goalnatpill";
import { Natglass } from "./natglass";
import { Goalnatglass } from "./goalnatglass";
import { Natquad } from "./natquad";
import { Goalnatquad } from "./goalnatquad";
import { Natflank } from "./natflank";
import { Goalnatflank } from "./goalnatflank";
import { Natsubtitle } from "./natsubtitle";
import { Goalnatsubtitle } from "./goalnatsubtitle";
import { Natled } from "./natled";
import { Goalnatled } from "./goalnatled";
import { Natticker } from "./natticker";
import { Goalnatticker } from "./goalnatticker";
import { Natlocation } from "./natlocation";
import { Goalnatwide } from "./goalnatwide";
import { Natcalendar } from "./natcalendar";
import { Nathashtag } from "./nathashtag";
import { Goalnathashtag } from "./goalnathashtag";
import { Goalnatquote } from "./goalnatquote";
import { Natslant } from "./natslant";
import { Goalnatslant } from "./goalnatslant";
import { Natboxed } from "./natboxed";
import { Goalnatboxed } from "./goalnatboxed";
import { Natunderline } from "./natunderline";
import { Goalnatunderline } from "./goalnatunderline";
import { Natknockout } from "./natknockout";
import { Goalnatknockout } from "./goalnatknockout";
import { Natdymo } from "./natdymo";
import { Goalnatdymo } from "./goalnatdymo";
import { Natturf } from "./natturf";
import { Goalnatturf } from "./goalnatturf";
import { Natswatch } from "./natswatch";
import { Goalnatswatch } from "./goalnatswatch";
import { Natneon } from "./natneon";
import { Goalnatneon } from "./goalnatneon";
import { Natcinema } from "./natcinema";
import { Goalnatcinema } from "./goalnatcinema";
import { Natlit } from "./natlit";
import { Natsand } from "./natsand";
import { Goalnatsand } from "./goalnatsand";
import { Natstarring, Goalnatstarring } from "./natstarring";
import { Natbeam, Goalnatbeam } from "./natbeam";
import { Natring, Goalnatring } from "./natring";
import { Natpanel, Goalnatpanel } from "./natpanel";
import { Natmoody, Goalnatmoody } from "./natmoody";
import { Natfog, Goalnatfog } from "./natfog";
import { Natpaper, Goalnatpaper } from "./natpaper";
import { Natfight, Goalnatfight } from "./natfight";
import { Nateditorial, Goalnateditorial } from "./nateditorial";
import { Natchest, Goalnatchest } from "./natchest";
import { Natgothic, Goalnatgothic } from "./natgothic";
import { Nattall, Goalnattall } from "./nattall";
import { Natribbon, Goalnatribbon } from "./natribbon";
import { Natduo, Goalnatduo } from "./natduo";
import { Natblur, Goalnatblur } from "./natblur";
import { Natsill } from "./natsill";
import { Natpassepartout } from "./natpassepartout";
import { Natteams } from "./natteams";
import { Goalnatairy } from "./goalnatairy";
import { Goalnatglow } from "./goalnatglow";
import { Bignumeral, Goalshirtno } from "./bignumeral";
import { Matchcard } from "./matchcard";
import { Goalnatletters, Goalnattopbar, Natdatehero, Natpitchpaint, Natsheet } from "./natfree";
import { Airspace, Colorfield, Goalscorebug, Goalsidename, Scorebug } from "./trend2";
import { Goalnatheadline, Goalnatseal, Natmilestones, Natskycrests, Natvsline } from "./natfree3";
import { Atmosrule, Goalatmos, Goalcolorframe, Gridlines, Tagstack } from "./trend3";
import { Goalnatfieldset, Goalnatfrost, Natfieldset, Natfootstrip, Natfrost } from "./natfree4";
import { Goalband, Goalmonoposter, Matchprogramme, Monoposter, Versusband } from "./trend4";
import { Goalnatnook, Goalnatweights, Natcaptionserif, Natdualclock, Natweekday } from "./natfree5";
import { Accentword, Crestcrown, Cornertab, Goalcornertab, Goaltape } from "./trend5";
import { Goalnatclubbar, Goalnatcontext, Natarrowdown, Natcompetition, Nathomeaway } from "./natfree6";
import { Bicolortitle, Goalbicolor, Goalthinarc, Nextup, Thinarc } from "./trend6";
import { Goalnatgolden, Goalnatstagger, Natcresthair, Natgolden, Natstagger } from "./natfree7";
import { Goalgradwash, Goalswissleft, Gradwash, Swissindex, Swissleft } from "./trend7";
import { Goalnatprofile, Goalnatseason, Natform, Natseasondots, Natvenuepin } from "./natfree8";
import { Chromeaccent, Daynight, Goalchromeaccent, Goallineupdots, Lineupdots } from "./trend8";
import { Goalnatcrestmark, Goalnatstreak, Natcrestmark, Natlastmeet, Natmonogram } from "./natfree9";
import { Geotype, Goalgeotype, Goalnetline, Goalswatchcard, Swatchcard } from "./trend9";
import { Goalnathairlines, Goalnatsplitrule, Natdayline, Natflankrules, Natpager } from "./natfree10";
import { Goalmotiontrail, Goalweightramp, Lineball, Motiontrail, Weightramp } from "./trend10";
import { Goalnatkitring, Goalnathomeaway, Natbackname, Natcityline, Natcountdown } from "./natfree11";
import { Angle34, Crestinline, Goalangle34, Goalcrestinline, Terraces } from "./trend11";
import { Goalnatclubhero, Goalnatlowercase, Natlowercase, Natroundring, Natteamstack } from "./natfree12";
import { Gateplate, Gateposts, Goalgateplate, Goaljstripes, Jstripes } from "./trend12";
import { Goalnatcornerfacts, Goalnatseasonline, Natcornerfacts, Natkickoffpill, Natseasonline } from "./natfree13";
import { Checkerrow, Chevronitalic, Diamondcrest, Goalchevronitalic, Goaldiamondcrest } from "./trend13";
import { Goalnatagainst, Goalnatbreadcrumb, Goalnatcrestflank, Natbreadcrumb, Natcrestflank } from "./natfree14";
import { Goalkitnumeral, Goalsubwaysign, Kitnumeral, Routeline, Subwaysign } from "./trend14";
import { Goalnathighlight, Goalnatmistlight, Natcrestcoins, Nathighlight, Natmistlight } from "./natfree15";
import { Goalheraldsplit, Goalironband, Heraldsplit, Ironband, Roundsans } from "./trend15";
import { Goalnatcolorbar, Goalnatornament, Natcolorbar, Natnextgames, Natornament } from "./natfree16";
import { Goalserifrule, Goalstripecard, Goaltifocards, Serifrule, Stripecard } from "./trend16";
import { Goalnatplacard, Goalnatsplitflap, Natkickoffword, Natprevious, Natsplitflap } from "./natfree17";
import { Estyear, Goalgoldcrest, Goalwingbars, Goldcrest, Wingbars } from "./trend17";
import { Goalnatfloodlit, Goalnatlive, Goalnatnation, Natfloodlit, Natnation } from "./natfree18";
import { Backslant, Goalbackslant, Goalwidthpair, Gothicinitial, Widthpair } from "./trend18";
import { Goalnatbunting, Goalnatscarf, Natbunting, Natrosette, Natscarf } from "./natfree19";
import { Feriaposter, Goalferiaposter, Goalrallyline, Hoopsblock, Rallyline } from "./trend19";
import { Goalnatcornerflag, Goalnatkithanger, Natcornerflag, Natkithanger, Natpass } from "./natfree20";
import { Billboard48, Framedprint, Goalbillboard, Goaldynamicstripes, Dynamicstripes } from "./trend20";
import { Goalnatdrum, Goalnatmegaphone, Natbeanie, Natdrum, Natmegaphone } from "./natfree21";
import { Fieldboard, Goalfieldboard, Goalstoneplaque, Seatnumber, Stoneplaque } from "./trend21";
import { Goalnatboot, Goalnatfoamfinger, Natboot, Natfloodtower, Natfoamfinger } from "./natfree22";
import { Goallanternsign, Goalmarqueesign, Keytag, Lanternsign, Marqueesign } from "./trend22";
import { Goalnatgoalframe, Goalnatshinpad, Goalnatwhistle, Natshinpad, Natwhistle } from "./natfree23";
import { Bentotiles, Concreteslab, Goalconcreteslab, Goalpatchbadge, Patchbadge } from "./trend23";
import { Goalnathorn, Goalnatmic, Goalnatstopwatch, Natbus, Natkitbag } from "./natfree24";
import { Goalshipcontainer, Goalsteellamellas, Shipcontainer, Stadiumtruss, Steellamellas } from "./trend24";
import { Goalnattarget, Goalnatvar, Natbinoculars, Natbottle, Natcone } from "./natfree25";
import { Citadel, Goalazulejo, Goalcitadel, Goalholofoil, Holofoil } from "./trend25";
import { Goalnatbolt, Goalnatheart, Goalnatrocket, Natdugout, Natheadphones } from "./natfree26";
import { Arcadepanel, Denimpanel, Espressocup, Goalarcade, Goaldenimpanel } from "./trend26";
import { Goalnatcrown, Goalnatpopper, Goalnatsiren, Natbattery, Nathourglass } from "./natfree27";
import { Goalstainedglass, Goalstarfield, Passportcover, Stainedglass, Umbrellaopen } from "./trend27";
import { Goalusmotion, Goalusneon, Usneongameday, Usscriptblock, Usvarsitynumber } from "./usgame1";
import { Goalus3d, Resultusfinal, Us3dgameday, Usdiamondplate, Usfansign } from "./usgame2";
import { Goalnatboxing, Goalnatgem, Natalarmclock, Natplane, Nattrafficlight } from "./natfree29";
import { Goallighthouse, Lighthousetower } from "./trend29";
import { Goalusstatcard, Usletterpatch, Usslidingbars } from "./usgame3";
import { Goalusduo, Resultusduo, Usangled, Usduoarena, Uskitband } from "./usgame4";
import { Goalusflare, Goalusglass, Usglass, Usposter, Usscoreboard } from "./usgame5";
import { Usbandvertical, Usbignumber, Useditorialmd, Usgoldword, Usstackedword } from "./usgame6";
import { Goalusecho, Goalusscript, Goalusstatcol, Resultuscolumn, Usrepeatname } from "./usgame7";
import { Goalpropanels, Goalprotwoscale, Proangled, Proframenum, Prosurname, Protwoscale } from "./pro1";
import { Usgamestack, Usitsvertical, Ussplitpanel } from "./usbold1";
import { Usgamegiant, Usgamemixed } from "./usbold2";
import { Portraitstripes } from "./portraitstripes";
import { Usduotone } from "./usbold3";
import { Goalnatrefoutline, Usgameside } from "./usbold4";
import { Agencynextmatch, Usresultframe } from "./usbold5";
import { Agencygoalgrid, Ushosting } from "./usbold6";
import { Agencyserifmatch } from "./agency2";
import { Goalproportrait, Procrestblocks, Promatchword, Proportrait, Proradial, Resultproarc } from "./pro2";
import { Goalprocircle, Proarch, Proeditorial, Prosplit, Prostrips } from "./pro3";
import { Goalprobands, Goalprocard, Produo, Pronamevertical, Resultproboard } from "./pro4";
import { Procrestwindow, Prodiagonal, Propolaroid, Proring, Prostadium, Protypegrid } from "./pro5";
import { Goalproband, Goalpromixed, Goalpronumber, Resultprodigits } from "./pro6";
import { Goalprocover, Procover, Profaceoff, Proletterphoto, Prominimal } from "./pro7";
import { Goalproblock, Goalproserif, Promonogram, Prospotlight, Resultprofinal } from "./pro8";
import { Prokickoff, Pronameband, Proticket, Protriptych, Proweek } from "./pro9";
import { Goalprobrackets, Goalpromosaic, Goalprovertical, Prooutlinenum, Resultprolower } from "./pro10";
import { Goalprolongshadow, Proinitial, Prolongshadow, Prorivalry, Prostathero } from "./pro11";
import { Goalprostar, Goalprotimeline, Proplayercard, Proswiss, Resultproscorers } from "./pro12";
import { Proawayday, Promirror, Prooppname, Proorb, Proroof, Prowindow } from "./pro13";
import { Goalproitalic, Goalproquote, Goalprostack, Resultproletter } from "./pro14";
import { Procountdown, Profloodrow, Pronumcircle, Proquad, Prostacked, Prostripeframe } from "./pro15";
import { Goalprocount, Goalprodiagonal, Goalpropodium, Resultproword } from "./pro16";
import { Prodatehero, Prohalfcrests, Prolineup, Proarc, Proreflect, Proslicednum } from "./pro17";
import { Goalprocloseup, Goalproeditorial, Goalproscoreline, Resultprovictory } from "./pro18";
import { Prochevron, Prokitsplit, Promedallion, Proquote, Prosplitportrait, Protricolour } from "./pro19";
import { Goalproduotone, Goalprofacts, Goalprominute, Resultprostacked } from "./pro20";
import { Probadge, Proclubword, Proglassbars, Prokickhours, Proprogramme, Prostoryboard } from "./pro21";
import { Goalprorows, Goalprosidenames, Goalprosplitword, Resultproflip } from "./pro22";
import { Procardstack, Progradient, Progrid, Prooutline, Propill, Proribbon } from "./pro23";
import { Goalprooutline, Goalpropill, Goalproserifname, Resultprostrip } from "./pro24";
import { Proclubinitial, Projersey, Prohorizon, Prostepthrough, Proversus, Proweekline } from "./pro25";
import { Goalprohorizon, Goalproletters, Goalproversus, Resultproft } from "./pro26";
import { Prochevronstack, Procolumnname, Prodropcap, Proletterbox, Proshield, Prozigzag } from "./pro27";
import { Goalprocolumn, Goalproletterbox, Goalproserifcount, Resultprosplitrule } from "./pro28";
import { Procoverstory, Procrestrows, Prohoops, Prominimalbar, Prooffset, Prostadiumwindow } from "./pro29";
import { Goalprohoops, Goalprotriptych, Goalprowindow, Resultprocircle } from "./pro30";
import { Procirclehalves, Prohugeword, Propagenumber, Propanorama, Proprofile, Prosidebars } from "./pro31";
import { Goalpropanorama, Goalproradial, Goalprosidebars, Resultprosplitscreen } from "./pro32";
import { Procalendar, Procrestgrid, Proladder, Prolframe, Prospotduo, Protwocolour } from "./pro33";
import { Goalprointerlock, Goalprolframe, Goalprotwocolour, Resultprobetween } from "./pro34";
import { Proampersand, Procrestcircles, Prokickoffsplit, Promarquee, Pronested, Protimeofday } from "./pro35";
import { Goalprocrests, Goalprog, Goalpromarquee, Resultprowdl } from "./pro36";
import { Proarchwindow, Procorners, Proplate, Proschedule, Prospine, Protwobands } from "./pro37";
import { Goalproarch, Goalprodiagnum, Goalprostackletters, Resultprofinallabel } from "./pro38";
import { Goalnatrefserif, Natreffoot, Natrefserif } from "./natref1";
import { Natrefthinbold, Resultnatquiet } from "./natref2";
import { Goalnatrefvert, Natrefvert } from "./natref3";
import { Goalnatreffirst, Goalnatrefpanel } from "./natref11";
import { Resultnatreffinal, Resultnatrefserif, Resultnatrefvertical } from "./natref12";
import { Natrefmixed, Natrefmixedclean, Natrefnext } from "./natref4";
import { Natrefredlight } from "./natref5";
import { Natrefghost, Natrefpan } from "./natref6";
import { Natrefhighkey, Natrefsunlit } from "./natref13";
import { Natrefpitchnumber, Resultnatrefhalftime } from "./natref14";
import { Goalnatrefvictoire } from "./natref15";
import { Goalnatrefstack, Natrefedgetitle } from "./natref18";
import { Natreftiltmatch, Resultnatrefstackscore } from "./natref19";
import { Goalnatrefcover, Goalnatrefsplitgo } from "./natref20";
import { Natrefmistmatch, Natrefwinegameday } from "./natref16";
import { Resultnatrefcyanfog, Resultnatrefsideband } from "./natref17";
import { Natrefbacklit, Natrefsplit } from "./natref7";
import { Natrefnightlights } from "./natref8";
import { Natrefgametime } from "./natref9";
import { Natrefsunset } from "./natref10";
import { Goalpaper } from "./goalpaper";
import { Goallowerthird } from "./goallowerthird";
import { Natrepeat, Goalnatrepeat } from "./natrepeat";
import { Natcard, Goalnatcard } from "./natcard";
import { Natgrid, Goalnatgrid } from "./natgrid";
import { Natnotes, Goalnatnotes } from "./natnotes";
import { Natedge, Goalnatedge } from "./natedge";
import { Natcircle, Goalnatcircle } from "./natcircle";
import { Goalnatlit } from "./goalnatlit";
import { Formfire } from "./formfire";
import { Formnatural } from "./formnatural";
import { Formpanel } from "./formpanel";
import { Clipbold, Clipclub, Clipnight, Clippaper } from "./clip";
import { Formgold } from "./formgold";
import { Formfiregold } from "./formfire";
import { Nattime } from "./nattime";
import { Natvert } from "./natvert";
import { Natborder } from "./natborder";
import { Goalnatvert } from "./goalnatvert";
import { Goalnatborder } from "./goalnatborder";
import { Goalnatsplit } from "./goalnatsplit";
import { Natclean } from "./natclean";
import { Natstrip } from "./natstrip";
import { Natdate } from "./natdate";
import { Goalnatclean } from "./goalnatclean";
import { Goalnatname } from "./goalnatname";
import { Goalnatstrip } from "./goalnatstrip";
import { Natword } from "./natword";
import { Natfold, Goalnatfold } from "./natfold";
import { Natspine, Goalnatspine } from "./natspine";
import { Natmix, Goalnatmix } from "./natmix";
import { Natlabel, Goalnatlabel } from "./natlabel";
import { Natspaced, Goalnatspaced } from "./natspaced";
import { Natmarks, Goalnatmarks } from "./natmarks";
import { Natdot, Goalnatdot } from "./natdot";
import { Natcut, Goalnatcut } from "./natcut";
import { Natlegend, Goalnatlegend } from "./natlegend";
import { Natcols, Goalnatcols } from "./natcols";
import { Natfoot, Goalnatfoot } from "./natfoot";
import { Natfade, Goalnatfade } from "./natfade";
import { Natarrow, Goalnatarrow } from "./natarrow";
import { Natrule, Goalnatrule } from "./natrule";
import { Natquiet, Goalnatquiet } from "./natquiet";
import { Natoverline, Goalnatoverline } from "./natoverline";
import { Natcolumn, Goalnatcolumn } from "./natcolumn";
import { Natwatermark, Goalnatwatermark } from "./natwatermark";
import { Nattab, Goalnattab } from "./nattab";
import { Natsentence, Goalnatsentence } from "./natsentence";
import { Natbracket, Goalnatbracket } from "./natbracket";
import { Natdotline, Goalnatdotline } from "./natdotline";
import { Nathead, Goalnathead } from "./nathead";
import { Natbadge, Goalnatbadge } from "./natbadge";
import { Natbar, Goalnatbar } from "./natbar";
import { Natends, Goalnatends } from "./natends";
import { Natlist, Goalnatlist } from "./natlist";
import { Natduel, Goalnatduel } from "./natduel";
import { Natdiag, Goalnatdiag } from "./natdiag";
import { Natsidebar, Goalnatsidebar } from "./natsidebar";
import { Natpennant, Goalnatpennant } from "./natpennant";
import { Natangle, Goalnatangle } from "./natangle";
import { Natlines, Goalnatlines } from "./natlines";
import { Natcrestbleed, Goalnatcrestbleed } from "./natcrestbleed";
import { Natnav, Goalnatnav } from "./natnav";
import { Natecho, Goalnatecho } from "./natecho";
import { Natflag, Goalnatflag } from "./natflag";
import { Nattag, Goalnattag } from "./nattag";
import { Natbreakout, Goalnatbreakout } from "./natbreakout";
import { Natstripe, Goalnatstripe } from "./natstripe";
import { Natvline, Goalnatvline } from "./natvline";
import { Natoverprint, Goalnatoverprint } from "./natoverprint";
import { Natkickoff, Goalnatkickoff } from "./natkickoff";
import { Natunderbar, Goalnatunderbar } from "./natunderbar";
import { Natsticker, Goalnatsticker } from "./natsticker";
import { Natsplitword, Goalnatsplitword } from "./natsplitword";
import { Natcorners4, Goalnatcorners4 } from "./natcorners4";
import { Natmicro2, Goalnatmicro2 } from "./natmicro2";
import { Natinset, Goalnatinset } from "./natinset";
import { Natbigletter, Goalnatbigletter } from "./natbigletter";
import { Natchips, Goalnatchips } from "./natchips";
import { Natslab, Goalnatslab } from "./natslab";
import { Natcrestbox, Goalnatcrestbox } from "./natcrestbox";
import { Natrepeatline, Goalnatrepeatline } from "./natrepeatline";
import { Natoffset, Goalnatoffset } from "./natoffset";
import { Natcredits, Goalnatcredits } from "./natcredits";
import { Natpilltop, Goalnatpilltop } from "./natpilltop";
import { Natfadebar, Goalnatfadebar } from "./natfadebar";
import { Natbaseline, Goalnatbaseline } from "./natbaseline";
import { Natoutlinebox, Goalnatoutlinebox } from "./natoutlinebox";
import { Natfootcols, Goalnatfootcols } from "./natfootcols";
import { Natdotsgrid, Goalnatdotsgrid } from "./natdotsgrid";
import { Natvs, Goalnatvs } from "./natvs";
import { Natcaptionbar, Goalnatcaptionbar } from "./natcaptionbar";
import { Nattight, Goalnattight } from "./nattight";
import { Nattopline, Goalnattopline } from "./nattopline";
import { Natrails, Goalnatrails } from "./natrails";
import { Natbigdate, Goalnatbigdate } from "./natbigdate";
import { Natplus, Goalnatplus } from "./natplus";
import { Natsyllable, Goalnatsyllable } from "./natsyllable";
import { Natcrestrow, Goalnatcrestrow } from "./natcrestrow";
import { Natwidefont, Goalnatwidefont } from "./natwidefont";
import { Natfig, Goalnatfig } from "./natfig";
import { Natcornerribbon, Goalnatcornerribbon } from "./natcornerribbon";
import { Natsides, Goalnatsides } from "./natsides";
import { Natdashed, Goalnatdashed } from "./natdashed";
import { Natcapsule, Goalnatcapsule } from "./natcapsule";
import { Natlower3, Goalnatlower3 } from "./natlower3";
import { Natballicon, Goalnatballicon } from "./natballicon";
import { Natslash, Goalnatslash } from "./natslash";
import { Natweightmix, Goalnatweightmix } from "./natweightmix";
import { Natgrid4, Goalnatgrid4 } from "./natgrid4";
import { Natclockicon, Goalnatclockicon } from "./natclockicon";
import { Natpin, Goalnatpin } from "./natpin";
import { Natdoublerule, Goalnatdoublerule } from "./natdoublerule";
import { Natpointer, Goalnatpointer } from "./natpointer";
import { Natserifcaps, Goalnatserifcaps } from "./natserifcaps";
import { Natgradword, Goalnatgradword } from "./natgradword";
import { Natdotsep, Goalnatdotsep } from "./natdotsep";
import { Natdatestack, Goalnatdatestack } from "./natdatestack";
import { Nattypewriter, Goalnattypewriter } from "./nattypewriter";
import { Natinfobox2, Goalnatinfobox2 } from "./natinfobox2";
import { Nathighlighter, Goalnathighlighter } from "./nathighlighter";
import { Natcrestsplit, Goalnatcrestsplit } from "./natcrestsplit";
import { Natcrestring, Goalnatcrestring } from "./natcrestring";
import { Natnumero, Goalnatnumero } from "./natnumero";
import { Nattilted, Goalnattilted } from "./nattilted";
import { Natclubword, Goalnatclubword } from "./natclubword";
import { Natglasscard, Goalnatglasscard } from "./natglasscard";
import { Natoffsetframe, Goalnatoffsetframe } from "./natoffsetframe";
import { Natitalicbig, Goalnatitalicbig } from "./natitalicbig";
import { Natknockbox, Goalnatknockbox } from "./natknockbox";
import { Natunderscore, Goalnatunderscore } from "./natunderscore";
import { Natfactrow, Goalnatfactrow } from "./natfactrow";
import { Natcols3, Goalnatcols3 } from "./natcols3";
import { Natbracev, Goalnatbracev } from "./natbracev";
import { Natarrowup, Goalnatarrowup } from "./natarrowup";
import { Nattimedisc, Goalnattimedisc } from "./nattimedisc";
import { Natrightrule, Goalnatrightrule } from "./natrightrule";
import { Natheaderbox, Goalnatheaderbox } from "./natheaderbox";
import { Natinitialcolor, Goalnatinitialcolor } from "./natinitialcolor";
import { Natrulebox, Goalnatrulebox } from "./natrulebox";
import { Natfadeword, Goalnatfadeword } from "./natfadeword";
import { Natleaders, Goalnatleaders } from "./natleaders";
import { Natcresttop, Goalnatcresttop } from "./natcresttop";
import { Natthickline, Goalnatthickline } from "./natthickline";
import { Natroundbox, Goalnatroundbox } from "./natroundbox";
import { Natnamesbig, Goalnatnamesbig } from "./natnamesbig";
import { Natedgebar, Goalnatedgebar } from "./natedgebar";
import { Natdatepill, Goalnatdatepill } from "./natdatepill";
import { Nattoprule, Goalnattoprule } from "./nattoprule";
import { Natcolorfoot, Goalnatcolorfoot } from "./natcolorfoot";
import { Nattriangle, Goalnattriangle } from "./nattriangle";
import { Natpullbar, Goalnatpullbar } from "./natpullbar";
import { Natstadium, Goalnatstadium } from "./natstadium";
import { Natwhenwhere, Goalnatwhenwhere } from "./natwhenwhere";
import { Natstretch, Goalnatstretch } from "./natstretch";
import { Natchip, Goalnatchip } from "./natchip";
import { Natfadestack, Goalnatfadestack } from "./natfadestack";
import { Natthirds, Goalnatthirds } from "./natthirds";
import { Natvdate, Goalnatvdate } from "./natvdate";
import { Natlr, Goalnatlr } from "./natlr";
import { Natversus, Goalnatversus } from "./natversus";
import { Natmidside, Goalnatmidside } from "./natmidside";
import { Natserifstack, Goalnatserifstack } from "./natserifstack";
import { Natduoline, Goalnatduoline } from "./natduoline";
import { Natfolio, Goalnatfolio } from "./natfolio";
import { Natstrike, Goalnatstrike } from "./natstrike";
import { Natblockshadow, Goalnatblockshadow } from "./natblockshadow";
import { Natlettertiles, Goalnatlettertiles } from "./natlettertiles";
import { Natdiamond, Goalnatdiamond } from "./natdiamond";
import { Natbubble, Goalnatbubble } from "./natbubble";
import { Natbullets, Goalnatbullets } from "./natbullets";
import { Natoutlinetime, Goalnatoutlinetime } from "./natoutlinetime";
import { Natvletters, Goalnatvletters } from "./natvletters";
import { Natthin, Goalnatthin } from "./natthin";
import { Natcascade, Goalnatcascade } from "./natcascade";
import { Natsup, Goalnatsup } from "./natsup";
import { Natsplitline, Goalnatsplitline } from "./natsplitline";
import { Natunderdots, Goalnatunderdots } from "./natunderdots";
import { Nattimeline, Goalnattimeline } from "./nattimeline";
import { Natfraction, Goalnatfraction } from "./natfraction";
import { Natperiod, Goalnatperiod } from "./natperiod";
import { Natcresttower, Goalnatcresttower } from "./natcresttower";
import { Natlinesides, Goalnatlinesides } from "./natlinesides";
import { Nattopcorner, Goalnattopcorner } from "./nattopcorner";
import { Natwhitefade, Goalnatwhitefade } from "./natwhitefade";
import { Natjustify, Goalnatjustify } from "./natjustify";
import { Natmagcaption, Goalnatmagcaption } from "./natmagcaption";
import { Natsplitfill, Goalnatsplitfill } from "./natsplitfill";
import { Natasterisk, Goalnatasterisk } from "./natasterisk";
import { Natpaired, Goalnatpaired } from "./natpaired";
import { Natsmallcrest, Goalnatsmallcrest } from "./natsmallcrest";
import { Natsmallcaps, Goalnatsmallcaps } from "./natsmallcaps";
import { Natdropline, Goalnatdropline } from "./natdropline";
import { Natruler, Goalnatruler } from "./natruler";
import { Natrows, Goalnatrows } from "./natrows";
import { Natblockcorners, Goalnatblockcorners } from "./natblockcorners";
import { Natellipse, Goalnatellipse } from "./natellipse";
import { Natheaderline, Goalnatheaderline } from "./natheaderline";
import { Natsidenote, Goalnatsidenote } from "./natsidenote";
import { Natunderlinefat, Goalnatunderlinefat } from "./natunderlinefat";
import { Natframeline, Goalnatframeline } from "./natframeline";
import { Natbadgeline, Goalnatbadgeline } from "./natbadgeline";
import { Natmixcase, Goalnatmixcase } from "./natmixcase";
import { Natshadowword, Goalnatshadowword } from "./natshadowword";
import { Natquotebar, Goalnatquotebar } from "./natquotebar";
import { Natbigv, Goalnatbigv } from "./natbigv";
import { Natstep, Goalnatstep } from "./natstep";
import { Natnumbered, Goalnatnumbered } from "./natnumbered";
import { Natcircletag, Goalnatcircletag } from "./natcircletag";
import { Natslashdate, Goalnatslashdate } from "./natslashdate";
import { Natboxedname, Goalnatboxedname } from "./natboxedname";
import { Natfadeline, Goalnatfadeline } from "./natfadeline";
import { Natpipe, Goalnatpipe } from "./natpipe";
import { Natwave, Goalnatwave } from "./natwave";
import { Nataboveunder, Goalnataboveunder } from "./nataboveunder";
import { Natemdash, Goalnatemdash } from "./natemdash";
import { Natcheck, Goalnatcheck } from "./natcheck";
import { Natjustifyrow, Goalnatjustifyrow } from "./natjustifyrow";
import { Natchevrons, Goalnatchevrons, Natslashes, Goalnatslashes, Natplusline, Goalnatplusline, Natbars, Goalnatbars, Natlcorner, Goalnatlcorner } from "./natmarks2";
import { Natdotgrid9, Goalnatdotgrid9, Natsquaremark, Goalnatsquaremark, Natdashes, Goalnatdashes, Nattilde, Goalnattilde, Natarcmark, Goalnatarcmark } from "./natmarks3";
import { Natfirstfill, Goalnatfirstfill, Natlastcolor, Goalnatlastcolor, Natboxletter, Goalnatboxletter, Natcolorsub, Goalnatcolorsub, Natcolorword, Goalnatcolorword } from "./natletters2";
import { Natbebas, Goalnatbebas, Natbodoni, Goalnatbodoni, Natunbounded, Goalnatunbounded, Natgrotesk, Goalnatgrotesk, Natalfaslab, Goalnatalfaslab } from "./natfonts";
import { Natanton, Goalnatanton, Natbarlow, Goalnatbarlow, Natarchivo, Goalnatarchivo, Natdela, Goalnatdela, Natitalicserif, Goalnatitalicserif } from "./natfonts";
import { Natmontserrat, Goalnatmontserrat, Natfraunces, Goalnatfraunces, Natarchivolight, Goalnatarchivolight, Natrubikmono, Goalnatrubikmono, Natfrauncesit, Goalnatfrauncesit } from "./natfonts";
import { Natfreecol, Goalnatfreecol, Natcutoff, Goalnatcutoff, Natcornerpair, Goalnatcornerpair, Natmirror, Goalnatmirror, Natbehindword, Goalnatbehindword } from "./natlayouts";
import { Natbehindoutline, Goalnatbehindoutline, Natbehindcolor, Goalnatbehindcolor, Natbehindserif, Goalnatbehindserif, Natbehindtall, Goalnatbehindtall, Natcutoffoutline, Goalnatcutoffoutline } from "./natlayouts";
import { Natcutoffcolor, Goalnatcutoffcolor, Natcutofftall, Goalnatcutofftall, Natcutoffserif, Goalnatcutoffserif, Natbehindbodoni, Goalnatbehindbodoni, Natbehindgrotesk, Goalnatbehindgrotesk } from "./natlayouts";
import { Natcornerbodoni, Goalnatcornerbodoni, Natcornertall, Goalnatcornertall, Natmirrorserif, Goalnatmirrorserif, Natmirrorcolor, Goalnatmirrorcolor, Natfreecolserif, Goalnatfreecolserif } from "./natlayouts";
import { Natcorneroutline, Goalnatcorneroutline, Natcornercolor, Goalnatcornercolor, Natfreecolbodoni, Goalnatfreecolbodoni, Natfreecoltall, Goalnatfreecoltall, Natmirrorbodoni, Goalnatmirrorbodoni } from "./natlayouts";
import { Natcorner } from "./natcorner";
import { Natgrass } from "./natgrass";
import { Goalnatword } from "./goalnatword";
import { Goalnatcorner } from "./goalnatcorner";
import { Goalnatlight } from "./goalnatlight";
import { Coachwelcome } from "./coachwelcome";
import { Coachwelcomelight } from "./coachwelcomelight";
import { Welcomelight } from "./welcomelight";
import { Welcomeclub } from "./welcomeclub";
import { Welcomecolumn } from "./welcomecolumn";
import { Welcomecareer } from "./welcomecareer";
import { Coachdark } from "./coachdark";
import { Coachname } from "./coachname";
import { Coachduo } from "./coachduo";
import { Coachframe } from "./coachframe";
import { Coachcard, Coachlowkey, Coachmono, Coachsheet } from "./coach2";
import { Coachclipboard } from "./coachclipboard";
import { Goalherocount } from "./goalherocount";
import { Coachhero } from "./coachhero";
import { Coachpress } from "./coachpress";
import { Coachboard } from "./coachboard";
import { Coachserif } from "./coachserif";
import { Coachtouchline } from "./coachtouchline";
import { Heroboxed } from "./heroboxed";
import { Herosticker } from "./herosticker";
import { Heroband } from "./heroband";
import { Heroname } from "./heroname";
import { Herofoot } from "./herofoot";
import { Goalherotop } from "./goalherotop";
import { Goalherobw } from "./goalherobw";
import { Goalheroduotone } from "./goalheroduotone";
import { Goalheroexclaim } from "./goalheroexclaim";
import { Goalherohalf } from "./goalherohalf";
import { Heroduo } from "./heroduo";
import { Herotint } from "./herotint";
import { Heroshadow } from "./heroshadow";
import { Herogradient } from "./herogradient";
import { Heroaura } from "./heroaura";
import { Goalheroname } from "./goalheroname";
import { Goalheroboxed } from "./goalheroboxed";
import { Goalherosticker } from "./goalherosticker";
import { Goalherocrest } from "./goalherocrest";
import { Goalherofill } from "./goalherofill";
import { Heroghost } from "./heroghost";
import { Herooutline } from "./herooutline";
import { Herotwotone } from "./herotwotone";
import { Heroserif } from "./heroserif";
import { Herolower } from "./herolower";
import { Goalheroshadow } from "./goalheroshadow";
import { Goalherogradient } from "./goalherogradient";
import { Goalherostagger } from "./goalherostagger";
import { Goalherotally } from "./goalherotally";
import { Goalheroaura } from "./goalheroaura";
import { Goalheroghost } from "./goalheroghost";
import { Goalherooutline } from "./goalherooutline";
import { Goalherotwotone } from "./goalherotwotone";
import { Goalheroserif } from "./goalheroserif";
import { Goalherolower } from "./goalherolower";
import { Herostack } from "./herostack";
import { Herocaps } from "./herocaps";
import { Heroframe } from "./heroframe";
import { Herovs } from "./herovs";
import { Heronumber } from "./heronumber";
import { Goalherostack } from "./goalherostack";
import { Goalherocaps } from "./goalherocaps";
import { Goalheroframe } from "./goalheroframe";
import { Goalherotint } from "./goalherotint";
import { Goalheroduo } from "./goalheroduo";
import { Heromatch, Heromatcharchivo, Heromatchbebas, Heromatchbodoni, Heromatchdela, Heromatchslab } from "./heromatch";
import { Herotime } from "./herotime";
import { Herodate } from "./herodate";
import { Heromatchdark } from "./heromatchdark";
import { Herobehind } from "./herobehind";
import { Goalherodark } from "./goalherodark";
import { Goalherosplit } from "./goalherosplit";
import { Goalherobehind } from "./goalherobehind";
import { Goalherofoot } from "./goalherofoot";
import { Goalheroband } from "./goalheroband";
import { Outline } from "./outline";
import { Ghost } from "./ghost";
import { Gameday } from "./gameday";
import { Sky } from "./sky";
import { Mist } from "./mist";
import { Headline } from "./headline";
import { Collage } from "./collage";
import { Debut } from "./debut";
import { Bokeh } from "./bokeh";
import { Strip } from "./strip";
import { Glow } from "./glow";
import { Dispersion } from "./dispersion";
import { Sepia } from "./sepia";
import { Notes } from "./notes";
import { Crestmark } from "./crestmark";
import { Upnext } from "./upnext";
import { Caption } from "./caption";
import { Numbers } from "./numbers";
import { Award } from "./award";
import { Cutletters } from "./cutletters";
import { Backlit } from "./backlit";
import { Twoscale } from "./twoscale";
import { Bignumber } from "./bignumber";
import { Brushday } from "./brushday";
import { Motion } from "./motion";
import { Studio } from "./studio";
import { Wall } from "./wall";
import { Graffiti } from "./graffiti";
import { Damask } from "./damask";
import { Diagonal } from "./diagonal";
import { Versus } from "./versus";
import { Chrome } from "./chrome";
import { Tape } from "./tape";
import { Night } from "./night";
import { Strokes } from "./strokes";
import { Tallname } from "./tallname";
import { Breakout } from "./breakout";
import { Statboxes } from "./statboxes";
import { Column } from "./column";
import { Splitnumber } from "./splitnumber";
import { Notebook } from "./notebook";
import { Swoosh } from "./swoosh";
import { Tilt } from "./tilt";
import { Backpanel } from "./backpanel";
import { Blurduo } from "./blurduo";
import { Faceday } from "./faceday";
import { Arc } from "./arc";
import { Tunnel } from "./tunnel";
import { Cheer } from "./cheer";
import { Sideband } from "./sideband";
import { Band } from "./band";
import { Pillar } from "./pillar";
import { Blueprint } from "./blueprint";
import { Glowline } from "./glowline";
import { Greyday } from "./greyday";
import { Triangles } from "./triangles";
import { Emblemart } from "./emblemart";
import { Reflect } from "./reflect";
import { Minimal } from "./minimal";
import { Profile } from "./profile";
import { Screenprint } from "./screenprint";
import { Bighead } from "./bighead";
import { Swirl } from "./swirl";
import { Splitbw } from "./splitbw";
import { Hollow } from "./hollow";
import { Selective } from "./selective";
import { Dotscript } from "./dotscript";
import { Roughname } from "./roughname";
import { Infobox } from "./infobox";
import { Condensed } from "./condensed";
import { Shards } from "./shards";
import { Clubname } from "./clubname";
import { Curvepanel } from "./curvepanel";
import { Emblemfade } from "./emblemfade";
import { Cutpaper } from "./cutpaper";
import { Petals } from "./petals";
import { Gradient } from "./gradient";
import { Ring } from "./ring";
import { Glass } from "./glass";
import { Boxtitle } from "./boxtitle";
import { Softglow } from "./softglow";
import { Blurrun } from "./blurrun";
import { Nextmatch } from "./nextmatch";
import { Redgrain } from "./redgrain";
import { Halfline } from "./halfline";
import { Statserif } from "./statserif";
import { Sepiaday } from "./sepiaday";
import { Topspeed } from "./topspeed";
import { Colorblock } from "./colorblock";
import { Cover } from "./cover";
import { Panelscript } from "./panelscript";
import { Medallion } from "./medallion";
import { Matchbar } from "./matchbar";
import { Ringlight } from "./ringlight";
import { Widescreen } from "./widescreen";
import { Underline } from "./underline";
import { Goalringlight } from "./goalringlight";
import { Goalmedallion } from "./goalmedallion";
import { Goalunderline } from "./goalunderline";
import { Goalwidescreen } from "./goalwidescreen";
import { Goalcrestpair } from "./goalcrestpair";
import { Paperechodate } from "./paperechodate";
import { Paperechotime } from "./paperechotime";
import { Paperechoname } from "./paperechoname";
import { Paperechoserif } from "./paperechoserif";
import { Paperechowide } from "./paperechowide";
import { Goalpaperechoname } from "./goalpaperechoname";
import { Goalpaperechoserif } from "./goalpaperechoserif";
import { Goalpaperechowide } from "./goalpaperechowide";
import { Goalpaperechovert } from "./goalpaperechovert";
import { Goalpaperechobar } from "./goalpaperechobar";
import { Echomicro } from "./echomicro";
import { Echoaura } from "./echoaura";
import { Echobackline } from "./echobackline";
import { Echonamefield } from "./echonamefield";
import { Echozoom } from "./echozoom";
import { Goalechoaura } from "./goalechoaura";
import { Goalechobackline } from "./goalechobackline";
import { Goalechonamefield } from "./goalechonamefield";
import { Goalechozoom } from "./goalechozoom";
import { Goalechovert } from "./goalechovert";
import { Echoinset } from "./echoinset";
import { Echogallery } from "./echogallery";
import { Echosidecol } from "./echosidecol";
import { Echohorizon } from "./echohorizon";
import { Echowidetitle } from "./echowidetitle";
import { Goalechobug } from "./goalechobug";
import { Goalechoserene } from "./goalechoserene";
import { Goalechohorizon } from "./goalechohorizon";
import { Goalechowide } from "./goalechowide";
import { Goalechotonal } from "./goalechotonal";
import { Echoswiss } from "./echoswiss";
import { Echoserif } from "./echoserif";
import { Echotable } from "./echotable";
import { Echoorbit } from "./echoorbit";
import { Echolockup } from "./echolockup";
import { Goalechoswiss } from "./goalechoswiss";
import { Goalechoserif } from "./goalechoserif";
import { Goalechoorbit } from "./goalechoorbit";
import { Goalechomono } from "./goalechomono";
import { Goalechoflash } from "./goalechoflash";
import { Echotitle } from "./echotitle";
import { Echodate } from "./echodate";
import { Echotime } from "./echotime";
import { Echoname } from "./echoname";
import { Echocrest } from "./echocrest";
import { Goalechotitle } from "./goalechotitle";
import { Goalechoname } from "./goalechoname";
import { Goalechocrest } from "./goalechocrest";
import { Goalechobar } from "./goalechobar";
import { Goalechocorner } from "./goalechocorner";
import { Paperripple } from "./paperripple";
import { Papertype } from "./papertype";
import { Paperdouble } from "./paperdouble";
import { Paperstep } from "./paperstep";
import { Papergiant } from "./papergiant";
import { Goalpaperripple } from "./goalpaperripple";
import { Goalpapertype } from "./goalpapertype";
import { Goalpaperdouble } from "./goalpaperdouble";
import { Goalpaperstep } from "./goalpaperstep";
import { Goalpapergiant } from "./goalpapergiant";
import { Paperecho } from "./paperecho";
import { Dashecho } from "./dashecho";
import { Gradientsilhouette } from "./gradientsilhouette";
import { Duosilhouette } from "./duosilhouette";
import { Stepsilhouette } from "./stepsilhouette";
import { Goalpaperecho } from "./goalpaperecho";
import { Goaldashecho } from "./goaldashecho";
import { Goalgradientsilhouette } from "./goalgradientsilhouette";
import { Goalduosilhouette } from "./goalduosilhouette";
import { Goalstepsilhouette } from "./goalstepsilhouette";
import { Dotsilhouette } from "./dotsilhouette";
import { Crestsilhouette } from "./crestsilhouette";
import { Splitsilhouette } from "./splitsilhouette";
import { Doubleline } from "./doubleline";
import { Risingecho } from "./risingecho";
import { Goaldotsilhouette } from "./goaldotsilhouette";
import { Goalcrestsilhouette } from "./goalcrestsilhouette";
import { Goalsplitsilhouette } from "./goalsplitsilhouette";
import { Goaldoubleline } from "./goaldoubleline";
import { Goalrisingecho } from "./goalrisingecho";
import { Typesilhouette } from "./typesilhouette";
import { Giantsilhouette } from "./giantsilhouette";
import { Linesilhouette } from "./linesilhouette";
import { Rippleecho } from "./rippleecho";
import { Rimlight } from "./rimlight";
import { Goaltypesilhouette } from "./goaltypesilhouette";
import { Goalgiantsilhouette } from "./goalgiantsilhouette";
import { Goallinesilhouette } from "./goallinesilhouette";
import { Goalrippleecho } from "./goalrippleecho";
import { Goalrimlight } from "./goalrimlight";
import { Castshadow } from "./castshadow";
import { Mirrorecho } from "./mirrorecho";
import { Overlap } from "./overlap";
import { Fillprogress } from "./fillprogress";
import { Twotone } from "./twotone";
import { Goalcastshadow } from "./goalcastshadow";
import { Goalmirrorecho } from "./goalmirrorecho";
import { Goaloverlap } from "./goaloverlap";
import { Goalfillprogress } from "./goalfillprogress";
import { Goaltwotone } from "./goaltwotone";
import { Bleedword } from "./bleedword";
import { Textsquare } from "./textsquare";
import { Circled } from "./circled";
import { Redacted } from "./redacted";
import { Oneline } from "./oneline";
import { Goalbleed } from "./goalbleed";
import { Goaltextsquare } from "./goaltextsquare";
import { Goalcircled } from "./goalcircled";
import { Goalredacted } from "./goalredacted";
import { Goaloneline } from "./goaloneline";
import { Dropcap } from "./dropcap";
import { Crossword } from "./crossword";
import { Hyphen } from "./hyphen";
import { Ellipsis } from "./ellipsis";
import { Arrow } from "./arrow";
import { Goaldropcap } from "./goaldropcap";
import { Goalcrossword } from "./goalcrossword";
import { Goalellipsis } from "./goalellipsis";
import { Goalarrow } from "./goalarrow";
import { Goalcolon } from "./goalcolon";
import { Bordertext } from "./bordertext";
import { Weights } from "./weights";
import { Bounce } from "./bounce";
import { Fadeword } from "./fadeword";
import { Tracking } from "./tracking";
import { Goalbordertext } from "./goalbordertext";
import { Goalweights } from "./goalweights";
import { Goalbounce } from "./goalbounce";
import { Goalfade } from "./goalfade";
import { Goaltracking } from "./goaltracking";
import { Halffill } from "./halffill";
import { Circletext } from "./circletext";
import { Strike } from "./strike";
import { Superscript } from "./superscript";
import { Quotes } from "./quotes";
import { Goalhalffill } from "./goalhalffill";
import { Goalcircletext } from "./goalcircletext";
import { Goalstrike } from "./goalstrike";
import { Goalsuperscript } from "./goalsuperscript";
import { Goalquotes } from "./goalquotes";
import { Cropmarks } from "./cropmarks";
import { Folder } from "./folder";
import { Keycaps } from "./keycaps";
import { Postit } from "./postit";
import { Specimen } from "./specimen";
import { Goalcropmarks } from "./goalcropmarks";
import { Goalkeycaps } from "./goalkeycaps";
import { Goalpostit } from "./goalpostit";
import { Goalspecimen } from "./goalspecimen";
import { Goaltally } from "./goaltally";
import { Nowplaying } from "./nowplaying";
import { Locator } from "./locator";
import { Invite } from "./invite";
import { Toggle } from "./toggle";
import { Emboss } from "./emboss";
import { Goalnowplaying } from "./goalnowplaying";
import { Goalemboss } from "./goalemboss";
import { Goaltoggle } from "./goaltoggle";
import { Goalpulse } from "./goalpulse";
import { Goalunlock } from "./goalunlock";
import { Search } from "./search";
import { Chat } from "./chat";
import { Receipt } from "./receipt";
import { Instant } from "./instant";
import { Measure } from "./measure";
import { Goalsearch } from "./goalsearch";
import { Goalchat } from "./goalchat";
import { Goalreceipt } from "./goalreceipt";
import { Goalinstant } from "./goalinstant";
import { Goalmeasure } from "./goalmeasure";
import { Totwgallery } from "./totwgallery";
import { Totwcard } from "./totwcard";
import { Totwswiss } from "./totwswiss";
import { Totwcallout } from "./totwcallout";
import { Totwsplit } from "./totwsplit";
import { Totwstack } from "./totwstack";
import { Totwmicro } from "./totwmicro";
import { Totwtonal } from "./totwtonal";
import { Notify } from "./notify";
import { Marker } from "./marker";
import { Chapter } from "./chapter";
import { Subtitle } from "./subtitle";
import { Parens } from "./parens";
import { Goalnotify } from "./goalnotify";
import { Goalmarker } from "./goalmarker";
import { Goalparens } from "./goalparens";
import { Goalsubtitle } from "./goalsubtitle";
import { Goalpunct } from "./goalpunct";
import { Sentence } from "./sentence";
import { Signage } from "./signage";
import { Datestamp } from "./datestamp";
import { Hairslash } from "./hairslash";
import { Viewfinder } from "./viewfinder";
import { Goalsentence } from "./goalsentence";
import { Goalcamera } from "./goalcamera";
import { Goalslash } from "./goalslash";
import { Goalviewfinder } from "./goalviewfinder";
import { Goalframe } from "./goalframe";
import { Offsetshadow } from "./offsetshadow";
import { Kickoff } from "./kickoff";
import { Pitchlines } from "./pitchlines";
import { Sunrise } from "./sunrise";
import { Contour } from "./contour";
import { Goalhorizon } from "./goalhorizon";
import { Goalmicro } from "./goalmicro";
import { Goalmonogram } from "./goalmonogram";
import { Goalstage } from "./goalstage";
import { Goaloffset } from "./goaloffset";
import { Namecorners } from "./namecorners";
import { Pinstripe } from "./pinstripe";
import { Crestpair } from "./crestpair";
import { Datecard } from "./datecard";
import { Frostband } from "./frostband";
import { Goalsidecol } from "./goalsidecol";
import { Goalgallery } from "./goalgallery";
import { Goallockup } from "./goallockup";
import { Goalboard } from "./goalboard";
import { Goalname } from "./goalname";
import { Seal } from "./seal";
import { Fixtureboard } from "./fixtureboard";
import { Lowerthird } from "./lowerthird";
import { Fixturelist } from "./fixturelist";
import { Dotgrid } from "./dotgrid";
import { Goalticker } from "./goalticker";
import { Goalaura } from "./goalaura";
import { Goalinset } from "./goalinset";
import { Goalswiss } from "./goalswiss";
import { Goalorbit } from "./goalorbit";
import { Footnote } from "./footnote";
import { Echoline } from "./echoline";
import { Pills } from "./pills";
import { Corner } from "./corner";
import { Shadow } from "./shadow";
import { Goalecho } from "./goalecho";
import { Goalcircle } from "./goalcircle";
import { Goalcrop } from "./goalcrop";
import { Goalbar } from "./goalbar";
import { Goalnumber } from "./goalnumber";
import { Crestline } from "./crestline";
import { Stage } from "./stage";
import { Edgebar } from "./edgebar";
import { Monogram } from "./monogram";
import { Thirds } from "./thirds";
import { Stub } from "./stub";
import { Goalmono } from "./goalmono";
import { Goaltonal } from "./goaltonal";
import { Goalvert } from "./goalvert";
import { Goalwide } from "./goalwide";
import { Goalscore } from "./goalscore";
import { Goalnet } from "./goalnet";
import { Goalbug } from "./goalbug";
import { Goalserene } from "./goalserene";
import { Welcome, Welcomeduo, Welcomehalo, Welcomeplay } from "./welcome";
import { Goalherobarlow, Goalheroanton, Goalheroarchivo, Goalherodela, Goalheroslab, Goalherobodoni, Goalherobebas } from "./goalhero";
import { Goalflash } from "./goalflash";
import { Goalrows } from "./goalrows";
import { Goallight } from "./goallight";
import { Goaldots } from "./goaldots";
import { Orbit } from "./orbit";
import { Vertname } from "./vertname";
import { Monoaccent } from "./monoaccent";
import { Timetable } from "./timetable";
import { Twoblock } from "./twoblock";
import { Autograph } from "./autograph";
import { Tonal } from "./tonal";
import { Widetitle } from "./widetitle";
import { Clock } from "./clock";
import { Micro } from "./micro";
import { Filmframe } from "./filmframe";
import { Aura } from "./aura";
import { Backline } from "./backline";
import { Namefield } from "./namefield";
import { Diptych } from "./diptych";
import { Pressphoto } from "./pressphoto";
import { Horizon } from "./horizon";
import { Lockup } from "./lockup";
import { Swiss } from "./swiss";
import { Gallery } from "./gallery";
import { Sidecol } from "./sidecol";
import { Serene } from "./serene";
import { Datefirst } from "./datefirst";
import { Inset } from "./inset";
import { Pride } from "./pride";
import { Playoff } from "./playoff";
import { Slats } from "./slats";
import { Vhs } from "./vhs";
import { Triptych } from "./triptych";
import { Tiles } from "./tiles";
import { Zoomburst } from "./zoomburst";
import { Tagcard } from "./tagcard";
import { Stencil } from "./stencil";
import { Pressstack } from "./pressstack";
import { Pressclip } from "./pressclip";
import { Presshero } from "./presshero";
import { Presswall } from "./presswall";
import { CANVAS_H, type RenderData } from "./types";

type TemplateDef = {
  id: TemplateId;
  label: string;
  /** Post types this look works for, best-suited first in the variant order. */
  fits: PostType[];
  /** Whether the player side / background style visibly change this look (so flipped variants are worth showing). */
  flips?: boolean;
  /** Kind of photo that works best: full body (default) or a head-and-shoulders crop. */
  photo?: "full" | "bust" | "any";
  /** The player stands on something (pitch, floor, board): needs a photo where the feet are visible. */
  feet?: boolean;
  /** Draws the player at a fixed size (collages, cards…): framing crops don't apply. */
  fixedFrame?: boolean;
  /** Draws a native 9:16 Instagram story itself (data.canvasH = 1920) instead of the post over a blurred frame. */
  story?: boolean;
  /** The logo's size and drop on the story when the edit sets none (the spot agreed with the client). */
  storyLogo?: { scale: number; moveY: number };
  /** Enlarges the face a lot (close-ups, eye strips): needs a sharp original photo. */
  magnifies?: boolean;
  /** Loud US "gameday" graphic (college / high-school style): favoured for players at US schools. */
  bold?: boolean;
  Component: (p: { data: RenderData }) => React.ReactElement;
};

/** NEYOD logo on the story as agreed: a fifth bigger, a little lower (Moisés' and Bruno's stories). */
const AGREED_LOGO = { scale: 1.2, moveY: 50 };

const ALL: PostType[] = ["totw", "goal", "result", "matchday", "stats", "potm", "transfer", "renewal"];

// Two literal halves: one array of ~1000 differently-typed entries is more than TypeScript can type-check at once.
const TEMPLATES_A: TemplateDef[] = [
  { id: "spotlight", label: "Spotlight", flips: true, fits: ALL, Component: Spotlight },
  { id: "poster", label: "Poster", flips: true, fits: ALL, Component: Poster },
  { id: "monumental", fixedFrame: true, label: "Nome monumental", fits: ["goal", "potm", "stats", "result", "matchday", "renewal", "transfer"], Component: Monumental },
  { id: "neon", label: "Neon", fits: ["goal", "result", "stats", "potm"], Component: Neon },
  { id: "data", label: "Dados TV", flips: true, fits: ["stats", "potm", "result", "goal", "matchday"], Component: DataSheet },
  { id: "halftone", label: "Retro", flips: true, fits: ["goal", "result", "matchday", "stats"], Component: Halftone },
  { id: "card", fixedFrame: true, label: "Carta FUT", fits: ["potm", "totw", "stats", "result"], Component: Card },
  { id: "announce", label: "É oficial", fits: ["transfer", "renewal"], Component: Announce },
  { id: "editorial", fixedFrame: true, label: "Editorial", photo: "any", fits: ["renewal", "transfer", "potm"], Component: Editorial },
  { id: "fixture", label: "Cartaz de jogo", fits: ["matchday"], Component: Fixture },
  { id: "stretch", fixedFrame: true, label: "Letras altas", fits: ["matchday", "goal", "result", "stats", "potm", "totw"], Component: Stretch },
  { id: "repeat", label: "Repetição", fits: ["goal", "result", "stats", "potm", "matchday"], Component: Repeat },
  { id: "closeup", magnifies: true, fixedFrame: true, label: "Grande plano", flips: true, photo: "any", fits: ["matchday", "goal", "result", "potm", "totw", "transfer", "stats", "renewal"], Component: Closeup },
  { id: "torn", label: "Papel rasgado", flips: true, fits: ["matchday", "totw", "result", "goal", "transfer", "stats", "potm", "renewal"], Component: Torn },
  { id: "brush", fixedFrame: true, label: "Pinceladas", flips: true, fits: ["matchday", "result", "goal", "potm", "stats"], Component: Brush },
  { id: "frame", fixedFrame: true, label: "Moldura", fits: ["matchday", "goal", "result", "stats", "potm"], Component: Frame },
  { id: "city", magnifies: true, label: "Cidade", flips: true, fits: ["result", "goal", "potm", "stats", "matchday", "transfer"], Component: City },
  { id: "portrait", magnifies: true, fixedFrame: true, label: "Retrato", photo: "bust", fits: ["renewal", "transfer", "potm"], Component: Portrait },
  { id: "crests", fixedFrame: true, label: "Só emblemas", photo: "any", fits: ["matchday"], Component: Crests },
  { id: "archive", label: "Arquivo P&B", flips: true, fits: ["matchday", "result", "goal", "potm", "stats", "transfer"], Component: Archive },
  { id: "kaleido", feet: true, fixedFrame: true, label: "Caleidoscópio", fits: ["matchday", "potm", "stats", "result"], Component: Kaleido },
  { id: "sequence", feet: true, fixedFrame: true, label: "Sequência", fits: ["goal", "result", "stats", "potm", "totw"], Component: Sequence },
  { id: "serif", magnifies: true, label: "Serifa", fits: ["goal", "renewal", "result", "potm", "transfer", "totw"], Component: Serif },
  { id: "windows", fixedFrame: true, label: "Janelas", fits: ["matchday", "result", "potm", "transfer", "goal"], Component: Windows },
  { id: "smear", magnifies: true, label: "Rasto", flips: true, photo: "bust", fits: ["transfer", "stats", "potm", "goal", "renewal"], Component: Smear },
  { id: "stamp", fixedFrame: true, label: "Selo", photo: "any", fits: ["matchday", "transfer", "renewal", "potm"], Component: Stamp },
  { id: "skyline", fixedFrame: true, label: "Horizonte", flips: true, fits: ["matchday", "goal", "result", "potm", "transfer", "renewal", "stats"], Component: Skyline },
  { id: "postcard", label: "Postal", fits: ["transfer", "matchday", "potm", "renewal"], Component: Postcard },
  { id: "exposure", fixedFrame: true, label: "Exposição", fits: ["transfer", "renewal", "potm", "stats", "goal"], Component: Exposure },
  { id: "streetposter", fixedFrame: true, label: "Cartaz na cidade", flips: true, fits: ["matchday", "transfer", "result", "goal"], Component: StreetPoster },
  { id: "slices", label: "Tiras", fits: ["matchday", "goal", "result", "potm", "stats", "transfer"], Component: Slices },
  { id: "ticket", fixedFrame: true, label: "Bilhete", fits: ["matchday", "transfer", "renewal"], Component: Ticket },
  { id: "magazine", label: "Capa de revista", fits: ["potm", "result", "renewal", "goal", "stats", "transfer"], Component: Magazine },
  { id: "riso", fixedFrame: true, label: "Risografia", flips: true, fits: ["goal", "result", "potm", "stats", "matchday"], Component: Riso },
  { id: "tactics", feet: true, fixedFrame: true, label: "Prancheta", fits: ["goal", "totw", "result", "matchday"], Component: Tactics },
  { id: "programme", fixedFrame: true, label: "Programa oficial", fits: ["matchday", "result"], Component: Programme },
  { id: "infographic", fixedFrame: true, label: "Infografia", fits: ["stats", "potm"], Component: Infographic },
  { id: "calendar", fixedFrame: true, label: "Calendário", fits: ["potm", "stats"], Component: Calendar },
  { id: "rising", fixedFrame: true, label: "Sol nascente", fits: ["goal", "potm", "renewal", "matchday", "result", "transfer"], Component: Rising },
  { id: "steps", fixedFrame: true, label: "Degraus", flips: true, fits: ["result", "transfer", "renewal", "potm", "goal"], Component: Steps },
  { id: "pitch", feet: true, fixedFrame: true, label: "Relvado", fits: ["matchday", "result"], Component: Pitch },
  { id: "floor", feet: true, fixedFrame: true, label: "Chão", fits: ["matchday", "goal"], Component: Floor },
  { id: "cinematic", label: "Cinemático", flips: true, fits: ["matchday", "result", "goal", "potm", "transfer", "renewal"], Component: Cinematic },
  { id: "panels", fixedFrame: true, label: "Painéis", photo: "any", fits: ["matchday", "result", "potm", "transfer", "renewal"], Component: Panels },
  { id: "checker", feet: true, fixedFrame: true, label: "Tabuleiro", fits: ["matchday", "potm", "stats", "result"], Component: Checker },
  { id: "gothic", fixedFrame: true, label: "Gótico", fits: ["matchday", "goal", "result", "potm"], Component: Gothic },
  { id: "speed", label: "Velocidade", fits: ["matchday", "goal", "result", "potm", "transfer"], Component: Speed },
  { id: "doodle", fixedFrame: true, label: "Rabisco", photo: "any", fits: ["matchday"], Component: Doodle },
  { id: "memory", magnifies: true, fixedFrame: true, label: "Memória", fits: ["matchday", "potm", "transfer", "renewal", "result"], Component: Memory },
  { id: "waves", fixedFrame: true, label: "Ondas", fits: ["potm", "stats", "renewal", "transfer", "goal"], Component: Waves },
  { id: "halo", label: "Emblema halo", fits: ["matchday", "potm", "stats", "transfer", "renewal"], Component: Halo },
  { id: "burst", label: "Explosão", fits: ["matchday", "goal", "result"], Component: Burst },
  { id: "comic", fixedFrame: true, label: "Banda desenhada", fits: ["goal", "result", "potm"], Component: Comic },
  { id: "sticker", fixedFrame: true, label: "Autocolante", fits: ["potm", "transfer", "goal", "renewal"], Component: Sticker },
  { id: "gaze", magnifies: true, fixedFrame: true, label: "Olhar", photo: "any", fits: ["matchday", "potm", "renewal", "transfer"], Component: Gaze },
  { id: "scorecol", fixedFrame: true, label: "Coluna de resultado", photo: "any", fits: ["result", "goal"], Component: ScoreCol },
  { id: "shield", fixedFrame: true, photo: "any", label: "Escudo", fits: ["matchday", "potm", "transfer", "renewal", "goal", "stats"], Component: Shield },
  { id: "jersey", flips: true, label: "Número gigante", fits: ["goal", "potm", "stats", "renewal", "matchday", "result"], Component: Jersey },
  { id: "sideword", fixedFrame: true, photo: "any", label: "Palavra vertical", fits: ["goal", "potm", "result", "renewal", "transfer", "stats"], Component: Sideword },
  { id: "duel", fixedFrame: true, label: "Duelo", fits: ["matchday", "result"], Component: Duel },
  { id: "syllables", flips: true, label: "Sílabas", fits: ["matchday", "goal", "potm", "stats", "transfer"], Component: Syllables },
  { id: "gilded", fixedFrame: true, photo: "any", label: "Dourado", fits: ["goal", "result", "potm", "stats", "renewal"], Component: Gilded },
  { id: "roundel", fixedFrame: true, label: "Carimbo circular", fits: ["matchday", "result", "goal"], Component: Roundel },
  { id: "arch", fixedFrame: true, label: "Arco", photo: "any", fits: ["transfer", "renewal", "matchday", "potm"], Component: Arch },
  { id: "silhouette", feet: true, fixedFrame: true, flips: true, label: "Silhueta", fits: ["matchday", "potm", "transfer", "renewal", "result"], Component: Silhouette },
  { id: "paperlight", label: "Papel claro", fits: ["matchday", "goal", "result", "potm", "stats", "transfer", "renewal", "totw"], Component: PaperLight },
  { id: "script", label: "Manuscrito", fits: ["matchday", "goal", "result", "potm", "stats", "transfer", "renewal"], Component: Script },
  { id: "mono", flips: true, label: "Monocromático", fits: ["matchday", "goal", "result", "potm", "stats", "transfer", "renewal", "totw"], Component: Mono },
  { id: "window", magnifies: true, fixedFrame: true, photo: "any", label: "Número janela", fits: ["matchday", "potm", "stats", "transfer", "renewal", "goal", "result", "totw"], Component: Window },
  { id: "matchserif", magnifies: true, fixedFrame: true, photo: "any", label: "Serifa matchday", fits: ["matchday", "result", "potm", "renewal", "transfer"], Component: MatchSerif },
  { id: "scoreline", flips: true, label: "Resultado editorial", fits: ["result", "goal", "matchday", "potm", "totw"], Component: Scoreline },
  { id: "broadcast", label: "Transmissão", fits: ["result", "goal", "matchday", "stats", "potm", "totw"], Component: Broadcast },
  { id: "simple", label: "Simples", fits: ["matchday", "result", "goal", "stats", "potm", "totw", "transfer", "renewal"], Component: Simple },
  // From the 2026-09-21 references (Fulltime outline, Nice birthday, Cajuns / UNC / Illini / Sooners gameday, Arsenal MOTM / debut, Brentford welcome, Commanders strip, Bellingham matchday).
  { id: "outline", flips: true, label: "Contorno", fits: ["result", "goal", "matchday", "potm"], Component: Outline },
  { id: "ghost", magnifies: true, flips: true, label: "Retrato fantasma", fits: ["potm", "transfer", "renewal", "goal", "stats", "matchday"], Component: Ghost },
  { id: "gameday", flips: true, label: "Letras gigantes", fits: ["matchday", "result", "goal"], Component: Gameday },
  { id: "sky", label: "Céu", fits: ["matchday", "goal", "potm", "renewal", "transfer"], Component: Sky },
  { id: "mist", feet: true, label: "Névoa", fits: ["matchday", "transfer", "renewal", "potm", "result"], Component: Mist },
  { id: "headline", flips: true, label: "Manchete", fits: ["matchday", "potm", "stats", "goal", "result", "renewal"], Component: Headline },
  { id: "collage", magnifies: true, fixedFrame: true, photo: "any", label: "Colagem", fits: ["potm", "goal", "result", "stats", "transfer"], Component: Collage },
  { id: "debut", label: "Meio a meio", fits: ["transfer", "renewal", "potm", "matchday", "goal"], Component: Debut },
  { id: "bokeh", label: "Luzes", fits: ["transfer", "renewal", "potm", "matchday"], Component: Bokeh },
  { id: "strip", fixedFrame: true, label: "Faixa", fits: ["stats", "potm", "matchday", "result", "goal"], Component: Strip },
  { id: "glow", flips: true, label: "Brilho", fits: ["matchday", "result", "goal", "potm"], Component: Glow },
  // From the second 2026-09-21 batch (United dispersion, Mbappé sepia, Foden notes, Greenwood crest, Ohio State up next, Forest POTM, Kings numbers, MVP, Bruno letters, Chelsea backlit, CJ Stroud, Semenyo 50, United "match day.", CWC round of 16, Celtics gameday).
  { id: "dispersion", magnifies: true, fixedFrame: true, photo: "any", label: "Dispersão", fits: ["matchday", "result", "potm", "goal"], Component: Dispersion },
  { id: "sepia", flips: true, label: "Sépia", fits: ["goal", "result", "potm", "stats"], Component: Sepia },
  { id: "notes", feet: true, label: "Anotações", fits: ["goal", "potm", "stats", "transfer", "renewal"], Component: Notes },
  { id: "crestmark", feet: true, label: "Emblema grande", fits: ["goal", "result", "potm", "stats", "matchday"], Component: Crestmark },
  { id: "upnext", magnifies: true, fixedFrame: true, photo: "any", label: "Próximos jogos", fits: ["matchday"], Component: Upnext },
  { id: "caption", label: "Legenda", fits: ["potm", "goal", "result", "matchday", "renewal", "transfer"], Component: Caption },
  { id: "numbers", fixedFrame: true, photo: "any", label: "Números", fits: ["stats", "potm", "result", "goal"], Component: Numbers },
  { id: "award", fixedFrame: true, photo: "any", label: "Prémio", fits: ["potm", "totw", "renewal", "stats"], Component: Award },
  { id: "cutletters", magnifies: true, fixedFrame: true, photo: "any", label: "Letras recortadas", fits: ["potm", "transfer", "renewal", "matchday", "goal"], Component: Cutletters },
  { id: "backlit", magnifies: true, fixedFrame: true, photo: "any", label: "Contraluz", fits: ["matchday", "transfer", "renewal", "potm"], Component: Backlit },
  { id: "twoscale", magnifies: true, label: "Dois tamanhos", fits: ["potm", "stats", "goal", "renewal", "transfer"], Component: Twoscale },
  { id: "bignumber", label: "Número grande", fits: ["stats", "potm", "goal", "result", "renewal"], Component: Bignumber },
  { id: "brushday", label: "Pincel editorial", fits: ["matchday", "result", "goal"], Component: Brushday },
  { id: "motion", story: true, label: "Movimento", fits: ["matchday", "result", "goal"], Component: Motion },
  { id: "studio", label: "Estúdio", fits: ["matchday", "result", "potm", "transfer", "renewal"], Component: Studio },
  // Third 2026-09-21 batch (Swansea wall, Fulham graffiti, Albacete damask, Sheffield diagonal, Wolves v Newcastle, Wolfsburg chrome, Palace tape, Arsenal night, Griezmann strokes, Dybala, Feyenoord, Bruno stat boxes, Doué column, Dalot 20, Dayton #2, Dortmund swoosh, City tilted, Saka, Rogers, Atleti face).
  { id: "wall", label: "Parede", fits: ["matchday", "result", "potm", "goal"], Component: Wall },
  { id: "graffiti", feet: true, label: "Grafíti", fits: ["matchday", "goal", "result"], Component: Graffiti },
  { id: "damask", feet: true, label: "Damasco", fits: ["matchday", "result", "goal"], Component: Damask },
  { id: "diagonal", feet: true, label: "Diagonal", fits: ["matchday", "result", "goal"], Component: Diagonal },
  { id: "versus", magnifies: true, fixedFrame: true, photo: "any", label: "Versus", fits: ["matchday", "result"], Component: Versus },
  { id: "chrome", label: "Cromado", fits: ["matchday", "result", "goal", "potm"], Component: Chrome },
  { id: "tape", magnifies: true, fixedFrame: true, photo: "any", label: "Recortes de papel", fits: ["matchday", "result", "potm", "transfer"], Component: Tape },
  { id: "night", feet: true, label: "Noite europeia", fits: ["matchday", "result", "goal"], Component: Night },
  { id: "strokes", label: "Traços", fits: ["potm", "stats", "goal", "transfer", "renewal", "matchday"], Component: Strokes },
  { id: "tallname", label: "Cartaz vertical", fits: ["potm", "stats", "transfer", "renewal", "goal", "matchday"], Component: Tallname },
  { id: "breakout", feet: true, label: "Fora da moldura", fits: ["matchday", "result", "goal", "potm"], Component: Breakout },
  { id: "statboxes", label: "Caixas de números", fits: ["stats", "potm", "result", "goal", "matchday"], Component: Statboxes },
  { id: "column", feet: true, label: "Coluna", fits: ["stats", "potm", "transfer", "renewal", "matchday"], Component: Column },
  { id: "splitnumber", feet: true, label: "Número dividido", fits: ["potm", "stats", "renewal", "transfer", "matchday"], Component: Splitnumber },
  { id: "notebook", feet: true, label: "Caderno", fits: ["stats", "potm", "goal", "totw", "matchday"], Component: Notebook },
  { id: "swoosh", feet: true, label: "Curva", fits: ["transfer", "renewal", "potm", "stats", "matchday"], Component: Swoosh },
  { id: "tilt", story: true, label: "Inclinado", fits: ["matchday", "goal", "result"], Component: Tilt },
  { id: "backpanel", label: "Costas", fits: ["potm", "stats", "renewal", "transfer", "matchday"], Component: Backpanel },
  { id: "blurduo", magnifies: true, fixedFrame: true, photo: "any", label: "Retrato em movimento", fits: ["potm", "transfer", "renewal", "matchday"], Component: Blurduo },
  { id: "faceday", magnifies: true, fixedFrame: true, photo: "any", label: "Rosto e título", fits: ["matchday", "result", "potm", "transfer"], Component: Faceday },
  // Fourth 2026-09-22 batch (Monaco arc, Chelsea tunnel, Charlotte VAMOS, Gladbach side band, Chelsea crest band, Celtic pillar, City GOAL grid, Düsseldorf glow, Beşiktaş grey, Oranje triangles, Liverbird, Flamengo reflection, Villa minimal, United v Leipzig, Clemson print).
  { id: "arc", feet: true, label: "Arco branco", fits: ["matchday", "result", "goal", "potm"], Component: Arc },
  { id: "tunnel", magnifies: true, fixedFrame: true, photo: "any", label: "Túnel", fits: ["matchday", "result", "potm"], Component: Tunnel },
  { id: "cheer", feet: true, label: "Grito", fits: ["goal", "matchday", "result", "potm", "stats"], Component: Cheer },
  { id: "sideband", story: true, feet: true, label: "Faixa lateral", fits: ["matchday", "result", "goal", "potm"], Component: Sideband },
  { id: "band", feet: true, label: "Banda do emblema", fits: ["matchday", "potm", "stats", "transfer", "renewal", "goal"], Component: Band },
  { id: "pillar", story: true, feet: true, label: "Pilar", fits: ["matchday", "result", "goal", "potm"], Component: Pillar },
  { id: "blueprint", magnifies: true, fixedFrame: true, photo: "any", label: "Grelha", fits: ["goal", "matchday", "potm", "result", "transfer"], Component: Blueprint },
  { id: "glowline", feet: true, label: "Contorno de luz", fits: ["matchday", "result", "potm", "renewal"], Component: Glowline },
  { id: "greyday", feet: true, label: "Cinzento e script", fits: ["matchday", "result", "goal"], Component: Greyday },
  { id: "triangles", magnifies: true, fixedFrame: true, photo: "any", label: "Triângulos", fits: ["stats", "potm", "matchday", "transfer", "renewal"], Component: Triangles },
  { id: "emblemart", label: "Emblema pintado", fits: ["matchday", "result", "potm", "goal"], Component: Emblemart },
  { id: "reflect", feet: true, label: "Reflexo", fits: ["matchday", "result", "goal", "transfer"], Component: Reflect },
  { id: "minimal", feet: true, label: "Minimalista", fits: ["goal", "potm", "matchday", "result", "renewal", "transfer"], Component: Minimal },
  { id: "profile", magnifies: true, fixedFrame: true, photo: "any", label: "Perfil", fits: ["matchday", "result", "potm"], Component: Profile },
  { id: "screenprint", label: "Serigrafia", fits: ["matchday", "goal", "result", "potm"], Component: Screenprint },
  // Fifth batch (Carolina big head, Chelsea swirls, Santos split, Gladbach outline, Vitória selective colour, Seongnam dots, Ludogorets rough name, Atlético-MG box, Santos condensed, Barça shards, Bahia club name, St. Gallen curved panel).
  { id: "bighead", label: "Cabeça gigante", fits: ["matchday", "result", "goal", "potm"], Component: Bighead },
  { id: "swirl", label: "Ondas do clube", fits: ["matchday", "result", "goal", "potm"], Component: Swirl },
  { id: "splitbw", feet: true, label: "Preto e branco", fits: ["matchday", "result", "goal"], Component: Splitbw },
  { id: "hollow", feet: true, label: "Letras vazadas", fits: ["matchday", "result", "goal"], Component: Hollow },
  { id: "selective", story: true, feet: true, label: "Cor seletiva", fits: ["matchday", "result", "goal", "potm"], Component: Selective },
  { id: "dotscript", feet: true, label: "Pontos e assinatura", fits: ["matchday", "result", "goal"], Component: Dotscript },
  { id: "roughname", feet: true, label: "Nome áspero", fits: ["matchday", "result", "goal", "potm"], Component: Roughname },
  { id: "infobox", label: "Caixa de jogo", fits: ["matchday", "result", "goal"], Component: Infobox },
  { id: "condensed", feet: true, label: "Letras estreitas", fits: ["matchday", "result", "goal"], Component: Condensed },
  { id: "shards", magnifies: true, fixedFrame: true, photo: "any", label: "Estilhaços", fits: ["matchday", "result", "goal", "potm"], Component: Shards },
  { id: "clubname", feet: true, label: "Nome do clube", fits: ["matchday", "result", "goal"], Component: Clubname },
  { id: "curvepanel", feet: true, label: "Painel curvo", fits: ["matchday", "result", "goal", "potm"], Component: Curvepanel },
  // Sixth batch (Pohang faint crest, Oyarzabal paper cut, Isak petals, Rogers gradient, Meyer ring, Greenwood glass card, Lallana box, Nacional soft glow, Malmö motion blur).
  { id: "emblemfade", story: true, feet: true, label: "Emblema suave", fits: ["matchday", "result", "goal"], Component: Emblemfade },
  { id: "cutpaper", story: true, label: "Recorte P&B", fits: ["matchday", "goal", "potm", "result", "stats"], Component: Cutpaper },
  { id: "petals", label: "Pétalas", fits: ["matchday", "potm", "goal", "transfer", "renewal"], Component: Petals },
  { id: "gradient", feet: true, label: "Degradê e minutos", fits: ["goal", "result", "matchday", "stats"], Component: Gradient },
  { id: "ring", feet: true, label: "Anel", fits: ["matchday", "potm", "stats", "renewal", "transfer"], Component: Ring },
  { id: "glass", label: "Vidro", fits: ["stats", "potm", "goal", "result", "matchday"], Component: Glass },
  { id: "boxtitle", label: "Moldura e reflexo", fits: ["matchday", "result", "goal"], Component: Boxtitle },
  { id: "softglow", feet: true, label: "Brilho suave", fits: ["matchday", "result", "goal"], Component: Softglow },
  { id: "blurrun", story: true, label: "Corrida desfocada", fits: ["matchday", "result", "goal", "speed"], Component: Blurrun },
  // Seventh batch (Real Madrid next match, Arsenal red grain, Barça half-outline, Estêvão stats serif, Brest sepia).
  { id: "nextmatch", magnifies: true, fixedFrame: true, photo: "any", label: "Próximo jogo", fits: ["matchday", "result", "potm"], Component: Nextmatch },
  { id: "redgrain", magnifies: true, fixedFrame: true, photo: "any", label: "Grão vermelho", fits: ["matchday", "goal", "result"], Component: Redgrain },
  { id: "halfline", magnifies: true, fixedFrame: true, photo: "any", label: "Metade vazada", fits: ["matchday", "result", "goal"], Component: Halfline },
  { id: "topspeed", label: "Recorde de velocidade", flips: true, fits: ["speed"], Component: Topspeed },
  { id: "statserif", feet: true, label: "Serifa e números", fits: ["stats", "potm", "matchday", "result", "goal"], Component: Statserif },
  { id: "sepiaday", magnifies: true, fixedFrame: true, photo: "any", label: "Sépia dourado", fits: ["matchday", "result", "potm", "renewal"], Component: Sepiaday },
  { id: "colorblock", flips: true, feet: true, photo: "full", label: "Bloco de cor", fits: ["matchday", "result", "goal", "potm"], Component: Colorblock },
  { id: "cover", flips: true, magnifies: true, photo: "any", label: "Capa serifada", fits: ["matchday", "result", "potm", "renewal", "transfer"], Component: Cover },
  { id: "panelscript", flips: true, label: "Painel e assinatura", fits: ["matchday", "result", "goal", "potm"], Component: Panelscript },
  { id: "pride", magnifies: true, fixedFrame: true, flips: true, photo: "any", label: "Retrato emoldurado", fits: ["matchday", "result", "potm", "renewal"], Component: Pride },
  { id: "playoff", flips: true, label: "Fotocópia playoff", fits: ["matchday", "result", "goal", "potm"], Component: Playoff },
  { id: "slats", flips: true, label: "Tiras inclinadas", fits: ["matchday", "result", "goal", "potm"], Component: Slats },
  { id: "vhs", flips: true, label: "Cassete VHS", fits: ["matchday", "result", "goal", "potm"], Component: Vhs },
  { id: "triptych", fixedFrame: true, photo: "any", label: "Tríptico", fits: ["matchday", "result", "potm", "renewal"], Component: Triptych },
  { id: "tiles", flips: true, label: "Mosaico", fits: ["matchday", "result", "goal", "potm"], Component: Tiles },
  { id: "zoomburst", story: true, flips: true, label: "Zoom radial", fits: ["matchday", "result", "goal", "potm"], Component: Zoomburst },
  { id: "tagcard", flips: true, label: "Cartão e graffiti", fits: ["matchday", "result", "goal", "potm"], Component: Tagcard },
  { id: "stencil", flips: true, label: "Stencil", fits: ["matchday", "result", "goal", "potm"], Component: Stencil },
  { id: "swiss", story: true, flips: true, label: "Grelha suíça", fits: ["matchday", "result", "goal", "potm"], Component: Swiss },
  { id: "gallery", story: true, label: "Galeria", fits: ["matchday", "result", "goal", "potm", "renewal"], Component: Gallery },
  { id: "sidecol", story: true, flips: true, label: "Coluna lateral", fits: ["matchday", "result", "goal", "potm"], Component: Sidecol },
  { id: "serene", story: true, label: "Sereno", fits: ["matchday", "result", "goal", "potm", "renewal"], Component: Serene },
  { id: "datefirst", story: true, flips: true, label: "Data em destaque", fits: ["matchday", "result"], Component: Datefirst },
  { id: "inset", story: true, label: "Moldura fina", fits: ["matchday", "result", "goal", "potm", "renewal"], Component: Inset },
  { id: "micro", story: true, flips: true, label: "Micrográficos", fits: ["matchday", "result", "goal", "potm"], Component: Micro },
  { id: "filmframe", photo: "any", label: "Fotograma", fits: ["matchday", "result", "goal", "potm", "renewal"], Component: Filmframe },
  { id: "aura", story: true, photo: "any", label: "Aura", fits: ["matchday", "result", "goal", "potm", "renewal"], Component: Aura },
  { id: "backline", story: true, label: "De costas", fits: ["matchday", "result", "potm", "renewal"], Component: Backline },
  { id: "namefield", story: true, photo: "bust", label: "Nome de fundo", fits: ["matchday", "result", "potm", "renewal"], Component: Namefield },
  { id: "diptych", fixedFrame: true, photo: "any", label: "Díptico", fits: ["matchday", "result", "potm", "renewal"], Component: Diptych },
  { id: "pressphoto", photo: "any", label: "Foto de imprensa", fits: ["matchday", "result", "goal", "potm"], Component: Pressphoto },
  { id: "horizon", story: true, feet: true, flips: true, label: "Horizonte", fits: ["matchday", "result", "potm"], Component: Horizon },
  { id: "lockup", story: true, label: "Assinatura central", fits: ["matchday", "result", "goal", "potm", "renewal"], Component: Lockup },
  { id: "orbit", story: true, photo: "any", label: "Órbita", fits: ["matchday", "result", "goal", "potm", "renewal"], Component: Orbit },
  { id: "vertname", story: true, flips: true, label: "Nome vertical", fits: ["matchday", "result", "goal", "potm", "renewal"], Component: Vertname },
  { id: "monoaccent", story: true, photo: "any", flips: true, label: "Preto e branco com cor", fits: ["matchday", "result", "goal", "potm", "renewal"], Component: Monoaccent },
  { id: "timetable", story: true, flips: true, label: "Horário", fits: ["matchday", "result"], Component: Timetable },
  { id: "twoblock", flips: true, label: "Dois blocos", fits: ["matchday", "result", "goal", "potm"], Component: Twoblock },
  { id: "autograph", photo: "any", label: "Autógrafo", fits: ["matchday", "result", "potm", "renewal"], Component: Autograph },
  { id: "tonal", story: true, photo: "any", label: "Monocromático", fits: ["matchday", "result", "goal", "potm", "renewal"], Component: Tonal },
  { id: "widetitle", story: true, photo: "any", label: "Título largo", fits: ["matchday", "result", "goal", "potm"], Component: Widetitle },
  { id: "clock", photo: "any", label: "Relógio", fits: ["matchday"], Component: Clock },
  { id: "goalwide", photo: "any", label: "Golo largo", fits: ["goal"], Component: Goalwide },
  { id: "goalscore", story: true, photo: "any", label: "Marcador", fits: ["goal"], Component: Goalscore },
  { id: "goalnet", story: true, photo: "any", label: "Rede", fits: ["goal"], Component: Goalnet },
  { id: "goalbug", story: true, photo: "any", label: "Televisão", fits: ["goal"], Component: Goalbug },
  { id: "goalserene", story: true, photo: "any", label: "Golo sereno", fits: ["goal"], Component: Goalserene },
  { id: "goalflash", story: true, photo: "any", label: "Flash", fits: ["goal"], Component: Goalflash },
  { id: "goalrows", story: true, photo: "any", label: "Linhas de golo", fits: ["goal"], Component: Goalrows },
  { id: "goallight", story: true, photo: "any", label: "Luz de golo", fits: ["goal"], Component: Goallight },
  { id: "goaldots", story: true, photo: "any", label: "Contagem", fits: ["goal"], Component: Goaldots },
  { id: "crestline", story: true, photo: "any", label: "Linha dos emblemas", fits: ["matchday", "result"], Component: Crestline },
  { id: "stage", story: true, feet: true, fixedFrame: true, label: "Palco", fits: ["matchday", "result", "potm"], Component: Stage },
  { id: "edgebar", story: true, flips: true, label: "Barra lateral", fits: ["matchday", "result", "potm"], Component: Edgebar },
  { id: "monogram", story: true, photo: "any", label: "Monograma", fits: ["matchday", "result", "potm", "renewal"], Component: Monogram },
  { id: "thirds", story: true, flips: true, label: "Terços", fits: ["matchday", "result"], Component: Thirds },
  { id: "stub", story: true, label: "Bilhete", fits: ["matchday"], Component: Stub },
  { id: "goalmono", story: true, photo: "any", flips: true, label: "Golo a preto e branco", fits: ["goal"], Component: Goalmono },
  { id: "goaltonal", story: true, photo: "any", label: "Golo monocromático", fits: ["goal"], Component: Goaltonal },
  { id: "goalvert", story: true, flips: true, label: "Golo vertical", fits: ["goal"], Component: Goalvert },
  { id: "footnote", story: true, flips: true, label: "Notas de rodapé", fits: ["matchday", "result"], Component: Footnote },
  { id: "echoline", story: true, photo: "any", flips: true, label: "Contorno eco", fits: ["matchday", "result", "potm"], Component: Echoline },
  { id: "pills", story: true, photo: "any", label: "Etiquetas", fits: ["matchday", "result"], Component: Pills },
  { id: "corner", story: true, flips: true, label: "Canto", fits: ["matchday", "result", "potm"], Component: Corner },
  { id: "shadow", story: true, feet: true, flips: true, label: "Sombra longa", fits: ["matchday", "result"], Component: Shadow },
  { id: "goalecho", story: true, photo: "any", flips: true, label: "Golo em eco", fits: ["goal"], Component: Goalecho },
  { id: "goalcircle", story: true, photo: "any", label: "Golo com sol", fits: ["goal"], Component: Goalcircle },
  { id: "goalcrop", story: true, photo: "any", flips: true, label: "Golo de perto", fits: ["goal"], Component: Goalcrop },
  { id: "goalbar", story: true, photo: "any", label: "Barra de golo", fits: ["goal"], Component: Goalbar },
  { id: "goalnumber", story: true, photo: "any", label: "Número do golo", fits: ["goal"], Component: Goalnumber },
  { id: "seal", story: true, label: "Selo", fits: ["matchday"], Component: Seal },
  { id: "fixtureboard", story: true, photo: "any", label: "Quadro do jogo", fits: ["matchday"], Component: Fixtureboard },
  { id: "lowerthird", story: true, flips: true, label: "Barra de TV", fits: ["matchday"], Component: Lowerthird },
  { id: "fixturelist", story: true, flips: true, label: "Próximos jogos", fits: ["matchday"], Component: Fixturelist },
  { id: "dotgrid", story: true, photo: "any", flips: true, label: "Grelha de pontos", fits: ["matchday", "result"], Component: Dotgrid },
  { id: "goalticker", story: true, photo: "any", label: "Golo em fita", fits: ["goal"], Component: Goalticker },
  { id: "goalaura", story: true, photo: "any", label: "Golo aura", fits: ["goal"], Component: Goalaura },
  { id: "goalinset", story: true, photo: "any", label: "Golo moldura", fits: ["goal"], Component: Goalinset },
  { id: "goalswiss", story: true, flips: true, label: "Golo suíço", fits: ["goal"], Component: Goalswiss },
  { id: "goalorbit", story: true, photo: "any", label: "Golo órbita", fits: ["goal"], Component: Goalorbit },
  { id: "namecorners", story: true, flips: true, label: "Nome nos cantos", fits: ["matchday"], Component: Namecorners },
  { id: "pinstripe", story: true, photo: "any", label: "Riscas finas", fits: ["matchday"], Component: Pinstripe },
  { id: "crestpair", story: true, photo: "any", label: "Emblemas a par", fits: ["matchday"], Component: Crestpair },
  { id: "datecard", story: true, flips: true, label: "Cartão de data", fits: ["matchday"], Component: Datecard },
  { id: "frostband", story: true, photo: "any", label: "Faixa fosca", fits: ["matchday", "result"], Component: Frostband },
  { id: "goalsidecol", story: true, flips: true, label: "Golo coluna", fits: ["goal"], Component: Goalsidecol },
  { id: "goalgallery", story: true, photo: "any", label: "Golo galeria", fits: ["goal"], Component: Goalgallery },
  { id: "goallockup", story: true, photo: "any", label: "Golo assinatura central", fits: ["goal"], Component: Goallockup },
  { id: "goalboard", story: true, flips: true, label: "Golo em painel", fits: ["goal"], Component: Goalboard },
  { id: "goalname", story: true, photo: "any", label: "Golo nome de fundo", fits: ["goal"], Component: Goalname },
  { id: "offsetshadow", story: true, flips: true, label: "Sombra deslocada", fits: ["matchday"], Component: Offsetshadow },
  { id: "kickoff", story: true, photo: "any", label: "Hora do jogo", fits: ["matchday"], Component: Kickoff },
  { id: "pitchlines", story: true, photo: "any", label: "Linhas do campo", fits: ["matchday", "result"], Component: Pitchlines },
  { id: "sunrise", story: true, photo: "any", label: "Nascer do sol", fits: ["matchday"], Component: Sunrise },
  { id: "contour", story: true, photo: "any", label: "Curvas de nível", fits: ["matchday"], Component: Contour },
  { id: "goalhorizon", story: true, feet: true, flips: true, label: "Golo horizonte", fits: ["goal"], Component: Goalhorizon },
  { id: "goalmicro", story: true, flips: true, label: "Golo micrográficos", fits: ["goal"], Component: Goalmicro },
  { id: "goalmonogram", story: true, photo: "any", label: "Golo monograma", fits: ["goal"], Component: Goalmonogram },
  { id: "goalstage", story: true, photo: "any", label: "Golo palco", fits: ["goal"], Component: Goalstage },
  { id: "goaloffset", story: true, flips: true, label: "Golo sombra", fits: ["goal"], Component: Goaloffset },
  { id: "medallion", story: true, photo: "any", label: "Medalhão", fits: ["matchday"], Component: Medallion },
  { id: "matchbar", story: true, flips: true, label: "Barra da jornada", fits: ["matchday"], Component: Matchbar },
  { id: "ringlight", story: true, photo: "any", label: "Anel de luz", fits: ["matchday"], Component: Ringlight },
  { id: "widescreen", story: true, photo: "any", label: "Ecrã panorâmico", fits: ["matchday", "result"], Component: Widescreen },
  { id: "underline", story: true, flips: true, label: "Sublinhado", fits: ["matchday"], Component: Underline },
  { id: "goalringlight", story: true, photo: "any", label: "Golo anel de luz", fits: ["goal"], Component: Goalringlight },
  { id: "goalmedallion", story: true, photo: "any", label: "Golo medalhão", fits: ["goal"], Component: Goalmedallion },
  { id: "goalunderline", story: true, flips: true, label: "Golo sublinhado", fits: ["goal"], Component: Goalunderline },
  { id: "goalwidescreen", story: true, photo: "any", label: "Golo panorâmico", fits: ["goal"], Component: Goalwidescreen },
  { id: "goalcrestpair", story: true, photo: "any", label: "Golo emblemas a par", fits: ["goal"], Component: Goalcrestpair },
  { id: "paperechodate", story: true, flips: true, label: "Papel eco com data", fits: ["matchday"], Component: Paperechodate },
  { id: "paperechotime", story: true, flips: true, label: "Papel eco com hora", fits: ["matchday"], Component: Paperechotime },
  { id: "paperechoname", story: true, flips: true, label: "Papel eco com apelido", fits: ["matchday"], Component: Paperechoname },
  { id: "paperechoserif", story: true, flips: true, label: "Papel eco com serifa", fits: ["matchday"], Component: Paperechoserif },
  { id: "paperechowide", story: true, photo: "any", label: "Papel eco com título largo", fits: ["matchday"], Component: Paperechowide },
  { id: "goalpaperechoname", story: true, flips: true, label: "Golo papel eco com apelido", fits: ["goal"], Component: Goalpaperechoname },
  { id: "goalpaperechoserif", story: true, flips: true, label: "Golo papel eco com serifa", fits: ["goal"], Component: Goalpaperechoserif },
  { id: "goalpaperechowide", story: true, photo: "any", label: "Golo papel eco com título largo", fits: ["goal"], Component: Goalpaperechowide },
  { id: "goalpaperechovert", story: true, flips: true, label: "Golo papel eco com nome vertical", fits: ["goal"], Component: Goalpaperechovert },
  { id: "goalpaperechobar", story: true, flips: true, label: "Golo papel eco com barra", fits: ["goal"], Component: Goalpaperechobar },
  { id: "echomicro", story: true, flips: true, label: "Eco micro", fits: ["matchday"], Component: Echomicro },
  { id: "echoaura", story: true, photo: "any", label: "Eco com aura", fits: ["matchday"], Component: Echoaura },
  { id: "echobackline", story: true, flips: true, label: "Eco com linha de fundo", fits: ["matchday"], Component: Echobackline },
  { id: "echonamefield", story: true, flips: true, label: "Eco com campo de nome", fits: ["matchday"], Component: Echonamefield },
  { id: "echozoom", story: true, photo: "any", label: "Eco com zoom", fits: ["matchday"], Component: Echozoom },
  { id: "goalechoaura", story: true, photo: "any", label: "Golo eco com aura", fits: ["goal"], Component: Goalechoaura },
  { id: "goalechobackline", story: true, flips: true, label: "Golo eco com linha de fundo", fits: ["goal"], Component: Goalechobackline },
  { id: "goalechonamefield", story: true, flips: true, label: "Golo eco com campo de nome", fits: ["goal"], Component: Goalechonamefield },
  { id: "goalechozoom", story: true, photo: "any", label: "Golo eco com zoom", fits: ["goal"], Component: Goalechozoom },
  { id: "goalechovert", story: true, flips: true, label: "Golo eco com nome vertical", fits: ["goal"], Component: Goalechovert },
  { id: "echoinset", story: true, flips: true, label: "Eco com moldura", fits: ["matchday"], Component: Echoinset },
  { id: "echogallery", story: true, flips: true, label: "Eco galeria", fits: ["matchday"], Component: Echogallery },
  { id: "echosidecol", story: true, flips: true, label: "Eco com coluna", fits: ["matchday"], Component: Echosidecol },
  { id: "echohorizon", story: true, photo: "any", label: "Eco com horizonte", fits: ["matchday"], Component: Echohorizon },
  { id: "echowidetitle", story: true, photo: "any", label: "Eco com título largo", fits: ["matchday"], Component: Echowidetitle },
  { id: "goalechobug", story: true, flips: true, label: "Golo eco com selo", fits: ["goal"], Component: Goalechobug },
  { id: "goalechoserene", story: true, flips: true, label: "Golo eco sereno", fits: ["goal"], Component: Goalechoserene },
  { id: "goalechohorizon", story: true, photo: "any", label: "Golo eco com horizonte", fits: ["goal"], Component: Goalechohorizon },
  { id: "goalechowide", story: true, photo: "any", label: "Golo eco com título largo", fits: ["goal"], Component: Goalechowide },
  { id: "goalechotonal", story: true, flips: true, label: "Golo eco tonal", fits: ["goal"], Component: Goalechotonal },
  { id: "echoswiss", story: true, flips: true, label: "Eco suíço", fits: ["matchday"], Component: Echoswiss },
  { id: "echoserif", story: true, flips: true, label: "Eco com serifa", fits: ["matchday"], Component: Echoserif },
  { id: "echotable", story: true, flips: true, label: "Eco com tabela", fits: ["matchday"], Component: Echotable },
  { id: "echoorbit", story: true, photo: "any", label: "Eco com órbita", fits: ["matchday"], Component: Echoorbit },
  { id: "echolockup", story: true, flips: true, label: "Eco com bloco", fits: ["matchday"], Component: Echolockup },
  { id: "goalechoswiss", story: true, flips: true, label: "Golo eco suíço", fits: ["goal"], Component: Goalechoswiss },
  { id: "goalechoserif", story: true, flips: true, label: "Golo eco com serifa", fits: ["goal"], Component: Goalechoserif },
  { id: "goalechoorbit", story: true, photo: "any", label: "Golo eco com órbita", fits: ["goal"], Component: Goalechoorbit },
  { id: "goalechomono", story: true, flips: true, label: "Golo eco com destaque", fits: ["goal"], Component: Goalechomono },
  { id: "goalechoflash", story: true, flips: true, label: "Golo eco com flash", fits: ["goal"], Component: Goalechoflash },
  { id: "echotitle", story: true, flips: true, label: "Eco com título vertical", fits: ["matchday"], Component: Echotitle },
  { id: "echodate", story: true, flips: true, label: "Eco com data grande", fits: ["matchday"], Component: Echodate },
  { id: "echotime", story: true, flips: true, label: "Eco com hora grande", fits: ["matchday"], Component: Echotime },
  { id: "echoname", story: true, flips: true, label: "Eco com apelido", fits: ["matchday"], Component: Echoname },
  { id: "echocrest", story: true, flips: true, label: "Eco com emblema", fits: ["matchday"], Component: Echocrest },
  { id: "goalechotitle", story: true, flips: true, label: "Golo eco com título vertical", fits: ["goal"], Component: Goalechotitle },
  { id: "goalechoname", story: true, flips: true, label: "Golo eco com apelido", fits: ["goal"], Component: Goalechoname },
  { id: "goalechocrest", story: true, flips: true, label: "Golo eco com emblema", fits: ["goal"], Component: Goalechocrest },
  { id: "goalechobar", story: true, flips: true, label: "Golo eco com barra", fits: ["goal"], Component: Goalechobar },
  { id: "goalechocorner", story: true, photo: "any", label: "Golo eco com cantos", fits: ["goal"], Component: Goalechocorner },
  { id: "paperripple", story: true, photo: "any", label: "Ondas em papel", fits: ["matchday"], Component: Paperripple },
  { id: "papertype", story: true, flips: true, label: "Silhueta de texto em papel", fits: ["matchday"], Component: Papertype },
  { id: "paperdouble", story: true, photo: "any", label: "Contorno duplo em papel", fits: ["matchday"], Component: Paperdouble },
  { id: "paperstep", story: true, flips: true, label: "Degraus em papel", fits: ["matchday"], Component: Paperstep },
  { id: "papergiant", story: true, flips: true, label: "Silhueta gigante em papel", fits: ["matchday"], Component: Papergiant },
  { id: "goalpaperripple", story: true, photo: "any", label: "Golo ondas em papel", fits: ["goal"], Component: Goalpaperripple },
  { id: "goalpapertype", story: true, flips: true, label: "Golo silhueta de texto em papel", fits: ["goal"], Component: Goalpapertype },
  { id: "goalpaperdouble", story: true, photo: "any", label: "Golo contorno duplo em papel", fits: ["goal"], Component: Goalpaperdouble },
  { id: "goalpaperstep", story: true, flips: true, label: "Golo degraus em papel", fits: ["goal"], Component: Goalpaperstep },
  { id: "goalpapergiant", story: true, flips: true, label: "Golo silhueta gigante em papel", fits: ["goal"], Component: Goalpapergiant },
  { id: "paperecho", story: true, flips: true, label: "Contorno em papel", fits: ["matchday"], Component: Paperecho },
  { id: "dashecho", story: true, flips: true, label: "Contorno tracejado", fits: ["matchday"], Component: Dashecho },
  { id: "gradientsilhouette", story: true, flips: true, label: "Silhueta em degradê", fits: ["matchday"], Component: Gradientsilhouette },
  { id: "duosilhouette", story: true, photo: "any", label: "Duas silhuetas", fits: ["matchday"], Component: Duosilhouette },
  { id: "stepsilhouette", story: true, flips: true, label: "Silhuetas em degraus", fits: ["matchday"], Component: Stepsilhouette },
  { id: "goalpaperecho", story: true, flips: true, label: "Golo contorno em papel", fits: ["goal"], Component: Goalpaperecho },
  { id: "goaldashecho", story: true, flips: true, label: "Golo contorno tracejado", fits: ["goal"], Component: Goaldashecho },
  { id: "goalgradientsilhouette", story: true, flips: true, label: "Golo silhueta em degradê", fits: ["goal"], Component: Goalgradientsilhouette },
  { id: "goalduosilhouette", story: true, photo: "any", label: "Golo duas silhuetas", fits: ["goal"], Component: Goalduosilhouette },
  { id: "goalstepsilhouette", story: true, flips: true, label: "Golo silhuetas em degraus", fits: ["goal"], Component: Goalstepsilhouette },
  { id: "dotsilhouette", story: true, flips: true, label: "Silhueta de pontos", fits: ["matchday"], Component: Dotsilhouette },
  { id: "crestsilhouette", story: true, flips: true, label: "Silhueta de emblemas", fits: ["matchday"], Component: Crestsilhouette },
  { id: "splitsilhouette", story: true, flips: true, label: "Silhueta meia-meia", fits: ["matchday"], Component: Splitsilhouette },
  { id: "doubleline", story: true, photo: "any", label: "Contorno duplo", fits: ["matchday"], Component: Doubleline },
  { id: "risingecho", story: true, photo: "any", label: "Eco a subir", fits: ["matchday"], Component: Risingecho },
  { id: "goaldotsilhouette", story: true, flips: true, label: "Golo silhueta de pontos", fits: ["goal"], Component: Goaldotsilhouette },
  { id: "goalcrestsilhouette", story: true, flips: true, label: "Golo silhueta de emblemas", fits: ["goal"], Component: Goalcrestsilhouette },
  { id: "goalsplitsilhouette", story: true, flips: true, label: "Golo silhueta meia-meia", fits: ["goal"], Component: Goalsplitsilhouette },
  { id: "goaldoubleline", story: true, photo: "any", label: "Golo contorno duplo", fits: ["goal"], Component: Goaldoubleline },
  { id: "goalrisingecho", photo: "any", label: "Golo eco a subir", fits: ["goal"], Component: Goalrisingecho },
  { id: "typesilhouette", story: true, flips: true, label: "Silhueta de texto", fits: ["matchday"], Component: Typesilhouette },
  { id: "giantsilhouette", story: true, flips: true, label: "Silhueta gigante", fits: ["matchday"], Component: Giantsilhouette },
  { id: "linesilhouette", story: true, flips: true, label: "Silhueta riscada", fits: ["matchday"], Component: Linesilhouette },
  { id: "rippleecho", story: true, photo: "any", label: "Eco em ondas", fits: ["matchday"], Component: Rippleecho },
  { id: "rimlight", story: true, photo: "any", label: "Luz de contorno", fits: ["matchday"], Component: Rimlight },
  { id: "goaltypesilhouette", story: true, flips: true, label: "Golo silhueta de texto", fits: ["goal"], Component: Goaltypesilhouette },
  { id: "goalgiantsilhouette", story: true, flips: true, label: "Golo silhueta gigante", fits: ["goal"], Component: Goalgiantsilhouette },
  { id: "goallinesilhouette", story: true, flips: true, label: "Golo silhueta riscada", fits: ["goal"], Component: Goallinesilhouette },
  { id: "goalrippleecho", story: true, photo: "any", label: "Golo eco em ondas", fits: ["goal"], Component: Goalrippleecho },
  { id: "goalrimlight", story: true, photo: "any", label: "Golo luz de contorno", fits: ["goal"], Component: Goalrimlight },
  { id: "castshadow", story: true, feet: true, flips: true, label: "Sombra comprida", fits: ["matchday"], Component: Castshadow },
  { id: "mirrorecho", story: true, flips: true, label: "Eco espelhado", fits: ["matchday"], Component: Mirrorecho },
  { id: "overlap", story: true, flips: true, label: "Sobreposto", fits: ["matchday"], Component: Overlap },
  { id: "fillprogress", story: true, photo: "any", label: "Enchimento", fits: ["matchday"], Component: Fillprogress },
  { id: "twotone", story: true, photo: "any", label: "Duas cores", fits: ["matchday"], Component: Twotone },
  { id: "goalcastshadow", story: true, feet: true, flips: true, label: "Golo sombra comprida", fits: ["goal"], Component: Goalcastshadow },
  { id: "goalmirrorecho", story: true, flips: true, label: "Golo eco espelhado", fits: ["goal"], Component: Goalmirrorecho },
  { id: "goaloverlap", flips: true, label: "Golo sobreposto", fits: ["goal"], Component: Goaloverlap },
  { id: "goalfillprogress", story: true, photo: "any", label: "Golo enchimento", fits: ["goal"], Component: Goalfillprogress },
  { id: "goaltwotone", photo: "any", label: "Golo duas cores", fits: ["goal"], Component: Goaltwotone },
  { id: "bleedword", story: true, photo: "any", label: "Palavra cortada", fits: ["matchday"], Component: Bleedword },
  { id: "textsquare", story: true, flips: true, label: "Quadrado de texto", fits: ["matchday"], Component: Textsquare },
  { id: "circled", story: true, flips: true, label: "Circulado", fits: ["matchday"], Component: Circled },
  { id: "redacted", story: true, flips: true, label: "Censurado", fits: ["matchday"], Component: Redacted },
  { id: "oneline", photo: "any", label: "Uma linha", fits: ["matchday"], Component: Oneline },
  { id: "goalbleed", photo: "any", label: "Golo palavra cortada", fits: ["goal"], Component: Goalbleed },
  { id: "goaltextsquare", story: true, flips: true, label: "Golo quadrado de texto", fits: ["goal"], Component: Goaltextsquare },
  { id: "goalcircled", story: true, flips: true, label: "Golo circulado", fits: ["goal"], Component: Goalcircled },
  { id: "goalredacted", story: true, flips: true, label: "Golo censurado", fits: ["goal"], Component: Goalredacted },
  { id: "goaloneline", story: true, photo: "any", label: "Golo uma linha", fits: ["goal"], Component: Goaloneline },
  { id: "dropcap", story: true, flips: true, label: "Capitular", fits: ["matchday"], Component: Dropcap },
  { id: "crossword", story: true, flips: true, label: "Palavras cruzadas", fits: ["matchday"], Component: Crossword },
  { id: "hyphen", story: true, flips: true, label: "Hífen", fits: ["matchday"], Component: Hyphen },
  { id: "ellipsis", story: true, flips: true, label: "Reticências", fits: ["matchday"], Component: Ellipsis },
  { id: "arrow", story: true, flips: true, label: "Seta", fits: ["matchday"], Component: Arrow },
  { id: "goaldropcap", story: true, flips: true, label: "Golo capitular", fits: ["goal"], Component: Goaldropcap },
  { id: "goalcrossword", story: true, flips: true, label: "Golo palavras cruzadas", fits: ["goal"], Component: Goalcrossword },
  { id: "goalellipsis", story: true, flips: true, label: "Golo reticências", fits: ["goal"], Component: Goalellipsis },
  { id: "goalarrow", story: true, flips: true, label: "Golo seta", fits: ["goal"], Component: Goalarrow },
  { id: "goalcolon", story: true, flips: true, label: "Golo dois pontos", fits: ["goal"], Component: Goalcolon },
  { id: "bordertext", story: true, photo: "any", label: "Texto na moldura", fits: ["matchday"], Component: Bordertext },
  { id: "weights", story: true, flips: true, label: "Pesos de letra", fits: ["matchday"], Component: Weights },
  { id: "bounce", story: true, photo: "any", label: "Letras a saltar", fits: ["matchday"], Component: Bounce },
  { id: "fadeword", story: true, photo: "any", label: "Palavra a desvanecer", fits: ["matchday"], Component: Fadeword },
  { id: "tracking", story: true, flips: true, label: "Espaçamento", fits: ["matchday"], Component: Tracking },
  { id: "goalbordertext", story: true, photo: "any", label: "Golo texto na moldura", fits: ["goal"], Component: Goalbordertext },
  { id: "goalweights", story: true, flips: true, label: "Golo pesos de letra", fits: ["goal"], Component: Goalweights },
  { id: "goalbounce", story: true, photo: "any", label: "Golo letras a saltar", fits: ["goal"], Component: Goalbounce },
  { id: "goalfade", story: true, photo: "any", label: "Golo a desvanecer", fits: ["goal"], Component: Goalfade },
  { id: "goaltracking", story: true, flips: true, label: "Golo espaçamento", fits: ["goal"], Component: Goaltracking },
  { id: "halffill", story: true, photo: "any", label: "Meio cheio", fits: ["matchday"], Component: Halffill },
  { id: "circletext", story: true, photo: "any", label: "Texto em círculo", fits: ["matchday"], Component: Circletext },
  { id: "strike", story: true, flips: true, label: "Riscado", fits: ["matchday"], Component: Strike },
  { id: "superscript", story: true, flips: true, label: "Expoente", fits: ["matchday"], Component: Superscript },
  { id: "quotes", story: true, flips: true, label: "Aspas", fits: ["matchday"], Component: Quotes },
  { id: "goalhalffill", story: true, photo: "any", label: "Golo meio cheio", fits: ["goal"], Component: Goalhalffill },
  { id: "goalcircletext", story: true, photo: "any", label: "Golo texto em círculo", fits: ["goal"], Component: Goalcircletext },
  { id: "goalstrike", story: true, flips: true, label: "Golo riscado", fits: ["goal"], Component: Goalstrike },
  { id: "goalsuperscript", story: true, flips: true, label: "Golo expoente", fits: ["goal"], Component: Goalsuperscript },
  { id: "goalquotes", story: true, photo: "any", label: "Golo aspas", fits: ["goal"], Component: Goalquotes },
  { id: "cropmarks", story: true, photo: "any", label: "Marcas de corte", fits: ["matchday"], Component: Cropmarks },
  { id: "folder", story: true, flips: true, label: "Pasta", fits: ["matchday"], Component: Folder },
  { id: "keycaps", story: true, flips: true, label: "Teclas", fits: ["matchday"], Component: Keycaps },
  { id: "postit", story: true, flips: true, label: "Nota autocolante", fits: ["matchday"], Component: Postit },
  { id: "specimen", story: true, flips: true, label: "Amostra de letra", fits: ["matchday"], Component: Specimen },
  { id: "goalcropmarks", story: true, photo: "any", label: "Golo marcas de corte", fits: ["goal"], Component: Goalcropmarks },
  { id: "goalkeycaps", story: true, photo: "any", label: "Golo teclas", fits: ["goal"], Component: Goalkeycaps },
  { id: "goalpostit", story: true, flips: true, label: "Golo nota autocolante", fits: ["goal"], Component: Goalpostit },
  { id: "goalspecimen", story: true, flips: true, label: "Golo amostra de letra", fits: ["goal"], Component: Goalspecimen },
  { id: "goaltally", story: true, flips: true, label: "Golo contagem", fits: ["goal"], Component: Goaltally },
  { id: "nowplaying", story: true, flips: true, label: "A tocar", fits: ["matchday"], Component: Nowplaying },
  { id: "locator", story: true, flips: true, label: "Localização", fits: ["matchday"], Component: Locator },
  { id: "invite", story: true, photo: "any", label: "Convite", fits: ["matchday"], Component: Invite },
  { id: "toggle", story: true, flips: true, label: "Interruptor", fits: ["matchday"], Component: Toggle },
  { id: "emboss", story: true, photo: "any", label: "Relevo", fits: ["matchday"], Component: Emboss },
  { id: "goalnowplaying", story: true, flips: true, label: "Golo a tocar", fits: ["goal"], Component: Goalnowplaying },
  { id: "goalemboss", story: true, photo: "any", label: "Golo relevo", fits: ["goal"], Component: Goalemboss },
  { id: "goaltoggle", story: true, flips: true, label: "Golo interruptor", fits: ["goal"], Component: Goaltoggle },
  { id: "goalpulse", story: true, photo: "any", label: "Golo pulsação", fits: ["goal"], Component: Goalpulse },
  { id: "goalunlock", story: true, photo: "any", label: "Golo desbloqueado", fits: ["goal"], Component: Goalunlock },
  { id: "search", story: true, photo: "any", label: "Pesquisa", fits: ["matchday"], Component: Search },
  { id: "chat", story: true, flips: true, label: "Mensagens", fits: ["matchday"], Component: Chat },
  { id: "receipt", story: true, flips: true, label: "Talão", fits: ["matchday"], Component: Receipt },
  { id: "instant", story: true, photo: "any", label: "Foto instantânea", fits: ["matchday"], Component: Instant },
  { id: "measure", story: true, flips: true, label: "Cotas", fits: ["matchday"], Component: Measure },
  { id: "goalsearch", story: true, photo: "any", label: "Golo pesquisa", fits: ["goal"], Component: Goalsearch },
  { id: "goalchat", story: true, flips: true, label: "Golo mensagens", fits: ["goal"], Component: Goalchat },
  { id: "goalreceipt", story: true, flips: true, label: "Golo talão", fits: ["goal"], Component: Goalreceipt },
  { id: "goalinstant", story: true, photo: "any", label: "Golo foto instantânea", fits: ["goal"], Component: Goalinstant },
  { id: "goalmeasure", story: true, flips: true, label: "Golo cotas", fits: ["goal"], Component: Goalmeasure },
  { id: "totwgallery", story: true, photo: "any", label: "Equipa da semana galeria", fits: ["totw"], Component: Totwgallery },
  { id: "totwcard", story: true, photo: "any", label: "Equipa da semana cartão", fits: ["totw"], Component: Totwcard },
  { id: "totwswiss", story: true, photo: "any", label: "Equipa da semana suíço", fits: ["totw"], Component: Totwswiss },
  { id: "totwcallout", story: true, photo: "any", label: "Equipa da semana chamada", fits: ["totw"], Component: Totwcallout },
  { id: "totwsplit", story: true, photo: "any", label: "Equipa da semana metades", fits: ["totw"], Component: Totwsplit },
  { id: "totwstack", story: true, photo: "any", label: "Equipa da semana sobreposto", fits: ["totw"], Component: Totwstack },
  { id: "totwmicro", story: true, photo: "any", label: "Equipa da semana micro", fits: ["totw"], Component: Totwmicro },
  { id: "totwtonal", story: true, photo: "any", label: "Equipa da semana tonal", fits: ["totw"], Component: Totwtonal },
  { id: "notify", story: true, photo: "any", label: "Notificação", fits: ["matchday"], Component: Notify },
  { id: "marker", story: true, flips: true, label: "Marcador", fits: ["matchday"], Component: Marker },
  { id: "chapter", story: true, photo: "any", label: "Capítulo", fits: ["matchday"], Component: Chapter },
  { id: "subtitle", story: true, photo: "any", label: "Legenda de filme", fits: ["matchday"], Component: Subtitle },
  { id: "parens", story: true, photo: "any", label: "Parênteses", fits: ["matchday"], Component: Parens },
  { id: "goalnotify", story: true, photo: "any", label: "Golo notificação", fits: ["goal"], Component: Goalnotify },
  { id: "goalmarker", story: true, flips: true, label: "Golo marcador", fits: ["goal"], Component: Goalmarker },
  { id: "goalparens", story: true, photo: "any", label: "Golo parênteses", fits: ["goal"], Component: Goalparens },
  { id: "goalsubtitle", story: true, photo: "any", label: "Golo legenda de filme", fits: ["goal"], Component: Goalsubtitle },
  { id: "goalpunct", story: true, flips: true, label: "Golo ponto final", fits: ["goal"], Component: Goalpunct },
  { id: "sentence", story: true, photo: "any", label: "Frase", fits: ["matchday"], Component: Sentence },
  { id: "signage", story: true, flips: true, label: "Sinalética", fits: ["matchday"], Component: Signage },
  { id: "datestamp", story: true, photo: "any", label: "Data de câmara", fits: ["matchday"], Component: Datestamp },
  { id: "hairslash", story: true, photo: "any", label: "Linha diagonal", fits: ["matchday"], Component: Hairslash },
  { id: "viewfinder", story: true, photo: "any", label: "Visor", fits: ["matchday"], Component: Viewfinder },
  { id: "goalsentence", story: true, photo: "any", label: "Golo frase", fits: ["goal"], Component: Goalsentence },
  { id: "goalcamera", story: true, photo: "any", label: "Golo data de câmara", fits: ["goal"], Component: Goalcamera },
  { id: "goalslash", story: true, photo: "any", label: "Golo linha diagonal", fits: ["goal"], Component: Goalslash },
  { id: "goalviewfinder", story: true, photo: "any", label: "Golo visor", fits: ["goal"], Component: Goalviewfinder },
  { id: "goalframe", story: true, photo: "any", label: "Golo moldura fina", fits: ["goal"], Component: Goalframe },
  { id: "goalherobarlow", story: true, photo: "any", label: "Golo herói · Barlow itálico", fits: ["goal"], Component: Goalherobarlow },
  { id: "goalheroanton", story: true, photo: "any", label: "Golo herói · Anton", fits: ["goal"], Component: Goalheroanton },
  { id: "goalheroarchivo", story: true, photo: "any", label: "Golo herói · Archivo Black", fits: ["goal"], Component: Goalheroarchivo },
  { id: "goalherodela", story: true, photo: "any", label: "Golo herói · Dela Gothic", fits: ["goal"], Component: Goalherodela },
  { id: "goalheroslab", story: true, photo: "any", label: "Golo herói · Alfa Slab", fits: ["goal"], Component: Goalheroslab },
  { id: "goalherobodoni", story: true, photo: "any", label: "Golo herói · Bodoni itálico", fits: ["goal"], Component: Goalherobodoni },
  { id: "goalherobebas", story: true, photo: "any", label: "Golo herói · Bebas", fits: ["goal"], Component: Goalherobebas },
  { id: "welcome", story: true, photo: "any", label: "Apresentação", fits: [], Component: Welcome },
  { id: "welcomeplay", story: true, photo: "any", label: "Apresentação · a jogar", fits: ["welcome"], Component: Welcomeplay },
  { id: "welcomeduo", story: true, photo: "any", label: "Apresentação · dupla", fits: [], Component: Welcomeduo },
  { id: "welcomehalo", story: true, photo: "any", label: "Apresentação · rosto grande", fits: [], Component: Welcomehalo },
  { id: "heromatch", story: true, photo: "any", label: "Herói · dia de jogo", fits: ["matchday"], Component: Heromatch },
  { id: "herotime", story: true, photo: "any", label: "Herói · hora", fits: ["matchday"], Component: Herotime },
  { id: "herodate", story: true, photo: "any", label: "Herói · data", fits: ["matchday"], Component: Herodate },
  { id: "heromatchdark", story: true, photo: "any", label: "Herói escuro", fits: ["matchday"], Component: Heromatchdark },
  { id: "herobehind", story: true, photo: "any", label: "Herói · atrás", fits: ["matchday"], Component: Herobehind },
  { id: "goalherodark", story: true, photo: "any", label: "Golo herói escuro", fits: ["goal"], Component: Goalherodark },
  { id: "goalherosplit", story: true, photo: "any", label: "Golo herói dividido", fits: ["goal"], Component: Goalherosplit },
  { id: "goalherobehind", story: true, photo: "any", label: "Golo herói atrás", fits: ["goal"], Component: Goalherobehind },
  { id: "goalherofoot", story: true, photo: "any", label: "Golo herói em baixo", fits: ["goal"], Component: Goalherofoot },
  { id: "goalheroband", story: true, photo: "any", label: "Golo herói faixa", fits: ["goal"], Component: Goalheroband },
  { id: "herostack", story: true, photo: "any", label: "Herói empilhado", fits: ["matchday"], Component: Herostack },
  { id: "herocaps", story: true, photo: "any", label: "Herói letra fina", fits: ["matchday"], Component: Herocaps },
  { id: "heroframe", story: true, photo: "any", label: "Herói moldura", fits: ["matchday"], Component: Heroframe },
  { id: "herovs", story: true, photo: "any", label: "Herói VS", fits: ["matchday"], Component: Herovs },
  { id: "heronumber", story: true, photo: "any", label: "Herói jornada", fits: ["matchday"], Component: Heronumber },
  { id: "goalherostack", story: true, photo: "any", label: "Golo herói empilhado", fits: ["goal"], Component: Goalherostack },
  { id: "goalherocaps", story: true, photo: "any", label: "Golo herói letra fina", fits: ["goal"], Component: Goalherocaps },
  { id: "goalheroframe", story: true, photo: "any", label: "Golo herói moldura", fits: ["goal"], Component: Goalheroframe },
  { id: "goalherotint", story: true, photo: "any", label: "Golo herói tingido", fits: ["goal"], Component: Goalherotint },
  { id: "goalheroduo", story: true, photo: "any", label: "Golo herói duas fotos", fits: ["goal"], Component: Goalheroduo },
  { id: "heromatchbodoni", story: true, photo: "any", label: "Herói · Bodoni itálico", fits: ["matchday"], Component: Heromatchbodoni },
  { id: "heromatchdela", story: true, photo: "any", label: "Herói · Dela Gothic", fits: ["matchday"], Component: Heromatchdela },
  { id: "heromatchslab", story: true, photo: "any", label: "Herói · Alfa Slab", fits: ["matchday"], Component: Heromatchslab },
  { id: "heromatchbebas", story: true, photo: "any", label: "Herói · Bebas", fits: ["matchday"], Component: Heromatchbebas },
  { id: "heromatcharchivo", story: true, photo: "any", label: "Herói · Archivo Black", fits: ["matchday"], Component: Heromatcharchivo },
  { id: "goalheroghost", story: true, photo: "any", label: "Golo herói tom sobre tom", fits: ["goal"], Component: Goalheroghost },
  { id: "goalherooutline", story: true, photo: "any", label: "Golo herói contorno", fits: ["goal"], Component: Goalherooutline },
];
const TEMPLATES_B: TemplateDef[] = [
  { id: "goalherotwotone", story: true, photo: "any", label: "Golo herói duas cores", fits: ["goal"], Component: Goalherotwotone },
  { id: "goalheroserif", story: true, photo: "any", label: "Golo herói serifa", fits: ["goal"], Component: Goalheroserif },
  { id: "goalherolower", story: true, photo: "any", label: "Golo herói minúsculas", fits: ["goal"], Component: Goalherolower },
  { id: "heroghost", story: true, photo: "any", label: "Herói tom sobre tom", fits: ["matchday"], Component: Heroghost },
  { id: "herooutline", story: true, photo: "any", label: "Herói contorno", fits: ["matchday"], Component: Herooutline },
  { id: "herotwotone", story: true, photo: "any", label: "Herói duas cores", fits: ["matchday"], Component: Herotwotone },
  { id: "heroserif", story: true, photo: "any", label: "Herói serifa", fits: ["matchday"], Component: Heroserif },
  { id: "herolower", story: true, photo: "any", label: "Herói minúsculas", fits: ["matchday"], Component: Herolower },
  { id: "goalheroshadow", story: true, photo: "any", label: "Golo herói sombra", fits: ["goal"], Component: Goalheroshadow },
  { id: "goalherogradient", story: true, photo: "any", label: "Golo herói gradiente", fits: ["goal"], Component: Goalherogradient },
  { id: "goalherostagger", story: true, photo: "any", label: "Golo herói degrau", fits: ["goal"], Component: Goalherostagger },
  { id: "goalherotally", story: true, photo: "any", label: "Golo herói contagem", fits: ["goal"], Component: Goalherotally },
  { id: "goalheroaura", story: true, photo: "any", label: "Golo herói brilho", fits: ["goal"], Component: Goalheroaura },
  { id: "heroduo", story: true, photo: "any", label: "Herói duas fotos", fits: ["matchday"], Component: Heroduo },
  { id: "herotint", story: true, photo: "any", label: "Herói tingido", fits: ["matchday"], Component: Herotint },
  { id: "heroshadow", story: true, photo: "any", label: "Herói sombra", fits: ["matchday"], Component: Heroshadow },
  { id: "herogradient", story: true, photo: "any", label: "Herói gradiente", fits: ["matchday"], Component: Herogradient },
  { id: "heroaura", story: true, photo: "any", label: "Herói brilho", fits: ["matchday"], Component: Heroaura },
  { id: "goalheroname", story: true, photo: "any", label: "Golo herói apelido", fits: ["goal"], Component: Goalheroname },
  { id: "goalheroboxed", story: true, photo: "any", label: "Golo herói caixa", fits: ["goal"], Component: Goalheroboxed },
  { id: "goalherosticker", story: true, photo: "any", label: "Golo herói autocolante", fits: ["goal"], Component: Goalherosticker },
  { id: "goalherocrest", story: true, photo: "any", label: "Golo herói emblema", fits: ["goal"], Component: Goalherocrest },
  { id: "goalherofill", story: true, photo: "any", label: "Golo herói foto nas letras", fits: ["goal"], Component: Goalherofill },
  { id: "heroboxed", story: true, photo: "any", label: "Herói caixa", fits: ["matchday"], Component: Heroboxed },
  { id: "herosticker", story: true, photo: "any", label: "Herói autocolante", fits: ["matchday"], Component: Herosticker },
  { id: "heroband", story: true, photo: "any", label: "Herói faixa", fits: ["matchday"], Component: Heroband },
  { id: "heroname", story: true, photo: "any", label: "Herói apelido", fits: ["matchday"], Component: Heroname },
  { id: "herofoot", story: true, photo: "any", label: "Herói em baixo", fits: ["matchday"], Component: Herofoot },
  { id: "goalherotop", story: true, photo: "any", label: "Golo herói bloco", fits: ["goal"], Component: Goalherotop },
  { id: "goalherobw", story: true, photo: "any", label: "Golo herói preto e branco", fits: ["goal"], Component: Goalherobw },
  { id: "goalheroduotone", story: true, photo: "any", label: "Golo herói duotone", fits: ["goal"], Component: Goalheroduotone },
  { id: "goalheroexclaim", story: true, photo: "any", label: "Golo herói exclamação", fits: ["goal"], Component: Goalheroexclaim },
  { id: "goalherohalf", story: true, photo: "any", label: "Golo herói meio fundo", fits: ["goal"], Component: Goalherohalf },
  { id: "coachhero", story: true, photo: "any", label: "Treinador · herói", fits: ["matchday"], Component: Coachhero },
  { id: "coachpress", story: true, photo: "any", label: "Treinador · sala de imprensa", fits: ["matchday"], Component: Coachpress },
  { id: "coachboard", story: true, photo: "any", label: "Treinador · quadro tático", fits: ["matchday"], Component: Coachboard },
  { id: "coachserif", story: true, photo: "any", label: "Treinador · revista", fits: ["matchday"], Component: Coachserif },
  { id: "coachtouchline", story: true, photo: "any", label: "Treinador · linha lateral", fits: ["matchday"], Component: Coachtouchline },
  { id: "coachdark", story: true, photo: "any", label: "Treinador · escuro", fits: ["matchday"], Component: Coachdark },
  { id: "coachname", story: true, photo: "any", label: "Treinador · apelido", fits: ["matchday"], Component: Coachname },
  { id: "coachduo", story: true, photo: "any", label: "Treinador · duas fotos", fits: ["matchday"], Component: Coachduo },
  { id: "coachframe", story: true, photo: "any", label: "Treinador · moldura", fits: ["matchday"], Component: Coachframe },
  { id: "coachcard", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Treinador · cartão com nome", fits: ["matchday", "result"], Component: Coachcard },
  { id: "coachsheet", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Treinador · folha impressa", fits: ["matchday", "result"], Component: Coachsheet },
  { id: "coachlowkey", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Treinador · retrato em fundo negro", fits: ["matchday", "result"], Component: Coachlowkey },
  { id: "coachmono", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Treinador · COACH a preto e branco", fits: ["matchday", "result"], Component: Coachmono },
  { id: "coachclipboard", story: true, photo: "any", label: "Treinador · prancheta", fits: ["matchday"], Component: Coachclipboard },
  { id: "goalherocount", story: true, photo: "any", label: "Golo herói número", fits: ["goal"], Component: Goalherocount },
  { id: "welcomelight", story: true, photo: "any", label: "Apresentação · claro", fits: [], Component: Welcomelight },
  { id: "welcomeclub", story: true, photo: "any", label: "Apresentação · cor do clube", fits: [], Component: Welcomeclub },
  { id: "welcomecolumn", story: true, photo: "any", label: "Apresentação · coluna", fits: [], Component: Welcomecolumn },
  { id: "welcomecareer", story: true, photo: "any", label: "Apresentação · percurso", fits: [], Component: Welcomecareer },
  { id: "coachwelcome", story: true, photo: "any", label: "Treinador · apresentação", fits: ["welcome"], Component: Coachwelcome },
  { id: "coachwelcomelight", story: true, photo: "any", label: "Treinador · apresentação clara", fits: ["welcome"], Component: Coachwelcomelight },
  { id: "natword", story: true, photo: "any", label: "Natural · palavra atrás", fits: ["matchday"], Component: Natword },
  { id: "natcorner", story: true, photo: "any", label: "Natural · canto", fits: ["matchday"], Component: Natcorner },
  { id: "natgrass", story: true, photo: "any", label: "Natural · relva", fits: ["matchday"], Component: Natgrass },
  { id: "goalnatword", story: true, photo: "any", label: "Golo natural · palavra atrás", fits: ["goal"], Component: Goalnatword },
  { id: "natfold", story: true, photo: "any", label: "Natural · dobra", fits: ["matchday"], Component: Natfold },
  { id: "goalnatfold", story: true, photo: "any", label: "Golo natural · dobra", fits: ["goal"], Component: Goalnatfold },
  { id: "natspine", story: true, photo: "any", label: "Natural · lombada", fits: ["matchday"], Component: Natspine },
  { id: "goalnatspine", story: true, photo: "any", label: "Golo natural · lombada", fits: ["goal"], Component: Goalnatspine },
  { id: "natmix", story: true, photo: "any", label: "Natural · escala mista", fits: ["matchday"], Component: Natmix },
  { id: "goalnatmix", story: true, photo: "any", label: "Golo natural · escala mista", fits: ["goal"], Component: Goalnatmix },
  { id: "natlabel", story: true, photo: "any", label: "Natural · etiqueta", fits: ["matchday"], Component: Natlabel },
  { id: "goalnatlabel", story: true, photo: "any", label: "Golo natural · etiqueta", fits: ["goal"], Component: Goalnatlabel },
  { id: "natspaced", story: true, photo: "any", label: "Natural · espaçado", fits: ["matchday"], Component: Natspaced },
  { id: "goalnatspaced", story: true, photo: "any", label: "Golo natural · espaçado", fits: ["goal"], Component: Goalnatspaced },
  { id: "natmarks", story: true, photo: "any", label: "Natural · marcas", fits: ["matchday"], Component: Natmarks },
  { id: "goalnatmarks", story: true, photo: "any", label: "Golo natural · marcas", fits: ["goal"], Component: Goalnatmarks },
  { id: "natdot", story: true, photo: "any", label: "Natural · ponto", fits: ["matchday"], Component: Natdot },
  { id: "goalnatdot", story: true, photo: "any", label: "Golo natural · ponto", fits: ["goal"], Component: Goalnatdot },
  { id: "natcut", story: true, photo: "any", label: "Natural · cortado", fits: ["matchday"], Component: Natcut },
  { id: "goalnatcut", story: true, photo: "any", label: "Golo natural · cortado", fits: ["goal"], Component: Goalnatcut },
  { id: "natlegend", story: true, photo: "any", label: "Natural · legenda", fits: ["matchday"], Component: Natlegend },
  { id: "goalnatlegend", story: true, photo: "any", label: "Golo natural · legenda", fits: ["goal"], Component: Goalnatlegend },
  { id: "natcols", story: true, photo: "any", label: "Natural · colunas", fits: ["matchday"], Component: Natcols },
  { id: "goalnatcols", story: true, photo: "any", label: "Golo natural · colunas", fits: ["goal"], Component: Goalnatcols },
  { id: "natfoot", story: true, photo: "any", label: "Natural · nota", fits: ["matchday"], Component: Natfoot },
  { id: "goalnatfoot", story: true, photo: "any", label: "Golo natural · nota", fits: ["goal"], Component: Goalnatfoot },
  { id: "natfade", story: true, photo: "any", label: "Natural · esbatido", fits: ["matchday"], Component: Natfade },
  { id: "goalnatfade", story: true, photo: "any", label: "Golo natural · esbatido", fits: ["goal"], Component: Goalnatfade },
  { id: "natarrow", story: true, photo: "any", label: "Natural · seta", fits: ["matchday"], Component: Natarrow },
  { id: "goalnatarrow", story: true, photo: "any", label: "Golo natural · seta", fits: ["goal"], Component: Goalnatarrow },
  { id: "natrule", story: true, photo: "any", label: "Natural · fio", fits: ["matchday"], Component: Natrule },
  { id: "goalnatrule", story: true, photo: "any", label: "Golo natural · fio", fits: ["goal"], Component: Goalnatrule },
  { id: "natquiet", story: true, photo: "any", label: "Natural · silêncio", fits: ["matchday"], Component: Natquiet },
  { id: "goalnatquiet", story: true, photo: "any", label: "Golo natural · silêncio", fits: ["goal"], Component: Goalnatquiet },
  { id: "natoverline", story: true, photo: "any", label: "Natural · sobretítulo", fits: ["matchday"], Component: Natoverline },
  { id: "goalnatoverline", story: true, photo: "any", label: "Golo natural · sobretítulo", fits: ["goal"], Component: Goalnatoverline },
  { id: "natcolumn", story: true, photo: "any", label: "Natural · coluna", fits: ["matchday"], Component: Natcolumn },
  { id: "goalnatcolumn", story: true, photo: "any", label: "Golo natural · coluna", fits: ["goal"], Component: Goalnatcolumn },
  { id: "natwatermark", story: true, photo: "any", label: "Natural · marca de água", fits: ["matchday"], Component: Natwatermark },
  { id: "goalnatwatermark", story: true, photo: "any", label: "Golo natural · marca de água", fits: ["goal"], Component: Goalnatwatermark },
  { id: "nattab", story: true, photo: "any", label: "Natural · separador", fits: ["matchday"], Component: Nattab },
  { id: "goalnattab", story: true, photo: "any", label: "Golo natural · separador", fits: ["goal"], Component: Goalnattab },
  { id: "natsentence", story: true, photo: "any", label: "Natural · frase", fits: ["matchday"], Component: Natsentence },
  { id: "goalnatsentence", story: true, photo: "any", label: "Golo natural · frase", fits: ["goal"], Component: Goalnatsentence },
  { id: "natbracket", story: true, photo: "any", label: "Natural · parênteses", fits: ["matchday"], Component: Natbracket },
  { id: "goalnatbracket", story: true, photo: "any", label: "Golo natural · parênteses", fits: ["goal"], Component: Goalnatbracket },
  { id: "natdotline", story: true, photo: "any", label: "Natural · linha do tempo", fits: ["matchday"], Component: Natdotline },
  { id: "goalnatdotline", story: true, photo: "any", label: "Golo natural · linha do tempo", fits: ["goal"], Component: Goalnatdotline },
  { id: "nathead", story: true, photo: "any", label: "Natural · título", fits: ["matchday"], Component: Nathead },
  { id: "goalnathead", story: true, photo: "any", label: "Golo natural · título", fits: ["goal"], Component: Goalnathead },
  { id: "natbadge", story: true, photo: "any", label: "Natural · selo", fits: ["matchday"], Component: Natbadge },
  { id: "goalnatbadge", story: true, photo: "any", label: "Golo natural · selo", fits: ["goal"], Component: Goalnatbadge },
  { id: "natbar", story: true, photo: "any", label: "Natural · barra", fits: ["matchday"], Component: Natbar },
  { id: "goalnatbar", story: true, photo: "any", label: "Golo natural · barra", fits: ["goal"], Component: Goalnatbar },
  { id: "natends", story: true, photo: "any", label: "Natural · extremos", fits: ["matchday"], Component: Natends },
  { id: "goalnatends", story: true, photo: "any", label: "Golo natural · extremos", fits: ["goal"], Component: Goalnatends },
  { id: "natlist", story: true, photo: "any", label: "Natural · lista", fits: ["matchday"], Component: Natlist },
  { id: "goalnatlist", story: true, photo: "any", label: "Golo natural · lista", fits: ["goal"], Component: Goalnatlist },
  { id: "natduel", story: true, photo: "any", label: "Natural · duelo", fits: ["matchday"], Component: Natduel },
  { id: "goalnatduel", story: true, photo: "any", label: "Golo natural · duelo", fits: ["goal"], Component: Goalnatduel },
  { id: "natdiag", story: true, photo: "any", label: "Natural · diagonal", fits: ["matchday"], Component: Natdiag },
  { id: "goalnatdiag", story: true, photo: "any", label: "Golo natural · diagonal", fits: ["goal"], Component: Goalnatdiag },
  { id: "natsidebar", story: true, photo: "any", label: "Natural · margem lateral", fits: ["matchday"], Component: Natsidebar },
  { id: "goalnatsidebar", story: true, photo: "any", label: "Golo natural · margem lateral", fits: ["goal"], Component: Goalnatsidebar },
  { id: "natpennant", story: true, photo: "any", label: "Natural · galhardete", fits: ["matchday"], Component: Natpennant },
  { id: "goalnatpennant", story: true, photo: "any", label: "Golo natural · galhardete", fits: ["goal"], Component: Goalnatpennant },
  { id: "natangle", story: true, photo: "any", label: "Natural · esquadro", fits: ["matchday"], Component: Natangle },
  { id: "goalnatangle", story: true, photo: "any", label: "Golo natural · esquadro", fits: ["goal"], Component: Goalnatangle },
  { id: "natlines", story: true, photo: "any", label: "Natural · linhas", fits: ["matchday"], Component: Natlines },
  { id: "goalnatlines", story: true, photo: "any", label: "Golo natural · linhas", fits: ["goal"], Component: Goalnatlines },
  { id: "natcrestbleed", story: true, photo: "any", label: "Natural · emblema cortado", fits: ["matchday"], Component: Natcrestbleed },
  { id: "goalnatcrestbleed", story: true, photo: "any", label: "Golo natural · emblema cortado", fits: ["goal"], Component: Goalnatcrestbleed },
  { id: "natnav", story: true, photo: "any", label: "Natural · barra de navegação", fits: ["matchday"], Component: Natnav },
  { id: "goalnatnav", story: true, photo: "any", label: "Golo natural · barra de navegação", fits: ["goal"], Component: Goalnatnav },
  { id: "natecho", story: true, photo: "any", label: "Natural · eco", fits: ["matchday"], Component: Natecho },
  { id: "goalnatecho", story: true, photo: "any", label: "Golo natural · eco", fits: ["goal"], Component: Goalnatecho },
  { id: "natflag", story: true, photo: "any", label: "Natural · bandeira", fits: ["matchday"], Component: Natflag },
  { id: "goalnatflag", story: true, photo: "any", label: "Golo natural · bandeira", fits: ["goal"], Component: Goalnatflag },
  { id: "nattag", story: true, photo: "any", label: "Natural · etiqueta de preço", fits: ["matchday"], Component: Nattag },
  { id: "goalnattag", story: true, photo: "any", label: "Golo natural · etiqueta de preço", fits: ["goal"], Component: Goalnattag },
  { id: "natbreakout", story: true, photo: "any", label: "Natural · fora da moldura", fits: ["matchday"], Component: Natbreakout },
  { id: "goalnatbreakout", story: true, photo: "any", label: "Golo natural · fora da moldura", fits: ["goal"], Component: Goalnatbreakout },
  { id: "natstripe", story: true, photo: "any", label: "Natural · risca", fits: ["matchday"], Component: Natstripe },
  { id: "goalnatstripe", story: true, photo: "any", label: "Golo natural · risca", fits: ["goal"], Component: Goalnatstripe },
  { id: "natvline", story: true, photo: "any", label: "Natural · divisória", fits: ["matchday"], Component: Natvline },
  { id: "goalnatvline", story: true, photo: "any", label: "Golo natural · divisória", fits: ["goal"], Component: Goalnatvline },
  { id: "natoverprint", story: true, photo: "any", label: "Natural · sobreimpressão", fits: ["matchday"], Component: Natoverprint },
  { id: "goalnatoverprint", story: true, photo: "any", label: "Golo natural · sobreimpressão", fits: ["goal"], Component: Goalnatoverprint },
  { id: "natkickoff", story: true, photo: "any", label: "Natural · hora", fits: ["matchday"], Component: Natkickoff },
  { id: "goalnatkickoff", story: true, photo: "any", label: "Golo natural · hora", fits: ["goal"], Component: Goalnatkickoff },
  { id: "natunderbar", story: true, photo: "any", label: "Natural · sublinhado", fits: ["matchday"], Component: Natunderbar },
  { id: "goalnatunderbar", story: true, photo: "any", label: "Golo natural · sublinhado", fits: ["goal"], Component: Goalnatunderbar },
  { id: "natsticker", story: true, photo: "any", label: "Natural · autocolante", fits: ["matchday"], Component: Natsticker },
  { id: "goalnatsticker", story: true, photo: "any", label: "Golo natural · autocolante", fits: ["goal"], Component: Goalnatsticker },
  { id: "natsplitword", photo: "any", label: "Natural · palavra partida", fits: ["matchday"], Component: Natsplitword },
  { id: "goalnatsplitword", photo: "any", label: "Golo natural · palavra partida", fits: ["goal"], Component: Goalnatsplitword },
  { id: "natcorners4", story: true, photo: "any", label: "Natural · quatro cantos", fits: ["matchday"], Component: Natcorners4 },
  { id: "goalnatcorners4", story: true, photo: "any", label: "Golo natural · quatro cantos", fits: ["goal"], Component: Goalnatcorners4 },
  { id: "natmicro2", story: true, photo: "any", label: "Natural · micro", fits: ["matchday"], Component: Natmicro2 },
  { id: "goalnatmicro2", story: true, photo: "any", label: "Golo natural · micro", fits: ["goal"], Component: Goalnatmicro2 },
  { id: "natinset", story: true, photo: "any", label: "Natural · moldura interior", fits: ["matchday"], Component: Natinset },
  { id: "goalnatinset", story: true, photo: "any", label: "Golo natural · moldura interior", fits: ["goal"], Component: Goalnatinset },
  { id: "natbigletter", story: true, photo: "any", label: "Natural · inicial", fits: ["matchday"], Component: Natbigletter },
  { id: "goalnatbigletter", story: true, photo: "any", label: "Golo natural · inicial", fits: ["goal"], Component: Goalnatbigletter },
  { id: "natchips", story: true, photo: "any", label: "Natural · pastilhas", fits: ["matchday"], Component: Natchips },
  { id: "goalnatchips", story: true, photo: "any", label: "Golo natural · pastilhas", fits: ["goal"], Component: Goalnatchips },
  { id: "natslab", story: true, photo: "any", label: "Natural · slab", fits: ["matchday"], Component: Natslab },
  { id: "goalnatslab", story: true, photo: "any", label: "Golo natural · slab", fits: ["goal"], Component: Goalnatslab },
  { id: "natcrestbox", story: true, photo: "any", label: "Natural · caixa do emblema", fits: ["matchday"], Component: Natcrestbox },
  { id: "goalnatcrestbox", story: true, photo: "any", label: "Golo natural · caixa do emblema", fits: ["goal"], Component: Goalnatcrestbox },
  { id: "natrepeatline", story: true, photo: "any", label: "Natural · linha repetida", fits: ["matchday"], Component: Natrepeatline },
  { id: "goalnatrepeatline", story: true, photo: "any", label: "Golo natural · linha repetida", fits: ["goal"], Component: Goalnatrepeatline },
  { id: "natoffset", story: true, photo: "any", label: "Natural · sombra deslocada", fits: ["matchday"], Component: Natoffset },
  { id: "goalnatoffset", story: true, photo: "any", label: "Golo natural · sombra deslocada", fits: ["goal"], Component: Goalnatoffset },
  { id: "natcredits", story: true, photo: "any", label: "Natural · créditos", fits: ["matchday"], Component: Natcredits },
  { id: "goalnatcredits", story: true, photo: "any", label: "Golo natural · créditos", fits: ["goal"], Component: Goalnatcredits },
  { id: "natpilltop", story: true, photo: "any", label: "Natural · pastilha no topo", fits: ["matchday"], Component: Natpilltop },
  { id: "goalnatpilltop", story: true, photo: "any", label: "Golo natural · pastilha no topo", fits: ["goal"], Component: Goalnatpilltop },
  { id: "natfadebar", story: true, photo: "any", label: "Natural · barra esbatida", fits: ["matchday"], Component: Natfadebar },
  { id: "goalnatfadebar", story: true, photo: "any", label: "Golo natural · barra esbatida", fits: ["goal"], Component: Goalnatfadebar },
  { id: "natbaseline", story: true, photo: "any", label: "Natural · linha de base", fits: ["matchday"], Component: Natbaseline },
  { id: "goalnatbaseline", story: true, photo: "any", label: "Golo natural · linha de base", fits: ["goal"], Component: Goalnatbaseline },
  { id: "natoutlinebox", story: true, photo: "any", label: "Natural · caixa de contorno", fits: ["matchday"], Component: Natoutlinebox },
  { id: "goalnatoutlinebox", story: true, photo: "any", label: "Golo natural · caixa de contorno", fits: ["goal"], Component: Goalnatoutlinebox },
  { id: "natfootcols", story: true, photo: "any", label: "Natural · duas colunas", fits: ["matchday"], Component: Natfootcols },
  { id: "goalnatfootcols", story: true, photo: "any", label: "Golo natural · duas colunas", fits: ["goal"], Component: Goalnatfootcols },
  { id: "natdotsgrid", story: true, photo: "any", label: "Natural · grelha de pontos", fits: ["matchday"], Component: Natdotsgrid },
  { id: "goalnatdotsgrid", story: true, photo: "any", label: "Golo natural · grelha de pontos", fits: ["goal"], Component: Goalnatdotsgrid },
  { id: "natvs", story: true, photo: "any", label: "Natural · vs", fits: ["matchday"], Component: Natvs },
  { id: "goalnatvs", story: true, photo: "any", label: "Golo natural · vs", fits: ["goal"], Component: Goalnatvs },
  { id: "natcaptionbar", story: true, photo: "any", label: "Natural · faixa de legenda", fits: ["matchday"], Component: Natcaptionbar },
  { id: "goalnatcaptionbar", story: true, photo: "any", label: "Golo natural · faixa de legenda", fits: ["goal"], Component: Goalnatcaptionbar },
  { id: "nattight", story: true, photo: "any", label: "Natural · apertado", fits: ["matchday"], Component: Nattight },
  { id: "goalnattight", story: true, photo: "any", label: "Golo natural · apertado", fits: ["goal"], Component: Goalnattight },
  { id: "nattopline", story: true, photo: "any", label: "Natural · só no topo", fits: ["matchday"], Component: Nattopline },
  { id: "goalnattopline", story: true, photo: "any", label: "Golo natural · só no topo", fits: ["goal"], Component: Goalnattopline },
  { id: "natrails", story: true, photo: "any", label: "Natural · calhas", fits: ["matchday"], Component: Natrails },
  { id: "goalnatrails", story: true, photo: "any", label: "Golo natural · calhas", fits: ["goal"], Component: Goalnatrails },
  { id: "natbigdate", story: true, photo: "any", label: "Natural · data grande", fits: ["matchday"], Component: Natbigdate },
  { id: "goalnatbigdate", story: true, photo: "any", label: "Golo natural · data grande", fits: ["goal"], Component: Goalnatbigdate },
  { id: "natplus", story: true, photo: "any", label: "Natural · cruz", fits: ["matchday"], Component: Natplus },
  { id: "goalnatplus", story: true, photo: "any", label: "Golo natural · cruz", fits: ["goal"], Component: Goalnatplus },
  { id: "natsyllable", story: true, photo: "any", label: "Natural · empilhado", fits: ["matchday"], Component: Natsyllable },
  { id: "goalnatsyllable", story: true, photo: "any", label: "Golo natural · empilhado", fits: ["goal"], Component: Goalnatsyllable },
  { id: "natcrestrow", story: true, photo: "any", label: "Natural · fila de emblemas", fits: ["matchday"], Component: Natcrestrow },
  { id: "goalnatcrestrow", story: true, photo: "any", label: "Golo natural · fila de emblemas", fits: ["goal"], Component: Goalnatcrestrow },
  { id: "natwidefont", story: true, photo: "any", label: "Natural · letra larga", fits: ["matchday"], Component: Natwidefont },
  { id: "goalnatwidefont", story: true, photo: "any", label: "Golo natural · letra larga", fits: ["goal"], Component: Goalnatwidefont },
  { id: "natfig", story: true, photo: "any", label: "Natural · figura", fits: ["matchday"], Component: Natfig },
  { id: "goalnatfig", story: true, photo: "any", label: "Golo natural · figura", fits: ["goal"], Component: Goalnatfig },
  { id: "natcornerribbon", photo: "any", label: "Natural · fita de canto", fits: ["matchday"], Component: Natcornerribbon },
  { id: "goalnatcornerribbon", photo: "any", label: "Golo natural · fita de canto", fits: ["goal"], Component: Goalnatcornerribbon },
  { id: "natsides", story: true, photo: "any", label: "Natural · lados", fits: ["matchday"], Component: Natsides },
  { id: "goalnatsides", story: true, photo: "any", label: "Golo natural · lados", fits: ["goal"], Component: Goalnatsides },
  { id: "natdashed", story: true, photo: "any", label: "Natural · tracejado", fits: ["matchday"], Component: Natdashed },
  { id: "goalnatdashed", story: true, photo: "any", label: "Golo natural · tracejado", fits: ["goal"], Component: Goalnatdashed },
  { id: "natcapsule", story: true, photo: "any", label: "Natural · cápsula", fits: ["matchday"], Component: Natcapsule },
  { id: "goalnatcapsule", story: true, photo: "any", label: "Golo natural · cápsula", fits: ["goal"], Component: Goalnatcapsule },
  { id: "natlower3", story: true, photo: "any", label: "Natural · oráculo", fits: ["matchday"], Component: Natlower3 },
  { id: "goalnatlower3", story: true, photo: "any", label: "Golo natural · oráculo", fits: ["goal"], Component: Goalnatlower3 },
  { id: "natballicon", story: true, photo: "any", label: "Natural · ícone de bola", fits: ["matchday"], Component: Natballicon },
  { id: "goalnatballicon", story: true, photo: "any", label: "Golo natural · ícone de bola", fits: ["goal"], Component: Goalnatballicon },
  { id: "natslash", story: true, photo: "any", label: "Natural · barra oblíqua", fits: ["matchday"], Component: Natslash },
  { id: "goalnatslash", story: true, photo: "any", label: "Golo natural · barra oblíqua", fits: ["goal"], Component: Goalnatslash },
  { id: "natweightmix", story: true, photo: "any", label: "Natural · fino e grosso", fits: ["matchday"], Component: Natweightmix },
  { id: "goalnatweightmix", story: true, photo: "any", label: "Golo natural · fino e grosso", fits: ["goal"], Component: Goalnatweightmix },
  { id: "natgrid4", story: true, photo: "any", label: "Natural · grelha 2×2", fits: ["matchday"], Component: Natgrid4 },
  { id: "goalnatgrid4", story: true, photo: "any", label: "Golo natural · grelha 2×2", fits: ["goal"], Component: Goalnatgrid4 },
  { id: "natclockicon", story: true, photo: "any", label: "Natural · relógio", fits: ["matchday"], Component: Natclockicon },
  { id: "goalnatclockicon", story: true, photo: "any", label: "Golo natural · relógio", fits: ["goal"], Component: Goalnatclockicon },
  { id: "natpin", story: true, photo: "any", label: "Natural · localização", fits: ["matchday"], Component: Natpin },
  { id: "goalnatpin", story: true, photo: "any", label: "Golo natural · localização", fits: ["goal"], Component: Goalnatpin },
  { id: "natdoublerule", story: true, photo: "any", label: "Natural · linha dupla", fits: ["matchday"], Component: Natdoublerule },
  { id: "goalnatdoublerule", story: true, photo: "any", label: "Golo natural · linha dupla", fits: ["goal"], Component: Goalnatdoublerule },
  { id: "natpointer", story: true, photo: "any", label: "Natural · seta-legenda", fits: ["matchday"], Component: Natpointer },
  { id: "goalnatpointer", story: true, photo: "any", label: "Golo natural · seta-legenda", fits: ["goal"], Component: Goalnatpointer },
  { id: "natserifcaps", story: true, photo: "any", label: "Natural · serifa espaçada", fits: ["matchday"], Component: Natserifcaps },
  { id: "goalnatserifcaps", story: true, photo: "any", label: "Golo natural · serifa espaçada", fits: ["goal"], Component: Goalnatserifcaps },
  { id: "natgradword", story: true, photo: "any", label: "Natural · palavra em degradê", fits: ["matchday"], Component: Natgradword },
  { id: "goalnatgradword", story: true, photo: "any", label: "Golo natural · palavra em degradê", fits: ["goal"], Component: Goalnatgradword },
  { id: "natdotsep", story: true, photo: "any", label: "Natural · reticências", fits: ["matchday"], Component: Natdotsep },
  { id: "goalnatdotsep", story: true, photo: "any", label: "Golo natural · reticências", fits: ["goal"], Component: Goalnatdotsep },
  { id: "natdatestack", story: true, photo: "any", label: "Natural · data empilhada", fits: ["matchday"], Component: Natdatestack },
  { id: "goalnatdatestack", story: true, photo: "any", label: "Golo natural · data empilhada", fits: ["goal"], Component: Goalnatdatestack },
  { id: "nattypewriter", story: true, photo: "any", label: "Natural · máquina de escrever", fits: ["matchday"], Component: Nattypewriter },
  { id: "goalnattypewriter", story: true, photo: "any", label: "Golo natural · máquina de escrever", fits: ["goal"], Component: Goalnattypewriter },
  { id: "natinfobox2", story: true, photo: "any", label: "Natural · caixa de informação", fits: ["matchday"], Component: Natinfobox2 },
  { id: "goalnatinfobox2", story: true, photo: "any", label: "Golo natural · caixa de informação", fits: ["goal"], Component: Goalnatinfobox2 },
  { id: "nathighlighter", story: true, photo: "any", label: "Natural · marcador", fits: ["matchday"], Component: Nathighlighter },
  { id: "goalnathighlighter", story: true, photo: "any", label: "Golo natural · marcador", fits: ["goal"], Component: Goalnathighlighter },
  { id: "natcrestsplit", story: true, photo: "any", label: "Natural · separador de emblema", fits: ["matchday"], Component: Natcrestsplit },
  { id: "goalnatcrestsplit", story: true, photo: "any", label: "Golo natural · separador de emblema", fits: ["goal"], Component: Goalnatcrestsplit },
  { id: "natcrestring", story: true, photo: "any", label: "Natural · emblema em círculo", fits: ["matchday"], Component: Natcrestring },
  { id: "goalnatcrestring", story: true, photo: "any", label: "Golo natural · emblema em círculo", fits: ["goal"], Component: Goalnatcrestring },
  { id: "natnumero", story: true, photo: "any", label: "Natural · número", fits: ["matchday"], Component: Natnumero },
  { id: "goalnatnumero", story: true, photo: "any", label: "Golo natural · número", fits: ["goal"], Component: Goalnatnumero },
  { id: "nattilted", story: true, photo: "any", label: "Natural · inclinado", fits: ["matchday"], Component: Nattilted },
  { id: "goalnattilted", story: true, photo: "any", label: "Golo natural · inclinado", fits: ["goal"], Component: Goalnattilted },
  { id: "natclubword", story: true, photo: "any", label: "Natural · palavra na cor do clube", fits: ["matchday"], Component: Natclubword },
  { id: "goalnatclubword", story: true, photo: "any", label: "Golo natural · palavra na cor do clube", fits: ["goal"], Component: Goalnatclubword },
  { id: "natglasscard", story: true, photo: "any", label: "Natural · cartão de vidro", fits: ["matchday"], Component: Natglasscard },
  { id: "goalnatglasscard", story: true, photo: "any", label: "Golo natural · cartão de vidro", fits: ["goal"], Component: Goalnatglasscard },
  { id: "natoffsetframe", story: true, photo: "any", label: "Natural · moldura deslocada", fits: ["matchday"], Component: Natoffsetframe },
  { id: "goalnatoffsetframe", story: true, photo: "any", label: "Golo natural · moldura deslocada", fits: ["goal"], Component: Goalnatoffsetframe },
  { id: "natitalicbig", story: true, photo: "any", label: "Natural · itálico", fits: ["matchday"], Component: Natitalicbig },
  { id: "goalnatitalicbig", story: true, photo: "any", label: "Golo natural · itálico", fits: ["goal"], Component: Goalnatitalicbig },
  { id: "natknockbox", story: true, photo: "any", label: "Natural · caixa sólida", fits: ["matchday"], Component: Natknockbox },
  { id: "goalnatknockbox", story: true, photo: "any", label: "Golo natural · caixa sólida", fits: ["goal"], Component: Goalnatknockbox },
  { id: "natunderscore", story: true, photo: "any", label: "Natural · sublinhado de cursor", fits: ["matchday"], Component: Natunderscore },
  { id: "goalnatunderscore", story: true, photo: "any", label: "Golo natural · sublinhado de cursor", fits: ["goal"], Component: Goalnatunderscore },
  { id: "natfactrow", story: true, photo: "any", label: "Natural · fila de factos", fits: ["matchday"], Component: Natfactrow },
  { id: "goalnatfactrow", story: true, photo: "any", label: "Golo natural · fila de factos", fits: ["goal"], Component: Goalnatfactrow },
  { id: "natcols3", story: true, photo: "any", label: "Natural · três colunas", fits: ["matchday"], Component: Natcols3 },
  { id: "goalnatcols3", story: true, photo: "any", label: "Golo natural · três colunas", fits: ["goal"], Component: Goalnatcols3 },
  { id: "natbracev", story: true, photo: "any", label: "Natural · chaveta", fits: ["matchday"], Component: Natbracev },
  { id: "goalnatbracev", story: true, photo: "any", label: "Golo natural · chaveta", fits: ["goal"], Component: Goalnatbracev },
  { id: "natarrowup", story: true, photo: "any", label: "Natural · seta diagonal", fits: ["matchday"], Component: Natarrowup },
  { id: "goalnatarrowup", story: true, photo: "any", label: "Golo natural · seta diagonal", fits: ["goal"], Component: Goalnatarrowup },
  { id: "nattimedisc", story: true, photo: "any", label: "Natural · círculo da hora", fits: ["matchday"], Component: Nattimedisc },
  { id: "goalnattimedisc", story: true, photo: "any", label: "Golo natural · círculo da hora", fits: ["goal"], Component: Goalnattimedisc },
  { id: "natrightrule", story: true, photo: "any", label: "Natural · alinhado à direita", fits: ["matchday"], Component: Natrightrule },
  { id: "goalnatrightrule", story: true, photo: "any", label: "Golo natural · alinhado à direita", fits: ["goal"], Component: Goalnatrightrule },
  { id: "natheaderbox", story: true, photo: "any", label: "Natural · cabeçalho em caixa", fits: ["matchday"], Component: Natheaderbox },
  { id: "goalnatheaderbox", story: true, photo: "any", label: "Golo natural · cabeçalho em caixa", fits: ["goal"], Component: Goalnatheaderbox },
  { id: "natinitialcolor", story: true, photo: "any", label: "Natural · inicial colorida", fits: ["matchday"], Component: Natinitialcolor },
  { id: "goalnatinitialcolor", story: true, photo: "any", label: "Golo natural · inicial colorida", fits: ["goal"], Component: Goalnatinitialcolor },
  { id: "natrulebox", story: true, photo: "any", label: "Natural · caixa dividida", fits: ["matchday"], Component: Natrulebox },
  { id: "goalnatrulebox", story: true, photo: "any", label: "Golo natural · caixa dividida", fits: ["goal"], Component: Goalnatrulebox },
  { id: "natfadeword", story: true, photo: "any", label: "Natural · palavra a esvanecer", fits: ["matchday"], Component: Natfadeword },
  { id: "goalnatfadeword", story: true, photo: "any", label: "Golo natural · palavra a esvanecer", fits: ["goal"], Component: Goalnatfadeword },
  { id: "natleaders", story: true, photo: "any", label: "Natural · linhas pontilhadas", fits: ["matchday"], Component: Natleaders },
  { id: "goalnatleaders", story: true, photo: "any", label: "Golo natural · linhas pontilhadas", fits: ["goal"], Component: Goalnatleaders },
  { id: "natcresttop", story: true, photo: "any", label: "Natural · emblema no topo", fits: ["matchday"], Component: Natcresttop },
  { id: "goalnatcresttop", story: true, photo: "any", label: "Golo natural · emblema no topo", fits: ["goal"], Component: Goalnatcresttop },
  { id: "natthickline", story: true, photo: "any", label: "Natural · faixa inferior", fits: ["matchday"], Component: Natthickline },
  { id: "goalnatthickline", story: true, photo: "any", label: "Golo natural · faixa inferior", fits: ["goal"], Component: Goalnatthickline },
  { id: "natroundbox", story: true, photo: "any", label: "Natural · contorno redondo", fits: ["matchday"], Component: Natroundbox },
  { id: "goalnatroundbox", story: true, photo: "any", label: "Golo natural · contorno redondo", fits: ["goal"], Component: Goalnatroundbox },
  { id: "natnamesbig", story: true, photo: "any", label: "Natural · nomes grandes", fits: ["matchday"], Component: Natnamesbig },
  { id: "goalnatnamesbig", story: true, photo: "any", label: "Golo natural · nomes grandes", fits: ["goal"], Component: Goalnatnamesbig },
  { id: "natedgebar", story: true, photo: "any", label: "Natural · orla lateral", fits: ["matchday"], Component: Natedgebar },
  { id: "goalnatedgebar", story: true, photo: "any", label: "Golo natural · orla lateral", fits: ["goal"], Component: Goalnatedgebar },
  { id: "natdatepill", story: true, photo: "any", label: "Natural · data no canto", fits: ["matchday"], Component: Natdatepill },
  { id: "goalnatdatepill", story: true, photo: "any", label: "Golo natural · data no canto", fits: ["goal"], Component: Goalnatdatepill },
  { id: "nattoprule", story: true, photo: "any", label: "Natural · fio de abertura", fits: ["matchday"], Component: Nattoprule },
  { id: "goalnattoprule", story: true, photo: "any", label: "Golo natural · fio de abertura", fits: ["goal"], Component: Goalnattoprule },
  { id: "natcolorfoot", story: true, photo: "any", label: "Natural · rodapé colorido", fits: ["matchday"], Component: Natcolorfoot },
  { id: "goalnatcolorfoot", story: true, photo: "any", label: "Golo natural · rodapé colorido", fits: ["goal"], Component: Goalnatcolorfoot },
  { id: "nattriangle", story: true, photo: "any", label: "Natural · triângulo", fits: ["matchday"], Component: Nattriangle },
  { id: "goalnattriangle", story: true, photo: "any", label: "Golo natural · triângulo", fits: ["goal"], Component: Goalnattriangle },
  { id: "natpullbar", story: true, photo: "any", label: "Natural · barra de citação", fits: ["matchday"], Component: Natpullbar },
  { id: "goalnatpullbar", story: true, photo: "any", label: "Golo natural · barra de citação", fits: ["goal"], Component: Goalnatpullbar },
  { id: "natstadium", story: true, photo: "any", label: "Natural · estádio", fits: ["matchday"], Component: Natstadium },
  { id: "goalnatstadium", story: true, photo: "any", label: "Golo natural · estádio", fits: ["goal"], Component: Goalnatstadium },
  { id: "natwhenwhere", story: true, photo: "any", label: "Natural · quando e onde", fits: ["matchday"], Component: Natwhenwhere },
  { id: "goalnatwhenwhere", story: true, photo: "any", label: "Golo natural · quando e onde", fits: ["goal"], Component: Goalnatwhenwhere },
  { id: "natstretch", story: true, photo: "any", label: "Natural · esticado", fits: ["matchday"], Component: Natstretch },
  { id: "goalnatstretch", story: true, photo: "any", label: "Golo natural · esticado", fits: ["goal"], Component: Goalnatstretch },
  { id: "natchip", story: true, photo: "any", label: "Natural · pastilha de cor", fits: ["matchday"], Component: Natchip },
  { id: "goalnatchip", story: true, photo: "any", label: "Golo natural · pastilha de cor", fits: ["goal"], Component: Goalnatchip },
  { id: "natfadestack", story: true, photo: "any", label: "Natural · pilha esvanecida", fits: ["matchday"], Component: Natfadestack },
  { id: "goalnatfadestack", story: true, photo: "any", label: "Golo natural · pilha esvanecida", fits: ["goal"], Component: Goalnatfadestack },
  { id: "natthirds", story: true, photo: "any", label: "Natural · terços", fits: ["matchday"], Component: Natthirds },
  { id: "goalnatthirds", story: true, photo: "any", label: "Golo natural · terços", fits: ["goal"], Component: Goalnatthirds },
  { id: "natvdate", story: true, photo: "any", label: "Natural · data vertical", fits: ["matchday"], Component: Natvdate },
  { id: "goalnatvdate", story: true, photo: "any", label: "Golo natural · data vertical", fits: ["goal"], Component: Goalnatvdate },
  { id: "natlr", story: true, photo: "any", label: "Natural · esquerda e direita", fits: ["matchday"], Component: Natlr },
  { id: "goalnatlr", story: true, photo: "any", label: "Golo natural · esquerda e direita", fits: ["goal"], Component: Goalnatlr },
  { id: "natversus", story: true, photo: "any", label: "Natural · versus", fits: ["matchday"], Component: Natversus },
  { id: "goalnatversus", story: true, photo: "any", label: "Golo natural · versus", fits: ["goal"], Component: Goalnatversus },
  { id: "natmidside", story: true, photo: "any", label: "Natural · meio lateral", fits: ["matchday"], Component: Natmidside },
  { id: "goalnatmidside", story: true, photo: "any", label: "Golo natural · meio lateral", fits: ["goal"], Component: Goalnatmidside },
  { id: "natserifstack", story: true, photo: "any", label: "Natural · serifa empilhada", fits: ["matchday"], Component: Natserifstack },
  { id: "goalnatserifstack", story: true, photo: "any", label: "Golo natural · serifa empilhada", fits: ["goal"], Component: Goalnatserifstack },
  { id: "natduoline", story: true, photo: "any", label: "Natural · fio de duas cores", fits: ["matchday"], Component: Natduoline },
  { id: "goalnatduoline", story: true, photo: "any", label: "Golo natural · fio de duas cores", fits: ["goal"], Component: Goalnatduoline },
  { id: "natfolio", story: true, photo: "any", label: "Natural · fólio", fits: ["matchday"], Component: Natfolio },
  { id: "goalnatfolio", story: true, photo: "any", label: "Golo natural · fólio", fits: ["goal"], Component: Goalnatfolio },
  { id: "natstrike", story: true, photo: "any", label: "Natural · riscado", fits: ["matchday"], Component: Natstrike },
  { id: "goalnatstrike", story: true, photo: "any", label: "Golo natural · riscado", fits: ["goal"], Component: Goalnatstrike },
  { id: "natblockshadow", story: true, photo: "any", label: "Natural · bloco com sombra", fits: ["matchday"], Component: Natblockshadow },
  { id: "goalnatblockshadow", story: true, photo: "any", label: "Golo natural · bloco com sombra", fits: ["goal"], Component: Goalnatblockshadow },
  { id: "natlettertiles", story: true, photo: "any", label: "Natural · letras em mosaico", fits: ["matchday"], Component: Natlettertiles },
  { id: "goalnatlettertiles", story: true, photo: "any", label: "Golo natural · letras em mosaico", fits: ["goal"], Component: Goalnatlettertiles },
  { id: "natdiamond", story: true, photo: "any", label: "Natural · losangos", fits: ["matchday"], Component: Natdiamond },
  { id: "goalnatdiamond", story: true, photo: "any", label: "Golo natural · losangos", fits: ["goal"], Component: Goalnatdiamond },
  { id: "natbubble", story: true, photo: "any", label: "Natural · balão", fits: ["matchday"], Component: Natbubble },
  { id: "goalnatbubble", story: true, photo: "any", label: "Golo natural · balão", fits: ["goal"], Component: Goalnatbubble },
  { id: "natbullets", story: true, photo: "any", label: "Natural · lista com marcas", fits: ["matchday"], Component: Natbullets },
  { id: "goalnatbullets", story: true, photo: "any", label: "Golo natural · lista com marcas", fits: ["goal"], Component: Goalnatbullets },
  { id: "natoutlinetime", story: true, photo: "any", label: "Natural · hora em contorno", fits: ["matchday"], Component: Natoutlinetime },
  { id: "goalnatoutlinetime", story: true, photo: "any", label: "Golo natural · hora em contorno", fits: ["goal"], Component: Goalnatoutlinetime },
  { id: "natvletters", story: true, photo: "any", label: "Natural · letras verticais", fits: ["matchday"], Component: Natvletters },
  { id: "goalnatvletters", story: true, photo: "any", label: "Golo natural · letras verticais", fits: ["goal"], Component: Goalnatvletters },
  { id: "natthin", story: true, photo: "any", label: "Natural · fino espaçado", fits: ["matchday"], Component: Natthin },
  { id: "goalnatthin", story: true, photo: "any", label: "Golo natural · fino espaçado", fits: ["goal"], Component: Goalnatthin },
  { id: "natcascade", story: true, photo: "any", label: "Natural · cascata", fits: ["matchday"], Component: Natcascade },
  { id: "goalnatcascade", story: true, photo: "any", label: "Golo natural · cascata", fits: ["goal"], Component: Goalnatcascade },
  { id: "natsup", story: true, photo: "any", label: "Natural · expoente", fits: ["matchday"], Component: Natsup },
  { id: "goalnatsup", story: true, photo: "any", label: "Golo natural · expoente", fits: ["goal"], Component: Goalnatsup },
  { id: "natsplitline", story: true, photo: "any", label: "Natural · linha ao meio", fits: ["matchday"], Component: Natsplitline },
  { id: "goalnatsplitline", story: true, photo: "any", label: "Golo natural · linha ao meio", fits: ["goal"], Component: Goalnatsplitline },
  { id: "natunderdots", story: true, photo: "any", label: "Natural · três pontos", fits: ["matchday"], Component: Natunderdots },
  { id: "goalnatunderdots", story: true, photo: "any", label: "Golo natural · três pontos", fits: ["goal"], Component: Goalnatunderdots },
  { id: "nattimeline", story: true, photo: "any", label: "Natural · linha do tempo", fits: ["matchday"], Component: Nattimeline },
  { id: "goalnattimeline", story: true, photo: "any", label: "Golo natural · linha do tempo", fits: ["goal"], Component: Goalnattimeline },
  { id: "natfraction", story: true, photo: "any", label: "Natural · fração", fits: ["matchday"], Component: Natfraction },
  { id: "goalnatfraction", story: true, photo: "any", label: "Golo natural · fração", fits: ["goal"], Component: Goalnatfraction },
  { id: "natperiod", story: true, photo: "any", label: "Natural · ponto final", fits: ["matchday"], Component: Natperiod },
  { id: "goalnatperiod", story: true, photo: "any", label: "Golo natural · ponto final", fits: ["goal"], Component: Goalnatperiod },
  { id: "natcresttower", story: true, photo: "any", label: "Natural · torre de emblemas", fits: ["matchday"], Component: Natcresttower },
  { id: "goalnatcresttower", story: true, photo: "any", label: "Golo natural · torre de emblemas", fits: ["goal"], Component: Goalnatcresttower },
  { id: "natlinesides", story: true, photo: "any", label: "Natural · traços laterais", fits: ["matchday"], Component: Natlinesides },
  { id: "goalnatlinesides", story: true, photo: "any", label: "Golo natural · traços laterais", fits: ["goal"], Component: Goalnatlinesides },
  { id: "nattopcorner", story: true, photo: "any", label: "Natural · canto de cima", fits: ["matchday"], Component: Nattopcorner },
  { id: "goalnattopcorner", story: true, photo: "any", label: "Golo natural · canto com traço", fits: ["goal"], Component: Goalnattopcorner },
  { id: "natwhitefade", story: true, photo: "any", label: "Natural · névoa clara", fits: ["matchday"], Component: Natwhitefade },
  { id: "goalnatwhitefade", story: true, photo: "any", label: "Golo natural · névoa clara", fits: ["goal"], Component: Goalnatwhitefade },
  { id: "natjustify", story: true, photo: "any", label: "Natural · bloco justificado", fits: ["matchday"], Component: Natjustify },
  { id: "goalnatjustify", story: true, photo: "any", label: "Golo natural · bloco justificado", fits: ["goal"], Component: Goalnatjustify },
  { id: "natmagcaption", story: true, photo: "any", label: "Natural · legenda de revista", fits: ["matchday"], Component: Natmagcaption },
  { id: "goalnatmagcaption", story: true, photo: "any", label: "Golo natural · legenda de revista", fits: ["goal"], Component: Goalnatmagcaption },
  { id: "natsplitfill", story: true, photo: "any", label: "Natural · meio preenchido", fits: ["matchday"], Component: Natsplitfill },
  { id: "goalnatsplitfill", story: true, photo: "any", label: "Golo natural · meio preenchido", fits: ["goal"], Component: Goalnatsplitfill },
  { id: "natasterisk", story: true, photo: "any", label: "Natural · asterisco", fits: ["matchday"], Component: Natasterisk },
  { id: "goalnatasterisk", story: true, photo: "any", label: "Golo natural · asterisco", fits: ["goal"], Component: Goalnatasterisk },
  { id: "natpaired", story: true, photo: "any", label: "Natural · pares", fits: ["matchday"], Component: Natpaired },
  { id: "goalnatpaired", story: true, photo: "any", label: "Golo natural · pares", fits: ["goal"], Component: Goalnatpaired },
  { id: "natsmallcrest", story: true, photo: "any", label: "Natural · emblema na linha", fits: ["matchday"], Component: Natsmallcrest },
  { id: "goalnatsmallcrest", story: true, photo: "any", label: "Golo natural · emblema na linha", fits: ["goal"], Component: Goalnatsmallcrest },
  { id: "natsmallcaps", story: true, photo: "any", label: "Natural · versaletes", fits: ["matchday"], Component: Natsmallcaps },
  { id: "goalnatsmallcaps", story: true, photo: "any", label: "Golo natural · versaletes", fits: ["goal"], Component: Goalnatsmallcaps },
  { id: "natdropline", story: true, photo: "any", label: "Natural · fio vertical", fits: ["matchday"], Component: Natdropline },
  { id: "goalnatdropline", story: true, photo: "any", label: "Golo natural · fio vertical", fits: ["goal"], Component: Goalnatdropline },
  { id: "natruler", story: true, photo: "any", label: "Natural · régua", fits: ["matchday"], Component: Natruler },
  { id: "goalnatruler", story: true, photo: "any", label: "Golo natural · régua", fits: ["goal"], Component: Goalnatruler },
  { id: "natrows", story: true, photo: "any", label: "Natural · linhas de tabela", fits: ["matchday"], Component: Natrows },
  { id: "goalnatrows", story: true, photo: "any", label: "Golo natural · linhas de tabela", fits: ["goal"], Component: Goalnatrows },
  { id: "natblockcorners", story: true, photo: "any", label: "Natural · cantos no bloco", fits: ["matchday"], Component: Natblockcorners },
  { id: "goalnatblockcorners", story: true, photo: "any", label: "Golo natural · cantos no bloco", fits: ["goal"], Component: Goalnatblockcorners },
  { id: "natellipse", story: true, photo: "any", label: "Natural · elipse", fits: ["matchday"], Component: Natellipse },
  { id: "goalnatellipse", story: true, photo: "any", label: "Golo natural · elipse", fits: ["goal"], Component: Goalnatellipse },
  { id: "natheaderline", story: true, photo: "any", label: "Natural · cabeçalho com fio", fits: ["matchday"], Component: Natheaderline },
  { id: "goalnatheaderline", story: true, photo: "any", label: "Golo natural · cabeçalho com fio", fits: ["goal"], Component: Goalnatheaderline },
  { id: "natsidenote", story: true, photo: "any", label: "Natural · nota lateral", fits: ["matchday"], Component: Natsidenote },
  { id: "goalnatsidenote", story: true, photo: "any", label: "Golo natural · nota lateral", fits: ["goal"], Component: Goalnatsidenote },
  { id: "natunderlinefat", story: true, photo: "any", label: "Natural · sublinhado grosso", fits: ["matchday"], Component: Natunderlinefat },
  { id: "goalnatunderlinefat", story: true, photo: "any", label: "Golo natural · sublinhado grosso", fits: ["goal"], Component: Goalnatunderlinefat },
  { id: "natframeline", story: true, photo: "any", label: "Natural · passe-partout", fits: ["matchday"], Component: Natframeline },
  { id: "goalnatframeline", story: true, photo: "any", label: "Golo natural · passe-partout", fits: ["goal"], Component: Goalnatframeline },
  { id: "natbadgeline", story: true, photo: "any", label: "Natural · etiqueta e fio", fits: ["matchday"], Component: Natbadgeline },
  { id: "goalnatbadgeline", story: true, photo: "any", label: "Golo natural · etiqueta e fio", fits: ["goal"], Component: Goalnatbadgeline },
  { id: "natmixcase", story: true, photo: "any", label: "Natural · duas vozes", fits: ["matchday"], Component: Natmixcase },
  { id: "goalnatmixcase", story: true, photo: "any", label: "Golo natural · duas vozes", fits: ["goal"], Component: Goalnatmixcase },
  { id: "natshadowword", story: true, photo: "any", label: "Natural · eco", fits: ["matchday"], Component: Natshadowword },
  { id: "goalnatshadowword", story: true, photo: "any", label: "Golo natural · eco", fits: ["goal"], Component: Goalnatshadowword },
  { id: "natquotebar", story: true, photo: "any", label: "Natural · barra lateral", fits: ["matchday"], Component: Natquotebar },
  { id: "goalnatquotebar", story: true, photo: "any", label: "Golo natural · barra lateral", fits: ["goal"], Component: Goalnatquotebar },
  { id: "natbigv", story: true, photo: "any", label: "Natural · v grande", fits: ["matchday"], Component: Natbigv },
  { id: "goalnatbigv", story: true, photo: "any", label: "Golo natural · v grande", fits: ["goal"], Component: Goalnatbigv },
  { id: "natstep", story: true, photo: "any", label: "Natural · escada", fits: ["matchday"], Component: Natstep },
  { id: "goalnatstep", story: true, photo: "any", label: "Golo natural · escada", fits: ["goal"], Component: Goalnatstep },
  { id: "natnumbered", story: true, photo: "any", label: "Natural · lista numerada", fits: ["matchday"], Component: Natnumbered },
  { id: "goalnatnumbered", story: true, photo: "any", label: "Golo natural · lista numerada", fits: ["goal"], Component: Goalnatnumbered },
  { id: "natcircletag", story: true, photo: "any", label: "Natural · anel", fits: ["matchday"], Component: Natcircletag },
  { id: "goalnatcircletag", story: true, photo: "any", label: "Golo natural · anel", fits: ["goal"], Component: Goalnatcircletag },
  { id: "natslashdate", story: true, photo: "any", label: "Natural · barra oblíqua", fits: ["matchday"], Component: Natslashdate },
  { id: "goalnatslashdate", story: true, photo: "any", label: "Golo natural · barra oblíqua", fits: ["goal"], Component: Goalnatslashdate },
  { id: "natboxedname", story: true, photo: "any", label: "Natural · linha em caixa", fits: ["matchday"], Component: Natboxedname },
  { id: "goalnatboxedname", story: true, photo: "any", label: "Golo natural · linha em caixa", fits: ["goal"], Component: Goalnatboxedname },
  { id: "natfadeline", story: true, photo: "any", label: "Natural · fio que desvanece", fits: ["matchday"], Component: Natfadeline },
  { id: "goalnatfadeline", story: true, photo: "any", label: "Golo natural · fio que desvanece", fits: ["goal"], Component: Goalnatfadeline },
  { id: "natpipe", story: true, photo: "any", label: "Natural · cápsula com divisões", fits: ["matchday"], Component: Natpipe },
  { id: "goalnatpipe", story: true, photo: "any", label: "Golo natural · cápsula com divisões", fits: ["goal"], Component: Goalnatpipe },
  { id: "natwave", story: true, photo: "any", label: "Natural · onda", fits: ["matchday"], Component: Natwave },
  { id: "goalnatwave", story: true, photo: "any", label: "Golo natural · onda", fits: ["goal"], Component: Goalnatwave },
  { id: "nataboveunder", story: true, photo: "any", label: "Natural · entre fios", fits: ["matchday"], Component: Nataboveunder },
  { id: "goalnataboveunder", story: true, photo: "any", label: "Golo natural · entre fios", fits: ["goal"], Component: Goalnataboveunder },
  { id: "natemdash", story: true, photo: "any", label: "Natural · travessão", fits: ["matchday"], Component: Natemdash },
  { id: "goalnatemdash", story: true, photo: "any", label: "Golo natural · travessão", fits: ["goal"], Component: Goalnatemdash },
  { id: "natcheck", story: true, photo: "any", label: "Natural · visto", fits: ["matchday"], Component: Natcheck },
  { id: "goalnatcheck", story: true, photo: "any", label: "Golo natural · visto", fits: ["goal"], Component: Goalnatcheck },
  { id: "natjustifyrow", story: true, photo: "any", label: "Natural · linha espalhada", fits: ["matchday"], Component: Natjustifyrow },
  { id: "goalnatjustifyrow", story: true, photo: "any", label: "Golo natural · linha espalhada", fits: ["goal"], Component: Goalnatjustifyrow },
  { id: "natchevrons", story: true, photo: "any", label: "Natural · setas", fits: ["matchday"], Component: Natchevrons },
  { id: "goalnatchevrons", story: true, photo: "any", label: "Golo natural · setas", fits: ["goal"], Component: Goalnatchevrons },
  { id: "natslashes", story: true, photo: "any", label: "Natural · barras duplas", fits: ["matchday"], Component: Natslashes },
  { id: "goalnatslashes", story: true, photo: "any", label: "Golo natural · barras duplas", fits: ["goal"], Component: Goalnatslashes },
  { id: "natplusline", story: true, photo: "any", label: "Natural · fio com cruzes", fits: ["matchday"], Component: Natplusline },
  { id: "goalnatplusline", story: true, photo: "any", label: "Golo natural · fio com cruzes", fits: ["goal"], Component: Goalnatplusline },
  { id: "natbars", story: true, photo: "any", label: "Natural · três barras", fits: ["matchday"], Component: Natbars },
  { id: "goalnatbars", story: true, photo: "any", label: "Golo natural · três barras", fits: ["goal"], Component: Goalnatbars },
  { id: "natlcorner", story: true, photo: "any", label: "Natural · canto em L", fits: ["matchday"], Component: Natlcorner },
  { id: "goalnatlcorner", story: true, photo: "any", label: "Golo natural · canto em L", fits: ["goal"], Component: Goalnatlcorner },
  { id: "natdotgrid9", story: true, photo: "any", label: "Natural · grelha de pontos", fits: ["matchday"], Component: Natdotgrid9 },
  { id: "goalnatdotgrid9", story: true, photo: "any", label: "Golo natural · grelha de pontos", fits: ["goal"], Component: Goalnatdotgrid9 },
  { id: "natsquaremark", story: true, photo: "any", label: "Natural · quadrado", fits: ["matchday"], Component: Natsquaremark },
  { id: "goalnatsquaremark", story: true, photo: "any", label: "Golo natural · quadrado", fits: ["goal"], Component: Goalnatsquaremark },
  { id: "natdashes", story: true, photo: "any", label: "Natural · três traços", fits: ["matchday"], Component: Natdashes },
  { id: "goalnatdashes", story: true, photo: "any", label: "Golo natural · três traços", fits: ["goal"], Component: Goalnatdashes },
  { id: "nattilde", story: true, photo: "any", label: "Natural · til", fits: ["matchday"], Component: Nattilde },
  { id: "goalnattilde", story: true, photo: "any", label: "Golo natural · til", fits: ["goal"], Component: Goalnattilde },
  { id: "natarcmark", story: true, photo: "any", label: "Natural · arco", fits: ["matchday"], Component: Natarcmark },
  { id: "goalnatarcmark", story: true, photo: "any", label: "Golo natural · arco", fits: ["goal"], Component: Goalnatarcmark },
  { id: "natfirstfill", story: true, photo: "any", label: "Natural · primeira letra cheia", fits: ["matchday"], Component: Natfirstfill },
  { id: "goalnatfirstfill", story: true, photo: "any", label: "Golo natural · primeira letra cheia", fits: ["goal"], Component: Goalnatfirstfill },
  { id: "natlastcolor", story: true, photo: "any", label: "Natural · última letra a cor", fits: ["matchday"], Component: Natlastcolor },
  { id: "goalnatlastcolor", story: true, photo: "any", label: "Golo natural · última letra a cor", fits: ["goal"], Component: Goalnatlastcolor },
  { id: "natboxletter", story: true, photo: "any", label: "Natural · letra em caixa", fits: ["matchday"], Component: Natboxletter },
  { id: "goalnatboxletter", story: true, photo: "any", label: "Golo natural · letra em caixa", fits: ["goal"], Component: Goalnatboxletter },
  { id: "natcolorsub", story: true, photo: "any", label: "Natural · linhas a cor", fits: ["matchday"], Component: Natcolorsub },
  { id: "goalnatcolorsub", story: true, photo: "any", label: "Golo natural · linhas a cor", fits: ["goal"], Component: Goalnatcolorsub },
  { id: "natcolorword", story: true, photo: "any", label: "Natural · palavra a cor", fits: ["matchday"], Component: Natcolorword },
  { id: "goalnatcolorword", story: true, photo: "any", label: "Golo natural · palavra a cor", fits: ["goal"], Component: Goalnatcolorword },
  { id: "natbebas", story: true, photo: "any", label: "Natural · letra alta", fits: ["matchday"], Component: Natbebas },
  { id: "goalnatbebas", story: true, photo: "any", label: "Golo natural · letra alta", fits: ["goal"], Component: Goalnatbebas },
  { id: "natbodoni", story: true, photo: "any", label: "Natural · serifa de revista", fits: ["matchday"], Component: Natbodoni },
  { id: "goalnatbodoni", story: true, photo: "any", label: "Golo natural · serifa de revista", fits: ["goal"], Component: Goalnatbodoni },
  { id: "natunbounded", story: true, photo: "any", label: "Natural · letra larga", fits: ["matchday"], Component: Natunbounded },
  { id: "goalnatunbounded", story: true, photo: "any", label: "Golo natural · letra larga", fits: ["goal"], Component: Goalnatunbounded },
  { id: "natgrotesk", story: true, photo: "any", label: "Natural · letra técnica", fits: ["matchday"], Component: Natgrotesk },
  { id: "goalnatgrotesk", story: true, photo: "any", label: "Golo natural · letra técnica", fits: ["goal"], Component: Goalnatgrotesk },
  { id: "natalfaslab", story: true, photo: "any", label: "Natural · serifa grossa", fits: ["matchday"], Component: Natalfaslab },
  { id: "goalnatalfaslab", story: true, photo: "any", label: "Golo natural · serifa grossa", fits: ["goal"], Component: Goalnatalfaslab },
  { id: "natanton", story: true, photo: "any", label: "Natural · cartaz estreito", fits: ["matchday"], Component: Natanton },
  { id: "goalnatanton", story: true, photo: "any", label: "Golo natural · cartaz estreito", fits: ["goal"], Component: Goalnatanton },
  { id: "natbarlow", story: true, photo: "any", label: "Natural · condensada desportiva", fits: ["matchday"], Component: Natbarlow },
  { id: "goalnatbarlow", story: true, photo: "any", label: "Golo natural · condensada desportiva", fits: ["goal"], Component: Goalnatbarlow },
  { id: "natarchivo", story: true, photo: "any", label: "Natural · grotesca pesada", fits: ["matchday"], Component: Natarchivo },
  { id: "goalnatarchivo", story: true, photo: "any", label: "Golo natural · grotesca pesada", fits: ["goal"], Component: Goalnatarchivo },
  { id: "natdela", story: true, photo: "any", label: "Natural · letra robusta", fits: ["matchday"], Component: Natdela },
  { id: "goalnatdela", story: true, photo: "any", label: "Golo natural · letra robusta", fits: ["goal"], Component: Goalnatdela },
  { id: "natitalicserif", story: true, photo: "any", label: "Natural · itálico serifado", fits: ["matchday"], Component: Natitalicserif },
  { id: "goalnatitalicserif", story: true, photo: "any", label: "Golo natural · itálico serifado", fits: ["goal"], Component: Goalnatitalicserif },
  { id: "natmontserrat", story: true, photo: "any", label: "Natural · geométrica espaçada", fits: ["matchday"], Component: Natmontserrat },
  { id: "goalnatmontserrat", story: true, photo: "any", label: "Golo natural · geométrica espaçada", fits: ["goal"], Component: Goalnatmontserrat },
  { id: "natfraunces", story: true, photo: "any", label: "Natural · serifa quente", fits: ["matchday"], Component: Natfraunces },
  { id: "goalnatfraunces", story: true, photo: "any", label: "Golo natural · serifa quente", fits: ["goal"], Component: Goalnatfraunces },
  { id: "natarchivolight", story: true, photo: "any", label: "Natural · maiúsculas finas", fits: ["matchday"], Component: Natarchivolight },
  { id: "goalnatarchivolight", story: true, photo: "any", label: "Golo natural · maiúsculas finas", fits: ["goal"], Component: Goalnatarchivolight },
  { id: "natrubikmono", story: true, photo: "any", label: "Natural · monoespaçada pesada", fits: ["matchday"], Component: Natrubikmono },
  { id: "goalnatrubikmono", story: true, photo: "any", label: "Golo natural · monoespaçada pesada", fits: ["goal"], Component: Goalnatrubikmono },
  { id: "natfrauncesit", story: true, photo: "any", label: "Natural · itálico quente", fits: ["matchday"], Component: Natfrauncesit },
  { id: "goalnatfrauncesit", story: true, photo: "any", label: "Golo natural · itálico quente", fits: ["goal"], Component: Goalnatfrauncesit },
  { id: "natfreecol", story: true, photo: "any", label: "Natural · coluna livre", fits: ["matchday"], Component: Natfreecol },
  { id: "goalnatfreecol", story: true, photo: "any", label: "Golo natural · coluna livre", fits: ["goal"], Component: Goalnatfreecol },
  { id: "natcutoff", story: true, photo: "any", label: "Natural · palavra cortada", fits: ["matchday"], Component: Natcutoff },
  { id: "goalnatcutoff", story: true, photo: "any", label: "Golo natural · palavra cortada", fits: ["goal"], Component: Goalnatcutoff },
  { id: "natcornerpair", story: true, photo: "any", label: "Natural · cantos opostos", fits: ["matchday"], Component: Natcornerpair },
  { id: "goalnatcornerpair", story: true, photo: "any", label: "Golo natural · cantos opostos", fits: ["goal"], Component: Goalnatcornerpair },
  { id: "natmirror", story: true, photo: "any", label: "Natural · reflexo", fits: ["matchday"], Component: Natmirror },
  { id: "goalnatmirror", story: true, photo: "any", label: "Golo natural · reflexo", fits: ["goal"], Component: Goalnatmirror },
  { id: "natbehindword", story: true, photo: "any", label: "Natural · palavra atrás", fits: ["matchday"], Component: Natbehindword },
  { id: "goalnatbehindword", story: true, photo: "any", label: "Golo natural · palavra atrás", fits: ["goal"], Component: Goalnatbehindword },
  { id: "natbehindoutline", story: true, photo: "any", label: "Natural · atrás em contorno", fits: ["matchday"], Component: Natbehindoutline },
  { id: "goalnatbehindoutline", story: true, photo: "any", label: "Golo natural · atrás em contorno", fits: ["goal"], Component: Goalnatbehindoutline },
  { id: "natbehindcolor", story: true, photo: "any", label: "Natural · atrás a cor", fits: ["matchday"], Component: Natbehindcolor },
  { id: "goalnatbehindcolor", story: true, photo: "any", label: "Golo natural · atrás a cor", fits: ["goal"], Component: Goalnatbehindcolor },
  { id: "natbehindserif", story: true, photo: "any", label: "Natural · atrás serifado", fits: ["matchday"], Component: Natbehindserif },
  { id: "goalnatbehindserif", story: true, photo: "any", label: "Golo natural · atrás serifado", fits: ["goal"], Component: Goalnatbehindserif },
  { id: "natbehindtall", story: true, photo: "any", label: "Natural · atrás alta", fits: ["matchday"], Component: Natbehindtall },
  { id: "goalnatbehindtall", story: true, photo: "any", label: "Golo natural · atrás alta", fits: ["goal"], Component: Goalnatbehindtall },
  { id: "natcutoffoutline", story: true, photo: "any", label: "Natural · cortada em contorno", fits: ["matchday"], Component: Natcutoffoutline },
  { id: "goalnatcutoffoutline", story: true, photo: "any", label: "Golo natural · cortada em contorno", fits: ["goal"], Component: Goalnatcutoffoutline },
  { id: "natcutoffcolor", story: true, photo: "any", label: "Natural · cortada a cor", fits: ["matchday"], Component: Natcutoffcolor },
  { id: "goalnatcutoffcolor", story: true, photo: "any", label: "Golo natural · cortada a cor", fits: ["goal"], Component: Goalnatcutoffcolor },
  { id: "natcutofftall", story: true, photo: "any", label: "Natural · cortada alta", fits: ["matchday"], Component: Natcutofftall },
  { id: "goalnatcutofftall", story: true, photo: "any", label: "Golo natural · cortada alta", fits: ["goal"], Component: Goalnatcutofftall },
  { id: "natcutoffserif", story: true, photo: "any", label: "Natural · cortada serifada", fits: ["matchday"], Component: Natcutoffserif },
  { id: "goalnatcutoffserif", story: true, photo: "any", label: "Golo natural · cortada serifada", fits: ["goal"], Component: Goalnatcutoffserif },
  { id: "natbehindbodoni", story: true, photo: "any", label: "Natural · atrás em Bodoni", fits: ["matchday"], Component: Natbehindbodoni },
  { id: "goalnatbehindbodoni", story: true, photo: "any", label: "Golo natural · atrás em Bodoni", fits: ["goal"], Component: Goalnatbehindbodoni },
  { id: "natbehindgrotesk", story: true, photo: "any", label: "Natural · atrás técnica", fits: ["matchday"], Component: Natbehindgrotesk },
  { id: "goalnatbehindgrotesk", story: true, photo: "any", label: "Golo natural · atrás técnica", fits: ["goal"], Component: Goalnatbehindgrotesk },
  { id: "natcornerbodoni", story: true, photo: "any", label: "Natural · cantos em Bodoni", fits: ["matchday"], Component: Natcornerbodoni },
  { id: "goalnatcornerbodoni", story: true, photo: "any", label: "Golo natural · cantos em Bodoni", fits: ["goal"], Component: Goalnatcornerbodoni },
  { id: "natcornertall", story: true, photo: "any", label: "Natural · cantos altos", fits: ["matchday"], Component: Natcornertall },
  { id: "goalnatcornertall", story: true, photo: "any", label: "Golo natural · cantos altos", fits: ["goal"], Component: Goalnatcornertall },
  { id: "natmirrorserif", story: true, photo: "any", label: "Natural · reflexo serifado", fits: ["matchday"], Component: Natmirrorserif },
  { id: "goalnatmirrorserif", story: true, photo: "any", label: "Golo natural · reflexo serifado", fits: ["goal"], Component: Goalnatmirrorserif },
  { id: "natmirrorcolor", story: true, photo: "any", label: "Natural · reflexo a cor", fits: ["matchday"], Component: Natmirrorcolor },
  { id: "goalnatmirrorcolor", story: true, photo: "any", label: "Golo natural · reflexo a cor", fits: ["goal"], Component: Goalnatmirrorcolor },
  { id: "natfreecolserif", story: true, photo: "any", label: "Natural · coluna serifada", fits: ["matchday"], Component: Natfreecolserif },
  { id: "goalnatfreecolserif", story: true, photo: "any", label: "Golo natural · coluna serifada", fits: ["goal"], Component: Goalnatfreecolserif },
  { id: "natcorneroutline", story: true, photo: "any", label: "Natural · cantos em contorno", fits: ["matchday"], Component: Natcorneroutline },
  { id: "goalnatcorneroutline", story: true, photo: "any", label: "Golo natural · cantos em contorno", fits: ["goal"], Component: Goalnatcorneroutline },
  { id: "natcornercolor", story: true, photo: "any", label: "Natural · cantos a cor", fits: ["matchday"], Component: Natcornercolor },
  { id: "goalnatcornercolor", story: true, photo: "any", label: "Golo natural · cantos a cor", fits: ["goal"], Component: Goalnatcornercolor },
  { id: "natfreecolbodoni", story: true, photo: "any", label: "Natural · coluna em Bodoni", fits: ["matchday"], Component: Natfreecolbodoni },
  { id: "goalnatfreecolbodoni", story: true, photo: "any", label: "Golo natural · coluna em Bodoni", fits: ["goal"], Component: Goalnatfreecolbodoni },
  { id: "natfreecoltall", story: true, photo: "any", label: "Natural · coluna alta", fits: ["matchday"], Component: Natfreecoltall },
  { id: "goalnatfreecoltall", story: true, photo: "any", label: "Golo natural · coluna alta", fits: ["goal"], Component: Goalnatfreecoltall },
  { id: "natmirrorbodoni", story: true, photo: "any", label: "Natural · reflexo em Bodoni", fits: ["matchday"], Component: Natmirrorbodoni },
  { id: "goalnatmirrorbodoni", story: true, photo: "any", label: "Golo natural · reflexo em Bodoni", fits: ["goal"], Component: Goalnatmirrorbodoni },
  { id: "goalnatcorner", story: true, photo: "any", label: "Golo natural · canto", fits: ["goal"], Component: Goalnatcorner },
  { id: "goalnatlight", story: true, photo: "any", label: "Golo natural · luz", fits: ["goal"], Component: Goalnatlight },
  { id: "natclean", story: true, photo: "any", label: "Natural · foto limpa", fits: ["matchday"], Component: Natclean },
  { id: "natstrip", story: true, photo: "any", label: "Natural · faixa", fits: ["matchday"], Component: Natstrip },
  { id: "natdate", story: true, photo: "any", label: "Natural · data atrás", fits: ["matchday"], Component: Natdate },
  { id: "goalnatclean", story: true, photo: "any", label: "Golo natural · foto limpa", fits: ["goal"], Component: Goalnatclean },
  { id: "goalnatname", story: true, photo: "any", label: "Golo natural · apelido atrás", fits: ["goal"], Component: Goalnatname },
  { id: "goalnatstrip", story: true, photo: "any", label: "Golo natural · faixa", fits: ["goal"], Component: Goalnatstrip },
  { id: "nattime", story: true, photo: "any", label: "Natural · hora atrás", fits: ["matchday"], Component: Nattime },
  { id: "natvert", story: true, photo: "any", label: "Natural · vertical", fits: ["matchday"], Component: Natvert },
  { id: "natborder", story: true, photo: "any", label: "Natural · moldura", fits: ["matchday"], Component: Natborder },
  { id: "goalnatvert", story: true, photo: "any", label: "Golo natural · vertical", fits: ["goal"], Component: Goalnatvert },
  { id: "goalnatborder", story: true, photo: "any", label: "Golo natural · moldura", fits: ["goal"], Component: Goalnatborder },
  { id: "goalnatsplit", story: true, photo: "any", label: "Golo natural · dividido", fits: ["goal"], Component: Goalnatsplit },
  { id: "natcrest", story: true, photo: "any", label: "Natural · emblema atrás", fits: ["matchday"], Component: Natcrest },
  { id: "natnumber", story: true, photo: "any", label: "Natural · número atrás", fits: ["matchday"], Component: Natnumber },
  { id: "goalnatcrest", story: true, photo: "any", label: "Golo natural · emblema atrás", fits: ["goal"], Component: Goalnatcrest },
  { id: "goalnatnumber", story: true, photo: "any", label: "Golo natural · número atrás", fits: ["goal"], Component: Goalnatnumber },
  { id: "natstamp", story: true, photo: "any", label: "Natural · selo", fits: ["matchday"], Component: Natstamp },
  { id: "goalnatstamp", story: true, photo: "any", label: "Golo natural · selo", fits: ["goal"], Component: Goalnatstamp },
  { id: "natcaption", story: true, photo: "any", label: "Natural · legenda", fits: ["matchday"], Component: Natcaption },
  { id: "goalnatcaption", story: true, photo: "any", label: "Golo natural · legenda", fits: ["goal"], Component: Goalnatcaption },
  { id: "natoutline", story: true, photo: "any", label: "Natural · contorno", fits: ["matchday"], Component: Natoutline },
  { id: "goalnatoutline", story: true, photo: "any", label: "Golo natural · contorno", fits: ["goal"], Component: Goalnatoutline },
  { id: "natbug", story: true, photo: "any", label: "Natural · grafismo TV", fits: ["matchday"], Component: Natbug },
  { id: "goalnatbug", story: true, photo: "any", label: "Golo natural · grafismo TV", fits: ["goal"], Component: Goalnatbug },
  { id: "natfocus", story: true, photo: "any", label: "Natural · foco", fits: ["matchday"], Component: Natfocus },
  { id: "goalnatfocus", story: true, photo: "any", label: "Golo natural · foco", fits: ["goal"], Component: Goalnatfocus },
  { id: "nathorizon", story: true, photo: "any", label: "Natural · linha da relva", fits: ["matchday"], Component: Nathorizon },
  { id: "goalnathorizon", story: true, photo: "any", label: "Golo natural · linha da relva", fits: ["goal"], Component: Goalnathorizon },
  { id: "natserif", story: true, photo: "any", label: "Natural · serifa", fits: ["matchday"], Component: Natserif },
  { id: "goalnatserif", story: true, photo: "any", label: "Golo natural · serifa", fits: ["goal"], Component: Goalnatserif },
  { id: "natvenue", story: true, photo: "any", label: "Natural · estádio", fits: ["matchday"], Component: Natvenue },
  { id: "natarc", story: true, photo: "any", label: "Natural · arco", fits: ["matchday"], Component: Natarc },
  { id: "goalnatarc", story: true, photo: "any", label: "Golo natural · arco", fits: ["goal"], Component: Goalnatarc },
  { id: "goalnatcallout", story: true, photo: "any", label: "Golo natural · legenda apontada", fits: ["goal"], Component: Goalnatcallout },
  { id: "natmono", story: true, photo: "any", label: "Natural · máquina de escrever", fits: ["matchday"], Component: Natmono },
  { id: "goalnatmono", story: true, photo: "any", label: "Golo natural · máquina de escrever", fits: ["goal"], Component: Goalnatmono },
  { id: "natticket", story: true, photo: "any", label: "Natural · bilhete", fits: ["matchday"], Component: Natticket },
  { id: "natstack", story: true, photo: "any", label: "Natural · coluna", fits: ["matchday"], Component: Natstack },
  { id: "goalnatstack", story: true, photo: "any", label: "Golo natural · coluna", fits: ["goal"], Component: Goalnatstack },
  { id: "goalnatinitial", story: true, photo: "any", label: "Golo natural · inicial", fits: ["goal"], Component: Goalnatinitial },
  { id: "natmasthead", story: true, photo: "any", label: "Natural · cabeçalho de jornal", fits: ["matchday"], Component: Natmasthead },
  { id: "goalnatmasthead", story: true, photo: "any", label: "Golo natural · cabeçalho de jornal", fits: ["goal"], Component: Goalnatmasthead },
  { id: "natclock", story: true, photo: "any", label: "Natural · relógio", fits: ["matchday"], Component: Natclock },
  { id: "goalnatitalic", story: true, photo: "any", label: "Golo natural · itálico", fits: ["goal"], Component: Goalnatitalic },
  { id: "natpill", story: true, photo: "any", label: "Natural · etiquetas", fits: ["matchday"], Component: Natpill },
  { id: "goalnatpill", story: true, photo: "any", label: "Golo natural · etiquetas", fits: ["goal"], Component: Goalnatpill },
  { id: "natglass", story: true, photo: "any", label: "Natural · vidro", fits: ["matchday"], Component: Natglass },
  { id: "goalnatglass", story: true, photo: "any", label: "Golo natural · vidro", fits: ["goal"], Component: Goalnatglass },
  { id: "natquad", story: true, photo: "any", label: "Natural · quatro cantos", fits: ["matchday"], Component: Natquad },
  { id: "goalnatquad", story: true, photo: "any", label: "Golo natural · quatro cantos", fits: ["goal"], Component: Goalnatquad },
  { id: "natflank", story: true, photo: "any", label: "Natural · palavra dividida", fits: ["matchday"], Component: Natflank },
  { id: "goalnatflank", story: true, photo: "any", label: "Golo natural · palavra dividida", fits: ["goal"], Component: Goalnatflank },
  { id: "natsubtitle", story: true, photo: "any", label: "Natural · legenda de cinema", fits: ["matchday"], Component: Natsubtitle },
  { id: "goalnatsubtitle", story: true, photo: "any", label: "Golo natural · legenda de cinema", fits: ["goal"], Component: Goalnatsubtitle },
  { id: "natled", story: true, photo: "any", label: "Natural · painel LED", fits: ["matchday"], Component: Natled },
  { id: "goalnatled", story: true, photo: "any", label: "Golo natural · painel LED", fits: ["goal"], Component: Goalnatled },
  { id: "natticker", story: true, photo: "any", label: "Natural · faixa de notícias", fits: ["matchday"], Component: Natticker },
  { id: "goalnatticker", story: true, photo: "any", label: "Golo natural · faixa de notícias", fits: ["goal"], Component: Goalnatticker },
  { id: "natlocation", story: true, photo: "any", label: "Natural · localização", fits: ["matchday"], Component: Natlocation },
  { id: "goalnatwide", story: true, photo: "any", label: "Golo natural · espaçado", fits: ["goal"], Component: Goalnatwide },
  { id: "natcalendar", story: true, photo: "any", label: "Natural · calendário", fits: ["matchday"], Component: Natcalendar },
  { id: "nathashtag", story: true, photo: "any", label: "Natural · hashtag", fits: ["matchday"], Component: Nathashtag },
  { id: "goalnathashtag", story: true, photo: "any", label: "Golo natural · hashtag", fits: ["goal"], Component: Goalnathashtag },
  { id: "goalnatquote", story: true, photo: "any", label: "Golo natural · citação", fits: ["goal"], Component: Goalnatquote },
  { id: "natslant", story: true, photo: "any", label: "Natural · inclinado", fits: ["matchday"], Component: Natslant },
  { id: "goalnatslant", story: true, photo: "any", label: "Golo natural · inclinado", fits: ["goal"], Component: Goalnatslant },
  { id: "natboxed", story: true, photo: "any", label: "Natural · caixa fina", fits: ["matchday"], Component: Natboxed },
  { id: "goalnatboxed", story: true, photo: "any", label: "Golo natural · caixa fina", fits: ["goal"], Component: Goalnatboxed },
  { id: "natunderline", story: true, photo: "any", label: "Natural · sublinhado", fits: ["matchday"], Component: Natunderline },
  { id: "goalnatunderline", story: true, photo: "any", label: "Golo natural · sublinhado", fits: ["goal"], Component: Goalnatunderline },
  { id: "natknockout", story: true, photo: "any", label: "Natural · letras recortadas", fits: ["matchday"], Component: Natknockout },
  { id: "goalnatknockout", story: true, photo: "any", label: "Golo natural · letras recortadas", fits: ["goal"], Component: Goalnatknockout },
  { id: "natdymo", story: true, photo: "any", label: "Natural · etiqueta", fits: ["matchday"], Component: Natdymo },
  { id: "goalnatdymo", story: true, photo: "any", label: "Golo natural · etiqueta", fits: ["goal"], Component: Goalnatdymo },
  { id: "natturf", story: true, photo: "any", label: "Natural · pintado na relva", fits: ["matchday"], Component: Natturf },
  { id: "goalnatturf", story: true, photo: "any", label: "Golo natural · pintado na relva", fits: ["goal"], Component: Goalnatturf },
  { id: "natswatch", story: true, photo: "any", label: "Natural · amostra de cor", fits: ["matchday"], Component: Natswatch },
  { id: "goalnatswatch", story: true, photo: "any", label: "Golo natural · amostra de cor", fits: ["goal"], Component: Goalnatswatch },
  { id: "natneon", story: true, photo: "any", label: "Natural · néon", fits: ["matchday"], Component: Natneon },
  { id: "goalnatneon", story: true, photo: "any", label: "Golo natural · néon", fits: ["goal"], Component: Goalnatneon },
  { id: "natcinema", story: true, photo: "any", label: "Natural · cinema", fits: ["matchday"], Component: Natcinema },
  { id: "goalnatcinema", story: true, photo: "any", label: "Golo natural · cinema", fits: ["goal"], Component: Goalnatcinema },
  { id: "natlit", story: true, photo: "any", label: "Natural · destaque", fits: ["matchday"], Component: Natlit },
  { id: "goalnatlit", story: true, photo: "any", label: "Golo natural · destaque", fits: ["goal"], Component: Goalnatlit },
  { id: "natsand", photo: "any", label: "Natural · dourado", fits: ["matchday"], Component: Natsand },
  { id: "goalnatsand", photo: "any", label: "Golo natural · dourado", fits: ["goal"], Component: Goalnatsand },
  { id: "natstarring", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · starring", fits: ["matchday"], Component: Natstarring },
  { id: "goalnatstarring", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo natural · starring", fits: ["goal"], Component: Goalnatstarring },
  { id: "natbeam", photo: "any", label: "Natural · feixe", fits: ["matchday"], Component: Natbeam },
  { id: "goalnatbeam", photo: "any", label: "Golo natural · feixe", fits: ["goal"], Component: Goalnatbeam },
  { id: "natring", photo: "any", label: "Natural · anel", fits: ["matchday"], Component: Natring },
  { id: "goalnatring", photo: "any", label: "Golo natural · anel", fits: ["goal"], Component: Goalnatring },
  { id: "natpanel", photo: "any", label: "Natural · painel", fits: ["matchday"], Component: Natpanel },
  { id: "goalnatpanel", photo: "any", label: "Golo natural · painel", fits: ["goal"], Component: Goalnatpanel },
  { id: "natmoody", photo: "any", label: "Natural · sombrio", fits: ["matchday"], Component: Natmoody },
  { id: "goalnatmoody", photo: "any", label: "Golo natural · sombrio", fits: ["goal"], Component: Goalnatmoody },
  { id: "natfog", photo: "any", label: "Natural · névoa", fits: ["matchday"], Component: Natfog },
  { id: "goalnatfog", photo: "any", label: "Golo natural · névoa", fits: ["goal"], Component: Goalnatfog },
  { id: "natpaper", photo: "any", label: "Natural · papel", fits: ["matchday"], Component: Natpaper },
  { id: "goalnatpaper", photo: "any", label: "Golo natural · papel", fits: ["goal"], Component: Goalnatpaper },
  { id: "natfight", photo: "any", label: "Natural · combate", fits: ["matchday"], Component: Natfight },
  { id: "goalnatfight", photo: "any", label: "Golo natural · combate", fits: ["goal"], Component: Goalnatfight },
  { id: "nateditorial", photo: "any", label: "Natural · editorial", fits: ["matchday"], Component: Nateditorial },
  { id: "goalnateditorial", photo: "any", label: "Golo natural · editorial", fits: ["goal"], Component: Goalnateditorial },
  { id: "natchest", photo: "any", label: "Natural · peito", fits: ["matchday"], Component: Natchest },
  { id: "goalnatchest", photo: "any", label: "Golo natural · peito", fits: ["goal"], Component: Goalnatchest },
  { id: "natgothic", photo: "any", label: "Natural · gótico", fits: ["matchday"], Component: Natgothic },
  { id: "goalnatgothic", photo: "any", label: "Golo natural · gótico", fits: ["goal"], Component: Goalnatgothic },
  { id: "nattall", photo: "any", label: "Natural · alto", fits: ["matchday"], Component: Nattall },
  { id: "goalnattall", photo: "any", label: "Golo natural · alto", fits: ["goal"], Component: Goalnattall },
  { id: "natribbon", photo: "any", label: "Natural · fita", fits: ["matchday"], Component: Natribbon },
  { id: "goalnatribbon", photo: "any", label: "Golo natural · fita", fits: ["goal"], Component: Goalnatribbon },
  { id: "natduo", photo: "any", label: "Natural · duotone", fits: ["matchday"], Component: Natduo },
  { id: "goalnatduo", photo: "any", label: "Golo natural · duotone", fits: ["goal"], Component: Goalnatduo },
  { id: "natblur", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · arrasto", fits: ["matchday"], Component: Natblur },
  { id: "goalnatblur", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo natural · arrasto", fits: ["goal"], Component: Goalnatblur },
  { id: "natrepeat", photo: "any", label: "Natural · repetido", fits: ["matchday"], Component: Natrepeat },
  { id: "goalnatrepeat", photo: "any", label: "Golo natural · repetido", fits: ["goal"], Component: Goalnatrepeat },
  { id: "natcard", photo: "any", label: "Natural · cartão", fits: ["matchday"], Component: Natcard },
  { id: "goalnatcard", photo: "any", label: "Golo natural · cartão", fits: ["goal"], Component: Goalnatcard },
  { id: "natgrid", photo: "any", label: "Natural · grelha", fits: ["matchday"], Component: Natgrid },
  { id: "goalnatgrid", photo: "any", label: "Golo natural · grelha", fits: ["goal"], Component: Goalnatgrid },
  { id: "natnotes", photo: "any", label: "Natural · notas", fits: ["matchday"], Component: Natnotes },
  { id: "goalnatnotes", photo: "any", label: "Golo natural · notas", fits: ["goal"], Component: Goalnatnotes },
  { id: "natedge", photo: "any", label: "Natural · bordas", fits: ["matchday"], Component: Natedge },
  { id: "goalnatedge", photo: "any", label: "Golo natural · bordas", fits: ["goal"], Component: Goalnatedge },
  { id: "natcircle", photo: "any", label: "Natural · círculo", fits: ["matchday"], Component: Natcircle },
  { id: "goalnatcircle", photo: "any", label: "Golo natural · círculo", fits: ["goal"], Component: Goalnatcircle },
  // Form carousels (3 slides via params.slide): post type "form", built in Criar's carousel builder.
  { id: "formfire", story: true, photo: "any", label: "Forma · em chamas (3 imagens)", fits: ["form"], Component: Formfire },
  { id: "formfiregold", story: true, photo: "any", label: "Forma · em chamas dourado", fits: ["form"], Component: Formfiregold },
  { id: "formnatural", story: true, photo: "any", label: "Forma · natural (3 imagens)", fits: ["form"], Component: Formnatural },
  { id: "formpanel", story: true, photo: "any", label: "Forma · painel do clube (3 imagens)", fits: ["form"], Component: Formpanel },
  { id: "formgold", story: true, photo: "any", label: "Forma · dourado", fits: ["form"], Component: Formgold },
  // Video stories (goal / assist): a slot (#clip-slot) the ball-following video is laid over on export.
  { id: "clipnight", story: true, photo: "any", label: "Vídeo · noite", fits: ["clip"], Component: Clipnight },
  { id: "clipclub", story: true, photo: "any", label: "Vídeo · cor do clube", fits: ["clip"], Component: Clipclub },
  { id: "clippaper", story: true, photo: "any", label: "Vídeo · papel", fits: ["clip"], Component: Clippaper },
  { id: "clipbold", story: true, photo: "any", label: "Vídeo · destaque", fits: ["clip"], Component: Clipbold },
  { id: "pressstack", story: true, photo: "any", label: "Imprensa · cartões", fits: ["press"], Component: Pressstack },
  { id: "pressclip", story: true, photo: "any", label: "Imprensa · recortes", fits: ["press"], Component: Pressclip },
  { id: "presshero", story: true, photo: "any", label: "Imprensa · manchete", fits: ["press"], Component: Presshero },
  { id: "presswall", story: true, photo: "any", label: "Imprensa · mural", fits: ["press"], Component: Presswall },
  // Hourly round 2026-11-02: natural looks and 2026 matchday-graphic trends (Dribbble #matchday, match cards, editorial, TV lower thirds).
  { id: "natsill", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · parapeito", fits: ["matchday"], Component: Natsill },
  { id: "natpassepartout", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · passe-partout", fits: ["matchday"], Component: Natpassepartout },
  { id: "natteams", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · duas colunas", fits: ["matchday"], Component: Natteams },
  { id: "goalnatairy", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo natural · espaçado", fits: ["goal"], Component: Goalnatairy },
  { id: "goalnatglow", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo natural · holofote", fits: ["goal"], Component: Goalnatglow },
  { id: "bignumeral", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Número gigante", fits: ["matchday"], Component: Bignumeral },
  { id: "goalshirtno", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · número da camisola", fits: ["goal"], Component: Goalshirtno },
  { id: "matchcard", story: true, photo: "any", label: "Cartão de jogo", fits: ["matchday"], Component: Matchcard },
  { id: "goalpaper", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo editorial", fits: ["goal"], Component: Goalpaper },
  { id: "goallowerthird", story: true, photo: "any", label: "Golo · grafismo TV", fits: ["goal"], Component: Goallowerthird },
  // Hourly round 2 (2026-11-02): natural looks with all small type in the free column beside him, and trends
  // (2026 broadcast scoreboard concepts, colour-block posters, negative space, upright surnames).
  { id: "natsheet", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · ficha", fits: ["matchday"], Component: Natsheet },
  { id: "natpitchpaint", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · pintado na relva", fits: ["matchday"], Component: Natpitchpaint },
  { id: "natdatehero", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · data gigante", fits: ["matchday"], Component: Natdatehero },
  { id: "goalnatletters", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo natural · letras empilhadas", fits: ["goal"], Component: Goalnatletters },
  { id: "goalnattopbar", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo natural · faixa de topo", fits: ["goal"], Component: Goalnattopbar },
  { id: "scorebug", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Placard", fits: ["matchday"], Component: Scorebug },
  { id: "goalscorebug", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · placard", fits: ["goal"], Component: Goalscorebug },
  { id: "colorfield", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Campo de cor", fits: ["matchday"], Component: Colorfield },
  { id: "airspace", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Espaço negativo", fits: ["matchday"], Component: Airspace },
  { id: "goalsidename", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Nome lateral", fits: ["goal"], Component: Goalsidename },
  // Hourly round 3 (2026-11-02): natural looks with the type in the free column or the sky above him, and trends
  // (Hull City 26/27 atmospheric set, France 2026 gameday grid, Palermo FC colour frame, USWNT pill tags).
  { id: "natvsline", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · cara a cara", fits: ["matchday"], Component: Natvsline },
  { id: "natmilestones", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · marcos", fits: ["matchday"], Component: Natmilestones },
  { id: "natskycrests", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · emblemas no céu", fits: ["matchday"], Component: Natskycrests },
  { id: "goalnatseal", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo natural · selo", fits: ["goal"], Component: Goalnatseal },
  { id: "goalnatheadline", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo natural · manchete", fits: ["goal"], Component: Goalnatheadline },
  { id: "atmosrule", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Atmosférico", fits: ["matchday"], Component: Atmosrule },
  { id: "goalatmos", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo atmosférico", fits: ["goal"], Component: Goalatmos },
  { id: "gridlines", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Grelha", fits: ["matchday"], Component: Gridlines },
  { id: "goalcolorframe", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · moldura de cor", fits: ["goal"], Component: Goalcolorframe },
  { id: "tagstack", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Etiquetas", fits: ["matchday"], Component: Tagstack },
  // Hourly round 4 (2026-11-02): all small type above his head or in a panel of its own (never over anyone),
  // and trends (Stoke City match programmes, Venngage black-and-white posters, Boavista SC club-colour band).
  { id: "natfrost", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · vidro", fits: ["matchday"], Component: Natfrost },
  { id: "natfootstrip", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · faixa", fits: ["matchday"], Component: Natfootstrip },
  { id: "natfieldset", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · moldura com legenda", fits: ["matchday"], Component: Natfieldset },
  { id: "goalnatfrost", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo natural · vidro", fits: ["goal"], Component: Goalnatfrost },
  { id: "goalnatfieldset", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo natural · moldura com legenda", fits: ["goal"], Component: Goalnatfieldset },
  { id: "matchprogramme", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Programa de jogo", fits: ["matchday"], Component: Matchprogramme },
  { id: "monoposter", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Preto e branco", fits: ["matchday"], Component: Monoposter },
  { id: "versusband", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Faixa do clube", fits: ["matchday"], Component: Versusband },
  { id: "goalband", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · faixa do clube", fits: ["goal"], Component: Goalband },
  { id: "goalmonoposter", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · preto e branco", fits: ["goal"], Component: Goalmonoposter },
  { id: "natdualclock", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · dois fusos", fits: ["matchday"], Component: Natdualclock },
  { id: "natweekday", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · dia da semana", fits: ["matchday"], Component: Natweekday },
  { id: "natcaptionserif", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · legenda", fits: ["matchday"], Component: Natcaptionserif },
  { id: "goalnatnook", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo natural · canto", fits: ["goal"], Component: Goalnatnook },
  { id: "goalnatweights", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo natural · dois pesos", fits: ["goal"], Component: Goalnatweights },
  { id: "cornertab", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Canto do clube", fits: ["matchday"], Component: Cornertab },
  { id: "goalcornertab", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · canto do clube", fits: ["goal"], Component: Goalcornertab },
  { id: "accentword", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Palavra expressiva", fits: ["matchday"], Component: Accentword },
  { id: "crestcrown", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Emblema ao alto", fits: ["matchday"], Component: Crestcrown },
  { id: "goaltape", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · fita", fits: ["goal"], Component: Goaltape },
  { id: "nathomeaway", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · casa/fora", fits: ["matchday"], Component: Nathomeaway },
  { id: "natcompetition", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · competição", fits: ["matchday"], Component: Natcompetition },
  { id: "natarrowdown", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · seta", fits: ["matchday"], Component: Natarrowdown },
  { id: "goalnatclubbar", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo natural · sublinhado", fits: ["goal"], Component: Goalnatclubbar },
  { id: "goalnatcontext", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo natural · contexto", fits: ["goal"], Component: Goalnatcontext },
  { id: "thinarc", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Arco fino", fits: ["matchday"], Component: Thinarc },
  { id: "goalthinarc", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · arco fino", fits: ["goal"], Component: Goalthinarc },
  { id: "bicolortitle", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Título bicolor", fits: ["matchday"], Component: Bicolortitle },
  { id: "goalbicolor", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · bicolor", fits: ["goal"], Component: Goalbicolor },
  { id: "nextup", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Próximo jogo", fits: ["matchday"], Component: Nextup },
  { id: "natgolden", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · luz dourada", fits: ["matchday"], Component: Natgolden },
  { id: "goalnatgolden", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo natural · luz dourada", fits: ["goal"], Component: Goalnatgolden },
  { id: "natcresthair", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · emblemas ligados", fits: ["matchday"], Component: Natcresthair },
  { id: "natstagger", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · desencontrado", fits: ["matchday"], Component: Natstagger },
  { id: "goalnatstagger", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo natural · desencontrado", fits: ["goal"], Component: Goalnatstagger },
  { id: "gradwash", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Gradiente do clube", fits: ["matchday"], Component: Gradwash },
  { id: "goalgradwash", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · gradiente do clube", fits: ["goal"], Component: Goalgradwash },
  { id: "swissleft", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Suíço", fits: ["matchday"], Component: Swissleft },
  { id: "goalswissleft", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · suíço", fits: ["goal"], Component: Goalswissleft },
  { id: "swissindex", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Índice", fits: ["matchday"], Component: Swissindex },
  { id: "natseasondots", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · caminho", fits: ["matchday"], Component: Natseasondots },
  { id: "natform", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · forma", fits: ["matchday"], Component: Natform },
  { id: "natvenuepin", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · local", fits: ["matchday"], Component: Natvenuepin },
  { id: "goalnatseason", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo natural · conta da época", fits: ["goal"], Component: Goalnatseason },
  { id: "goalnatprofile", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo natural · perfil", fits: ["goal"], Component: Goalnatprofile },
  { id: "lineupdots", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Ficha de equipa", fits: ["matchday"], Component: Lineupdots },
  { id: "goallineupdots", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · ficha de equipa", fits: ["goal"], Component: Goallineupdots },
  { id: "daynight", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Hora do jogo", fits: ["matchday"], Component: Daynight },
  { id: "chromeaccent", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Cromado", fits: ["matchday"], Component: Chromeaccent },
  { id: "goalchromeaccent", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · cromado", fits: ["goal"], Component: Goalchromeaccent },
  { id: "natcrestmark", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · marca d'água", fits: ["matchday"], Component: Natcrestmark },
  { id: "goalnatcrestmark", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo natural · marca d'água", fits: ["goal"], Component: Goalnatcrestmark },
  { id: "natlastmeet", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · último confronto", fits: ["matchday"], Component: Natlastmeet },
  { id: "goalnatstreak", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo natural · série", fits: ["goal"], Component: Goalnatstreak },
  { id: "natmonogram", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · monograma", fits: ["matchday"], Component: Natmonogram },
  { id: "swatchcard", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Amostra de cor", fits: ["matchday"], Component: Swatchcard },
  { id: "goalswatchcard", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · amostra de cor", fits: ["goal"], Component: Goalswatchcard },
  { id: "geotype", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Formas geométricas", fits: ["matchday"], Component: Geotype },
  { id: "goalgeotype", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · formas geométricas", fits: ["goal"], Component: Goalgeotype },
  { id: "goalnetline", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · baliza", fits: ["goal"], Component: Goalnetline },
  { id: "natdayline", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · régua do dia", fits: ["matchday"], Component: Natdayline },
  { id: "natflankrules", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · linhas laterais", fits: ["matchday"], Component: Natflankrules },
  { id: "natpager", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · jornadas", fits: ["matchday"], Component: Natpager },
  { id: "goalnathairlines", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo natural · linhas laterais", fits: ["goal"], Component: Goalnathairlines },
  { id: "goalnatsplitrule", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo natural · linha dividida", fits: ["goal"], Component: Goalnatsplitrule },
  { id: "weightramp", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Pesos em escada", fits: ["matchday"], Component: Weightramp },
  { id: "goalweightramp", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · pesos em escada", fits: ["goal"], Component: Goalweightramp },
  { id: "motiontrail", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Rasto", fits: ["matchday"], Component: Motiontrail },
  { id: "goalmotiontrail", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · rasto", fits: ["goal"], Component: Goalmotiontrail },
  { id: "lineball", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Bola em traço", fits: ["matchday"], Component: Lineball },
  { id: "natcountdown", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · contagem", fits: ["matchday"], Component: Natcountdown },
  { id: "natbackname", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · nome nas costas", fits: ["matchday"], Component: Natbackname },
  { id: "natcityline", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · cidade", fits: ["matchday"], Component: Natcityline },
  { id: "goalnathomeaway", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo natural · casa/fora", fits: ["goal"], Component: Goalnathomeaway },
  { id: "goalnatkitring", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo natural · número no anel", fits: ["goal"], Component: Goalnatkitring },
  { id: "angle34", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Ângulo 34º", fits: ["matchday"], Component: Angle34 },
  { id: "goalangle34", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · ângulo 34º", fits: ["goal"], Component: Goalangle34 },
  { id: "terraces", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Bancada", fits: ["matchday"], Component: Terraces },
  { id: "crestinline", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Emblema na palavra", fits: ["matchday"], Component: Crestinline },
  { id: "goalcrestinline", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · emblema na palavra", fits: ["goal"], Component: Goalcrestinline },
  { id: "natteamstack", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · equipas", fits: ["matchday"], Component: Natteamstack },
  { id: "natroundring", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · anel da jornada", fits: ["matchday"], Component: Natroundring },
  { id: "natlowercase", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · minúsculas", fits: ["matchday"], Component: Natlowercase },
  { id: "goalnatlowercase", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo natural · minúsculas", fits: ["goal"], Component: Goalnatlowercase },
  { id: "goalnatclubhero", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo natural · clube em destaque", fits: ["goal"], Component: Goalnatclubhero },
  { id: "jstripes", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Riscas", fits: ["matchday"], Component: Jstripes },
  { id: "goaljstripes", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · riscas", fits: ["goal"], Component: Goaljstripes },
  { id: "gateplate", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Placa", fits: ["matchday"], Component: Gateplate },
  { id: "goalgateplate", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · placa", fits: ["goal"], Component: Goalgateplate },
  { id: "gateposts", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Portão", fits: ["matchday"], Component: Gateposts },
  { id: "natseasonline", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · época", fits: ["matchday"], Component: Natseasonline },
  { id: "natkickoffpill", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · pílula da hora", fits: ["matchday"], Component: Natkickoffpill },
  { id: "natcornerfacts", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · cantos", fits: ["matchday"], Component: Natcornerfacts },
  { id: "goalnatseasonline", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo natural · época", fits: ["goal"], Component: Goalnatseasonline },
  { id: "goalnatcornerfacts", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo natural · cantos", fits: ["goal"], Component: Goalnatcornerfacts },
  { id: "chevronitalic", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Chevrons", fits: ["matchday"], Component: Chevronitalic },
  { id: "goalchevronitalic", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · chevrons", fits: ["goal"], Component: Goalchevronitalic },
  { id: "diamondcrest", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Losango", fits: ["matchday"], Component: Diamondcrest },
  { id: "goaldiamondcrest", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · losango", fits: ["goal"], Component: Goaldiamondcrest },
  { id: "checkerrow", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Xadrez", fits: ["matchday"], Component: Checkerrow },
  { id: "natcrestflank", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · emblemas ao lado", fits: ["matchday"], Component: Natcrestflank },
  { id: "goalnatcrestflank", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo natural · emblema e palavra", fits: ["goal"], Component: Goalnatcrestflank },
  { id: "natbreadcrumb", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · percurso", fits: ["matchday"], Component: Natbreadcrumb },
  { id: "goalnatbreadcrumb", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo natural · percurso", fits: ["goal"], Component: Goalnatbreadcrumb },
  { id: "goalnatagainst", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo natural · contra", fits: ["goal"], Component: Goalnatagainst },
  { id: "subwaysign", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Sinalética", fits: ["matchday"], Component: Subwaysign },
  { id: "goalsubwaysign", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · sinalética", fits: ["goal"], Component: Goalsubwaysign },
  { id: "routeline", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Linha", fits: ["matchday"], Component: Routeline },
  { id: "kitnumeral", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Número de camisola", fits: ["matchday"], Component: Kitnumeral },
  { id: "goalkitnumeral", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · número de camisola", fits: ["goal"], Component: Goalkitnumeral },
  { id: "natmistlight", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · névoa clara", fits: ["matchday"], Component: Natmistlight },
  { id: "goalnatmistlight", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo natural · névoa clara", fits: ["goal"], Component: Goalnatmistlight },
  { id: "natcrestcoins", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · moedas", fits: ["matchday"], Component: Natcrestcoins },
  { id: "nathighlight", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · marcador", fits: ["matchday"], Component: Nathighlight },
  { id: "goalnathighlight", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo natural · marcador", fits: ["goal"], Component: Goalnathighlight },
  { id: "ironband", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Grade", fits: ["matchday"], Component: Ironband },
  { id: "goalironband", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · grade", fits: ["goal"], Component: Goalironband },
  { id: "roundsans", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Letra redonda", fits: ["matchday"], Component: Roundsans },
  { id: "heraldsplit", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Brasão", fits: ["matchday"], Component: Heraldsplit },
  { id: "goalheraldsplit", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · brasão", fits: ["goal"], Component: Goalheraldsplit },
  { id: "natcolorbar", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · barra da cor", fits: ["matchday"], Component: Natcolorbar },
  { id: "goalnatcolorbar", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo natural · barra da cor", fits: ["goal"], Component: Goalnatcolorbar },
  { id: "natnextgames", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · a seguir", fits: ["matchday"], Component: Natnextgames },
  { id: "natornament", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · ornamento", fits: ["matchday"], Component: Natornament },
  { id: "goalnatornament", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo natural · ornamento", fits: ["goal"], Component: Goalnatornament },
  { id: "serifrule", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Regra serifada", fits: ["matchday"], Component: Serifrule },
  { id: "goalserifrule", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · regra serifada", fits: ["goal"], Component: Goalserifrule },
  { id: "stripecard", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Cartão riscado", fits: ["matchday"], Component: Stripecard },
  { id: "goalstripecard", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · cartão riscado", fits: ["goal"], Component: Goalstripecard },
  { id: "goaltifocards", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · cartões", fits: ["goal"], Component: Goaltifocards },
  { id: "natsplitflap", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · painel de partidas", fits: ["matchday"], Component: Natsplitflap },
  { id: "goalnatsplitflap", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo natural · painel de partidas", fits: ["goal"], Component: Goalnatsplitflap },
  { id: "natprevious", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · última vitória", fits: ["matchday"], Component: Natprevious },
  { id: "natkickoffword", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · hora por extenso", fits: ["matchday"], Component: Natkickoffword },
  { id: "goalnatplacard", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo natural · legenda de museu", fits: ["goal"], Component: Goalnatplacard },
  { id: "wingbars", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Asas", fits: ["matchday"], Component: Wingbars },
  { id: "goalwingbars", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · asas", fits: ["goal"], Component: Goalwingbars },
  { id: "goldcrest", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Emblema dourado", fits: ["matchday"], Component: Goldcrest },
  { id: "goalgoldcrest", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · emblema dourado", fits: ["goal"], Component: Goalgoldcrest },
  { id: "estyear", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Fundação", fits: ["matchday"], Component: Estyear },
  { id: "natnation", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · nacionalidade", fits: ["matchday"], Component: Natnation },
  { id: "goalnatnation", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo natural · nacionalidade", fits: ["goal"], Component: Goalnatnation },
  { id: "natfloodlit", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · holofotes", fits: ["matchday"], Component: Natfloodlit },
  { id: "goalnatfloodlit", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo natural · holofotes", fits: ["goal"], Component: Goalnatfloodlit },
  { id: "goalnatlive", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo natural · em direto", fits: ["goal"], Component: Goalnatlive },
  { id: "backslant", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Inclinado à esquerda", fits: ["matchday"], Component: Backslant },
  { id: "goalbackslant", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · inclinado à esquerda", fits: ["goal"], Component: Goalbackslant },
  { id: "widthpair", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Duas larguras", fits: ["matchday"], Component: Widthpair },
  { id: "goalwidthpair", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · duas larguras", fits: ["goal"], Component: Goalwidthpair },
  { id: "gothicinitial", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Inicial gótica", fits: ["matchday"], Component: Gothicinitial },
  { id: "natscarf", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · cachecol", fits: ["matchday"], Component: Natscarf },
  { id: "goalnatscarf", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo natural · cachecol", fits: ["goal"], Component: Goalnatscarf },
  { id: "natbunting", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · bandeirinhas", fits: ["matchday"], Component: Natbunting },
  { id: "goalnatbunting", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo natural · bandeirinhas", fits: ["goal"], Component: Goalnatbunting },
  { id: "natrosette", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · roseta", fits: ["matchday"], Component: Natrosette },
  { id: "feriaposter", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Cartaz de feira", fits: ["matchday"], Component: Feriaposter },
  { id: "goalferiaposter", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · cartaz de feira", fits: ["goal"], Component: Goalferiaposter },
  { id: "rallyline", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Lema", fits: ["matchday"], Component: Rallyline },
  { id: "goalrallyline", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · lema", fits: ["goal"], Component: Goalrallyline },
  { id: "hoopsblock", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Aros", fits: ["matchday"], Component: Hoopsblock },
  { id: "natcornerflag", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · bandeirola de canto", fits: ["matchday"], Component: Natcornerflag },
  { id: "goalnatcornerflag", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo natural · bandeirola de canto", fits: ["goal"], Component: Goalnatcornerflag },
  { id: "natpass", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · credencial", fits: ["matchday"], Component: Natpass },
  { id: "natkithanger", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · camisola no cabide", fits: ["matchday"], Component: Natkithanger },
  { id: "goalnatkithanger", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo natural · camisola no cabide", fits: ["goal"], Component: Goalnatkithanger },
  { id: "billboard", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Outdoor", fits: ["matchday"], Component: Billboard48 },
  { id: "goalbillboard", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · outdoor", fits: ["goal"], Component: Goalbillboard },
  { id: "dynamicstripes", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Riscas dinâmicas", fits: ["matchday"], Component: Dynamicstripes },
  { id: "goaldynamicstripes", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · riscas dinâmicas", fits: ["goal"], Component: Goaldynamicstripes },
  { id: "framedprint", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Cartaz emoldurado", fits: ["matchday"], Component: Framedprint },
  { id: "natmegaphone", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · megafone", fits: ["matchday"], Component: Natmegaphone },
  { id: "goalnatmegaphone", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo natural · megafone", fits: ["goal"], Component: Goalnatmegaphone },
  { id: "natdrum", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · bombo", fits: ["matchday"], Component: Natdrum },
  { id: "goalnatdrum", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo natural · bombo", fits: ["goal"], Component: Goalnatdrum },
  { id: "natbeanie", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · gorro", fits: ["matchday"], Component: Natbeanie },
  { id: "stoneplaque", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Pedra gravada", fits: ["matchday"], Component: Stoneplaque },
  { id: "goalstoneplaque", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · pedra gravada", fits: ["goal"], Component: Goalstoneplaque },
  { id: "fieldboard", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Placard de campo", fits: ["matchday"], Component: Fieldboard },
  { id: "goalfieldboard", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · placard de campo", fits: ["goal"], Component: Goalfieldboard },
  { id: "seatnumber", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Lugar", fits: ["matchday"], Component: Seatnumber },
  { id: "natfoamfinger", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · dedo de espuma", fits: ["matchday"], Component: Natfoamfinger },
  { id: "goalnatfoamfinger", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo natural · dedo de espuma", fits: ["goal"], Component: Goalnatfoamfinger },
  { id: "natfloodtower", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · torre de iluminação", fits: ["matchday"], Component: Natfloodtower },
  { id: "natboot", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · chuteira", fits: ["matchday"], Component: Natboot },
  { id: "goalnatboot", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo natural · remate", fits: ["goal"], Component: Goalnatboot },
  { id: "marqueesign", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Letreiro", fits: ["matchday"], Component: Marqueesign },
  { id: "goalmarqueesign", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · letreiro", fits: ["goal"], Component: Goalmarqueesign },
  { id: "lanternsign", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Lanterna", fits: ["matchday"], Component: Lanternsign },
  { id: "goallanternsign", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · lanterna", fits: ["goal"], Component: Goallanternsign },
  { id: "keytag", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Chave", fits: ["matchday"], Component: Keytag },
];
const TEMPLATES_C: TemplateDef[] = [
  // Hourly round 23 (2026-11-03): natural objects beside the type (shin pad, whistle, goal frame) and trends
  // (CF Montréal brutalist slab, bento tiles, embroidered anniversary patches).
  { id: "natshinpad", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · caneleira", fits: ["matchday"], Component: Natshinpad },
  { id: "goalnatshinpad", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo natural · caneleira", fits: ["goal"], Component: Goalnatshinpad },
  { id: "natwhistle", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · apito", fits: ["matchday"], Component: Natwhistle },
  { id: "goalnatwhistle", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo natural · apito", fits: ["goal"], Component: Goalnatwhistle },
  { id: "goalnatgoalframe", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo natural · bola na rede", fits: ["goal"], Component: Goalnatgoalframe },
  { id: "concreteslab", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Betão", fits: ["matchday"], Component: Concreteslab },
  { id: "goalconcreteslab", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · betão", fits: ["goal"], Component: Goalconcreteslab },
  { id: "bentotiles", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Bento", fits: ["matchday"], Component: Bentotiles },
  { id: "patchbadge", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Emblema bordado", fits: ["matchday"], Component: Patchbadge },
  { id: "goalpatchbadge", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · emblema bordado", fits: ["goal"], Component: Goalpatchbadge },
  // Hourly round 24 (2026-11-03): natural objects beside the type (team coach, kit bag, interview mic, stopwatch, air
  // horn) and 2025/26 kit-story trends (Everton dock container, Bernabéu steel lamellas, Molineux roof truss).
  { id: "natbus", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · autocarro", fits: ["matchday"], Component: Natbus },
  { id: "natkitbag", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · saco de equipamento", fits: ["matchday"], Component: Natkitbag },
  { id: "goalnatmic", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo natural · microfone", fits: ["goal"], Component: Goalnatmic },
  { id: "goalnatstopwatch", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo natural · cronómetro", fits: ["goal"], Component: Goalnatstopwatch },
  { id: "goalnathorn", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo natural · buzina", fits: ["goal"], Component: Goalnathorn },
  { id: "shipcontainer", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Contentor", fits: ["matchday"], Component: Shipcontainer },
  { id: "goalshipcontainer", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · contentor", fits: ["goal"], Component: Goalshipcontainer },
  { id: "steellamellas", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Lamelas", fits: ["matchday"], Component: Steellamellas },
  { id: "goalsteellamellas", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · lamelas", fits: ["goal"], Component: Goalsteellamellas },
  { id: "stadiumtruss", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Treliça", fits: ["matchday"], Component: Stadiumtruss },
  // Hourly round 25 (2026-11-03): natural objects beside the type (water bottle, training cone, binoculars, VAR
  // monitor, target) and 2025/26 kit-story trends (Lille Citadel star fort, Toulouse iridescent foil, Cádiz azulejo).
  { id: "natbottle", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · garrafa", fits: ["matchday"], Component: Natbottle },
  { id: "natcone", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · cone de treino", fits: ["matchday"], Component: Natcone },
  { id: "natbinoculars", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · binóculos", fits: ["matchday"], Component: Natbinoculars },
  { id: "goalnatvar", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo natural · VAR", fits: ["goal"], Component: Goalnatvar },
  { id: "goalnattarget", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo natural · alvo", fits: ["goal"], Component: Goalnattarget },
  { id: "citadel", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Cidadela", fits: ["matchday"], Component: Citadel },
  { id: "goalcitadel", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · cidadela", fits: ["goal"], Component: Goalcitadel },
  { id: "holofoil", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Holográfico", fits: ["matchday"], Component: Holofoil },
  { id: "goalholofoil", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · holográfico", fits: ["goal"], Component: Goalholofoil },
  { id: "goalazulejo", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · azulejo", fits: ["goal"], Component: Goalazulejo },
  // Hourly round 26 (2026-11-03): natural objects beside the type (headphones, dugout, rocket, lightning bolt, heart)
  // and 2025/26 kit-story trends (Fluminense Lapa arches, Sampdoria denim, Napoli espresso). No logo: noLogoDrop.
  { id: "natheadphones", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · auscultadores", fits: ["matchday"], Component: Natheadphones },
  { id: "natdugout", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · banco de suplentes", fits: ["matchday"], Component: Natdugout },
  { id: "goalnatrocket", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo natural · foguetão", fits: ["goal"], Component: Goalnatrocket },
  { id: "goalnatbolt", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo natural · relâmpago", fits: ["goal"], Component: Goalnatbolt },
  { id: "goalnatheart", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo natural · coração", fits: ["goal"], Component: Goalnatheart },
  { id: "arcade", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Arcada", fits: ["matchday"], Component: Arcadepanel },
  { id: "goalarcade", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · arcada", fits: ["goal"], Component: Goalarcade },
  { id: "denimpanel", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Ganga", fits: ["matchday"], Component: Denimpanel },
  { id: "goaldenimpanel", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · ganga", fits: ["goal"], Component: Goaldenimpanel },
  { id: "espressocup", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Café", fits: ["matchday"], Component: Espressocup },
  // Hourly round 27 (2026-11-03): natural objects beside the type (battery, hourglass, crown, goal siren, party popper)
  // and kit-story trends (Swiss passport, Man City rain-or-shine umbrella, Belgium stained glass, USA woven stars).
  { id: "natbattery", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · bateria", fits: ["matchday"], Component: Natbattery },
  { id: "nathourglass", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · ampulheta", fits: ["matchday"], Component: Nathourglass },
  { id: "goalnatcrown", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo natural · coroa", fits: ["goal"], Component: Goalnatcrown },
  { id: "goalnatsiren", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo natural · sirene", fits: ["goal"], Component: Goalnatsiren },
  { id: "goalnatpopper", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo natural · lança-confetes", fits: ["goal"], Component: Goalnatpopper },
  { id: "passport", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Passaporte", fits: ["matchday"], Component: Passportcover },
  { id: "umbrella", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Guarda-chuva", fits: ["matchday"], Component: Umbrellaopen },
  { id: "stainedglass", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Vitral", fits: ["matchday"], Component: Stainedglass },
  { id: "goalstainedglass", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · vitral", fits: ["goal"], Component: Goalstainedglass },
  { id: "goalstarfield", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · estrelas", fits: ["goal"], Component: Goalstarfield },
  // US college / high-school gameday looks (2026-11-03, research in scratchpad us-gameday-research.md): loud type
  // behind the athlete, neon, 3D, diamond plate, fan sign, FINAL card. bold: favoured for US players, fit everyone.
  { id: "usscriptblock", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Gameday · script e bloco", fits: ["matchday"], Component: Usscriptblock },
  { id: "usvarsitynumber", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Número varsity", fits: ["matchday"], Component: Usvarsitynumber },
  { id: "usneongameday", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Gameday · contorno néon", fits: ["matchday"], Component: Usneongameday },
  { id: "usdiamondplate", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Chapa de diamante", fits: ["matchday"], Component: Usdiamondplate },
  { id: "us3dgameday", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Gameday 3D", fits: ["matchday"], Component: Us3dgameday },
  { id: "usfansign", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Cartaz de adepto", fits: ["matchday"], Component: Usfansign },
  { id: "goalusneon", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · contorno néon", fits: ["goal"], Component: Goalusneon },
  { id: "goalusmotion", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · velocidade horizontal", fits: ["goal"], Component: Goalusmotion },
  { id: "goalus3d", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · 3D", fits: ["goal"], Component: Goalus3d },
  { id: "resultusfinal", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Resultado · FINAL", fits: ["result"], Component: Resultusfinal },
  // Hourly round 29 (2026-11-03/04): natural objects (alarm clock, airliner, traffic light, boxing glove, gem), the
  // Sunderland lighthouse, and three more bold US gameday looks (sliding bars, letterman patch, stat card).
  { id: "natalarmclock", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · despertador", fits: ["matchday"], Component: Natalarmclock },
  { id: "natplane", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · avião", fits: ["matchday"], Component: Natplane },
  { id: "nattrafficlight", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · semáforo", fits: ["matchday"], Component: Nattrafficlight },
  { id: "goalnatboxing", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo natural · luva de boxe", fits: ["goal"], Component: Goalnatboxing },
  { id: "goalnatgem", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo natural · gema", fits: ["goal"], Component: Goalnatgem },
  { id: "lighthouse", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Farol", fits: ["matchday"], Component: Lighthousetower },
  { id: "goallighthouse", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · farol", fits: ["goal"], Component: Goallighthouse },
  { id: "usslidingbars", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Gameday · barras deslizantes", fits: ["matchday"], Component: Usslidingbars },
  { id: "usletterpatch", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Letra varsity", fits: ["matchday"], Component: Usletterpatch },
  { id: "goalusstatcard", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · cartão de stats", fits: ["goal"], Component: Goalusstatcard },
  // Round 30 (2026-11-04): complex US gameday looks, 4+ layers each (duotone ground, framing, headline with outline
  // echoes above the head or up the free side, sharp rim-lit cut-out, angled info panel). Research in scratchpad.
  { id: "usduoarena", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Arena duotone", fits: ["matchday"], Component: Usduoarena },
  { id: "usangled", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Painéis angulares", fits: ["matchday"], Component: Usangled },
  { id: "uskitband", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Faixa do equipamento", fits: ["matchday"], Component: Uskitband },
  { id: "usscoreboard", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Placar de estádio", fits: ["matchday"], Component: Usscoreboard },
  { id: "usposter", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Cartaz premium", fits: ["matchday"], Component: Usposter },
  { id: "usglass", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Gameday · vidro premium", fits: ["matchday"], Component: Usglass },
  { id: "goalusduo", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · arena duotone", fits: ["goal"], Component: Goalusduo },
  { id: "goalusflare", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · clarão", fits: ["goal"], Component: Goalusflare },
  { id: "goalusglass", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · vidro premium", fits: ["goal"], Component: Goalusglass },
  { id: "resultusduo", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Resultado · arena", fits: ["result"], Component: Resultusduo },
  // Round 31 (2026-11-04): built from real Pinterest/Behance refs (scratchpad refs-analysis.md) — depth-interleaved
  // headlines, giant number, light editorial grounds, vertical band, gold word, name pattern, GOAL + stats, final column.
  { id: "usstackedword", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Gameday · empilhado", fits: ["matchday"], Component: Usstackedword },
  { id: "usbignumber", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Número gigante · estúdio", fits: ["matchday"], Component: Usbignumber },
  { id: "useditorialmd", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Editorial · match day", fits: ["matchday"], Component: Useditorialmd },
  { id: "usbandvertical", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Faixa vertical · it's gameday", fits: ["matchday"], Component: Usbandvertical },
  { id: "usgoldword", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Palavra dourada", fits: ["matchday"], Component: Usgoldword },
  { id: "usrepeatname", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Nome repetido", fits: ["matchday"], Component: Usrepeatname },
  { id: "goalusstatcol", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · coluna de stats", fits: ["goal"], Component: Goalusstatcol },
  { id: "goalusscript", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · bloco e script", fits: ["goal"], Component: Goalusscript },
  { id: "goalusecho", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · eco em linhas", fits: ["goal"], Component: Goalusecho },
  { id: "resultuscolumn", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Resultado · coluna final", fits: ["result"], Component: Resultuscolumn },
  // Round 32 (2026-11-04): "pro" looks modelled on the 13 references the user liked (scratchpad liked/) — the same
  // player at two scales, the surname / word behind him, the round-flag kick-off clock.
  { id: "prosurname", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Apelido empilhado", fits: ["matchday"], Component: Prosurname },
  { id: "protwoscale", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Duas escalas", fits: ["matchday"], Component: Protwoscale },
  { id: "proframenum", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Número moldura", fits: ["matchday"], Component: Proframenum },
  { id: "proangled", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Painéis em ângulo", fits: ["matchday"], Component: Proangled },
  { id: "proportrait", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Retrato no painel", fits: ["matchday"], Component: Proportrait },
  { id: "proradial", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Próximo jogo · zoom", fits: ["matchday"], Component: Proradial },
  { id: "promatchword", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Match · retrato apertado", fits: ["matchday"], Component: Promatchword },
  { id: "usitsvertical", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "EUA · it's gameday vertical", fits: ["matchday"], Component: Usitsvertical },
  { id: "portraitstripes", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "bust", label: "Agência · retrato com apelido gigante", fits: ["matchday"], Component: Portraitstripes },
  { id: "usgamestack", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "EUA · game day empilhado", fits: ["matchday"], Component: Usgamestack },
  { id: "ussplitpanel", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "EUA · painel dividido", fits: ["matchday"], Component: Ussplitpanel },
  { id: "usgamegiant", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "EUA · game day gigante", fits: ["matchday"], Component: Usgamegiant },
  { id: "usgamemixed", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "EUA · game day misto", fits: ["matchday"], Component: Usgamemixed },
  { id: "usduotone", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "EUA · foto na cor do clube", fits: ["matchday"], Component: Usduotone },
  { id: "usgameside", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "EUA · game day ao lado do rosto", fits: ["matchday"], Component: Usgameside },
  { id: "usresultframe", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "EUA · resultado com foto em janela", fits: ["result"], Component: Usresultframe },
  { id: "agencynextmatch", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "bust", label: "Agência · next match ao lado do rosto", fits: ["matchday"], Component: Agencynextmatch },
  { id: "ushosting", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "EUA · hosting dourado sobre a cabeça", fits: ["matchday"], Component: Ushosting },
  { id: "agencygoalgrid", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Agência · golo na grelha clara", fits: ["goal"], Component: Agencygoalgrid },
  { id: "goalnatrefoutline", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · golo contorno repetido", fits: ["goal"], Component: Goalnatrefoutline },
  { id: "agencyserifmatch", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "bust", label: "Agência · MATCH serifado noturno", fits: ["matchday"], Component: Agencyserifmatch },
  { id: "procrestblocks", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Blocos do emblema", fits: ["matchday"], Component: Procrestblocks },
  { id: "goalprotwoscale", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · duas escalas", fits: ["goal"], Component: Goalprotwoscale },
  { id: "goalpropanels", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · três painéis", fits: ["goal"], Component: Goalpropanels },
  { id: "goalproportrait", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · retrato no painel", fits: ["goal"], Component: Goalproportrait },
  { id: "resultproarc", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Resultado · curva", fits: ["result"], Component: Resultproarc },
  // Round 33 (2026-11-04): new pro families — strips, arch, editorial serif, colour/B&W split, duo, vertical surname,
  // circle portrait, match card, horizontal bands, scoreboard with portrait.
  { id: "prostrips", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Retrato em tiras", fits: ["matchday"], Component: Prostrips },
  { id: "proarch", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Retrato em arco", fits: ["matchday"], Component: Proarch },
  { id: "proeditorial", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Editorial serifado", fits: ["matchday"], Component: Proeditorial },
  { id: "prosplit", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Cor e preto e branco", fits: ["matchday"], Component: Prosplit },
  { id: "produo", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Dupla", fits: ["matchday"], Component: Produo },
  { id: "pronamevertical", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Apelido na vertical", fits: ["matchday"], Component: Pronamevertical },
  { id: "goalprocircle", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · retrato no círculo", fits: ["goal"], Component: Goalprocircle },
  { id: "goalprocard", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · cartão do jogo", fits: ["goal"], Component: Goalprocard },
  { id: "goalprobands", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · retrato em faixas", fits: ["goal"], Component: Goalprobands },
  { id: "resultproboard", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Resultado · placar com retrato", fits: ["result"], Component: Resultproboard },
  // Round 34 (2026-11-04): diagonal two scales, crest window, text ring, type grid, instant photo, stadium sky, club
  // band + surname, mixed-face GOAL!, giant shirt number, digits + script result.
  { id: "prodiagonal", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Diagonal duas escalas", fits: ["matchday"], Component: Prodiagonal },
  { id: "procrestwindow", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Janela do emblema", fits: ["matchday"], Component: Procrestwindow },
  { id: "proring", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Anel de texto", fits: ["matchday"], Component: Proring },
  { id: "protypegrid", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Grelha tipográfica", fits: ["matchday"], Component: Protypegrid },
  { id: "propolaroid", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Retrato emoldurado · instantânea", fits: ["matchday"], Component: Propolaroid },
  { id: "prostadium", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Céu do estádio", fits: ["matchday"], Component: Prostadium },
  { id: "goalproband", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · faixa com apelido", fits: ["goal"], Component: Goalproband },
  { id: "goalpromixed", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · letras mistas", fits: ["goal"], Component: Goalpromixed },
  { id: "goalpronumber", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · número gigante atrás", fits: ["goal"], Component: Goalpronumber },
  { id: "resultprodigits", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Resultado · dígitos e script", fits: ["result"], Component: Resultprodigits },
  // Round 35 (2026-11-04): minimal poster, crests face-off, photo in the letters, magazine cover, monogram, spotlight
  // columns, name + block, serif over him, "Final Score.".
  { id: "prominimal", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Cartaz minimalista", fits: ["matchday"], Component: Prominimal },
  { id: "profaceoff", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Emblemas frente a frente", fits: ["matchday"], Component: Profaceoff },
  { id: "proletterphoto", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Foto nas letras", fits: ["matchday"], Component: Proletterphoto },
  { id: "procover", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Capa editorial", fits: ["matchday"], Component: Procover },
  { id: "promonogram", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Monograma de iniciais", fits: ["matchday"], Component: Promonogram },
  { id: "prospotlight", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Holofote · colunas", fits: ["matchday"], Component: Prospotlight },
  { id: "goalprocover", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · capa editorial", fits: ["goal"], Component: Goalprocover },
  { id: "goalproblock", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · nome e bloco", fits: ["goal"], Component: Goalproblock },
  { id: "goalproserif", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · serifa sobre ele", fits: ["goal"], Component: Goalproserif },
  { id: "resultprofinal", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Resultado · Final Score", fits: ["result"], Component: Resultprofinal },
  // Round 36 (2026-11-04): kick-off hero, triptych, ticket, name band, this-week list, outlined number, vertical GOAL,
  // two-portrait mosaic, corner brackets, broadcast lower-third.
  { id: "prokickoff", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Hora gigante · bandeiras", fits: ["matchday"], Component: Prokickoff },
  { id: "protriptych", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Tríptico do jogador", fits: ["matchday"], Component: Protriptych },
  { id: "proticket", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Bilhete · retrato", fits: ["matchday"], Component: Proticket },
  { id: "pronameband", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Faixa com o nome", fits: ["matchday"], Component: Pronameband },
  { id: "proweek", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Esta semana", fits: ["matchday"], Component: Proweek },
  { id: "prooutlinenum", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Número em contorno", fits: ["matchday"], Component: Prooutlinenum },
  { id: "goalprovertical", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · retrato e palavra vertical", fits: ["goal"], Component: Goalprovertical },
  { id: "goalpromosaic", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · mosaico de retratos", fits: ["goal"], Component: Goalpromosaic },
  { id: "goalprobrackets", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · cantos", fits: ["goal"], Component: Goalprobrackets },
  { id: "resultprolower", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Resultado · rodapé de TV", fits: ["result"], Component: Resultprolower },
  // Round 37 (2026-11-04): season stat hero, club initial, long shadow, rivalry diagonal, Swiss grid, player card,
  // goal timeline, man-of-the-match serif, result with his line.
  { id: "prostathero", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Estatística em destaque", fits: ["matchday"], Component: Prostathero },
  { id: "proinitial", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Inicial do clube", fits: ["matchday"], Component: Proinitial },
  { id: "prolongshadow", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Estúdio · sombra longa", fits: ["matchday"], Component: Prolongshadow },
  { id: "prorivalry", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Rivalidade · diagonal", fits: ["matchday"], Component: Prorivalry },
  { id: "proswiss", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Grelha suíça · retrato", fits: ["matchday"], Component: Proswiss },
  { id: "proplayercard", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Cartão do jogador · faixas", fits: ["matchday"], Component: Proplayercard },
  { id: "goalprolongshadow", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · estúdio sombra longa", fits: ["goal"], Component: Goalprolongshadow },
  { id: "goalprotimeline", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · minuto na linha do tempo", fits: ["goal"], Component: Goalprotimeline },
  { id: "goalprostar", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · homem do jogo", fits: ["goal"], Component: Goalprostar },
  { id: "resultproscorers", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Resultado · marcadores", fits: ["result"], Component: Resultproscorers },
  // Round 38 (2026-11-04): mirror, colour orb, opponent name x VS, stadium roof lines, window + data, away day two
  // clocks, quote marks, vertical echo, serif italic surname, giant W/D/L.
  { id: "promirror", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Espelho · cor e P&B", fits: ["matchday"], Component: Promirror },
  { id: "proorb", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Orbe de cor", fits: ["matchday"], Component: Proorb },
  { id: "prooppname", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Nome do adversário", fits: ["matchday"], Component: Prooppname },
  { id: "proroof", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Linhas da cobertura", fits: ["matchday"], Component: Proroof },
  { id: "prowindow", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Janela e dados", fits: ["matchday"], Component: Prowindow },
  { id: "proawayday", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Jogo fora · dois fusos", fits: ["matchday"], Component: Proawayday },
  { id: "goalproquote", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · entre aspas", fits: ["goal"], Component: Goalproquote },
  { id: "goalprostack", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · eco vertical", fits: ["goal"], Component: Goalprostack },
  { id: "goalproitalic", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · serifa itálica", fits: ["goal"], Component: Goalproitalic },
  { id: "resultproletter", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Resultado · letra gigante", fits: ["result"], Component: Resultproletter },
  // Round 39 (2026-11-04): stacked club names, countdown, four quadrants, number circle, kit-stripe frame, floodlight
  // row, season goal count, diagonal panel, podium, result word filled with the photo.
  { id: "prostacked", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Nomes empilhados", fits: ["matchday"], Component: Prostacked },
  { id: "procountdown", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Contagem decrescente", fits: ["matchday"], Component: Procountdown },
  { id: "proquad", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Quatro quadrantes", fits: ["matchday"], Component: Proquad },
  { id: "pronumcircle", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Número no círculo", fits: ["matchday"], Component: Pronumcircle },
  { id: "prostripeframe", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Moldura de riscas", fits: ["matchday"], Component: Prostripeframe },
  { id: "profloodrow", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Holofotes em linha", fits: ["matchday"], Component: Profloodrow },
  { id: "goalprocount", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · contagem da época", fits: ["goal"], Component: Goalprocount },
  { id: "goalprodiagonal", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · painel diagonal", fits: ["goal"], Component: Goalprodiagonal },
  { id: "goalpropodium", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · pódio", fits: ["goal"], Component: Goalpropodium },
  { id: "resultproword", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Resultado · palavra com foto", fits: ["result"], Component: Resultproword },
  // round 40 · pro families (sliced number, reflection, arc, line-up, half crests, date hero, scoreline, editorial, close-up, victory)
  { id: "proslicednum", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Número fatiado", fits: ["matchday"], Component: Proslicednum },
  { id: "proreflect", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Chão espelhado", fits: ["matchday"], Component: Proreflect },
  { id: "proarc", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Arco de texto", fits: ["matchday"], Component: Proarc },
  { id: "prolineup", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Ficha de alinhamento", fits: ["matchday"], Component: Prolineup },
  { id: "prohalfcrests", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Meios emblemas", fits: ["matchday"], Component: Prohalfcrests },
  { id: "prodatehero", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Data em serifa", fits: ["matchday"], Component: Prodatehero },
  { id: "goalproscoreline", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · marcador do momento", fits: ["goal"], Component: Goalproscoreline },
  { id: "goalproeditorial", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · cartaz editorial", fits: ["goal"], Component: Goalproeditorial },
  { id: "goalprocloseup", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · grande plano", fits: ["goal"], Component: Goalprocloseup },
  { id: "resultprovictory", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Resultado · vitória", fits: ["result"], Component: Resultprovictory },
  // round 41 · pro families (chevron, tricolour, medallion, split portrait, pull-quote, home/away split, minute, duotone, fact sheet, stacked crests)
  { id: "prochevron", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Chevron do clube", fits: ["matchday"], Component: Prochevron },
  { id: "protricolour", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Bandeira tricolor", fits: ["matchday"], Component: Protricolour },
  { id: "promedallion", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Medalhão da jornada", fits: ["matchday"], Component: Promedallion },
  { id: "prosplitportrait", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Retrato duplo", fits: ["matchday"], Component: Prosplitportrait },
  { id: "proquote", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Citação editorial", fits: ["matchday"], Component: Proquote },
  { id: "prokitsplit", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Casa e fora", fits: ["matchday"], Component: Prokitsplit },
  { id: "goalprominute", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · minuto ou época", fits: ["goal"], Component: Goalprominute },
  { id: "goalproduotone", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · duotone do clube", fits: ["goal"], Component: Goalproduotone },
  { id: "goalprofacts", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · ficha do golo", fits: ["goal"], Component: Goalprofacts },
  { id: "resultprostacked", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Resultado · emblemas empilhados", fits: ["result"], Component: Resultprostacked },
  // round 42 · pro families (glass bars, club word, programme, storyboard, badge, kick-off hours, side names, GO|AL, rows, flip score)
  { id: "proglassbars", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Vidro fosco", fits: ["matchday"], Component: Proglassbars },
  { id: "proclubword", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Nome do clube gigante", fits: ["matchday"], Component: Proclubword },
  { id: "proprogramme", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Capa de programa", fits: ["matchday"], Component: Proprogramme },
  { id: "prostoryboard", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Três quadros", fits: ["matchday"], Component: Prostoryboard },
  { id: "probadge", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Emblema redondo", fits: ["matchday"], Component: Probadge },
  { id: "prokickhours", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Faltam X horas", fits: ["matchday"], Component: Prokickhours },
  { id: "goalprosidenames", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · nome nas laterais", fits: ["goal"], Component: Goalprosidenames },
  { id: "goalprosplitword", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · GO | AL", fits: ["goal"], Component: Goalprosplitword },
  { id: "goalprorows", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · repetido", fits: ["goal"], Component: Goalprorows },
  { id: "resultproflip", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Resultado · placar de virar", fits: ["result"], Component: Resultproflip },
  // round 43 · pro families (pill, ribbon, outline number, poster grid, kit gradient, card stack, serif+script, pill goal, outline goal, score strip)
  { id: "propill", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Cápsula", fits: ["matchday"], Component: Propill },
  { id: "proribbon", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Faixa diagonal", fits: ["matchday"], Component: Proribbon },
  { id: "prooutline", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Número vazado", fits: ["matchday"], Component: Prooutline },
  { id: "progrid", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Grelha editorial", fits: ["matchday"], Component: Progrid },
  { id: "progradient", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Gradiente do equipamento", fits: ["matchday"], Component: Progradient },
  { id: "procardstack", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Quem · o quê · quando · onde", fits: ["matchday"], Component: Procardstack },
  { id: "goalproserifname", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · marca em serifa", fits: ["goal"], Component: Goalproserifname },
  { id: "goalpropill", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · cápsula", fits: ["goal"], Component: Goalpropill },
  { id: "goalprooutline", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · número em contorno", fits: ["goal"], Component: Goalprooutline },
  { id: "resultprostrip", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Resultado · faixa do marcador", fits: ["result"], Component: Resultprostrip },
  // round 44 · pro families (club initial, step-through, horizon, A vs B, shirt back, week, photo letters, horizon goal, GOAL vs, FT block)
  { id: "proclubinitial", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Letra do clube", fits: ["matchday"], Component: Proclubinitial },
  { id: "prostepthrough", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Entre MATCH e DAY", fits: ["matchday"], Component: Prostepthrough },
  { id: "prohorizon", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Sol no horizonte", fits: ["matchday"], Component: Prohorizon },
  { id: "proversus", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "A vs B", fits: ["matchday"], Component: Proversus },
  { id: "projersey", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Costas da camisola", fits: ["matchday"], Component: Projersey },
  { id: "proweekline", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Semana do jogo", fits: ["matchday"], Component: Proweekline },
  { id: "goalproletters", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · foto nas letras", fits: ["goal"], Component: Goalproletters },
  { id: "goalprohorizon", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · horizonte", fits: ["goal"], Component: Goalprohorizon },
  { id: "goalproversus", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · versus", fits: ["goal"], Component: Goalproversus },
  { id: "resultproft", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Resultado · FT", fits: ["result"], Component: Resultproft },
  // round 45 · pro families (letterbox, name column, zigzag, shield, drop cap, chevron stack, serif count, letterbox goal, column goal, split numerals)
  { id: "proletterbox", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Cinema", fits: ["matchday"], Component: Proletterbox },
  { id: "procolumnname", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Coluna do nome", fits: ["matchday"], Component: Procolumnname },
  { id: "prozigzag", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Ziguezague", fits: ["matchday"], Component: Prozigzag },
  { id: "proshield", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Escudo da jornada", fits: ["matchday"], Component: Proshield },
  { id: "prodropcap", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Letra capitular", fits: ["matchday"], Component: Prodropcap },
  { id: "prochevronstack", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Riscas em chevron", fits: ["matchday"], Component: Prochevronstack },
  { id: "goalproserifcount", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · número em serifa", fits: ["goal"], Component: Goalproserifcount },
  { id: "goalproletterbox", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · cinema", fits: ["goal"], Component: Goalproletterbox },
  { id: "goalprocolumn", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · coluna do nome", fits: ["goal"], Component: Goalprocolumn },
  { id: "resultprosplitrule", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Resultado · traço vertical", fits: ["result"], Component: Resultprosplitrule },
  // round 46 · pro families (offset halves, stadium window, cover story, kit hoops, fixture rows, minimal bar, triptych goal, window goal, hoops goal, circle score)
  { id: "prooffset", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Retrato desfasado", fits: ["matchday"], Component: Prooffset },
  { id: "prostadiumwindow", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Janela do estádio", fits: ["matchday"], Component: Prostadiumwindow },
  { id: "procoverstory", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Reportagem de capa", fits: ["matchday"], Component: Procoverstory },
  { id: "prohoops", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Riscas horizontais", fits: ["matchday"], Component: Prohoops },
  { id: "procrestrows", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Linhas do jogo", fits: ["matchday"], Component: Procrestrows },
  { id: "prominimalbar", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Barra minimal", fits: ["matchday"], Component: Prominimalbar },
  { id: "goalprotriptych", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · tríptico", fits: ["goal"], Component: Goalprotriptych },
  { id: "goalprowindow", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · janela", fits: ["goal"], Component: Goalprowindow },
  { id: "goalprohoops", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · riscas horizontais", fits: ["goal"], Component: Goalprohoops },
  { id: "resultprocircle", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Resultado · círculo", fits: ["result"], Component: Resultprocircle },
  // round 47 · pro families (side bars, huge word, panorama, profile card, circle halves, page number, radial fan, bars goal, panorama goal, split screen)
  { id: "prosidebars", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Barras laterais", fits: ["matchday"], Component: Prosidebars },
  { id: "prohugeword", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Palavra gigante", fits: ["matchday"], Component: Prohugeword },
  { id: "propanorama", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Panorama do estádio", fits: ["matchday"], Component: Propanorama },
  { id: "proprofile", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Ficha do jogador", fits: ["matchday"], Component: Proprofile },
  { id: "procirclehalves", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Círculo dividido", fits: ["matchday"], Component: Procirclehalves },
  { id: "propagenumber", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Número de página", fits: ["matchday"], Component: Propagenumber },
  { id: "goalproradial", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · leque", fits: ["goal"], Component: Goalproradial },
  { id: "goalprosidebars", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · barras laterais", fits: ["goal"], Component: Goalprosidebars },
  { id: "goalpropanorama", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · panorama", fits: ["goal"], Component: Goalpropanorama },
  { id: "resultprosplitscreen", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Resultado · ecrã dividido", fits: ["result"], Component: Resultprosplitscreen },
  // round 48 · pro families (L-frame, calendar page, crest grid, duo, two-colour names, ladder, interlock goal, L goal, two-colour goal, portrait between numerals)
  { id: "prolframe", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Moldura em L", fits: ["matchday"], Component: Prolframe },
  { id: "procalendar", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Folha de calendário", fits: ["matchday"], Component: Procalendar },
  { id: "procrestgrid", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Parede de emblemas", fits: ["matchday"], Component: Procrestgrid },
  { id: "prospotduo", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Dupla em destaque", fits: ["matchday"], Component: Prospotduo },
  { id: "protwocolour", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Casa e fora a cores", fits: ["matchday"], Component: Protwocolour },
  { id: "proladder", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Escada do jogo", fits: ["matchday"], Component: Proladder },
  { id: "goalprointerlock", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · entrelaçado", fits: ["goal"], Component: Goalprointerlock },
  { id: "goalprolframe", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · moldura em L", fits: ["goal"], Component: Goalprolframe },
  { id: "goalprotwocolour", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · duas cores", fits: ["goal"], Component: Goalprotwocolour },
  { id: "resultprobetween", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Resultado · retrato entre números", fits: ["result"], Component: Resultprobetween },
  // round 49 · pro families (ampersand, split kick-off, nested frames, name marquee, crest circles, time of day, giant G, goal marquee, crest goal, W/D/L pill)
  { id: "proampersand", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "E comercial", fits: ["matchday"], Component: Proampersand },
  { id: "prokickoffsplit", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Hora dividida", fits: ["matchday"], Component: Prokickoffsplit },
  { id: "pronested", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Moldura dupla", fits: ["matchday"], Component: Pronested },
  { id: "promarquee", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Faixa do nome", fits: ["matchday"], Component: Promarquee },
  { id: "procrestcircles", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Emblemas em círculos", fits: ["matchday"], Component: Procrestcircles },
  { id: "protimeofday", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Esta noite", fits: ["matchday"], Component: Protimeofday },
  { id: "goalprog", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · letra G", fits: ["goal"], Component: Goalprog },
  { id: "goalpromarquee", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · faixa repetida", fits: ["goal"], Component: Goalpromarquee },
  { id: "goalprocrests", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · emblemas em círculos", fits: ["goal"], Component: Goalprocrests },
  { id: "resultprowdl", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Resultado · vitória/empate/derrota", fits: ["result"], Component: Resultprowdl },
  // round 50 · pro families (arched window, two bands, corner letters, plate, spine, schedule, diagonal number, stacked letters, arch goal, final)
  { id: "proarchwindow", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Janela em arco", fits: ["matchday"], Component: Proarchwindow },
  { id: "protwobands", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Duas faixas de foto", fits: ["matchday"], Component: Protwobands },
  { id: "procorners", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Letras nos cantos", fits: ["matchday"], Component: Procorners },
  { id: "proplate", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Prato de luz", fits: ["matchday"], Component: Proplate },
  { id: "prospine", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Lombada", fits: ["matchday"], Component: Prospine },
  { id: "proschedule", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Calendário dos próximos jogos", fits: ["matchday"], Component: Proschedule },
  { id: "goalprodiagnum", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · número na diagonal", fits: ["goal"], Component: Goalprodiagnum },
  { id: "goalprostackletters", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · letras empilhadas", fits: ["goal"], Component: Goalprostackletters },
  { id: "goalproarch", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Golo · arco", fits: ["goal"], Component: Goalproarch },
  { id: "resultprofinallabel", story: true, bold: true, storyLogo: AGREED_LOGO, photo: "any", label: "Resultado · final", fits: ["result"], Component: Resultprofinallabel },
  // round 51 · natural looks, each a faithful adaptation of one real reference (natref1.tsx)
  { id: "natrefserif", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · Matchday. em serifa", fits: ["matchday"], Component: Natrefserif },
  { id: "goalnatrefserif", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · Golo. em serifa", fits: ["goal"], Component: Goalnatrefserif },
  { id: "natreffoot", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · MATCHDAY em baixo", fits: ["matchday"], Component: Natreffoot },
  // round 52 · natural looks after one real reference each (natref2.tsx)
  { id: "natrefthinbold", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · MATCH fino DAY forte", fits: ["matchday"], Component: Natrefthinbold },
  { id: "resultnatquiet", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · resultado discreto", fits: ["result"], Component: Resultnatquiet },
  // round 53 · natural looks after one real reference each (natref3.tsx)
  { id: "natrefvert", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · palavra vertical", fits: ["matchday"], Component: Natrefvert },
  { id: "goalnatrefvert", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · golo vertical", fits: ["goal"], Component: Goalnatrefvert },
  { id: "goalnatreffirst", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · golo duas palavras", fits: ["goal"], Component: Goalnatreffirst },
  // Round 64 · natural RESULT looks, each after one real reference (natref12.tsx).
  { id: "resultnatrefserif", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · resultado FULLTIME serifa", fits: ["result"], Component: Resultnatrefserif },
  { id: "resultnatrefvertical", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · resultado vertical escuro", fits: ["result"], Component: Resultnatrefvertical },
  { id: "resultnatreffinal", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · resultado final score", fits: ["result"], Component: Resultnatreffinal },
  { id: "goalnatrefpanel", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · golo painel vertical", fits: ["goal"], Component: Goalnatrefpanel },
  // round 54 · natural looks after one real reference each (natref4.tsx)
  { id: "natrefmixed", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · MATCH day misto", fits: ["matchday"], Component: Natrefmixed },
  { id: "natrefmixedclean", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · MATCH day limpo", fits: ["matchday"], Component: Natrefmixedclean },
  { id: "natrefnext", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · próximo jogo em itálico", fits: ["matchday"], Component: Natrefnext },
  // round 56 · natural look after one reference, with its photo treatment (natref5.tsx)
  { id: "natrefredlight", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · luz na cor do clube", fits: ["matchday"], Component: Natrefredlight },
  // round 57 · natural looks after one reference, photo treatment first (natref6.tsx)
  { id: "natrefpan", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · fundo em movimento", fits: ["matchday"], Component: Natrefpan },
  { id: "natrefghost", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · grande plano na cor do clube", fits: ["matchday"], Component: Natrefghost },
  // round 58 · natural looks after one reference, photo treatment first (natref7.tsx)
  { id: "natrefbacklit", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · contraluz dourado", fits: ["matchday"], Component: Natrefbacklit },
  { id: "natrefsplit", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · azul-petróleo e laranja", fits: ["matchday"], Component: Natrefsplit },
  // round 60 · natural looks after one reference, photo treatment first (natref8.tsx)
  { id: "natrefnightlights", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · luzes da noite", fits: ["matchday"], Component: Natrefnightlights },
  // round 61 · a natural look after one reference, photo treatment first (natref9.tsx)
  { id: "natrefgametime", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · game time azul", fits: ["matchday"], Component: Natrefgametime },
  // round 62 · a natural look after one reference, photo treatment first (natref10.tsx)
  { id: "natrefsunset", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · céu de pôr do sol", fits: ["matchday"], Component: Natrefsunset },
  // round 65 · natural looks after one of the user's liked references, photo treatment first (natref13.tsx)
  { id: "natrefsunlit", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · MATCH DAY ao sol", fits: ["matchday"], Component: Natrefsunlit },
  { id: "natrefhighkey", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · apelido gigante em fundo claro", fits: ["matchday"], Component: Natrefhighkey },
  // round 66 · natural looks after one real reference each, photo treatment first (natref14.tsx)
  { id: "natrefpitchnumber", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · número gigante em verde fundo", fits: ["matchday"], Component: Natrefpitchnumber },
  { id: "resultnatrefhalftime", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · resultado discreto em baixo", fits: ["result"], Component: Resultnatrefhalftime },
  // round 67 · a natural goal look after one real reference, photo treatment first (natref15.tsx)
  { id: "goalnatrefvictoire", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · golo palavra em caixa", fits: ["goal"], Component: Goalnatrefvictoire },
  // round 68 · natural matchday looks after one real reference each, photo treatment first (natref16.tsx)
  { id: "natrefwinegameday", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · GAME DAY em sombra vinho", fits: ["matchday"], Component: Natrefwinegameday },
  { id: "natrefmistmatch", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · It's match day em névoa", fits: ["matchday"], Component: Natrefmistmatch },
  // round 69 · natural result looks after one real reference each, photo treatment first (natref17.tsx)
  { id: "resultnatrefsideband", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · resultado em faixa lateral", fits: ["result"], Component: Resultnatrefsideband },
  { id: "resultnatrefcyanfog", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · resultado em névoa ciano", fits: ["result"], Component: Resultnatrefcyanfog },
  // round 72 · natural looks after one real reference each, photo treatment first (natref18.tsx)
  { id: "natrefedgetitle", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · MATCHDAY vertical na margem", fits: ["matchday"], Component: Natrefedgetitle },
  { id: "goalnatrefstack", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · golo palavra empilhada com foto em cartão", fits: ["goal"], Component: Goalnatrefstack },
  // round 73 · natural looks after one real reference each, photo treatment first (natref19.tsx)
  { id: "natreftiltmatch", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · MATCH DAY inclinado atrás do jogador", fits: ["matchday"], Component: Natreftiltmatch },
  { id: "resultnatrefstackscore", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · resultado empilhado em luz mate", fits: ["result"], Component: Resultnatrefstackscore },
  // round 74 · natural goal looks after one real reference each, photo treatment first (natref20.tsx)
  { id: "goalnatrefsplitgo", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · golo GO/AL partido sobre fundo petróleo", fits: ["goal"], Component: Goalnatrefsplitgo },
  { id: "goalnatrefcover", story: true, storyLogo: AGREED_LOGO, photo: "any", label: "Natural · golo capa de revista", fits: ["goal"], Component: Goalnatrefcover },
];
export const TEMPLATES: TemplateDef[] = [...TEMPLATES_A, ...TEMPLATES_B, ...TEMPLATES_C];

/**
 * Goal posts and matchday posts never share looks: a goal gets only looks made for goals (from goal
 * references), and those never show up for a matchday. Other post types keep their own lists.
 */
/**
 * Looks made for coaches (a head-coach label, a bust in a jacket, no shirt number): shown only on coach
 * profiles, in their own section of Criar, and never in the players' grids.
 */
export const COACH_LOOKS = new Set<TemplateId>(["coachhero", "coachpress", "coachboard", "coachserif", "coachtouchline", "coachdark", "coachname", "coachduo", "coachframe", "coachclipboard", "coachwelcome", "coachwelcomelight", "coachcard", "coachsheet", "coachlowkey", "coachmono"]);

export const GOAL_LOOKS = new Set<TemplateId>([
  "goalnatgrid", "goalnatnotes", "goalnatedge", "goalnatcircle",
  "goalnatblur", "goalnatrepeat", "goalnatcard",
  "goalnatchest", "goalnatgothic", "goalnattall", "goalnatribbon", "goalnatduo",
  "goalnatmoody", "goalnatfog", "goalnatpaper", "goalnatfight", "goalnateditorial",
  "goalnatsand", "goalnatstarring", "goalnatbeam", "goalnatring", "goalnatpanel", "goalnatlit", "goalnatcinema",
  "goalnatswatch", "goalnatneon",
  "goalnatdymo", "goalnatturf",
  "goalnatunderline", "goalnatknockout",
  "goalnatslant", "goalnatboxed",
  "goalnathashtag", "goalnatquote",
  "goalnatticker", "goalnatwide",
  "goalnatled", "goalnatsubtitle",
  "goalnatquad", "goalnatflank",
  "goalnatpill", "goalnatglass",
  "goalnatmasthead", "goalnatitalic",
  "goalnatmono", "goalnatstack", "goalnatinitial",
  "goalnatserif", "goalnatarc", "goalnatcallout",
  "goalnatbug", "goalnatfocus", "goalnathorizon",
  "goalnatstamp", "goalnatcaption", "goalnatoutline",
  "goalnatcrest", "goalnatnumber",
  "goalnatvert", "goalnatborder", "goalnatsplit",
  "goalnatclean", "goalnatname", "goalnatstrip",
  "goalnatword", "goalnatcorner", "goalnatlight",
  "goalnatfold", "goalnatspine", "goalnatmix", "goalnatlabel", "goalnatspaced",
  "goalnatmarks", "goalnatdot", "goalnatcut", "goalnatlegend", "goalnatcols", "goalnatfoot", "goalnatfade", "goalnatarrow", "goalnatrule", "goalnatquiet", "goalnatoverline", "goalnatcolumn", "goalnatwatermark", "goalnattab", "goalnatsentence", "goalnatbracket", "goalnatdotline", "goalnathead", "goalnatbadge", "goalnatbar", "goalnatends", "goalnatlist", "goalnatduel", "goalnatdiag", "goalnatsidebar", "goalnatpennant", "goalnatangle", "goalnatlines", "goalnatcrestbleed", "goalnatnav", "goalnatecho", "goalnatflag", "goalnattag", "goalnatbreakout", "goalnatstripe", "goalnatvline", "goalnatoverprint", "goalnatkickoff", "goalnatunderbar", "goalnatsticker", "goalnatsplitword", "goalnatcorners4", "goalnatmicro2", "goalnatinset", "goalnatbigletter", "goalnatchips", "goalnatslab", "goalnatcrestbox", "goalnatrepeatline", "goalnatoffset", "goalnatcredits", "goalnatpilltop", "goalnatfadebar", "goalnatbaseline", "goalnatoutlinebox", "goalnatfootcols", "goalnatdotsgrid", "goalnatvs", "goalnatcaptionbar", "goalnattight", "goalnattopline", "goalnatrails", "goalnatbigdate", "goalnatplus", "goalnatsyllable", "goalnatcrestrow", "goalnatwidefont", "goalnatfig", "goalnatcornerribbon", "goalnatsides", "goalnatdashed", "goalnatcapsule", "goalnatlower3", "goalnatballicon", "goalnatslash", "goalnatweightmix", "goalnatgrid4", "goalnatclockicon", "goalnatpin", "goalnatdoublerule", "goalnatpointer", "goalnatserifcaps", "goalnatgradword", "goalnatdotsep", "goalnatdatestack", "goalnattypewriter", "goalnatinfobox2", "goalnathighlighter", "goalnatcrestsplit", "goalnatcrestring", "goalnatnumero", "goalnattilted", "goalnatclubword", "goalnatglasscard", "goalnatoffsetframe", "goalnatitalicbig", "goalnatknockbox", "goalnatunderscore", "goalnatfactrow", "goalnatcols3", "goalnatbracev", "goalnatarrowup", "goalnattimedisc", "goalnatrightrule", "goalnatheaderbox", "goalnatinitialcolor", "goalnatrulebox", "goalnatfadeword", "goalnatleaders", "goalnatcresttop", "goalnatthickline", "goalnatroundbox", "goalnatnamesbig", "goalnatedgebar", "goalnatdatepill", "goalnattoprule", "goalnatcolorfoot", "goalnattriangle", "goalnatpullbar", "goalnatstadium", "goalnatwhenwhere", "goalnatstretch", "goalnatchip", "goalnatfadestack", "goalnatthirds", "goalnatvdate", "goalnatlr", "goalnatversus", "goalnatmidside", "goalnatserifstack", "goalnatduoline", "goalnatfolio", "goalnatstrike", "goalnatblockshadow", "goalnatlettertiles",
"goalnatdiamond", "goalnatbubble", "goalnatbullets", "goalnatoutlinetime", "goalnatvletters", "goalnatthin", "goalnatcascade", "goalnatsup", "goalnatsplitline", "goalnatunderdots", "goalnattimeline", "goalnatfraction", "goalnatperiod", "goalnatcresttower", "goalnatlinesides", "goalnattopcorner", "goalnatwhitefade", "goalnatjustify", "goalnatmagcaption", "goalnatsplitfill", "goalnatasterisk", "goalnatpaired", "goalnatsmallcrest", "goalnatsmallcaps", "goalnatdropline", "goalnatruler", "goalnatrows", "goalnatblockcorners", "goalnatellipse", "goalnatheaderline", "goalnatsidenote", "goalnatunderlinefat", "goalnatframeline", "goalnatbadgeline", "goalnatmixcase", "goalnatshadowword", "goalnatquotebar", "goalnatbigv", "goalnatstep", "goalnatnumbered", "goalnatcircletag", "goalnatslashdate", "goalnatboxedname", "goalnatfadeline", "goalnatpipe", "goalnatwave", "goalnataboveunder", "goalnatemdash", "goalnatcheck", "goalnatjustifyrow", "goalnatchevrons", "goalnatslashes", "goalnatplusline", "goalnatbars", "goalnatlcorner", "goalnatdotgrid9", "goalnatsquaremark", "goalnatdashes", "goalnattilde", "goalnatarcmark", "goalnatfirstfill", "goalnatlastcolor", "goalnatboxletter", "goalnatcolorsub", "goalnatcolorword", "goalnatbebas", "goalnatbodoni", "goalnatunbounded", "goalnatgrotesk", "goalnatalfaslab", "goalnatanton", "goalnatbarlow", "goalnatarchivo", "goalnatdela", "goalnatitalicserif", "goalnatmontserrat", "goalnatfraunces", "goalnatarchivolight", "goalnatrubikmono", "goalnatfrauncesit", "goalnatfreecol", "goalnatcutoff", "goalnatcornerpair", "goalnatmirror", "goalnatbehindword", "goalnatbehindoutline", "goalnatbehindcolor", "goalnatbehindserif", "goalnatbehindtall", "goalnatcutoffoutline", "goalnatcutoffcolor", "goalnatcutofftall", "goalnatcutoffserif", "goalnatbehindbodoni", "goalnatbehindgrotesk", "goalnatcornerbodoni", "goalnatcornertall", "goalnatmirrorserif", "goalnatmirrorcolor", "goalnatfreecolserif", "goalnatcorneroutline", "goalnatcornercolor", "goalnatfreecolbodoni", "goalnatfreecoltall", "goalnatmirrorbodoni",
  "goalherocount",
  "goalherotop", "goalherobw", "goalheroduotone", "goalheroexclaim", "goalherohalf",
  "goalheroname", "goalheroboxed", "goalherosticker", "goalherocrest", "goalherofill",
  "goalheroshadow", "goalherogradient", "goalherostagger", "goalherotally", "goalheroaura",
  "goalheroghost", "goalherooutline", "goalherotwotone", "goalheroserif", "goalherolower",
  "goalherostack", "goalherocaps", "goalheroframe", "goalherotint", "goalheroduo",
  "goalherodark", "goalherosplit", "goalherobehind", "goalherofoot", "goalheroband",
  "goalherobarlow", "goalheroanton", "goalheroarchivo", "goalherodela", "goalheroslab", "goalherobodoni", "goalherobebas",
  "goalpaperechoname", "goalpaperechoserif", "goalpaperechowide", "goalpaperechovert", "goalpaperechobar",
  "goalechoaura", "goalechobackline", "goalechonamefield", "goalechozoom", "goalechovert",
  "goalechobug", "goalechoserene", "goalechohorizon", "goalechowide", "goalechotonal",
  "goalechoswiss", "goalechoserif", "goalechoorbit", "goalechomono", "goalechoflash",
  "goalechotitle", "goalechoname", "goalechocrest", "goalechobar", "goalechocorner",
  "goalpaperripple", "goalpapertype", "goalpaperdouble", "goalpaperstep", "goalpapergiant",
  "goalpaperecho", "goaldashecho", "goalgradientsilhouette", "goalduosilhouette", "goalstepsilhouette",
  "goaldotsilhouette", "goalcrestsilhouette", "goalsplitsilhouette", "goaldoubleline", "goalrisingecho",
  "goaltypesilhouette", "goalgiantsilhouette", "goallinesilhouette", "goalrippleecho", "goalrimlight",
  "goalcastshadow", "goalmirrorecho", "goaloverlap", "goalfillprogress", "goaltwotone",
  "goalbleed", "goaltextsquare", "goalcircled", "goalredacted", "goaloneline",
  "goaldropcap", "goalcrossword", "goalellipsis", "goalarrow", "goalcolon",
  "goalbordertext", "goalweights", "goalbounce", "goalfade", "goaltracking",
  "goalhalffill", "goalcircletext", "goalstrike", "goalsuperscript", "goalquotes",
  "goalcropmarks", "goalkeycaps", "goalpostit", "goalspecimen", "goaltally",
  "goalnowplaying", "goalemboss", "goaltoggle", "goalpulse", "goalunlock",
  "goalsearch", "goalchat", "goalreceipt", "goalinstant", "goalmeasure",
  "goalnotify", "goalmarker", "goalparens", "goalsubtitle", "goalpunct",
  "goalsentence", "goalcamera", "goalslash", "goalviewfinder", "goalframe",
  "goalringlight", "goalmedallion", "goalunderline", "goalwidescreen", "goalcrestpair",
  "goalhorizon", "goalmicro", "goalmonogram", "goalstage", "goaloffset",
  "goalsidecol", "goalgallery", "goallockup", "goalboard", "goalname", "goalticker", "goalaura", "goalinset", "goalswiss", "goalorbit", "goalecho", "goalcircle", "goalcrop", "goalbar", "goalnumber", "goalmono", "goaltonal", "goalvert", "goalwide", "goalscore", "goalnet", "goalbug", "goalserene", "goalflash", "goalrows", "goallight", "goaldots",
  "gradient", "gilded", "repeat", "sideword", "sepia", "bignumber",
  "neon", "sequence", "serif", "smear", "exposure", "magazine", "steps", "waves", "comic", "sticker", "collage", "numbers",
]);
for (const t of TEMPLATES) {
  t.fits = GOAL_LOOKS.has(t.id) ? t.fits.filter((f) => f !== "matchday") : t.fits.filter((f) => f !== "goal");
  if (GOAL_LOOKS.has(t.id) && !t.fits.includes("goal")) t.fits.push("goal");
}

/**
 * Poses each look is made for (from the photo's body pose): a celebration suits the explosive looks,
 * a player on the move the motion ones, a back shot the ones built on the shirt number.
 * Looks not listed take any pose.
 */
export const POSE_FIT: Partial<Record<TemplateId, Pose[]>> = {
  burst: ["celebrate", "open", "action"],
  comic: ["celebrate", "open"],
  sticker: ["celebrate", "open"],
  gilded: ["celebrate", "open"],
  stretch: ["celebrate", "open", "standing"],
  monumental: ["celebrate", "open", "back"],
  mono: ["celebrate", "open", "action"],
  spotlight: ["celebrate", "standing", "open"],
  poster: ["celebrate", "standing"],
  rising: ["open", "celebrate", "standing"],
  speed: ["action"],
  smear: ["action", "bust"],
  sequence: ["action"],
  riso: ["action", "celebrate"],
  torn: ["action", "celebrate"],
  brush: ["action", "celebrate"],
  tactics: ["action"],
  kaleido: ["action", "open"],
  syllables: ["action", "standing"],
  paperlight: ["standing", "action", "crouch"],
  jersey: ["back", "celebrate"],
  sideword: ["back", "celebrate", "bust"],
  cinematic: ["standing", "back"],
  silhouette: ["standing", "open", "back"],
  skyline: ["standing", "open"],
  floor: ["standing"],
  pitch: ["standing", "action"],
  fixture: ["standing", "crouch"],
  halo: ["standing", "open"],
  waves: ["standing", "celebrate"],
  checker: ["standing", "crouch"],
  duel: ["standing", "crouch"],
  script: ["standing", "celebrate", "bust"],
  window: ["bust", "celebrate", "open"],
  matchserif: ["bust", "standing"],
  scoreline: ["celebrate", "standing", "action", "open"],
  broadcast: ["celebrate", "action", "open", "standing"],
  simple: ["standing", "celebrate", "bust"],
  outline: ["standing", "action", "bust"],
  ghost: ["standing", "celebrate", "bust"],
  gameday: ["standing", "celebrate", "open"],
  sky: ["back", "standing", "celebrate"],
  mist: ["standing", "crouch"],
  headline: ["standing", "celebrate", "open"],
  collage: ["bust", "standing"],
  debut: ["standing", "bust"],
  bokeh: ["bust", "standing"],
  strip: ["action", "open"],
  glow: ["action", "celebrate"],
  dispersion: ["bust", "standing"],
  sepia: ["action", "celebrate", "standing"],
  notes: ["celebrate", "open", "action"],
  crestmark: ["action", "celebrate", "open"],
  upnext: ["bust", "standing"],
  caption: ["standing", "celebrate", "bust"],
  numbers: ["celebrate", "bust", "standing"],
  award: ["bust", "standing"],
  cutletters: ["bust", "standing"],
  backlit: ["bust", "standing"],
  twoscale: ["action", "open"],
  bignumber: ["action", "open", "celebrate"],
  brushday: ["action", "open"],
  motion: ["action"],
  studio: ["bust", "standing"],
  wall: ["open", "celebrate", "bust", "standing"],
  graffiti: ["action"],
  damask: ["action", "standing"],
  diagonal: ["standing", "action"],
  versus: ["bust", "standing"],
  chrome: ["bust", "celebrate", "standing"],
  tape: ["bust", "standing"],
  night: ["action", "standing"],
  strokes: ["action", "standing"],
  tallname: ["action", "back", "standing"],
  breakout: ["action", "standing"],
  statboxes: ["standing", "action", "celebrate"],
  column: ["action", "standing"],
  splitnumber: ["standing", "open"],
  notebook: ["action"],
  swoosh: ["action"],
  tilt: ["action"],
  backpanel: ["back", "standing"],
  blurduo: ["bust", "standing"],
  faceday: ["bust"],
  arc: ["celebrate", "open", "standing"],
  tunnel: ["back", "bust", "standing"],
  cheer: ["celebrate", "open"],
  sideband: ["action", "standing"],
  band: ["standing", "action"],
  pillar: ["celebrate", "open", "standing"],
  blueprint: ["bust", "standing"],
  glowline: ["standing"],
  greyday: ["standing", "action"],
  triangles: ["bust", "standing"],
  emblemart: ["bust", "celebrate", "standing"],
  reflect: ["action"],
  minimal: ["celebrate", "open", "action"],
  profile: ["bust", "standing"],
  screenprint: ["action", "celebrate"],
  bighead: ["action", "standing"],
  swirl: ["celebrate", "standing", "open"],
  splitbw: ["action"],
  hollow: ["action", "standing"],
  selective: ["standing", "action"],
  dotscript: ["action", "standing"],
  roughname: ["action"],
  infobox: ["celebrate", "bust", "standing"],
  condensed: ["action", "standing"],
  shards: ["celebrate", "bust"],
  clubname: ["action"],
  curvepanel: ["action", "standing"],
  emblemfade: ["action", "standing"],
  cutpaper: ["celebrate", "action", "open"],
  petals: ["celebrate", "standing", "open"],
  gradient: ["action"],
  ring: ["action", "standing"],
  glass: ["celebrate", "back", "standing"],
  boxtitle: ["action", "celebrate"],
  softglow: ["action", "standing"],
  blurrun: ["action"],
  nextmatch: ["bust", "standing"],
  redgrain: ["bust", "standing"],
  halfline: ["bust", "standing"],
  topspeed: ["action", "standing"],
  statserif: ["action", "standing"],
  sepiaday: ["bust", "standing", "celebrate"],
  colorblock: ["standing", "action", "celebrate"],
  cover: ["bust", "standing"],
  panelscript: ["action", "back", "standing"],
  pride: ["bust", "standing"],
  playoff: ["action", "celebrate", "standing"],
  slats: ["action", "standing", "celebrate"],
  vhs: ["standing", "action", "bust"],
  tiles: ["action", "celebrate"],
  zoomburst: ["celebrate", "action", "standing"],
  tagcard: ["action", "celebrate", "standing"],
  stencil: ["action", "celebrate", "standing"],
  swiss: ["standing", "action", "celebrate"],
  gallery: ["standing", "celebrate", "bust"],
  sidecol: ["standing", "action", "bust"],
  serene: ["standing", "celebrate", "action"],
  datefirst: ["standing", "action"],
  inset: ["standing", "bust", "celebrate"],
  micro: ["standing", "action", "celebrate"],
  aura: ["standing", "celebrate", "bust"],
  backline: ["back"],
  namefield: ["bust", "standing"],
  pressphoto: ["action", "celebrate", "standing"],
  horizon: ["standing", "action", "back"],
  lockup: ["action", "celebrate", "standing"],
  orbit: ["standing", "celebrate", "bust"],
  vertname: ["standing", "action"],
  timetable: ["standing", "action"],
  twoblock: ["action", "celebrate"],
  autograph: ["standing", "bust", "celebrate"],
  widetitle: ["standing", "bust"],
  clock: ["standing", "bust"],
  goalwide: ["celebrate", "action"],
  goalscore: ["celebrate", "action"],
  goalnet: ["celebrate", "action"],
  goalbug: ["celebrate", "action"],
  goalserene: ["celebrate", "action"],
  natcrest: ["action", "standing"],
  natnumber: ["action", "standing"],
  goalnatcrest: ["celebrate", "action"],
  goalnatnumber: ["celebrate", "action"],
  natstamp: ["action", "standing"],
  goalnatstamp: ["celebrate", "action"],
  natcaption: ["action", "standing"],
  goalnatcaption: ["celebrate", "action"],
  natoutline: ["action", "standing"],
  goalnatoutline: ["celebrate", "action"],
  natbug: ["action", "standing"],
  goalnatbug: ["celebrate", "action"],
  natfocus: ["action", "standing"],
  goalnatfocus: ["celebrate", "action"],
  nathorizon: ["action", "standing"],
  goalnathorizon: ["celebrate", "action"],
  natserif: ["action", "standing"],
  goalnatserif: ["celebrate", "action"],
  natvenue: ["action", "standing"],
  natarc: ["action", "standing"],
  goalnatarc: ["celebrate", "action"],
  goalnatcallout: ["celebrate", "action"],
  natmono: ["action", "standing"],
  goalnatmono: ["celebrate", "action"],
  natticket: ["action", "standing"],
  natstack: ["action", "standing"],
  goalnatstack: ["celebrate", "action"],
  goalnatinitial: ["celebrate", "action"],
  natmasthead: ["action", "standing"],
  goalnatmasthead: ["celebrate", "action"],
  natclock: ["action", "standing"],
  goalnatitalic: ["celebrate", "action"],
  natpill: ["action", "standing"],
  goalnatpill: ["celebrate", "action"],
  natglass: ["action", "standing"],
  goalnatglass: ["celebrate", "action"],
  natquad: ["action", "standing"],
  goalnatquad: ["celebrate", "action"],
  natflank: ["action", "standing"],
  goalnatflank: ["celebrate", "action"],
  natsubtitle: ["action", "standing"],
  goalnatsubtitle: ["celebrate", "action"],
  natled: ["action", "standing"],
  goalnatled: ["celebrate", "action"],
  natticker: ["action", "standing"],
  goalnatticker: ["celebrate", "action"],
  natlocation: ["action", "standing"],
  goalnatwide: ["celebrate", "action"],
  natcalendar: ["action", "standing"],
  nathashtag: ["action", "standing"],
  goalnathashtag: ["celebrate", "action"],
  goalnatquote: ["celebrate", "action"],
  natslant: ["action", "standing"],
  goalnatslant: ["celebrate", "action"],
  natboxed: ["action", "standing"],
  goalnatboxed: ["celebrate", "action"],
  natunderline: ["action", "standing"],
  goalnatunderline: ["celebrate", "action"],
  natknockout: ["action", "standing"],
  goalnatknockout: ["celebrate", "action"],
  natdymo: ["action", "standing"],
  goalnatdymo: ["celebrate", "action"],
  natturf: ["action", "standing"],
  goalnatturf: ["celebrate", "action"],
  natswatch: ["action", "standing"],
  goalnatswatch: ["celebrate", "action"],
  natneon: ["action", "standing"],
  goalnatneon: ["celebrate", "action"],
  natcinema: ["action", "standing"],
  goalnatcinema: ["celebrate", "action"],
  natlit: ["action", "standing"],
  goalnatlit: ["celebrate", "action"],
  natsand: ["action", "standing"],
  goalnatsand: ["celebrate", "action"],
  natstarring: ["action", "standing"],
  goalnatstarring: ["celebrate", "action"],
  natbeam: ["action", "standing"],
  goalnatbeam: ["celebrate", "action"],
  natring: ["action", "standing"],
  goalnatring: ["celebrate", "action"],
  natpanel: ["action", "standing"],
  goalnatpanel: ["celebrate", "action"],
  natmoody: ["action", "standing"],
  goalnatmoody: ["celebrate", "action"],
  natfog: ["action", "standing"],
  goalnatfog: ["celebrate", "action"],
  natpaper: ["action", "standing"],
  goalnatpaper: ["celebrate", "action"],
  natfight: ["action", "standing"],
  goalnatfight: ["celebrate", "action"],
  nateditorial: ["action", "standing"],
  goalnateditorial: ["celebrate", "action"],
  natchest: ["action", "standing"],
  goalnatchest: ["celebrate", "action"],
  natgothic: ["action", "standing"],
  goalnatgothic: ["celebrate", "action"],
  nattall: ["action", "standing"],
  goalnattall: ["celebrate", "action"],
  natribbon: ["action", "standing"],
  goalnatribbon: ["celebrate", "action"],
  natduo: ["action", "standing"],
  goalnatduo: ["celebrate", "action"],
  natblur: ["action", "standing"],
  goalnatblur: ["celebrate", "action"],
  natrepeat: ["action", "standing"],
  goalnatrepeat: ["celebrate", "action"],
  natcard: ["action", "standing"],
  goalnatcard: ["celebrate", "action"],
  natgrid: ["action", "standing"],
  goalnatgrid: ["celebrate", "action"],
  natnotes: ["action", "standing"],
  goalnatnotes: ["celebrate", "action"],
  natedge: ["action", "standing"],
  goalnatedge: ["celebrate", "action"],
  natcircle: ["action", "standing"],
  goalnatcircle: ["celebrate", "action"],
  nattime: ["action", "standing"],
  natvert: ["action", "standing"],
  natborder: ["action", "standing"],
  goalnatvert: ["celebrate", "action"],
  goalnatborder: ["celebrate", "action"],
  goalnatsplit: ["celebrate", "action"],
  natclean: ["action", "standing"],
  natstrip: ["action", "standing"],
  natdate: ["action", "standing"],
  goalnatclean: ["celebrate", "action"],
  goalnatname: ["celebrate", "action"],
  goalnatstrip: ["celebrate", "action"],
  natword: ["action", "standing"],
  natfold: ["action", "standing"],
  goalnatfold: ["celebrate", "action"],
  natspine: ["action", "standing"],
  goalnatspine: ["celebrate", "action"],
  natmix: ["action", "standing"],
  goalnatmix: ["celebrate", "action"],
  natlabel: ["action", "standing"],
  goalnatlabel: ["celebrate", "action"],
  natspaced: ["action", "standing"],
  goalnatspaced: ["celebrate", "action"],
  natmarks: ["action", "standing"],
  goalnatmarks: ["celebrate", "action"],
  natdot: ["action", "standing"],
  goalnatdot: ["celebrate", "action"],
  natcut: ["action", "standing"],
  goalnatcut: ["celebrate", "action"],
  natlegend: ["action", "standing"],
  goalnatlegend: ["celebrate", "action"],
  natcols: ["action", "standing"],
  goalnatcols: ["celebrate", "action"],
  natfoot: ["action", "standing"],
  goalnatfoot: ["celebrate", "action"],
  natfade: ["action", "standing"],
  goalnatfade: ["celebrate", "action"],
  natarrow: ["action", "standing"],
  goalnatarrow: ["celebrate", "action"],
  natrule: ["action", "standing"],
  goalnatrule: ["celebrate", "action"],
  natquiet: ["action", "standing"],
  goalnatquiet: ["celebrate", "action"],
  natoverline: ["action", "standing"],
  goalnatoverline: ["celebrate", "action"],
  natcolumn: ["action", "standing"],
  goalnatcolumn: ["celebrate", "action"],
  natwatermark: ["action", "standing"],
  goalnatwatermark: ["celebrate", "action"],
  nattab: ["action", "standing"],
  goalnattab: ["celebrate", "action"],
  natsentence: ["action", "standing"],
  goalnatsentence: ["celebrate", "action"],
  natbracket: ["action", "standing"],
  goalnatbracket: ["celebrate", "action"],
  natdotline: ["action", "standing"],
  goalnatdotline: ["celebrate", "action"],
  nathead: ["action", "standing"],
  goalnathead: ["celebrate", "action"],
  natbadge: ["action", "standing"],
  goalnatbadge: ["celebrate", "action"],
  natbar: ["action", "standing"],
  goalnatbar: ["celebrate", "action"],
  natends: ["action", "standing"],
  goalnatends: ["celebrate", "action"],
  natlist: ["action", "standing"],
  goalnatlist: ["celebrate", "action"],
  natduel: ["action", "standing"],
  goalnatduel: ["celebrate", "action"],
  natdiag: ["action", "standing"],
  goalnatdiag: ["celebrate", "action"],
  natsidebar: ["action", "standing"],
  goalnatsidebar: ["celebrate", "action"],
  natpennant: ["action", "standing"],
  goalnatpennant: ["celebrate", "action"],
  natangle: ["action", "standing"],
  goalnatangle: ["celebrate", "action"],
  natlines: ["action", "standing"],
  goalnatlines: ["celebrate", "action"],
  natcrestbleed: ["action", "standing"],
  goalnatcrestbleed: ["celebrate", "action"],
  natnav: ["action", "standing"],
  goalnatnav: ["celebrate", "action"],
  natecho: ["action", "standing"],
  goalnatecho: ["celebrate", "action"],
  natflag: ["action", "standing"],
  goalnatflag: ["celebrate", "action"],
  nattag: ["action", "standing"],
  goalnattag: ["celebrate", "action"],
  natbreakout: ["action", "standing"],
  goalnatbreakout: ["celebrate", "action"],
  natstripe: ["action", "standing"],
  goalnatstripe: ["celebrate", "action"],
  natvline: ["action", "standing"],
  goalnatvline: ["celebrate", "action"],
  natoverprint: ["action", "standing"],
  goalnatoverprint: ["celebrate", "action"],
  natkickoff: ["action", "standing"],
  goalnatkickoff: ["celebrate", "action"],
  natunderbar: ["action", "standing"],
  goalnatunderbar: ["celebrate", "action"],
  natsticker: ["action", "standing"],
  goalnatsticker: ["celebrate", "action"],
  natsplitword: ["action", "standing"],
  goalnatsplitword: ["celebrate", "action"],
  natcorners4: ["action", "standing"],
  goalnatcorners4: ["celebrate", "action"],
  natmicro2: ["action", "standing"],
  goalnatmicro2: ["celebrate", "action"],
  natinset: ["action", "standing"],
  goalnatinset: ["celebrate", "action"],
  natbigletter: ["action", "standing"],
  goalnatbigletter: ["celebrate", "action"],
  natchips: ["action", "standing"],
  goalnatchips: ["celebrate", "action"],
  natslab: ["action", "standing"],
  goalnatslab: ["celebrate", "action"],
  natcrestbox: ["action", "standing"],
  goalnatcrestbox: ["celebrate", "action"],
  natrepeatline: ["action", "standing"],
  goalnatrepeatline: ["celebrate", "action"],
  natoffset: ["action", "standing"],
  goalnatoffset: ["celebrate", "action"],
  natcredits: ["action", "standing"],
  goalnatcredits: ["celebrate", "action"],
  natpilltop: ["action", "standing"],
  goalnatpilltop: ["celebrate", "action"],
  natfadebar: ["action", "standing"],
  goalnatfadebar: ["celebrate", "action"],
  natbaseline: ["action", "standing"],
  goalnatbaseline: ["celebrate", "action"],
  natoutlinebox: ["action", "standing"],
  goalnatoutlinebox: ["celebrate", "action"],
  natfootcols: ["action", "standing"],
  goalnatfootcols: ["celebrate", "action"],
  natdotsgrid: ["action", "standing"],
  goalnatdotsgrid: ["celebrate", "action"],
  natvs: ["action", "standing"],
  goalnatvs: ["celebrate", "action"],
  natcaptionbar: ["action", "standing"],
  goalnatcaptionbar: ["celebrate", "action"],
  nattight: ["action", "standing"],
  goalnattight: ["celebrate", "action"],
  nattopline: ["action", "standing"],
  goalnattopline: ["celebrate", "action"],
  natrails: ["action", "standing"],
  goalnatrails: ["celebrate", "action"],
  natbigdate: ["action", "standing"],
  goalnatbigdate: ["celebrate", "action"],
  natplus: ["action", "standing"],
  goalnatplus: ["celebrate", "action"],
  natsyllable: ["action", "standing"],
  goalnatsyllable: ["celebrate", "action"],
  natcrestrow: ["action", "standing"],
  goalnatcrestrow: ["celebrate", "action"],
  natwidefont: ["action", "standing"],
  goalnatwidefont: ["celebrate", "action"],
  natfig: ["action", "standing"],
  goalnatfig: ["celebrate", "action"],
  natcornerribbon: ["action", "standing"],
  goalnatcornerribbon: ["celebrate", "action"],
  natsides: ["action", "standing"],
  goalnatsides: ["celebrate", "action"],
  natdashed: ["action", "standing"],
  goalnatdashed: ["celebrate", "action"],
  natcapsule: ["action", "standing"],
  goalnatcapsule: ["celebrate", "action"],
  natlower3: ["action", "standing"],
  goalnatlower3: ["celebrate", "action"],
  natballicon: ["action", "standing"],
  goalnatballicon: ["celebrate", "action"],
  natslash: ["action", "standing"],
  goalnatslash: ["celebrate", "action"],
  natweightmix: ["action", "standing"],
  goalnatweightmix: ["celebrate", "action"],
  natgrid4: ["action", "standing"],
  goalnatgrid4: ["celebrate", "action"],
  natclockicon: ["action", "standing"],
  goalnatclockicon: ["celebrate", "action"],
  natpin: ["action", "standing"],
  goalnatpin: ["celebrate", "action"],
  natdoublerule: ["action", "standing"],
  goalnatdoublerule: ["celebrate", "action"],
  natpointer: ["action", "standing"],
  goalnatpointer: ["celebrate", "action"],
  natserifcaps: ["action", "standing"],
  goalnatserifcaps: ["celebrate", "action"],
  natgradword: ["action", "standing"],
  goalnatgradword: ["celebrate", "action"],
  natdotsep: ["action", "standing"],
  goalnatdotsep: ["celebrate", "action"],
  natdatestack: ["action", "standing"],
  goalnatdatestack: ["celebrate", "action"],
  nattypewriter: ["action", "standing"],
  goalnattypewriter: ["celebrate", "action"],
  natinfobox2: ["action", "standing"],
  goalnatinfobox2: ["celebrate", "action"],
  nathighlighter: ["action", "standing"],
  goalnathighlighter: ["celebrate", "action"],
  natcrestsplit: ["action", "standing"],
  goalnatcrestsplit: ["celebrate", "action"],
  natcrestring: ["action", "standing"],
  goalnatcrestring: ["celebrate", "action"],
  natnumero: ["action", "standing"],
  goalnatnumero: ["celebrate", "action"],
  nattilted: ["action", "standing"],
  goalnattilted: ["celebrate", "action"],
  natclubword: ["action", "standing"],
  goalnatclubword: ["celebrate", "action"],
  natglasscard: ["action", "standing"],
  goalnatglasscard: ["celebrate", "action"],
  natoffsetframe: ["action", "standing"],
  goalnatoffsetframe: ["celebrate", "action"],
  natitalicbig: ["action", "standing"],
  goalnatitalicbig: ["celebrate", "action"],
  natknockbox: ["action", "standing"],
  goalnatknockbox: ["celebrate", "action"],
  natunderscore: ["action", "standing"],
  goalnatunderscore: ["celebrate", "action"],
  natfactrow: ["action", "standing"],
  goalnatfactrow: ["celebrate", "action"],
  natcols3: ["action", "standing"],
  goalnatcols3: ["celebrate", "action"],
  natbracev: ["action", "standing"],
  goalnatbracev: ["celebrate", "action"],
  natarrowup: ["action", "standing"],
  goalnatarrowup: ["celebrate", "action"],
  nattimedisc: ["action", "standing"],
  goalnattimedisc: ["celebrate", "action"],
  natrightrule: ["action", "standing"],
  goalnatrightrule: ["celebrate", "action"],
  natheaderbox: ["action", "standing"],
  goalnatheaderbox: ["celebrate", "action"],
  natinitialcolor: ["action", "standing"],
  goalnatinitialcolor: ["celebrate", "action"],
  natrulebox: ["action", "standing"],
  goalnatrulebox: ["celebrate", "action"],
  natfadeword: ["action", "standing"],
  goalnatfadeword: ["celebrate", "action"],
  natleaders: ["action", "standing"],
  goalnatleaders: ["celebrate", "action"],
  natcresttop: ["action", "standing"],
  goalnatcresttop: ["celebrate", "action"],
  natthickline: ["action", "standing"],
  goalnatthickline: ["celebrate", "action"],
  natroundbox: ["action", "standing"],
  goalnatroundbox: ["celebrate", "action"],
  natnamesbig: ["action", "standing"],
  goalnatnamesbig: ["celebrate", "action"],
  natedgebar: ["action", "standing"],
  goalnatedgebar: ["celebrate", "action"],
  natdatepill: ["action", "standing"],
  goalnatdatepill: ["celebrate", "action"],
  nattoprule: ["action", "standing"],
  goalnattoprule: ["celebrate", "action"],
  natcolorfoot: ["action", "standing"],
  goalnatcolorfoot: ["celebrate", "action"],
  nattriangle: ["action", "standing"],
  goalnattriangle: ["celebrate", "action"],
  natpullbar: ["action", "standing"],
  goalnatpullbar: ["celebrate", "action"],
  natstadium: ["action", "standing"],
  goalnatstadium: ["celebrate", "action"],
  natwhenwhere: ["action", "standing"],
  goalnatwhenwhere: ["celebrate", "action"],
  natstretch: ["action", "standing"],
  goalnatstretch: ["celebrate", "action"],
  natchip: ["action", "standing"],
  goalnatchip: ["celebrate", "action"],
  natfadestack: ["action", "standing"],
  goalnatfadestack: ["celebrate", "action"],
  natthirds: ["action", "standing"],
  goalnatthirds: ["celebrate", "action"],
  natvdate: ["action", "standing"],
  goalnatvdate: ["celebrate", "action"],
  natlr: ["action", "standing"],
  goalnatlr: ["celebrate", "action"],
  natversus: ["action", "standing"],
  goalnatversus: ["celebrate", "action"],
  natmidside: ["action", "standing"],
  goalnatmidside: ["celebrate", "action"],
  natserifstack: ["action", "standing"],
  goalnatserifstack: ["celebrate", "action"],
  natduoline: ["action", "standing"],
  goalnatduoline: ["celebrate", "action"],
  natfolio: ["action", "standing"],
  goalnatfolio: ["celebrate", "action"],
  natstrike: ["action", "standing"],
  goalnatstrike: ["celebrate", "action"],
  natblockshadow: ["action", "standing"],
  goalnatblockshadow: ["celebrate", "action"],
  natlettertiles: ["action", "standing"],
  goalnatlettertiles: ["celebrate", "action"],
  natdiamond: ["action", "standing"],
  goalnatdiamond: ["celebrate", "action"],
  natbubble: ["action", "standing"],
  goalnatbubble: ["celebrate", "action"],
  natbullets: ["action", "standing"],
  goalnatbullets: ["celebrate", "action"],
  natoutlinetime: ["action", "standing"],
  goalnatoutlinetime: ["celebrate", "action"],
  natvletters: ["action", "standing"],
  goalnatvletters: ["celebrate", "action"],
  natthin: ["action", "standing"],
  goalnatthin: ["celebrate", "action"],
  natcascade: ["action", "standing"],
  goalnatcascade: ["celebrate", "action"],
  natsup: ["action", "standing"],
  goalnatsup: ["celebrate", "action"],
  natsplitline: ["action", "standing"],
  goalnatsplitline: ["celebrate", "action"],
  natunderdots: ["action", "standing"],
  goalnatunderdots: ["celebrate", "action"],
  nattimeline: ["action", "standing"],
  goalnattimeline: ["celebrate", "action"],
  natfraction: ["action", "standing"],
  goalnatfraction: ["celebrate", "action"],
  natperiod: ["action", "standing"],
  goalnatperiod: ["celebrate", "action"],
  natcresttower: ["action", "standing"],
  goalnatcresttower: ["celebrate", "action"],
  natlinesides: ["action", "standing"],
  goalnatlinesides: ["celebrate", "action"],
  nattopcorner: ["action", "standing"],
  goalnattopcorner: ["celebrate", "action"],
  natwhitefade: ["action", "standing"],
  goalnatwhitefade: ["celebrate", "action"],
  natjustify: ["action", "standing"],
  goalnatjustify: ["celebrate", "action"],
  natmagcaption: ["action", "standing"],
  goalnatmagcaption: ["celebrate", "action"],
  natsplitfill: ["action", "standing"],
  goalnatsplitfill: ["celebrate", "action"],
  natasterisk: ["action", "standing"],
  goalnatasterisk: ["celebrate", "action"],
  natpaired: ["action", "standing"],
  goalnatpaired: ["celebrate", "action"],
  natsmallcrest: ["action", "standing"],
  goalnatsmallcrest: ["celebrate", "action"],
  natsmallcaps: ["action", "standing"],
  goalnatsmallcaps: ["celebrate", "action"],
  natdropline: ["action", "standing"],
  goalnatdropline: ["celebrate", "action"],
  natruler: ["action", "standing"],
  goalnatruler: ["celebrate", "action"],
  natrows: ["action", "standing"],
  goalnatrows: ["celebrate", "action"],
  natblockcorners: ["action", "standing"],
  goalnatblockcorners: ["celebrate", "action"],
  natellipse: ["action", "standing"],
  goalnatellipse: ["celebrate", "action"],
  natheaderline: ["action", "standing"],
  goalnatheaderline: ["celebrate", "action"],
  natsidenote: ["action", "standing"],
  goalnatsidenote: ["celebrate", "action"],
  natunderlinefat: ["action", "standing"],
  goalnatunderlinefat: ["celebrate", "action"],
  natframeline: ["action", "standing"],
  goalnatframeline: ["celebrate", "action"],
  natbadgeline: ["action", "standing"],
  goalnatbadgeline: ["celebrate", "action"],
  natmixcase: ["action", "standing"],
  goalnatmixcase: ["celebrate", "action"],
  natshadowword: ["action", "standing"],
  goalnatshadowword: ["celebrate", "action"],
  natquotebar: ["action", "standing"],
  goalnatquotebar: ["celebrate", "action"],
  natbigv: ["action", "standing"],
  goalnatbigv: ["celebrate", "action"],
  natstep: ["action", "standing"],
  goalnatstep: ["celebrate", "action"],
  natnumbered: ["action", "standing"],
  goalnatnumbered: ["celebrate", "action"],
  natcircletag: ["action", "standing"],
  goalnatcircletag: ["celebrate", "action"],
  natslashdate: ["action", "standing"],
  goalnatslashdate: ["celebrate", "action"],
  natboxedname: ["action", "standing"],
  goalnatboxedname: ["celebrate", "action"],
  natfadeline: ["action", "standing"],
  goalnatfadeline: ["celebrate", "action"],
  natpipe: ["action", "standing"],
  goalnatpipe: ["celebrate", "action"],
  natwave: ["action", "standing"],
  goalnatwave: ["celebrate", "action"],
  nataboveunder: ["action", "standing"],
  goalnataboveunder: ["celebrate", "action"],
  natemdash: ["action", "standing"],
  goalnatemdash: ["celebrate", "action"],
  natcheck: ["action", "standing"],
  goalnatcheck: ["celebrate", "action"],
  natjustifyrow: ["action", "standing"],
  goalnatjustifyrow: ["celebrate", "action"],
  natchevrons: ["action", "standing"],
  goalnatchevrons: ["celebrate", "action"],
  natslashes: ["action", "standing"],
  goalnatslashes: ["celebrate", "action"],
  natplusline: ["action", "standing"],
  goalnatplusline: ["celebrate", "action"],
  natbars: ["action", "standing"],
  goalnatbars: ["celebrate", "action"],
  natlcorner: ["action", "standing"],
  goalnatlcorner: ["celebrate", "action"],
  natdotgrid9: ["action", "standing"],
  goalnatdotgrid9: ["celebrate", "action"],
  natsquaremark: ["action", "standing"],
  goalnatsquaremark: ["celebrate", "action"],
  natdashes: ["action", "standing"],
  goalnatdashes: ["celebrate", "action"],
  nattilde: ["action", "standing"],
  goalnattilde: ["celebrate", "action"],
  natarcmark: ["action", "standing"],
  goalnatarcmark: ["celebrate", "action"],
  natfirstfill: ["action", "standing"],
  goalnatfirstfill: ["celebrate", "action"],
  natlastcolor: ["action", "standing"],
  goalnatlastcolor: ["celebrate", "action"],
  natboxletter: ["action", "standing"],
  goalnatboxletter: ["celebrate", "action"],
  natcolorsub: ["action", "standing"],
  goalnatcolorsub: ["celebrate", "action"],
  natcolorword: ["action", "standing"],
  goalnatcolorword: ["celebrate", "action"],
  natbebas: ["action", "standing"],
  goalnatbebas: ["celebrate", "action"],
  natbodoni: ["action", "standing"],
  goalnatbodoni: ["celebrate", "action"],
  natunbounded: ["action", "standing"],
  goalnatunbounded: ["celebrate", "action"],
  natgrotesk: ["action", "standing"],
  goalnatgrotesk: ["celebrate", "action"],
  natalfaslab: ["action", "standing"],
  goalnatalfaslab: ["celebrate", "action"],
  natanton: ["action", "standing"],
  goalnatanton: ["celebrate", "action"],
  natbarlow: ["action", "standing"],
  goalnatbarlow: ["celebrate", "action"],
  natarchivo: ["action", "standing"],
  goalnatarchivo: ["celebrate", "action"],
  natdela: ["action", "standing"],
  goalnatdela: ["celebrate", "action"],
  natitalicserif: ["action", "standing"],
  goalnatitalicserif: ["celebrate", "action"],
  natmontserrat: ["action", "standing"],
  goalnatmontserrat: ["celebrate", "action"],
  natfraunces: ["action", "standing"],
  goalnatfraunces: ["celebrate", "action"],
  natarchivolight: ["action", "standing"],
  goalnatarchivolight: ["celebrate", "action"],
  natrubikmono: ["action", "standing"],
  goalnatrubikmono: ["celebrate", "action"],
  natfrauncesit: ["action", "standing"],
  goalnatfrauncesit: ["celebrate", "action"],
  natfreecol: ["action", "standing"],
  goalnatfreecol: ["celebrate", "action"],
  natcutoff: ["action", "standing"],
  goalnatcutoff: ["celebrate", "action"],
  natcornerpair: ["action", "standing"],
  goalnatcornerpair: ["celebrate", "action"],
  natmirror: ["action", "standing"],
  goalnatmirror: ["celebrate", "action"],
  natbehindword: ["action", "standing"],
  goalnatbehindword: ["celebrate", "action"],
  natbehindoutline: ["action", "standing"],
  goalnatbehindoutline: ["celebrate", "action"],
  natbehindcolor: ["action", "standing"],
  goalnatbehindcolor: ["celebrate", "action"],
  natbehindserif: ["action", "standing"],
  goalnatbehindserif: ["celebrate", "action"],
  natbehindtall: ["action", "standing"],
  goalnatbehindtall: ["celebrate", "action"],
  natcutoffoutline: ["action", "standing"],
  goalnatcutoffoutline: ["celebrate", "action"],
  natcutoffcolor: ["action", "standing"],
  goalnatcutoffcolor: ["celebrate", "action"],
  natcutofftall: ["action", "standing"],
  goalnatcutofftall: ["celebrate", "action"],
  natcutoffserif: ["action", "standing"],
  goalnatcutoffserif: ["celebrate", "action"],
  natbehindbodoni: ["action", "standing"],
  goalnatbehindbodoni: ["celebrate", "action"],
  natbehindgrotesk: ["action", "standing"],
  goalnatbehindgrotesk: ["celebrate", "action"],
  natcornerbodoni: ["action", "standing"],
  goalnatcornerbodoni: ["celebrate", "action"],
  natcornertall: ["action", "standing"],
  goalnatcornertall: ["celebrate", "action"],
  natmirrorserif: ["action", "standing"],
  goalnatmirrorserif: ["celebrate", "action"],
  natmirrorcolor: ["action", "standing"],
  goalnatmirrorcolor: ["celebrate", "action"],
  natfreecolserif: ["action", "standing"],
  goalnatfreecolserif: ["celebrate", "action"],
  natcorneroutline: ["action", "standing"],
  goalnatcorneroutline: ["celebrate", "action"],
  natcornercolor: ["action", "standing"],
  goalnatcornercolor: ["celebrate", "action"],
  natfreecolbodoni: ["action", "standing"],
  goalnatfreecolbodoni: ["celebrate", "action"],
  natfreecoltall: ["action", "standing"],
  goalnatfreecoltall: ["celebrate", "action"],
  natmirrorbodoni: ["action", "standing"],
  goalnatmirrorbodoni: ["celebrate", "action"],
  natcorner: ["action", "standing"],
  natgrass: ["action", "standing"],
  goalnatword: ["celebrate", "action"],
  goalnatcorner: ["celebrate", "action"],
  goalnatlight: ["celebrate", "action"],
  pressstack: ["celebrate", "action", "standing"],
  pressclip: ["celebrate", "bust", "standing"],
  presshero: ["celebrate", "action", "standing"],
  presswall: ["celebrate", "bust", "standing"],
  coachwelcome: ["bust", "standing"],
  coachwelcomelight: ["bust", "standing"],
  welcomelight: ["bust", "standing"],
  welcomeclub: ["bust", "standing"],
  welcomecolumn: ["bust", "standing"],
  welcomecareer: ["bust", "standing"],
  coachdark: ["bust", "standing"],
  coachname: ["bust", "standing"],
  coachduo: ["bust", "standing"],
  coachframe: ["bust", "standing"],
  coachclipboard: ["bust", "standing"],
  coachcard: ["bust", "standing"],
  coachsheet: ["bust", "standing"],
  coachlowkey: ["bust", "standing"],
  coachmono: ["bust", "standing"],
  goalherocount: ["celebrate", "action"],
  coachhero: ["bust", "standing"],
  coachpress: ["bust", "standing"],
  coachboard: ["bust", "standing"],
  coachserif: ["bust", "standing"],
  coachtouchline: ["bust", "standing"],
  heroboxed: ["standing", "action", "bust"],
  herosticker: ["standing", "action", "bust"],
  heroband: ["standing", "action", "bust"],
  heroname: ["standing", "action", "bust"],
  herofoot: ["standing", "action", "bust"],
  goalherotop: ["celebrate", "action"],
  goalherobw: ["celebrate", "action"],
  goalheroduotone: ["celebrate", "action"],
  goalheroexclaim: ["celebrate", "action"],
  goalherohalf: ["celebrate", "action"],
  heroduo: ["standing", "action", "bust"],
  herotint: ["standing", "action", "bust"],
  heroshadow: ["standing", "action", "bust"],
  herogradient: ["standing", "action", "bust"],
  heroaura: ["standing", "action", "bust"],
  goalheroname: ["celebrate", "action"],
  goalheroboxed: ["celebrate", "action"],
  goalherosticker: ["celebrate", "action"],
  goalherocrest: ["celebrate", "action"],
  goalherofill: ["celebrate", "action"],
  heroghost: ["standing", "action", "bust"],
  herooutline: ["standing", "action", "bust"],
  herotwotone: ["standing", "action", "bust"],
  heroserif: ["standing", "action", "bust"],
  herolower: ["standing", "action", "bust"],
  goalheroshadow: ["celebrate", "action"],
  goalherogradient: ["celebrate", "action"],
  goalherostagger: ["celebrate", "action"],
  goalherotally: ["celebrate", "action"],
  goalheroaura: ["celebrate", "action"],
  heromatchbodoni: ["standing", "action", "bust"],
  heromatchdela: ["standing", "action", "bust"],
  heromatchslab: ["standing", "action", "bust"],
  heromatchbebas: ["standing", "action", "bust"],
  heromatcharchivo: ["standing", "action", "bust"],
  goalheroghost: ["celebrate", "action"],
  goalherooutline: ["celebrate", "action"],
  goalherotwotone: ["celebrate", "action"],
  goalheroserif: ["celebrate", "action"],
  goalherolower: ["celebrate", "action"],
  herostack: ["standing", "action", "bust"],
  herocaps: ["standing", "action", "bust"],
  heroframe: ["standing", "action", "bust"],
  herovs: ["standing", "action", "bust"],
  heronumber: ["standing", "action", "bust"],
  goalherostack: ["celebrate", "action"],
  goalherocaps: ["celebrate", "action"],
  goalheroframe: ["celebrate", "action"],
  goalherotint: ["celebrate", "action"],
  goalheroduo: ["celebrate", "action"],
  heromatch: ["standing", "action", "bust"],
  herotime: ["standing", "action", "bust"],
  herodate: ["standing", "action", "bust"],
  heromatchdark: ["standing", "action", "bust"],
  herobehind: ["standing", "action", "bust"],
  goalherodark: ["celebrate", "action"],
  goalherosplit: ["celebrate", "action"],
  goalherobehind: ["celebrate", "action"],
  goalherofoot: ["celebrate", "action"],
  goalheroband: ["celebrate", "action"],
  welcome: ["bust", "standing"],
  welcomeplay: ["bust", "standing"],
  welcomeduo: ["bust", "standing"],
  welcomehalo: ["bust", "standing"],
  goalherobarlow: ["celebrate", "action"],
  goalheroanton: ["celebrate", "action"],
  goalheroarchivo: ["celebrate", "action"],
  goalherodela: ["celebrate", "action"],
  goalheroslab: ["celebrate", "action"],
  goalherobodoni: ["celebrate", "action"],
  goalherobebas: ["celebrate", "action"],
  goalflash: ["celebrate", "action"],
  goalrows: ["celebrate", "action"],
  goallight: ["celebrate", "action"],
  goaldots: ["celebrate", "action"],
  crestline: ["standing", "bust"],
  stage: ["standing", "action", "back"],
  edgebar: ["standing", "action"],
  monogram: ["standing", "bust"],
  thirds: ["standing", "action"],
  stub: ["standing", "action", "bust"],
  goalmono: ["celebrate", "action"],
  goaltonal: ["celebrate", "action"],
  goalvert: ["celebrate", "action"],
  footnote: ["standing", "action"],
  echoline: ["standing", "action"],
  pills: ["standing", "action", "bust"],
  corner: ["standing", "action", "bust"],
  shadow: ["standing", "action"],
  goalecho: ["celebrate", "action"],
  goalcircle: ["celebrate", "action"],
  goalcrop: ["celebrate", "action"],
  goalbar: ["celebrate", "action"],
  goalnumber: ["celebrate", "action", "back"],
  seal: ["standing", "action", "bust"],
  fixtureboard: ["standing", "bust"],
  lowerthird: ["standing", "action"],
  fixturelist: ["standing", "action", "bust"],
  dotgrid: ["standing", "action"],
  goalticker: ["celebrate", "action"],
  goalaura: ["celebrate", "action"],
  goalinset: ["celebrate", "action"],
  goalswiss: ["celebrate", "action"],
  goalorbit: ["celebrate", "action"],
  namecorners: ["standing", "action", "bust"],
  pinstripe: ["standing", "bust"],
  crestpair: ["standing", "action"],
  datecard: ["standing", "action", "bust"],
  frostband: ["standing", "action"],
  goalsidecol: ["celebrate", "action"],
  goalgallery: ["celebrate", "action"],
  goallockup: ["celebrate", "action"],
  goalboard: ["celebrate", "action"],
  goalname: ["celebrate", "bust", "action"],
  offsetshadow: ["standing", "action"],
  kickoff: ["standing", "bust"],
  pitchlines: ["standing", "action"],
  sunrise: ["standing", "bust"],
  contour: ["standing", "action"],
  goalhorizon: ["celebrate", "action"],
  goalmicro: ["celebrate", "action"],
  goalmonogram: ["celebrate", "action"],
  goalstage: ["celebrate", "action"],
  goaloffset: ["celebrate", "action"],
  medallion: ["standing", "bust"],
  matchbar: ["standing", "action"],
  ringlight: ["standing", "bust"],
  widescreen: ["standing", "action"],
  underline: ["standing", "action", "bust"],
  goalringlight: ["celebrate", "action"],
  goalmedallion: ["celebrate", "action"],
  goalunderline: ["celebrate", "action"],
  goalwidescreen: ["celebrate", "action"],
  goalcrestpair: ["celebrate", "action"],
  paperechodate: ["standing", "bust"],
  paperechotime: ["standing", "bust", "action"],
  paperechoname: ["standing", "bust"],
  paperechoserif: ["standing", "bust"],
  paperechowide: ["standing", "bust"],
  goalpaperechoname: ["celebrate", "action"],
  goalpaperechoserif: ["celebrate", "action"],
  goalpaperechowide: ["celebrate", "action"],
  goalpaperechovert: ["celebrate", "action"],
  goalpaperechobar: ["celebrate", "action"],
  echomicro: ["standing", "bust", "action"],
  echoaura: ["standing", "bust"],
  echobackline: ["standing", "bust", "action"],
  echonamefield: ["standing", "bust"],
  echozoom: ["standing", "bust", "action"],
  goalechoaura: ["celebrate", "action"],
  goalechobackline: ["celebrate", "action"],
  goalechonamefield: ["celebrate", "action"],
  goalechozoom: ["celebrate", "action"],
  goalechovert: ["celebrate", "action"],
  echoinset: ["standing", "bust", "action"],
  echogallery: ["standing", "bust"],
  echosidecol: ["standing", "bust", "action"],
  echohorizon: ["standing", "bust", "action"],
  echowidetitle: ["standing", "bust"],
  goalechobug: ["celebrate", "action"],
  goalechoserene: ["celebrate", "action"],
  goalechohorizon: ["celebrate", "action"],
  goalechowide: ["celebrate", "action"],
  goalechotonal: ["celebrate", "action"],
  echoswiss: ["standing", "bust", "action"],
  echoserif: ["standing", "bust"],
  echotable: ["standing", "bust", "action"],
  echoorbit: ["standing", "bust"],
  echolockup: ["standing", "bust", "action"],
  goalechoswiss: ["celebrate", "action"],
  goalechoserif: ["celebrate", "action"],
  goalechoorbit: ["celebrate", "action"],
  goalechomono: ["celebrate", "action"],
  goalechoflash: ["celebrate", "action"],
  echotitle: ["standing", "bust", "action"],
  echodate: ["standing", "bust"],
  echotime: ["standing", "bust", "action"],
  echoname: ["standing", "bust"],
  echocrest: ["standing", "bust", "action"],
  goalechotitle: ["celebrate", "action"],
  goalechoname: ["celebrate", "action"],
  goalechocrest: ["celebrate", "action"],
  goalechobar: ["celebrate", "action"],
  goalechocorner: ["celebrate", "action"],
  paperripple: ["standing", "bust", "action"],
  papertype: ["standing", "bust", "action"],
  paperdouble: ["standing", "bust", "action"],
  paperstep: ["standing", "bust", "action"],
  papergiant: ["standing", "bust"],
  goalpaperripple: ["celebrate", "action"],
  goalpapertype: ["celebrate", "action"],
  goalpaperdouble: ["celebrate", "action"],
  goalpaperstep: ["celebrate", "action"],
  goalpapergiant: ["celebrate", "action"],
  paperecho: ["standing", "bust", "action"],
  dashecho: ["standing", "bust", "action"],
  gradientsilhouette: ["standing", "bust"],
  duosilhouette: ["standing", "bust"],
  stepsilhouette: ["standing", "bust", "action"],
  goalpaperecho: ["celebrate", "action"],
  goaldashecho: ["celebrate", "action"],
  goalgradientsilhouette: ["celebrate", "action"],
  goalduosilhouette: ["celebrate", "action"],
  goalstepsilhouette: ["celebrate", "action"],
  dotsilhouette: ["standing", "bust", "action"],
  crestsilhouette: ["standing", "bust"],
  splitsilhouette: ["standing", "bust", "action"],
  doubleline: ["standing", "bust", "action"],
  risingecho: ["standing", "bust"],
  goaldotsilhouette: ["celebrate", "action"],
  goalcrestsilhouette: ["celebrate", "action"],
  goalsplitsilhouette: ["celebrate", "action"],
  goaldoubleline: ["celebrate", "action"],
  goalrisingecho: ["celebrate", "action"],
  typesilhouette: ["standing", "bust", "action"],
  giantsilhouette: ["standing", "bust"],
  linesilhouette: ["standing", "bust", "action"],
  rippleecho: ["standing", "bust", "action"],
  rimlight: ["standing", "bust"],
  goaltypesilhouette: ["celebrate", "action"],
  goalgiantsilhouette: ["celebrate", "action"],
  goallinesilhouette: ["celebrate", "action"],
  goalrippleecho: ["celebrate", "action"],
  goalrimlight: ["celebrate", "action"],
  castshadow: ["standing", "action"],
  mirrorecho: ["standing", "bust", "action"],
  overlap: ["standing", "bust"],
  fillprogress: ["standing", "bust", "action"],
  twotone: ["standing", "bust"],
  goalcastshadow: ["celebrate", "action"],
  goalmirrorecho: ["celebrate", "action"],
  goaloverlap: ["celebrate", "action"],
  goalfillprogress: ["celebrate", "action"],
  goaltwotone: ["celebrate", "action"],
  bleedword: ["standing", "bust", "action"],
  textsquare: ["standing", "bust"],
  circled: ["standing", "bust", "action"],
  redacted: ["standing", "bust"],
  oneline: ["standing", "action", "bust"],
  goalbleed: ["celebrate", "action"],
  goaltextsquare: ["celebrate", "action"],
  goalcircled: ["celebrate", "action"],
  goalredacted: ["celebrate", "action"],
  goaloneline: ["celebrate", "action"],
  dropcap: ["standing", "bust"],
  crossword: ["standing", "bust", "action"],
  hyphen: ["standing", "bust"],
  ellipsis: ["standing", "bust", "action"],
  arrow: ["standing", "action"],
  goaldropcap: ["celebrate", "action"],
  goalcrossword: ["celebrate", "action"],
  goalellipsis: ["celebrate", "action"],
  goalarrow: ["celebrate", "action"],
  goalcolon: ["celebrate", "action"],
  bordertext: ["standing", "bust", "action"],
  weights: ["standing", "bust"],
  bounce: ["standing", "action"],
  fadeword: ["standing", "bust"],
  tracking: ["standing", "bust", "action"],
  goalbordertext: ["celebrate", "action"],
  goalweights: ["celebrate", "action"],
  goalbounce: ["celebrate", "action"],
  goalfade: ["celebrate", "action"],
  goaltracking: ["celebrate", "action"],
  halffill: ["standing", "bust", "action"],
  circletext: ["standing", "bust"],
  strike: ["standing", "bust", "action"],
  superscript: ["standing", "bust"],
  quotes: ["standing", "bust"],
  goalhalffill: ["celebrate", "action"],
  goalcircletext: ["celebrate", "action"],
  goalstrike: ["celebrate", "action"],
  goalsuperscript: ["celebrate", "action"],
  goalquotes: ["celebrate", "action"],
  cropmarks: ["standing", "bust", "action"],
  folder: ["standing", "bust"],
  keycaps: ["standing", "action"],
  postit: ["standing", "bust"],
  specimen: ["standing", "bust"],
  goalcropmarks: ["celebrate", "action"],
  goalkeycaps: ["celebrate", "action"],
  goalpostit: ["celebrate", "action"],
  goalspecimen: ["celebrate", "action"],
  goaltally: ["celebrate", "action"],
  nowplaying: ["standing", "bust", "action"],
  locator: ["standing", "action"],
  invite: ["standing", "bust"],
  toggle: ["standing", "bust", "action"],
  emboss: ["standing", "bust"],
  goalnowplaying: ["celebrate", "action"],
  goalemboss: ["celebrate", "action"],
  goaltoggle: ["celebrate", "action"],
  goalpulse: ["celebrate", "action"],
  goalunlock: ["celebrate", "action"],
  search: ["standing", "bust", "action"],
  chat: ["standing", "bust"],
  receipt: ["standing", "action"],
  instant: ["standing", "action", "bust"],
  measure: ["standing", "action"],
  goalsearch: ["celebrate", "action"],
  goalchat: ["celebrate", "action"],
  goalreceipt: ["celebrate", "action"],
  goalinstant: ["celebrate", "action"],
  goalmeasure: ["celebrate", "action"],
  totwgallery: ["celebrate", "standing", "bust"],
  totwcard: ["celebrate", "standing", "bust"],
  totwswiss: ["celebrate", "standing", "bust"],
  totwcallout: ["celebrate", "standing", "bust"],
  totwsplit: ["celebrate", "standing", "bust"],
  totwstack: ["celebrate", "standing", "bust"],
  totwmicro: ["celebrate", "standing", "bust"],
  totwtonal: ["celebrate", "standing", "bust"],
  notify: ["standing", "bust", "action"],
  marker: ["standing", "action", "bust"],
  chapter: ["standing", "bust"],
  subtitle: ["standing", "action"],
  parens: ["standing", "bust"],
  goalnotify: ["celebrate", "action"],
  goalmarker: ["celebrate", "action"],
  goalparens: ["celebrate", "action"],
  goalsubtitle: ["celebrate", "action"],
  goalpunct: ["celebrate", "action"],
  sentence: ["standing", "bust", "action"],
  signage: ["standing", "action"],
  datestamp: ["standing", "action", "bust"],
  hairslash: ["standing", "action"],
  viewfinder: ["standing", "bust"],
  goalsentence: ["celebrate", "action"],
  goalcamera: ["celebrate", "action"],
  goalslash: ["celebrate", "action"],
  goalviewfinder: ["celebrate", "action"],
  goalframe: ["celebrate", "action"],
};

/** How well a photo's pose suits a look: 2 made for it, 1 neutral, 0 wrong (a back shot in a face close-up). */
export function poseFit(templateId: TemplateId, pose: Pose | undefined): number {
  const def = TEMPLATES.find((t) => t.id === templateId);
  if (pose === "back" && (def?.magnifies || def?.photo === "bust")) return 0;
  const fit = POSE_FIT[templateId];
  if (!pose || pose === "unknown" || !fit) return 1;
  return fit.includes(pose) ? 2 : 1;
}

/** Order in which looks are proposed for each post type (the most fitting first). */
// The newest, most editorial looks lead; the classic ones follow.
const PRIORITY: Partial<Record<PostType, TemplateId[]>> = {
  // The agency's welcome post is one fixed look (user, 20/10): the others stay only for old edits.
  welcome: ["welcomeplay"],
  totw: ["totwgallery", "totwcard", "totwswiss", "totwcallout", "totwsplit", "totwstack", "totwmicro", "totwtonal", "stretch", "poster", "spotlight", "closeup", "torn", "simple", "notebook", "award", "broadcast", "scoreline", "window", "paperlight", "mono", "tactics", "serif", "sequence", "card"],
  goal: ["goalnatgrid", "goalnatnotes", "goalnatedge", "goalnatcircle", "goalnatblur", "goalnatrepeat", "goalnatcard", "goalnatchest", "goalnatgothic", "goalnattall", "goalnatribbon", "goalnatduo", "goalnatmoody", "goalnatfog", "goalnatpaper", "goalnatfight", "goalnateditorial", "goalnatsand", "goalnatstarring", "goalnatbeam", "goalnatring", "goalnatpanel", "goalnatlit", "goalnatcinema", "goalnatswatch", "goalnatneon", "goalnatdymo", "goalnatturf", "goalnatunderline", "goalnatknockout", "goalnatslant", "goalnatboxed", "goalnathashtag", "goalnatquote", "goalnatticker", "goalnatwide", "goalnatled", "goalnatsubtitle", "goalnatquad", "goalnatflank", "goalnatpill", "goalnatglass", "goalnatmasthead", "goalnatitalic", "goalnatmono", "goalnatstack", "goalnatinitial", "goalnatserif", "goalnatarc", "goalnatcallout", "goalnatbug", "goalnatfocus", "goalnathorizon", "goalnatstamp", "goalnatcaption", "goalnatoutline", "goalnatcrest", "goalnatnumber", "goalnatvert", "goalnatborder", "goalnatsplit", "goalnatclean", "goalnatname", "goalnatstrip", "goalnatword", "goalnatcorner", "goalnatlight", "goalnatfold", "goalnatspine", "goalnatmix", "goalnatlabel", "goalnatspaced", "goalnatmarks", "goalnatdot", "goalnatcut", "goalnatlegend", "goalnatcols", "goalnatfoot", "goalnatfade", "goalnatarrow", "goalnatrule", "goalnatquiet", "goalnatoverline", "goalnatcolumn", "goalnatwatermark", "goalnattab", "goalnatsentence", "goalnatbracket", "goalnatdotline", "goalnathead", "goalnatbadge", "goalnatbar", "goalnatends", "goalnatlist", "goalnatduel", "goalnatdiag", "goalnatsidebar", "goalnatpennant", "goalnatangle", "goalnatlines", "goalnatcrestbleed", "goalnatnav", "goalnatecho", "goalnatflag", "goalnattag", "goalnatbreakout", "goalnatstripe", "goalnatvline", "goalnatoverprint", "goalnatkickoff", "goalnatunderbar", "goalnatsticker", "goalnatsplitword", "goalnatcorners4", "goalnatmicro2", "goalnatinset", "goalnatbigletter", "goalnatchips", "goalnatslab", "goalnatcrestbox", "goalnatrepeatline", "goalnatoffset", "goalnatcredits", "goalnatpilltop", "goalnatfadebar", "goalnatbaseline", "goalnatoutlinebox", "goalnatfootcols", "goalnatdotsgrid", "goalnatvs", "goalnatcaptionbar", "goalnattight", "goalnattopline", "goalnatrails", "goalnatbigdate", "goalnatplus", "goalnatsyllable", "goalnatcrestrow", "goalnatwidefont", "goalnatfig", "goalnatcornerribbon", "goalnatsides", "goalnatdashed", "goalnatcapsule", "goalnatlower3", "goalnatballicon", "goalnatslash", "goalnatweightmix", "goalnatgrid4", "goalnatclockicon", "goalnatpin", "goalnatdoublerule", "goalnatpointer", "goalnatserifcaps", "goalnatgradword", "goalnatdotsep", "goalnatdatestack", "goalnattypewriter", "goalnatinfobox2", "goalnathighlighter", "goalnatcrestsplit", "goalnatcrestring", "goalnatnumero", "goalnattilted", "goalnatclubword", "goalnatglasscard", "goalnatoffsetframe", "goalnatitalicbig", "goalnatknockbox", "goalnatunderscore", "goalnatfactrow", "goalnatcols3", "goalnatbracev", "goalnatarrowup", "goalnattimedisc", "goalnatrightrule", "goalnatheaderbox", "goalnatinitialcolor", "goalnatrulebox", "goalnatfadeword", "goalnatleaders", "goalnatcresttop", "goalnatthickline", "goalnatroundbox", "goalnatnamesbig", "goalnatedgebar", "goalnatdatepill", "goalnattoprule", "goalnatcolorfoot", "goalnattriangle", "goalnatpullbar", "goalnatstadium", "goalnatwhenwhere", "goalnatstretch", "goalnatchip", "goalnatfadestack", "goalnatthirds", "goalnatvdate", "goalnatlr", "goalnatversus", "goalnatmidside", "goalnatserifstack", "goalnatduoline", "goalnatfolio", "goalnatstrike", "goalnatblockshadow", "goalnatlettertiles", "goalnatdiamond", "goalnatbubble", "goalnatbullets", "goalnatoutlinetime", "goalnatvletters", "goalnatthin", "goalnatcascade", "goalnatsup", "goalnatsplitline", "goalnatunderdots", "goalnattimeline", "goalnatfraction", "goalnatperiod", "goalnatcresttower", "goalnatlinesides", "goalnattopcorner", "goalnatwhitefade", "goalnatjustify", "goalnatmagcaption", "goalnatsplitfill", "goalnatasterisk", "goalnatpaired", "goalnatsmallcrest", "goalnatsmallcaps", "goalnatdropline", "goalnatruler", "goalnatrows", "goalnatblockcorners", "goalnatellipse", "goalnatheaderline", "goalnatsidenote", "goalnatunderlinefat", "goalnatframeline", "goalnatbadgeline", "goalnatmixcase", "goalnatshadowword", "goalnatquotebar", "goalnatbigv", "goalnatstep", "goalnatnumbered", "goalnatcircletag", "goalnatslashdate", "goalnatboxedname", "goalnatfadeline", "goalnatpipe", "goalnatwave", "goalnataboveunder", "goalnatemdash", "goalnatcheck", "goalnatjustifyrow", "goalnatchevrons", "goalnatslashes", "goalnatplusline", "goalnatbars", "goalnatlcorner", "goalnatdotgrid9", "goalnatsquaremark", "goalnatdashes", "goalnattilde", "goalnatarcmark", "goalnatfirstfill", "goalnatlastcolor", "goalnatboxletter", "goalnatcolorsub", "goalnatcolorword", "goalnatbebas", "goalnatbodoni", "goalnatunbounded", "goalnatgrotesk", "goalnatalfaslab", "goalnatanton", "goalnatbarlow", "goalnatarchivo", "goalnatdela", "goalnatitalicserif", "goalnatmontserrat", "goalnatfraunces", "goalnatarchivolight", "goalnatrubikmono", "goalnatfrauncesit", "goalnatfreecol", "goalnatcutoff", "goalnatcornerpair", "goalnatmirror", "goalnatbehindword", "goalnatbehindoutline", "goalnatbehindcolor", "goalnatbehindserif", "goalnatbehindtall", "goalnatcutoffoutline", "goalnatcutoffcolor", "goalnatcutofftall", "goalnatcutoffserif", "goalnatbehindbodoni", "goalnatbehindgrotesk", "goalnatcornerbodoni", "goalnatcornertall", "goalnatmirrorserif", "goalnatmirrorcolor", "goalnatfreecolserif", "goalnatcorneroutline", "goalnatcornercolor", "goalnatfreecolbodoni", "goalnatfreecoltall", "goalnatmirrorbodoni", "goalherocount", "goalherotop", "goalherobw", "goalheroduotone", "goalheroexclaim", "goalherohalf", "goalheroname", "goalheroboxed", "goalherosticker", "goalherocrest", "goalherofill", "goalheroshadow", "goalherogradient", "goalherostagger", "goalherotally", "goalheroaura", "goalheroghost", "goalherooutline", "goalherotwotone", "goalheroserif", "goalherolower", "goalherostack", "goalherocaps", "goalheroframe", "goalherotint", "goalheroduo", "goalherodark", "goalherosplit", "goalherobehind", "goalherofoot", "goalheroband", "goalherobarlow", "goalheroanton", "goalheroarchivo", "goalherodela", "goalheroslab", "goalherobodoni", "goalherobebas", "goalpaperechoname", "goalpaperechoserif", "goalpaperechowide", "goalpaperechovert", "goalpaperechobar", "goalechoaura", "goalechobackline", "goalechonamefield", "goalechozoom", "goalechovert", "goalechobug", "goalechoserene", "goalechohorizon", "goalechowide", "goalechotonal", "goalechoswiss", "goalechoserif", "goalechoorbit", "goalechomono", "goalechoflash", "goalechotitle", "goalechoname", "goalechocrest", "goalechobar", "goalechocorner", "goalpaperripple", "goalpapertype", "goalpaperdouble", "goalpaperstep", "goalpapergiant", "goalpaperecho", "goaldashecho", "goalgradientsilhouette", "goalduosilhouette", "goalstepsilhouette", "goaldotsilhouette", "goalcrestsilhouette", "goalsplitsilhouette", "goaldoubleline", "goalrisingecho", "goaltypesilhouette", "goalgiantsilhouette", "goallinesilhouette", "goalrippleecho", "goalrimlight", "goalcastshadow", "goalmirrorecho", "goaloverlap", "goalfillprogress", "goaltwotone", "goalbleed", "goaltextsquare", "goalcircled", "goalredacted", "goaloneline", "goaldropcap", "goalcrossword", "goalellipsis", "goalarrow", "goalcolon", "goalbordertext", "goalweights", "goalbounce", "goalfade", "goaltracking", "goalhalffill", "goalcircletext", "goalstrike", "goalsuperscript", "goalquotes", "goalcropmarks", "goalkeycaps", "goalpostit", "goalspecimen", "goaltally", "goalnowplaying", "goalemboss", "goaltoggle", "goalpulse", "goalunlock", "goalsearch", "goalchat", "goalreceipt", "goalinstant", "goalmeasure", "goalnotify", "goalmarker", "goalparens", "goalsubtitle", "goalpunct", "goalsentence", "goalcamera", "goalslash", "goalviewfinder", "goalframe", "goalringlight", "goalmedallion", "goalunderline", "goalwidescreen", "goalcrestpair", "goalhorizon", "goalmicro", "goalmonogram", "goalstage", "goaloffset", "goalsidecol", "goalgallery", "goallockup", "goalboard", "goalname", "goalticker", "goalaura", "goalinset", "goalswiss", "goalorbit", "goalecho", "goalcircle", "goalcrop", "goalbar", "goalnumber", "goalmono", "goaltonal", "goalvert", "goalwide", "goalscore", "goalnet", "goalbug", "goalserene", "goalflash", "goalrows", "goallight", "goaldots", "simple", "orbit", "vertname", "monoaccent", "twoblock", "tonal", "widetitle", "micro", "filmframe", "aura", "pressphoto", "lockup", "swiss", "gallery", "sidecol", "serene", "inset", "playoff", "slats", "vhs", "tiles", "zoomburst", "tagcard", "stencil", "colorblock", "panelscript", "redgrain", "halfline", "statserif", "emblemfade", "cutpaper", "petals", "gradient", "glass", "boxtitle", "softglow", "blurrun", "bighead", "swirl", "splitbw", "hollow", "selective", "dotscript", "roughname", "infobox", "condensed", "shards", "clubname", "curvepanel", "arc", "cheer", "sideband", "band", "pillar", "blueprint", "greyday", "emblemart", "reflect", "minimal", "screenprint", "wall", "graffiti", "damask", "diagonal", "chrome", "night", "strokes", "tallname", "breakout", "statboxes", "notebook", "tilt", "dispersion", "sepia", "notes", "crestmark", "caption", "numbers", "cutletters", "twoscale", "bignumber", "brushday", "motion", "outline", "ghost", "gameday", "sky", "headline", "collage", "debut", "strip", "glow", "broadcast", "scoreline", "window", "script", "mono", "paperlight", "comic", "shield", "jersey", "sideword", "syllables", "gilded", "roundel", "burst", "speed", "riso", "floor", "serif", "tactics", "skyline", "sequence", "smear", "windows", "archive", "repeat", "closeup", "stretch", "monumental", "city", "brush", "frame", "neon", "torn", "poster", "halftone", "spotlight"],
  result: ["simple", "widescreen", "pitchlines", "frostband", "dotgrid", "footnote", "echoline", "pills", "corner", "shadow", "crestline", "stage", "edgebar", "monogram", "thirds", "orbit", "vertname", "monoaccent", "timetable", "twoblock", "autograph", "tonal", "widetitle", "micro", "filmframe", "aura", "backline", "namefield", "diptych", "pressphoto", "horizon", "lockup", "swiss", "gallery", "sidecol", "serene", "datefirst", "inset", "pride", "playoff", "slats", "vhs", "triptych", "tiles", "zoomburst", "tagcard", "stencil", "colorblock", "cover", "panelscript", "nextmatch", "redgrain", "halfline", "statserif", "sepiaday", "emblemfade", "cutpaper", "gradient", "glass", "boxtitle", "softglow", "blurrun", "bighead", "swirl", "splitbw", "hollow", "selective", "dotscript", "roughname", "infobox", "condensed", "shards", "clubname", "curvepanel", "arc", "tunnel", "cheer", "sideband", "pillar", "blueprint", "glowline", "greyday", "emblemart", "reflect", "minimal", "profile", "screenprint", "wall", "graffiti", "damask", "diagonal", "versus", "chrome", "tape", "night", "breakout", "statboxes", "tilt", "faceday", "dispersion", "sepia", "crestmark", "caption", "numbers", "bignumber", "brushday", "motion", "studio", "outline", "gameday", "mist", "headline", "collage", "strip", "glow", "broadcast", "scoreline", "matchserif", "window", "mono", "script", "silhouette", "paperlight", "scorecol", "jersey", "sideword", "duel", "gilded", "roundel", "comic", "cinematic", "panels", "magazine", "archive", "steps", "slices", "windows", "serif", "kaleido", "sequence", "city", "closeup", "brush", "spotlight", "stretch", "repeat", "torn", "frame", "monumental", "neon", "data"],
  matchday: ["simple", "natgrid", "natnotes", "natedge", "natcircle", "natblur", "natrepeat", "natcard", "natchest", "natgothic", "nattall", "natribbon", "natduo", "natmoody", "natfog", "natpaper", "natfight", "nateditorial", "natsand", "natstarring", "natbeam", "natring", "natpanel", "natlit", "natcinema", "natswatch", "natneon", "natdymo", "natturf", "natunderline", "natknockout", "natslant", "natboxed", "natcalendar", "nathashtag", "natticker", "natlocation", "natled", "natsubtitle", "natquad", "natflank", "natpill", "natglass", "natmasthead", "natclock", "natmono", "natticket", "natstack", "natserif", "natvenue", "natarc", "natbug", "natfocus", "nathorizon", "natstamp", "natcaption", "natoutline", "natcrest", "natnumber", "nattime", "natvert", "natborder", "natclean", "natstrip", "natdate", "natword", "natcorner", "natgrass", "natfold", "natspine", "natmix", "natlabel", "natspaced", "natmarks", "natdot", "natcut", "natlegend", "natcols", "natfoot", "natfade", "natarrow", "natrule", "natquiet", "natoverline", "natcolumn", "natwatermark", "nattab", "natsentence", "natbracket", "natdotline", "nathead", "natbadge", "natbar", "natends", "natlist", "natduel", "natdiag", "natsidebar", "natpennant", "natangle", "natlines", "natcrestbleed", "natnav", "natecho", "natflag", "nattag", "natbreakout", "natstripe", "natvline", "natoverprint", "natkickoff", "natunderbar", "natsticker", "natsplitword", "natcorners4", "natmicro2", "natinset", "natbigletter", "natchips", "natslab", "natcrestbox", "natrepeatline", "natoffset", "natcredits", "natpilltop", "natfadebar", "natbaseline", "natoutlinebox", "natfootcols", "natdotsgrid", "natvs", "natcaptionbar", "nattight", "nattopline", "natrails", "natbigdate", "natplus", "natsyllable", "natcrestrow", "natwidefont", "natfig", "natcornerribbon", "natsides", "natdashed", "natcapsule", "natlower3", "natballicon", "natslash", "natweightmix", "natgrid4", "natclockicon", "natpin", "natdoublerule", "natpointer", "natserifcaps", "natgradword", "natdotsep", "natdatestack", "nattypewriter", "natinfobox2", "nathighlighter", "natcrestsplit", "natcrestring", "natnumero", "nattilted", "natclubword", "natglasscard", "natoffsetframe", "natitalicbig", "natknockbox", "natunderscore", "natfactrow", "natcols3", "natbracev", "natarrowup", "nattimedisc", "natrightrule", "natheaderbox", "natinitialcolor", "natrulebox", "natfadeword", "natleaders", "natcresttop", "natthickline", "natroundbox", "natnamesbig", "natedgebar", "natdatepill", "nattoprule", "natcolorfoot", "nattriangle", "natpullbar", "natstadium", "natwhenwhere", "natstretch", "natchip", "natfadestack", "natthirds", "natvdate", "natlr", "natversus", "natmidside", "natserifstack", "natduoline", "natfolio", "natstrike", "natblockshadow", "natlettertiles", "natdiamond", "natbubble", "natbullets", "natoutlinetime", "natvletters", "natthin", "natcascade", "natsup", "natsplitline", "natunderdots", "nattimeline", "natfraction", "natperiod", "natcresttower", "natlinesides", "nattopcorner", "natwhitefade", "natjustify", "natmagcaption", "natsplitfill", "natasterisk", "natpaired", "natsmallcrest", "natsmallcaps", "natdropline", "natruler", "natrows", "natblockcorners", "natellipse", "natheaderline", "natsidenote", "natunderlinefat", "natframeline", "natbadgeline", "natmixcase", "natshadowword", "natquotebar", "natbigv", "natstep", "natnumbered", "natcircletag", "natslashdate", "natboxedname", "natfadeline", "natpipe", "natwave", "nataboveunder", "natemdash", "natcheck", "natjustifyrow", "natchevrons", "natslashes", "natplusline", "natbars", "natlcorner", "natdotgrid9", "natsquaremark", "natdashes", "nattilde", "natarcmark", "natfirstfill", "natlastcolor", "natboxletter", "natcolorsub", "natcolorword", "natbebas", "natbodoni", "natunbounded", "natgrotesk", "natalfaslab", "natanton", "natbarlow", "natarchivo", "natdela", "natitalicserif", "natmontserrat", "natfraunces", "natarchivolight", "natrubikmono", "natfrauncesit", "natfreecol", "natcutoff", "natcornerpair", "natmirror", "natbehindword", "natbehindoutline", "natbehindcolor", "natbehindserif", "natbehindtall", "natcutoffoutline", "natcutoffcolor", "natcutofftall", "natcutoffserif", "natbehindbodoni", "natbehindgrotesk", "natcornerbodoni", "natcornertall", "natmirrorserif", "natmirrorcolor", "natfreecolserif", "natcorneroutline", "natcornercolor", "natfreecolbodoni", "natfreecoltall", "natmirrorbodoni", "heroboxed", "herosticker", "heroband", "heroname", "herofoot", "heroduo", "herotint", "heroshadow", "herogradient", "heroaura", "heroghost", "herooutline", "herotwotone", "heroserif", "herolower", "heromatchbodoni", "heromatchdela", "heromatchslab", "heromatchbebas", "heromatcharchivo", "herostack", "herocaps", "heroframe", "herovs", "heronumber", "heromatch", "herotime", "herodate", "heromatchdark", "herobehind", "paperechodate", "paperechotime", "paperechoname", "paperechoserif", "paperechowide", "echomicro", "echoaura", "echobackline", "echonamefield", "echozoom", "echoinset", "echogallery", "echosidecol", "echohorizon", "echowidetitle", "echoswiss", "echoserif", "echotable", "echoorbit", "echolockup", "echotitle", "echodate", "echotime", "echoname", "echocrest", "paperripple", "papertype", "paperdouble", "paperstep", "papergiant", "paperecho", "dashecho", "gradientsilhouette", "duosilhouette", "stepsilhouette", "dotsilhouette", "crestsilhouette", "splitsilhouette", "doubleline", "risingecho", "typesilhouette", "giantsilhouette", "linesilhouette", "rippleecho", "rimlight", "castshadow", "mirrorecho", "overlap", "fillprogress", "twotone", "bleedword", "textsquare", "circled", "redacted", "oneline", "dropcap", "crossword", "hyphen", "ellipsis", "arrow", "bordertext", "weights", "bounce", "fadeword", "tracking", "halffill", "circletext", "strike", "superscript", "quotes", "cropmarks", "folder", "keycaps", "postit", "specimen", "nowplaying", "locator", "invite", "toggle", "emboss", "search", "chat", "receipt", "instant", "measure", "notify", "marker", "chapter", "subtitle", "parens", "sentence", "signage", "datestamp", "hairslash", "viewfinder", "medallion", "matchbar", "ringlight", "widescreen", "underline", "offsetshadow", "kickoff", "pitchlines", "sunrise", "contour", "namecorners", "pinstripe", "crestpair", "datecard", "frostband", "seal", "fixtureboard", "lowerthird", "fixturelist", "dotgrid", "footnote", "echoline", "pills", "corner", "shadow", "crestline", "stage", "edgebar", "monogram", "thirds", "stub", "orbit", "vertname", "monoaccent", "timetable", "twoblock", "autograph", "tonal", "widetitle", "clock", "micro", "filmframe", "aura", "backline", "namefield", "diptych", "pressphoto", "horizon", "lockup", "swiss", "gallery", "sidecol", "serene", "datefirst", "inset", "pride", "playoff", "slats", "vhs", "triptych", "tiles", "zoomburst", "tagcard", "stencil", "colorblock", "cover", "panelscript", "nextmatch", "redgrain", "halfline", "statserif", "sepiaday", "emblemfade", "cutpaper", "petals", "gradient", "ring", "glass", "boxtitle", "softglow", "blurrun", "bighead", "swirl", "splitbw", "hollow", "selective", "dotscript", "roughname", "infobox", "condensed", "shards", "clubname", "curvepanel", "arc", "tunnel", "cheer", "sideband", "band", "pillar", "blueprint", "glowline", "greyday", "triangles", "emblemart", "reflect", "minimal", "profile", "screenprint", "strokes", "tallname", "statboxes", "column", "notebook", "swoosh", "wall", "graffiti", "damask", "diagonal", "versus", "chrome", "tape", "night", "breakout", "splitnumber", "tilt", "backpanel", "blurduo", "faceday", "dispersion", "crestmark", "upnext", "caption", "cutletters", "backlit", "brushday", "motion", "studio", "outline", "ghost", "gameday", "sky", "mist", "headline", "debut", "bokeh", "strip", "glow", "matchserif", "broadcast", "scoreline", "window", "silhouette", "paperlight", "script", "mono", "burst", "shield", "jersey", "duel", "syllables", "roundel", "halo", "gaze", "pitch", "floor", "cinematic", "checker", "memory", "ticket", "programme", "skyline", "streetposter", "archive", "kaleido", "windows", "stamp", "arch", "stretch", "closeup", "brush", "frame", "torn", "crests", "fixture", "monumental", "repeat", "halftone", "city"],
  stats: ["simple", "statserif", "cutpaper", "gradient", "ring", "glass", "cheer", "band", "triangles", "strokes", "tallname", "statboxes", "column", "splitnumber", "notebook", "swoosh", "backpanel", "sepia", "notes", "crestmark", "numbers", "award", "twoscale", "bignumber", "ghost", "headline", "collage", "strip", "broadcast", "window", "mono", "paperlight", "script", "infographic", "shield", "jersey", "sideword", "syllables", "gilded", "sequence", "smear", "kaleido", "archive", "monumental", "data", "closeup", "repeat", "city", "torn", "stretch", "neon", "card", "frame"],
  potm: ["simple", "echoline", "corner", "stage", "edgebar", "monogram", "orbit", "vertname", "monoaccent", "twoblock", "autograph", "tonal", "widetitle", "micro", "filmframe", "aura", "backline", "namefield", "diptych", "pressphoto", "horizon", "lockup", "swiss", "gallery", "sidecol", "serene", "inset", "pride", "playoff", "slats", "vhs", "triptych", "tiles", "zoomburst", "tagcard", "stencil", "cover", "colorblock", "panelscript", "nextmatch", "statserif", "sepiaday", "cutpaper", "petals", "ring", "glass", "bighead", "swirl", "selective", "roughname", "shards", "curvepanel", "arc", "tunnel", "cheer", "sideband", "band", "pillar", "blueprint", "glowline", "triangles", "emblemart", "minimal", "profile", "screenprint", "wall", "chrome", "tape", "strokes", "tallname", "breakout", "statboxes", "column", "splitnumber", "notebook", "swoosh", "backpanel", "blurduo", "faceday", "dispersion", "sepia", "notes", "crestmark", "caption", "numbers", "award", "cutletters", "backlit", "twoscale", "bignumber", "studio", "outline", "ghost", "sky", "mist", "headline", "collage", "debut", "bokeh", "strip", "glow", "matchserif", "scoreline", "broadcast", "window", "silhouette", "script", "mono", "paperlight", "waves", "shield", "jersey", "sideword", "syllables", "gilded", "halo", "sticker", "calendar", "memory", "checker", "magazine", "kaleido", "exposure", "slices", "serif", "windows", "sequence", "smear", "stamp", "arch", "closeup", "card", "portrait", "monumental", "city", "repeat", "stretch", "torn", "brush", "editorial"],
  transfer: ["simple", "cover", "petals", "ring", "band", "blueprint", "triangles", "reflect", "minimal", "tape", "strokes", "tallname", "column", "splitnumber", "swoosh", "backpanel", "blurduo", "faceday", "notes", "caption", "cutletters", "backlit", "twoscale", "studio", "ghost", "sky", "mist", "collage", "debut", "bokeh", "matchserif", "window", "silhouette", "paperlight", "script", "mono", "ticket", "shield", "sideword", "syllables", "memory", "panels", "postcard", "steps", "skyline", "exposure", "arch", "smear", "stamp", "windows", "archive", "serif", "announce", "portrait", "closeup", "editorial", "torn", "city", "spotlight", "monumental"],
  speed: ["blurrun", "topspeed"],
  press: ["pressstack", "presshero", "pressclip", "presswall"],
  renewal: ["simple", "monogram", "orbit", "vertname", "monoaccent", "autograph", "tonal", "filmframe", "aura", "backline", "namefield", "diptych", "lockup", "gallery", "serene", "inset", "pride", "triptych", "cover", "sepiaday", "petals", "ring", "band", "glowline", "triangles", "minimal", "strokes", "tallname", "column", "splitnumber", "swoosh", "backpanel", "blurduo", "notes", "caption", "award", "cutletters", "backlit", "twoscale", "bignumber", "studio", "ghost", "sky", "mist", "headline", "debut", "bokeh", "matchserif", "window", "silhouette", "script", "mono", "paperlight", "rising", "shield", "jersey", "sideword", "gilded", "serif", "exposure", "postcard", "arch", "stamp", "smear", "portrait", "editorial", "announce", "closeup", "monumental", "torn", "spotlight", "poster"],
};

/** Whole-canvas colour finishes: the same layout in a different mood. */
function Finished({ data, children }: { data: RenderData; children: React.ReactNode }) {
  const f = data.params.finish ?? "none";
  // "Tom profissional": no canvas filter — /api/natframe grades the natural looks' photo layers (natPlace &g=pro).
  if (f === "none" || f === "pro") return <>{children}</>;
  // Soft glow: no filter on the canvas — the photo layers (natkit NatGround / NatFigure) carry hidden blurred copies,
  // shown here; type and the logo stay crisp.
  if (f === "glow" || f === "glowstrong") {
    const strong = f === "glowstrong";
    return (
      <div data-glow="1" style={{ position: "relative", ["--glow-o" as string]: strong ? ".42" : ".26", ["--glow-b" as string]: strong ? "26px" : "18px" }}>
        <style>{"[data-glow='1'] .nat-glow{display:block !important}"}</style>
        {children}
      </div>
    );
  }
  const club = vivid(data.params.primary === "#10131c" ? data.params.accent : data.params.primary);
  const filter =
    f === "duo"
      ? "url(#finish-duo)"
      : f === "noir"
        ? "grayscale(1) contrast(1.18) brightness(.96)"
        : f === "film"
          ? "sepia(.28) saturate(.82) contrast(1.06) brightness(1.02)"
          : "saturate(1.35) contrast(1.12)";
  return (
    <div style={{ position: "relative", width: 1080, height: data.canvasH ?? 1350, overflow: "hidden" }}>
      {f === "duo" && <GradientMapDefs id="finish-duo" dark={shade(club, -0.72)} mid={club} light="#f3efe6" />}
      <div data-finish style={{ filter }}>
        {children}
      </div>
      {f === "film" && (
        <>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg, rgba(255,170,90,.18), transparent 45%, rgba(40,70,120,.18))", mixBlendMode: "soft-light", pointerEvents: "none" }} />
          <Film strength={2.2} />
        </>
      )}
      {f === "noir" && <Film strength={1.6} />}
    </div>
  );
}

export function EditCanvas({ data }: { data: RenderData }) {
  const t = TEMPLATES.find((t) => t.id === data.params.templateId) ?? TEMPLATES[0];
  // The logo size and position are applied here, for every look alike (LogoLift also moves the text above it
  // when the logo grows); the look itself draws its logo as designed.
  const def = (data.canvasH ?? CANVAS_H) > CANVAS_H ? t.storyLogo : undefined;
  const scale = data.params.logoScale ?? def?.scale ?? 1;
  const drawn = scale === 1 ? data : { ...data, params: { ...data.params, logoScale: 1 } };
  return (
    <LogoLift scale={scale} moveX={data.params.logoMoveX ?? 0} moveY={data.params.logoMoveY ?? def?.moveY ?? 0}>
      <Finished data={drawn}>
        <t.Component data={drawn} />
      </Finished>
    </LogoLift>
  );
}

/** Looks that draw a native 9:16 story. */
export const hasNativeStory = (templateId: string) => !!TEMPLATES.find((t) => t.id === templateId)?.story;

export const templatesFor = (postType: PostType) => TEMPLATES.filter((t) => t.fits.includes(postType));

const pickKey = (p: TemplateParams) => `${p.templateId}|${p.side}|${p.bgStyle}`;

/**
 * Twelve ready-to-use variations for a post, drawn at random each time (from `seed`): looks the player
 * likes and the most fitting ones are likelier, recent and reported ones less, but every grid is a new mix
 * of looks, sides, framings and colour finishes.
 */
/**
 * When each recent look was added. With ~200 looks a fresh one would only come up once every ~17
 * grids, so for {NEW_DAYS} days a new look the user has not exported yet gets one of the reserved
 * "new" slots in every grid. Every new look must be added here when it is registered.
 */
export const ADDED: Partial<Record<TemplateId, string>> = {
  coachcard: "2026-11-07",
  coachsheet: "2026-11-07",
  coachlowkey: "2026-11-07",
  coachmono: "2026-11-07",
  natfrost: "2026-11-02",
  natfootstrip: "2026-11-02",
  natfieldset: "2026-11-02",
  goalnatfrost: "2026-11-02",
  goalnatfieldset: "2026-11-02",
  matchprogramme: "2026-11-02",
  monoposter: "2026-11-02",
  versusband: "2026-11-02",
  goalband: "2026-11-02",
  goalmonoposter: "2026-11-02",
  natdualclock: "2026-11-02",
  natweekday: "2026-11-02",
  natcaptionserif: "2026-11-02",
  goalnatnook: "2026-11-02",
  goalnatweights: "2026-11-02",
  cornertab: "2026-11-02",
  goalcornertab: "2026-11-02",
  accentword: "2026-11-02",
  crestcrown: "2026-11-02",
  goaltape: "2026-11-02",
  nathomeaway: "2026-11-02",
  natcompetition: "2026-11-02",
  natarrowdown: "2026-11-02",
  goalnatclubbar: "2026-11-02",
  goalnatcontext: "2026-11-02",
  thinarc: "2026-11-02",
  goalthinarc: "2026-11-02",
  bicolortitle: "2026-11-02",
  goalbicolor: "2026-11-02",
  nextup: "2026-11-02",
  natgolden: "2026-11-02",
  goalnatgolden: "2026-11-02",
  natcresthair: "2026-11-02",
  natstagger: "2026-11-02",
  goalnatstagger: "2026-11-02",
  gradwash: "2026-11-02",
  goalgradwash: "2026-11-02",
  swissleft: "2026-11-02",
  goalswissleft: "2026-11-02",
  swissindex: "2026-11-02",
  natseasondots: "2026-11-02",
  natform: "2026-11-02",
  natvenuepin: "2026-11-02",
  goalnatseason: "2026-11-02",
  goalnatprofile: "2026-11-02",
  lineupdots: "2026-11-02",
  goallineupdots: "2026-11-02",
  daynight: "2026-11-02",
  chromeaccent: "2026-11-02",
  goalchromeaccent: "2026-11-02",
  natcrestmark: "2026-11-02",
  goalnatcrestmark: "2026-11-02",
  natlastmeet: "2026-11-02",
  goalnatstreak: "2026-11-02",
  natmonogram: "2026-11-02",
  swatchcard: "2026-11-02",
  goalswatchcard: "2026-11-02",
  geotype: "2026-11-02",
  goalgeotype: "2026-11-02",
  goalnetline: "2026-11-02",
  natdayline: "2026-11-02",
  natflankrules: "2026-11-02",
  natpager: "2026-11-02",
  goalnathairlines: "2026-11-02",
  goalnatsplitrule: "2026-11-02",
  weightramp: "2026-11-02",
  goalweightramp: "2026-11-02",
  motiontrail: "2026-11-02",
  goalmotiontrail: "2026-11-02",
  lineball: "2026-11-02",
  natcountdown: "2026-11-03",
  natbackname: "2026-11-03",
  natcityline: "2026-11-03",
  goalnathomeaway: "2026-11-03",
  goalnatkitring: "2026-11-03",
  angle34: "2026-11-03",
  goalangle34: "2026-11-03",
  terraces: "2026-11-03",
  crestinline: "2026-11-03",
  goalcrestinline: "2026-11-03",
  natteamstack: "2026-11-03",
  natroundring: "2026-11-03",
  natlowercase: "2026-11-03",
  goalnatlowercase: "2026-11-03",
  goalnatclubhero: "2026-11-03",
  jstripes: "2026-11-03",
  goaljstripes: "2026-11-03",
  gateplate: "2026-11-03",
  goalgateplate: "2026-11-03",
  gateposts: "2026-11-03",
  natseasonline: "2026-11-03",
  natkickoffpill: "2026-11-03",
  natcornerfacts: "2026-11-03",
  goalnatseasonline: "2026-11-03",
  goalnatcornerfacts: "2026-11-03",
  chevronitalic: "2026-11-03",
  goalchevronitalic: "2026-11-03",
  diamondcrest: "2026-11-03",
  goaldiamondcrest: "2026-11-03",
  checkerrow: "2026-11-03",
  natcrestflank: "2026-11-03",
  goalnatcrestflank: "2026-11-03",
  natbreadcrumb: "2026-11-03",
  goalnatbreadcrumb: "2026-11-03",
  goalnatagainst: "2026-11-03",
  subwaysign: "2026-11-03",
  goalsubwaysign: "2026-11-03",
  routeline: "2026-11-03",
  kitnumeral: "2026-11-03",
  goalkitnumeral: "2026-11-03",
  natmistlight: "2026-11-03",
  goalnatmistlight: "2026-11-03",
  natcrestcoins: "2026-11-03",
  nathighlight: "2026-11-03",
  goalnathighlight: "2026-11-03",
  ironband: "2026-11-03",
  goalironband: "2026-11-03",
  roundsans: "2026-11-03",
  heraldsplit: "2026-11-03",
  goalheraldsplit: "2026-11-03",
  natcolorbar: "2026-11-03",
  goalnatcolorbar: "2026-11-03",
  natnextgames: "2026-11-03",
  natornament: "2026-11-03",
  goalnatornament: "2026-11-03",
  serifrule: "2026-11-03",
  goalserifrule: "2026-11-03",
  stripecard: "2026-11-03",
  goalstripecard: "2026-11-03",
  goaltifocards: "2026-11-03",
  natsplitflap: "2026-11-03",
  goalnatsplitflap: "2026-11-03",
  natprevious: "2026-11-03",
  natkickoffword: "2026-11-03",
  goalnatplacard: "2026-11-03",
  wingbars: "2026-11-03",
  goalwingbars: "2026-11-03",
  goldcrest: "2026-11-03",
  goalgoldcrest: "2026-11-03",
  estyear: "2026-11-03",
  natnation: "2026-11-03",
  goalnatnation: "2026-11-03",
  natfloodlit: "2026-11-03",
  goalnatfloodlit: "2026-11-03",
  goalnatlive: "2026-11-03",
  backslant: "2026-11-03",
  goalbackslant: "2026-11-03",
  widthpair: "2026-11-03",
  goalwidthpair: "2026-11-03",
  gothicinitial: "2026-11-03",
  natscarf: "2026-11-03",
  goalnatscarf: "2026-11-03",
  natbunting: "2026-11-03",
  goalnatbunting: "2026-11-03",
  natrosette: "2026-11-03",
  feriaposter: "2026-11-03",
  goalferiaposter: "2026-11-03",
  rallyline: "2026-11-03",
  goalrallyline: "2026-11-03",
  hoopsblock: "2026-11-03",
  natcornerflag: "2026-11-03",
  goalnatcornerflag: "2026-11-03",
  natpass: "2026-11-03",
  natkithanger: "2026-11-03",
  goalnatkithanger: "2026-11-03",
  billboard: "2026-11-03",
  goalbillboard: "2026-11-03",
  dynamicstripes: "2026-11-03",
  goaldynamicstripes: "2026-11-03",
  framedprint: "2026-11-03",
  natmegaphone: "2026-11-03",
  goalnatmegaphone: "2026-11-03",
  natdrum: "2026-11-03",
  goalnatdrum: "2026-11-03",
  natbeanie: "2026-11-03",
  stoneplaque: "2026-11-03",
  goalstoneplaque: "2026-11-03",
  fieldboard: "2026-11-03",
  goalfieldboard: "2026-11-03",
  seatnumber: "2026-11-03",
  natfoamfinger: "2026-11-03",
  goalnatfoamfinger: "2026-11-03",
  natfloodtower: "2026-11-03",
  natboot: "2026-11-03",
  goalnatboot: "2026-11-03",
  marqueesign: "2026-11-03",
  goalmarqueesign: "2026-11-03",
  lanternsign: "2026-11-03",
  goallanternsign: "2026-11-03",
  keytag: "2026-11-03",
  natshinpad: "2026-11-03",
  goalnatshinpad: "2026-11-03",
  natwhistle: "2026-11-03",
  goalnatwhistle: "2026-11-03",
  goalnatgoalframe: "2026-11-03",
  concreteslab: "2026-11-03",
  goalconcreteslab: "2026-11-03",
  bentotiles: "2026-11-03",
  patchbadge: "2026-11-03",
  goalpatchbadge: "2026-11-03",
  natbus: "2026-11-03",
  natkitbag: "2026-11-03",
  goalnatmic: "2026-11-03",
  goalnatstopwatch: "2026-11-03",
  goalnathorn: "2026-11-03",
  shipcontainer: "2026-11-03",
  goalshipcontainer: "2026-11-03",
  steellamellas: "2026-11-03",
  goalsteellamellas: "2026-11-03",
  stadiumtruss: "2026-11-03",
  natbottle: "2026-11-03",
  natcone: "2026-11-03",
  natbinoculars: "2026-11-03",
  goalnatvar: "2026-11-03",
  goalnattarget: "2026-11-03",
  citadel: "2026-11-03",
  goalcitadel: "2026-11-03",
  holofoil: "2026-11-03",
  goalholofoil: "2026-11-03",
  goalazulejo: "2026-11-03",
  natheadphones: "2026-11-03",
  natdugout: "2026-11-03",
  goalnatrocket: "2026-11-03",
  goalnatbolt: "2026-11-03",
  goalnatheart: "2026-11-03",
  arcade: "2026-11-03",
  goalarcade: "2026-11-03",
  denimpanel: "2026-11-03",
  goaldenimpanel: "2026-11-03",
  espressocup: "2026-11-03",
  natbattery: "2026-11-03",
  nathourglass: "2026-11-03",
  goalnatcrown: "2026-11-03",
  goalnatsiren: "2026-11-03",
  goalnatpopper: "2026-11-03",
  passport: "2026-11-03",
  umbrella: "2026-11-03",
  stainedglass: "2026-11-03",
  goalstainedglass: "2026-11-03",
  goalstarfield: "2026-11-03",
  usscriptblock: "2026-11-03",
  usvarsitynumber: "2026-11-03",
  usneongameday: "2026-11-03",
  usdiamondplate: "2026-11-03",
  us3dgameday: "2026-11-03",
  usfansign: "2026-11-03",
  goalusneon: "2026-11-03",
  goalusmotion: "2026-11-03",
  goalus3d: "2026-11-03",
  resultusfinal: "2026-11-03",
  natalarmclock: "2026-11-03",
  natplane: "2026-11-03",
  nattrafficlight: "2026-11-03",
  goalnatboxing: "2026-11-03",
  goalnatgem: "2026-11-03",
  lighthouse: "2026-11-03",
  goallighthouse: "2026-11-03",
  usslidingbars: "2026-11-03",
  usletterpatch: "2026-11-03",
  goalusstatcard: "2026-11-03",
  usduoarena: "2026-11-04",
  usangled: "2026-11-04",
  uskitband: "2026-11-04",
  usscoreboard: "2026-11-04",
  usposter: "2026-11-04",
  usglass: "2026-11-04",
  goalusduo: "2026-11-04",
  goalusflare: "2026-11-04",
  goalusglass: "2026-11-04",
  resultusduo: "2026-11-04",
  usstackedword: "2026-11-04",
  usbignumber: "2026-11-04",
  useditorialmd: "2026-11-04",
  usbandvertical: "2026-11-04",
  usgoldword: "2026-11-04",
  usrepeatname: "2026-11-04",
  goalusstatcol: "2026-11-04",
  goalusscript: "2026-11-04",
  goalusecho: "2026-11-04",
  resultuscolumn: "2026-11-04",
  prosurname: "2026-11-04",
  protwoscale: "2026-11-04",
  proframenum: "2026-11-04",
  proangled: "2026-11-04",
  proportrait: "2026-11-04",
  proradial: "2026-11-04",
  promatchword: "2026-11-04",
  procrestblocks: "2026-11-04",
  goalprotwoscale: "2026-11-04",
  goalpropanels: "2026-11-04",
  goalproportrait: "2026-11-04",
  resultproarc: "2026-11-04",
  prostrips: "2026-11-04",
  proarch: "2026-11-04",
  proeditorial: "2026-11-04",
  prosplit: "2026-11-04",
  produo: "2026-11-04",
  pronamevertical: "2026-11-04",
  goalprocircle: "2026-11-04",
  goalprocard: "2026-11-04",
  goalprobands: "2026-11-04",
  resultproboard: "2026-11-04",
  prodiagonal: "2026-11-04",
  procrestwindow: "2026-11-04",
  proring: "2026-11-04",
  protypegrid: "2026-11-04",
  propolaroid: "2026-11-04",
  prostadium: "2026-11-04",
  goalproband: "2026-11-04",
  goalpromixed: "2026-11-04",
  goalpronumber: "2026-11-04",
  resultprodigits: "2026-11-04",
  prominimal: "2026-11-04",
  profaceoff: "2026-11-04",
  proletterphoto: "2026-11-04",
  procover: "2026-11-04",
  promonogram: "2026-11-04",
  prospotlight: "2026-11-04",
  goalprocover: "2026-11-04",
  goalproblock: "2026-11-04",
  goalproserif: "2026-11-04",
  resultprofinal: "2026-11-04",
  prokickoff: "2026-11-04",
  protriptych: "2026-11-04",
  proticket: "2026-11-04",
  pronameband: "2026-11-04",
  proweek: "2026-11-04",
  prooutlinenum: "2026-11-04",
  goalprovertical: "2026-11-04",
  goalpromosaic: "2026-11-04",
  goalprobrackets: "2026-11-04",
  resultprolower: "2026-11-04",
  prostathero: "2026-11-04",
  proinitial: "2026-11-04",
  prolongshadow: "2026-11-04",
  prorivalry: "2026-11-04",
  proswiss: "2026-11-04",
  proplayercard: "2026-11-04",
  goalprolongshadow: "2026-11-04",
  goalprotimeline: "2026-11-04",
  goalprostar: "2026-11-04",
  resultproscorers: "2026-11-04",
  promirror: "2026-11-04",
  proorb: "2026-11-04",
  prooppname: "2026-11-04",
  proroof: "2026-11-04",
  prowindow: "2026-11-04",
  proawayday: "2026-11-04",
  goalproquote: "2026-11-04",
  goalprostack: "2026-11-04",
  goalproitalic: "2026-11-04",
  resultproletter: "2026-11-04",
  prostacked: "2026-11-04",
  procountdown: "2026-11-04",
  proquad: "2026-11-04",
  pronumcircle: "2026-11-04",
  prostripeframe: "2026-11-04",
  profloodrow: "2026-11-04",
  goalprocount: "2026-11-04",
  goalprodiagonal: "2026-11-04",
  goalpropodium: "2026-11-04",
  resultproword: "2026-11-04",
  proslicednum: "2026-11-04",
  proreflect: "2026-11-04",
  proarc: "2026-11-04",
  prolineup: "2026-11-04",
  prohalfcrests: "2026-11-04",
  prodatehero: "2026-11-04",
  goalproscoreline: "2026-11-04",
  goalproeditorial: "2026-11-04",
  goalprocloseup: "2026-11-04",
  resultprovictory: "2026-11-04",
  prochevron: "2026-11-05",
  protricolour: "2026-11-05",
  promedallion: "2026-11-05",
  prosplitportrait: "2026-11-05",
  proquote: "2026-11-05",
  prokitsplit: "2026-11-05",
  goalprominute: "2026-11-05",
  goalproduotone: "2026-11-05",
  goalprofacts: "2026-11-05",
  resultprostacked: "2026-11-05",
  proglassbars: "2026-11-05",
  proclubword: "2026-11-05",
  proprogramme: "2026-11-05",
  prostoryboard: "2026-11-05",
  probadge: "2026-11-05",
  prokickhours: "2026-11-05",
  goalprosidenames: "2026-11-05",
  goalprosplitword: "2026-11-05",
  goalprorows: "2026-11-05",
  resultproflip: "2026-11-05",
  propill: "2026-11-05",
  proribbon: "2026-11-05",
  prooutline: "2026-11-05",
  progrid: "2026-11-05",
  progradient: "2026-11-05",
  procardstack: "2026-11-05",
  goalproserifname: "2026-11-05",
  goalpropill: "2026-11-05",
  goalprooutline: "2026-11-05",
  resultprostrip: "2026-11-05",
  proclubinitial: "2026-11-05",
  prostepthrough: "2026-11-05",
  prohorizon: "2026-11-05",
  proversus: "2026-11-05",
  projersey: "2026-11-05",
  proweekline: "2026-11-05",
  goalproletters: "2026-11-05",
  goalprohorizon: "2026-11-05",
  goalproversus: "2026-11-05",
  resultproft: "2026-11-05",
  proletterbox: "2026-11-05",
  procolumnname: "2026-11-05",
  prozigzag: "2026-11-05",
  proshield: "2026-11-05",
  prodropcap: "2026-11-05",
  prochevronstack: "2026-11-05",
  goalproserifcount: "2026-11-05",
  goalproletterbox: "2026-11-05",
  goalprocolumn: "2026-11-05",
  resultprosplitrule: "2026-11-05",
  prooffset: "2026-11-05",
  prostadiumwindow: "2026-11-05",
  procoverstory: "2026-11-05",
  prohoops: "2026-11-05",
  procrestrows: "2026-11-05",
  prominimalbar: "2026-11-05",
  goalprotriptych: "2026-11-05",
  goalprowindow: "2026-11-05",
  goalprohoops: "2026-11-05",
  resultprocircle: "2026-11-05",
  prosidebars: "2026-11-05",
  prohugeword: "2026-11-05",
  propanorama: "2026-11-05",
  proprofile: "2026-11-05",
  procirclehalves: "2026-11-05",
  propagenumber: "2026-11-05",
  goalproradial: "2026-11-05",
  goalprosidebars: "2026-11-05",
  goalpropanorama: "2026-11-05",
  resultprosplitscreen: "2026-11-05",
  prolframe: "2026-11-05",
  procalendar: "2026-11-05",
  procrestgrid: "2026-11-05",
  prospotduo: "2026-11-05",
  protwocolour: "2026-11-05",
  proladder: "2026-11-05",
  goalprointerlock: "2026-11-05",
  goalprolframe: "2026-11-05",
  goalprotwocolour: "2026-11-05",
  resultprobetween: "2026-11-05",
  proampersand: "2026-11-05",
  prokickoffsplit: "2026-11-05",
  pronested: "2026-11-05",
  promarquee: "2026-11-05",
  procrestcircles: "2026-11-05",
  protimeofday: "2026-11-05",
  goalprog: "2026-11-05",
  goalpromarquee: "2026-11-05",
  goalprocrests: "2026-11-05",
  resultprowdl: "2026-11-05",
  proarchwindow: "2026-11-05",
  protwobands: "2026-11-05",
  procorners: "2026-11-05",
  proplate: "2026-11-05",
  prospine: "2026-11-05",
  proschedule: "2026-11-05",
  goalprodiagnum: "2026-11-05",
  goalprostackletters: "2026-11-05",
  goalproarch: "2026-11-05",
  resultprofinallabel: "2026-11-05",
  natrefserif: "2026-11-05",
  goalnatrefserif: "2026-11-05",
  natreffoot: "2026-11-05",
  natrefthinbold: "2026-11-05",
  resultnatquiet: "2026-11-05",
  natrefvert: "2026-11-05",
  goalnatrefvert: "2026-11-05",
  goalnatreffirst: "2026-11-06",
  resultnatrefserif: "2026-11-06",
  resultnatrefvertical: "2026-11-06",
  resultnatreffinal: "2026-11-06",
  goalnatrefpanel: "2026-11-06",
  goalnatrefvictoire: "2026-11-06",
  natrefmixed: "2026-11-05",
  natrefmixedclean: "2026-11-06",
  natrefnext: "2026-11-05",
  natrefredlight: "2026-11-05",
  natrefpan: "2026-11-05",
  natrefghost: "2026-11-05",
  natrefbacklit: "2026-11-05",
  natrefsplit: "2026-11-05",
  natrefnightlights: "2026-11-06",
  natrefgametime: "2026-11-06",
  natrefsunset: "2026-11-06",
  natrefsunlit: "2026-11-06",
  natrefhighkey: "2026-11-06",
  natrefpitchnumber: "2026-11-06",
  natrefwinegameday: "2026-11-06",
  natrefmistmatch: "2026-11-06",
  resultnatrefhalftime: "2026-11-06",
  resultnatrefsideband: "2026-11-07",
  resultnatrefcyanfog: "2026-11-07",
  natrefedgetitle: "2026-11-07",
  goalnatrefstack: "2026-11-07",
  natreftiltmatch: "2026-11-07",
  resultnatrefstackscore: "2026-11-07",
  goalnatrefsplitgo: "2026-11-07",
  goalnatrefcover: "2026-11-07",
  usitsvertical: "2026-11-07",
  portraitstripes: "2026-11-07",
  usgamestack: "2026-11-07",
  ussplitpanel: "2026-11-07",
  usgamegiant: "2026-11-07",
  usgamemixed: "2026-11-07",
  usduotone: "2026-11-07",
  usgameside: "2026-11-08",
  usresultframe: "2026-11-08",
  agencynextmatch: "2026-11-08",
  goalnatrefoutline: "2026-11-08",
  ushosting: "2026-11-08",
  agencygoalgrid: "2026-11-08",
  agencyserifmatch: "2026-11-07",
  natsheet: "2026-11-02",
  natpitchpaint: "2026-11-02",
  natdatehero: "2026-11-02",
  goalnatletters: "2026-11-02",
  goalnattopbar: "2026-11-02",
  scorebug: "2026-11-02",
  goalscorebug: "2026-11-02",
  colorfield: "2026-11-02",
  airspace: "2026-11-02",
  natvsline: "2026-11-02",
  natmilestones: "2026-11-02",
  natskycrests: "2026-11-02",
  goalnatseal: "2026-11-02",
  goalnatheadline: "2026-11-02",
  atmosrule: "2026-11-02",
  goalatmos: "2026-11-02",
  gridlines: "2026-11-02",
  goalcolorframe: "2026-11-02",
  tagstack: "2026-11-02",
  goalsidename: "2026-11-02",
  natsill: "2026-11-02",
  natpassepartout: "2026-11-02",
  natteams: "2026-11-02",
  goalnatairy: "2026-11-02",
  goalnatglow: "2026-11-02",
  bignumeral: "2026-11-02",
  goalshirtno: "2026-11-02",
  matchcard: "2026-11-02",
  goalpaper: "2026-11-02",
  goallowerthird: "2026-11-02",
  pressstack: "2026-10-20",
  pressclip: "2026-10-20",
  presshero: "2026-10-20",
  presswall: "2026-10-20",
  natcrest: "2026-10-19",
  natnumber: "2026-10-19",
  goalnatcrest: "2026-10-19",
  goalnatnumber: "2026-10-19",
  natstamp: "2026-10-20",
  goalnatstamp: "2026-10-20",
  natcaption: "2026-10-20",
  goalnatcaption: "2026-10-20",
  natoutline: "2026-10-20",
  goalnatoutline: "2026-10-20",
  natbug: "2026-10-20",
  goalnatbug: "2026-10-20",
  natfocus: "2026-10-20",
  goalnatfocus: "2026-10-20",
  nathorizon: "2026-10-20",
  goalnathorizon: "2026-10-20",
  natserif: "2026-10-20",
  goalnatserif: "2026-10-20",
  natvenue: "2026-10-20",
  natarc: "2026-10-20",
  goalnatarc: "2026-10-20",
  goalnatcallout: "2026-10-20",
  natmono: "2026-10-20",
  goalnatmono: "2026-10-20",
  natticket: "2026-10-20",
  natstack: "2026-10-20",
  goalnatstack: "2026-10-20",
  goalnatinitial: "2026-10-20",
  natmasthead: "2026-10-20",
  goalnatmasthead: "2026-10-20",
  natclock: "2026-10-20",
  goalnatitalic: "2026-10-20",
  natpill: "2026-10-20",
  goalnatpill: "2026-10-20",
  natglass: "2026-10-20",
  goalnatglass: "2026-10-20",
  natquad: "2026-10-20",
  goalnatquad: "2026-10-20",
  natflank: "2026-10-20",
  goalnatflank: "2026-10-20",
  natsubtitle: "2026-10-21",
  goalnatsubtitle: "2026-10-21",
  natled: "2026-10-21",
  goalnatled: "2026-10-21",
  natticker: "2026-10-21",
  goalnatticker: "2026-10-21",
  natlocation: "2026-10-21",
  goalnatwide: "2026-10-21",
  natcalendar: "2026-10-21",
  nathashtag: "2026-10-21",
  goalnathashtag: "2026-10-21",
  goalnatquote: "2026-10-21",
  natslant: "2026-10-21",
  goalnatslant: "2026-10-21",
  natboxed: "2026-10-21",
  goalnatboxed: "2026-10-21",
  natunderline: "2026-10-21",
  goalnatunderline: "2026-10-21",
  natknockout: "2026-10-21",
  goalnatknockout: "2026-10-21",
  natdymo: "2026-10-21",
  goalnatdymo: "2026-10-21",
  natturf: "2026-10-21",
  goalnatturf: "2026-10-21",
  natswatch: "2026-10-21",
  goalnatswatch: "2026-10-21",
  natneon: "2026-10-21",
  goalnatneon: "2026-10-21",
  natcinema: "2026-10-22",
  goalnatcinema: "2026-10-22",
  natlit: "2026-10-22",
  goalnatlit: "2026-10-22",
  natsand: "2026-10-23",
  goalnatsand: "2026-10-23",
  natstarring: "2026-10-23",
  goalnatstarring: "2026-10-23",
  natbeam: "2026-10-23",
  goalnatbeam: "2026-10-23",
  natring: "2026-10-23",
  goalnatring: "2026-10-23",
  natpanel: "2026-10-23",
  goalnatpanel: "2026-10-23",
  natmoody: "2026-10-23",
  goalnatmoody: "2026-10-23",
  natfog: "2026-10-23",
  goalnatfog: "2026-10-23",
  natpaper: "2026-10-23",
  goalnatpaper: "2026-10-23",
  natfight: "2026-10-23",
  goalnatfight: "2026-10-23",
  nateditorial: "2026-10-23",
  goalnateditorial: "2026-10-23",
  natchest: "2026-10-23",
  goalnatchest: "2026-10-23",
  natgothic: "2026-10-23",
  goalnatgothic: "2026-10-23",
  nattall: "2026-10-23",
  goalnattall: "2026-10-23",
  natribbon: "2026-10-23",
  goalnatribbon: "2026-10-23",
  natduo: "2026-10-23",
  goalnatduo: "2026-10-23",
  natblur: "2026-10-23",
  goalnatblur: "2026-10-23",
  natrepeat: "2026-10-23",
  goalnatrepeat: "2026-10-23",
  natcard: "2026-10-23",
  goalnatcard: "2026-10-23",
  natgrid: "2026-10-23",
  goalnatgrid: "2026-10-23",
  natnotes: "2026-10-23",
  goalnatnotes: "2026-10-23",
  natedge: "2026-10-23",
  goalnatedge: "2026-10-23",
  natcircle: "2026-10-23",
  goalnatcircle: "2026-10-23",
  formfire: "2026-10-22",
  formnatural: "2026-10-22",
  formpanel: "2026-10-22",
  formgold: "2026-10-22",
  clipnight: "2026-10-26",
  clipclub: "2026-10-26",
  clippaper: "2026-10-26",
  clipbold: "2026-10-26",
  natfold: "2026-10-26",
  goalnatfold: "2026-10-26",
  natspine: "2026-10-26",
  goalnatspine: "2026-10-26",
  natmix: "2026-10-26",
  goalnatmix: "2026-10-26",
  natlabel: "2026-10-26",
  goalnatlabel: "2026-10-26",
  natspaced: "2026-10-26",
  goalnatspaced: "2026-10-26",
  natmarks: "2026-10-26",
  goalnatmarks: "2026-10-26",
  natdot: "2026-10-26",
  goalnatdot: "2026-10-26",
  natcut: "2026-10-26",
  goalnatcut: "2026-10-26",
  natlegend: "2026-10-26",
  goalnatlegend: "2026-10-26",
  natcols: "2026-10-26",
  goalnatcols: "2026-10-26",
  natfoot: "2026-10-26",
  goalnatfoot: "2026-10-26",
  natfade: "2026-10-26",
  goalnatfade: "2026-10-26",
  natarrow: "2026-10-26",
  goalnatarrow: "2026-10-26",
  natrule: "2026-10-26",
  goalnatrule: "2026-10-26",
  natquiet: "2026-10-26",
  goalnatquiet: "2026-10-26",
  natoverline: "2026-10-27",
  goalnatoverline: "2026-10-27",
  natcolumn: "2026-10-27",
  goalnatcolumn: "2026-10-27",
  natwatermark: "2026-10-27",
  goalnatwatermark: "2026-10-27",
  nattab: "2026-10-27",
  goalnattab: "2026-10-27",
  natsentence: "2026-10-27",
  goalnatsentence: "2026-10-27",
  natbracket: "2026-10-27",
  goalnatbracket: "2026-10-27",
  natdotline: "2026-10-27",
  goalnatdotline: "2026-10-27",
  nathead: "2026-10-27",
  goalnathead: "2026-10-27",
  natbadge: "2026-10-27",
  goalnatbadge: "2026-10-27",
  natbar: "2026-10-27",
  goalnatbar: "2026-10-27",
  natends: "2026-10-27",
  goalnatends: "2026-10-27",
  natlist: "2026-10-27",
  goalnatlist: "2026-10-27",
  natduel: "2026-10-27",
  goalnatduel: "2026-10-27",
  natdiag: "2026-10-27",
  goalnatdiag: "2026-10-27",
  natsidebar: "2026-10-27",
  goalnatsidebar: "2026-10-27",
  natpennant: "2026-10-27",
  goalnatpennant: "2026-10-27",
  natangle: "2026-10-27",
  goalnatangle: "2026-10-27",
  natlines: "2026-10-27",
  goalnatlines: "2026-10-27",
  natcrestbleed: "2026-10-27",
  goalnatcrestbleed: "2026-10-27",
  natnav: "2026-10-27",
  goalnatnav: "2026-10-27",
  natecho: "2026-10-27",
  goalnatecho: "2026-10-27",
  natflag: "2026-10-27",
  goalnatflag: "2026-10-27",
  nattag: "2026-10-27",
  goalnattag: "2026-10-27",
  natbreakout: "2026-10-27",
  goalnatbreakout: "2026-10-27",
  natstripe: "2026-10-27",
  goalnatstripe: "2026-10-27",
  natvline: "2026-10-27",
  goalnatvline: "2026-10-27",
  natoverprint: "2026-10-27",
  goalnatoverprint: "2026-10-27",
  natkickoff: "2026-10-27",
  goalnatkickoff: "2026-10-27",
  natunderbar: "2026-10-27",
  goalnatunderbar: "2026-10-27",
  natsticker: "2026-10-27",
  goalnatsticker: "2026-10-27",
  natsplitword: "2026-10-27",
  goalnatsplitword: "2026-10-27",
  natcorners4: "2026-10-27",
  goalnatcorners4: "2026-10-27",
  natmicro2: "2026-10-27",
  goalnatmicro2: "2026-10-27",
  natinset: "2026-10-27",
  goalnatinset: "2026-10-27",
  natbigletter: "2026-10-27",
  goalnatbigletter: "2026-10-27",
  natchips: "2026-10-27",
  goalnatchips: "2026-10-27",
  natslab: "2026-10-27",
  goalnatslab: "2026-10-27",
  natcrestbox: "2026-10-27",
  goalnatcrestbox: "2026-10-27",
  natrepeatline: "2026-10-27",
  goalnatrepeatline: "2026-10-27",
  natoffset: "2026-10-27",
  goalnatoffset: "2026-10-27",
  natcredits: "2026-10-27",
  goalnatcredits: "2026-10-27",
  natpilltop: "2026-10-27",
  goalnatpilltop: "2026-10-27",
  natfadebar: "2026-10-27",
  goalnatfadebar: "2026-10-27",
  natbaseline: "2026-10-27",
  goalnatbaseline: "2026-10-27",
  natoutlinebox: "2026-10-27",
  goalnatoutlinebox: "2026-10-27",
  natfootcols: "2026-10-27",
  goalnatfootcols: "2026-10-27",
  natdotsgrid: "2026-10-27",
  goalnatdotsgrid: "2026-10-27",
  natvs: "2026-10-27",
  goalnatvs: "2026-10-27",
  natcaptionbar: "2026-10-27",
  goalnatcaptionbar: "2026-10-27",
  nattight: "2026-10-27",
  goalnattight: "2026-10-27",
  nattopline: "2026-10-27",
  goalnattopline: "2026-10-27",
  natrails: "2026-10-27",
  goalnatrails: "2026-10-27",
  natbigdate: "2026-10-27",
  goalnatbigdate: "2026-10-27",
  natplus: "2026-10-27",
  goalnatplus: "2026-10-27",
  natsyllable: "2026-10-27",
  goalnatsyllable: "2026-10-27",
  natcrestrow: "2026-10-27",
  goalnatcrestrow: "2026-10-27",
  natwidefont: "2026-10-27",
  goalnatwidefont: "2026-10-27",
  natfig: "2026-10-27",
  goalnatfig: "2026-10-27",
  natcornerribbon: "2026-10-27",
  goalnatcornerribbon: "2026-10-27",
  natsides: "2026-10-27",
  goalnatsides: "2026-10-27",
  natdashed: "2026-10-28",
  goalnatdashed: "2026-10-28",
  natcapsule: "2026-10-28",
  goalnatcapsule: "2026-10-28",
  natlower3: "2026-10-28",
  goalnatlower3: "2026-10-28",
  natballicon: "2026-10-28",
  goalnatballicon: "2026-10-28",
  natslash: "2026-10-28",
  goalnatslash: "2026-10-28",
  natweightmix: "2026-10-28",
  goalnatweightmix: "2026-10-28",
  natgrid4: "2026-10-28",
  goalnatgrid4: "2026-10-28",
  natclockicon: "2026-10-28",
  goalnatclockicon: "2026-10-28",
  natpin: "2026-10-28",
  goalnatpin: "2026-10-28",
  natdoublerule: "2026-10-28",
  goalnatdoublerule: "2026-10-28",
  natpointer: "2026-10-28",
  goalnatpointer: "2026-10-28",
  natserifcaps: "2026-10-28",
  goalnatserifcaps: "2026-10-28",
  natgradword: "2026-10-28",
  goalnatgradword: "2026-10-28",
  natdotsep: "2026-10-28",
  goalnatdotsep: "2026-10-28",
  natdatestack: "2026-10-28",
  goalnatdatestack: "2026-10-28",
  nattypewriter: "2026-10-28",
  goalnattypewriter: "2026-10-28",
  natinfobox2: "2026-10-28",
  goalnatinfobox2: "2026-10-28",
  nathighlighter: "2026-10-28",
  goalnathighlighter: "2026-10-28",
  natcrestsplit: "2026-10-28",
  goalnatcrestsplit: "2026-10-28",
  natcrestring: "2026-10-28",
  goalnatcrestring: "2026-10-28",
  natnumero: "2026-10-28",
  goalnatnumero: "2026-10-28",
  nattilted: "2026-10-28",
  goalnattilted: "2026-10-28",
  natclubword: "2026-10-28",
  goalnatclubword: "2026-10-28",
  natglasscard: "2026-10-28",
  goalnatglasscard: "2026-10-28",
  natoffsetframe: "2026-10-28",
  goalnatoffsetframe: "2026-10-28",
  natitalicbig: "2026-10-28",
  goalnatitalicbig: "2026-10-28",
  natknockbox: "2026-10-28",
  goalnatknockbox: "2026-10-28",
  natunderscore: "2026-10-28",
  goalnatunderscore: "2026-10-28",
  natfactrow: "2026-10-28",
  goalnatfactrow: "2026-10-28",
  natcols3: "2026-10-28",
  goalnatcols3: "2026-10-28",
  natbracev: "2026-10-28",
  goalnatbracev: "2026-10-28",
  natarrowup: "2026-10-28",
  goalnatarrowup: "2026-10-28",
  nattimedisc: "2026-10-28",
  goalnattimedisc: "2026-10-28",
  natrightrule: "2026-10-28",
  goalnatrightrule: "2026-10-28",
  natheaderbox: "2026-10-28",
  goalnatheaderbox: "2026-10-28",
  natinitialcolor: "2026-10-28",
  goalnatinitialcolor: "2026-10-28",
  natrulebox: "2026-10-28",
  goalnatrulebox: "2026-10-28",
  natfadeword: "2026-10-28",
  goalnatfadeword: "2026-10-28",
  natleaders: "2026-10-28",
  goalnatleaders: "2026-10-28",
  natcresttop: "2026-10-28",
  goalnatcresttop: "2026-10-28",
  natthickline: "2026-10-28",
  goalnatthickline: "2026-10-28",
  natroundbox: "2026-10-28",
  goalnatroundbox: "2026-10-28",
  natnamesbig: "2026-10-28",
  goalnatnamesbig: "2026-10-28",
  natedgebar: "2026-10-28",
  goalnatedgebar: "2026-10-28",
  natdatepill: "2026-10-28",
  goalnatdatepill: "2026-10-28",
  nattoprule: "2026-10-28",
  goalnattoprule: "2026-10-28",
  natcolorfoot: "2026-10-28",
  goalnatcolorfoot: "2026-10-28",
  nattriangle: "2026-10-28",
  goalnattriangle: "2026-10-28",
  natpullbar: "2026-10-28",
  goalnatpullbar: "2026-10-28",
  natstadium: "2026-10-28",
  goalnatstadium: "2026-10-28",
  natwhenwhere: "2026-10-28",
  goalnatwhenwhere: "2026-10-28",
  natstretch: "2026-10-28",
  goalnatstretch: "2026-10-28",
  natchip: "2026-10-28",
  goalnatchip: "2026-10-28",
  natfadestack: "2026-10-28",
  goalnatfadestack: "2026-10-28",
  natthirds: "2026-10-28",
  goalnatthirds: "2026-10-28",
  natvdate: "2026-10-28",
  goalnatvdate: "2026-10-28",
  natlr: "2026-10-28",
  goalnatlr: "2026-10-28",
  natversus: "2026-10-28",
  goalnatversus: "2026-10-28",
  natmidside: "2026-10-28",
  goalnatmidside: "2026-10-28",
  natserifstack: "2026-10-28",
  goalnatserifstack: "2026-10-28",
  natduoline: "2026-10-28",
  goalnatduoline: "2026-10-28",
  natfolio: "2026-10-28",
  goalnatfolio: "2026-10-28",
  natstrike: "2026-10-28",
  goalnatstrike: "2026-10-28",
  natblockshadow: "2026-10-28",
  goalnatblockshadow: "2026-10-28",
  natlettertiles: "2026-10-28",
  goalnatlettertiles: "2026-10-28",
  natdiamond: "2026-10-28",
  goalnatdiamond: "2026-10-28",
  natbubble: "2026-10-28",
  goalnatbubble: "2026-10-28",
  natbullets: "2026-10-28",
  goalnatbullets: "2026-10-28",
  natoutlinetime: "2026-10-28",
  goalnatoutlinetime: "2026-10-28",
  natvletters: "2026-10-28",
  goalnatvletters: "2026-10-28",
  natthin: "2026-10-28",
  goalnatthin: "2026-10-28",
  natcascade: "2026-10-28",
  goalnatcascade: "2026-10-28",
  natsup: "2026-10-28",
  goalnatsup: "2026-10-28",
  natsplitline: "2026-10-28",
  goalnatsplitline: "2026-10-28",
  natunderdots: "2026-10-28",
  goalnatunderdots: "2026-10-28",
  nattimeline: "2026-10-28",
  goalnattimeline: "2026-10-28",
  natfraction: "2026-10-28",
  goalnatfraction: "2026-10-28",
  natperiod: "2026-10-28",
  goalnatperiod: "2026-10-28",
  natcresttower: "2026-10-28",
  goalnatcresttower: "2026-10-28",
  natlinesides: "2026-10-28",
  goalnatlinesides: "2026-10-28",
  nattopcorner: "2026-10-28",
  goalnattopcorner: "2026-10-28",
  natwhitefade: "2026-10-28",
  goalnatwhitefade: "2026-10-28",
  natjustify: "2026-10-28",
  goalnatjustify: "2026-10-28",
  natmagcaption: "2026-10-28",
  goalnatmagcaption: "2026-10-28",
  natsplitfill: "2026-10-28",
  goalnatsplitfill: "2026-10-28",
  natasterisk: "2026-10-28",
  goalnatasterisk: "2026-10-28",
  natpaired: "2026-10-28",
  goalnatpaired: "2026-10-28",
  natsmallcrest: "2026-10-28",
  goalnatsmallcrest: "2026-10-28",
  natsmallcaps: "2026-10-28",
  goalnatsmallcaps: "2026-10-28",
  natdropline: "2026-10-28",
  goalnatdropline: "2026-10-28",
  natruler: "2026-10-28",
  goalnatruler: "2026-10-28",
  natrows: "2026-10-28",
  goalnatrows: "2026-10-28",
  natblockcorners: "2026-10-28",
  goalnatblockcorners: "2026-10-28",
  natellipse: "2026-10-28",
  goalnatellipse: "2026-10-28",
  natheaderline: "2026-10-28",
  goalnatheaderline: "2026-10-28",
  natsidenote: "2026-10-28",
  goalnatsidenote: "2026-10-28",
  natunderlinefat: "2026-10-28",
  goalnatunderlinefat: "2026-10-28",
  natframeline: "2026-10-28",
  goalnatframeline: "2026-10-28",
  natbadgeline: "2026-10-28",
  goalnatbadgeline: "2026-10-28",
  natmixcase: "2026-10-28",
  goalnatmixcase: "2026-10-28",
  natshadowword: "2026-10-29",
  goalnatshadowword: "2026-10-29",
  natquotebar: "2026-10-29",
  goalnatquotebar: "2026-10-29",
  natbigv: "2026-10-29",
  goalnatbigv: "2026-10-29",
  natstep: "2026-10-29",
  goalnatstep: "2026-10-29",
  natnumbered: "2026-10-29",
  goalnatnumbered: "2026-10-29",
  natcircletag: "2026-10-29",
  goalnatcircletag: "2026-10-29",
  natslashdate: "2026-10-29",
  goalnatslashdate: "2026-10-29",
  natboxedname: "2026-10-29",
  goalnatboxedname: "2026-10-29",
  natfadeline: "2026-10-29",
  goalnatfadeline: "2026-10-29",
  natpipe: "2026-10-29",
  goalnatpipe: "2026-10-29",
  natwave: "2026-10-29",
  goalnatwave: "2026-10-29",
  nataboveunder: "2026-10-29",
  goalnataboveunder: "2026-10-29",
  natemdash: "2026-10-29",
  goalnatemdash: "2026-10-29",
  natcheck: "2026-10-29",
  goalnatcheck: "2026-10-29",
  natjustifyrow: "2026-10-29",
  goalnatjustifyrow: "2026-10-29",
  natchevrons: "2026-10-29",
  goalnatchevrons: "2026-10-29",
  natslashes: "2026-10-29",
  goalnatslashes: "2026-10-29",
  natplusline: "2026-10-29",
  goalnatplusline: "2026-10-29",
  natbars: "2026-10-29",
  goalnatbars: "2026-10-29",
  natlcorner: "2026-10-29",
  goalnatlcorner: "2026-10-29",
  natdotgrid9: "2026-10-29",
  goalnatdotgrid9: "2026-10-29",
  natsquaremark: "2026-10-29",
  goalnatsquaremark: "2026-10-29",
  natdashes: "2026-10-29",
  goalnatdashes: "2026-10-29",
  nattilde: "2026-10-29",
  goalnattilde: "2026-10-29",
  natarcmark: "2026-10-29",
  goalnatarcmark: "2026-10-29",
  natfirstfill: "2026-10-29",
  goalnatfirstfill: "2026-10-29",
  natlastcolor: "2026-10-29",
  goalnatlastcolor: "2026-10-29",
  natboxletter: "2026-10-29",
  goalnatboxletter: "2026-10-29",
  natcolorsub: "2026-10-29",
  goalnatcolorsub: "2026-10-29",
  natcolorword: "2026-10-29",
  goalnatcolorword: "2026-10-29",
  natbebas: "2026-10-29",
  goalnatbebas: "2026-10-29",
  natbodoni: "2026-10-29",
  goalnatbodoni: "2026-10-29",
  natunbounded: "2026-10-29",
  goalnatunbounded: "2026-10-29",
  natgrotesk: "2026-10-29",
  goalnatgrotesk: "2026-10-29",
  natalfaslab: "2026-10-29",
  goalnatalfaslab: "2026-10-29",
  natanton: "2026-10-29",
  goalnatanton: "2026-10-29",
  natbarlow: "2026-10-29",
  goalnatbarlow: "2026-10-29",
  natarchivo: "2026-10-29",
  goalnatarchivo: "2026-10-29",
  natdela: "2026-10-29",
  goalnatdela: "2026-10-29",
  natitalicserif: "2026-10-29",
  goalnatitalicserif: "2026-10-29",
  natmontserrat: "2026-10-29",
  goalnatmontserrat: "2026-10-29",
  natfraunces: "2026-10-29",
  goalnatfraunces: "2026-10-29",
  natarchivolight: "2026-10-29",
  goalnatarchivolight: "2026-10-29",
  natrubikmono: "2026-10-29",
  goalnatrubikmono: "2026-10-29",
  natfrauncesit: "2026-10-29",
  goalnatfrauncesit: "2026-10-29",
  natfreecol: "2026-10-29",
  goalnatfreecol: "2026-10-29",
  natcutoff: "2026-10-29",
  goalnatcutoff: "2026-10-29",
  natcornerpair: "2026-10-29",
  goalnatcornerpair: "2026-10-29",
  natmirror: "2026-10-29",
  goalnatmirror: "2026-10-29",
  natbehindword: "2026-10-29",
  goalnatbehindword: "2026-10-29",
  natbehindoutline: "2026-10-29",
  goalnatbehindoutline: "2026-10-29",
  natbehindcolor: "2026-10-29",
  goalnatbehindcolor: "2026-10-29",
  natbehindserif: "2026-10-29",
  goalnatbehindserif: "2026-10-29",
  natbehindtall: "2026-10-29",
  goalnatbehindtall: "2026-10-29",
  natcutoffoutline: "2026-10-29",
  goalnatcutoffoutline: "2026-10-29",
  natcutoffcolor: "2026-10-29",
  goalnatcutoffcolor: "2026-10-29",
  natcutofftall: "2026-10-29",
  goalnatcutofftall: "2026-10-29",
  natcutoffserif: "2026-10-29",
  goalnatcutoffserif: "2026-10-29",
  natbehindbodoni: "2026-10-29",
  goalnatbehindbodoni: "2026-10-29",
  natbehindgrotesk: "2026-10-29",
  goalnatbehindgrotesk: "2026-10-29",
  natcornerbodoni: "2026-10-29",
  goalnatcornerbodoni: "2026-10-29",
  natcornertall: "2026-10-29",
  goalnatcornertall: "2026-10-29",
  natmirrorserif: "2026-10-29",
  goalnatmirrorserif: "2026-10-29",
  natmirrorcolor: "2026-10-29",
  goalnatmirrorcolor: "2026-10-29",
  natfreecolserif: "2026-10-29",
  goalnatfreecolserif: "2026-10-29",
  natcorneroutline: "2026-10-29",
  goalnatcorneroutline: "2026-10-29",
  natcornercolor: "2026-10-29",
  goalnatcornercolor: "2026-10-29",
  natfreecolbodoni: "2026-10-29",
  goalnatfreecolbodoni: "2026-10-29",
  natfreecoltall: "2026-10-29",
  goalnatfreecoltall: "2026-10-29",
  natmirrorbodoni: "2026-10-29",
  goalnatmirrorbodoni: "2026-10-29",
  formfiregold: "2026-10-22",
  nattime: "2026-10-19",
  natvert: "2026-10-19",
  natborder: "2026-10-19",
  goalnatvert: "2026-10-19",
  goalnatborder: "2026-10-19",
  goalnatsplit: "2026-10-19",
  natclean: "2026-10-19",
  natstrip: "2026-10-19",
  natdate: "2026-10-19",
  goalnatclean: "2026-10-19",
  goalnatname: "2026-10-19",
  goalnatstrip: "2026-10-19",
  natword: "2026-10-19",
  natcorner: "2026-10-19",
  natgrass: "2026-10-19",
  goalnatword: "2026-10-19",
  goalnatcorner: "2026-10-19",
  goalnatlight: "2026-10-19",
  coachwelcome: "2026-10-18",
  coachwelcomelight: "2026-10-18",
  welcomelight: "2026-10-18",
  welcomeclub: "2026-10-18",
  welcomecolumn: "2026-10-18",
  welcomecareer: "2026-10-18",
  coachdark: "2026-10-18",
  coachname: "2026-10-18",
  coachduo: "2026-10-18",
  coachframe: "2026-10-18",
  coachclipboard: "2026-10-18",
  goalherocount: "2026-10-18",
  coachhero: "2026-10-18",
  coachpress: "2026-10-18",
  coachboard: "2026-10-18",
  coachserif: "2026-10-18",
  coachtouchline: "2026-10-18",
  heroboxed: "2026-10-18",
  herosticker: "2026-10-18",
  heroband: "2026-10-18",
  heroname: "2026-10-18",
  herofoot: "2026-10-18",
  goalherotop: "2026-10-18",
  goalherobw: "2026-10-18",
  goalheroduotone: "2026-10-18",
  goalheroexclaim: "2026-10-18",
  goalherohalf: "2026-10-18",
  heroduo: "2026-10-18",
  herotint: "2026-10-18",
  heroshadow: "2026-10-18",
  herogradient: "2026-10-18",
  heroaura: "2026-10-18",
  goalheroname: "2026-10-18",
  goalheroboxed: "2026-10-18",
  goalherosticker: "2026-10-18",
  goalherocrest: "2026-10-18",
  goalherofill: "2026-10-18",
  heroghost: "2026-10-18",
  herooutline: "2026-10-18",
  herotwotone: "2026-10-18",
  heroserif: "2026-10-18",
  herolower: "2026-10-18",
  goalheroshadow: "2026-10-18",
  goalherogradient: "2026-10-18",
  goalherostagger: "2026-10-18",
  goalherotally: "2026-10-18",
  goalheroaura: "2026-10-18",
  heromatchbodoni: "2026-10-17",
  heromatchdela: "2026-10-17",
  heromatchslab: "2026-10-17",
  heromatchbebas: "2026-10-17",
  heromatcharchivo: "2026-10-17",
  goalheroghost: "2026-10-17",
  goalherooutline: "2026-10-17",
  goalherotwotone: "2026-10-17",
  goalheroserif: "2026-10-17",
  goalherolower: "2026-10-17",
  herostack: "2026-10-17",
  herocaps: "2026-10-17",
  heroframe: "2026-10-17",
  herovs: "2026-10-17",
  heronumber: "2026-10-17",
  goalherostack: "2026-10-17",
  goalherocaps: "2026-10-17",
  goalheroframe: "2026-10-17",
  goalherotint: "2026-10-17",
  goalheroduo: "2026-10-17",
  heromatch: "2026-10-17",
  herotime: "2026-10-17",
  herodate: "2026-10-17",
  heromatchdark: "2026-10-17",
  herobehind: "2026-10-17",
  goalherodark: "2026-10-17",
  goalherosplit: "2026-10-17",
  goalherobehind: "2026-10-17",
  goalherofoot: "2026-10-17",
  goalheroband: "2026-10-17",
  welcome: "2026-10-17",
  welcomeplay: "2026-10-17",
  welcomeduo: "2026-10-17",
  welcomehalo: "2026-10-17",
  goalherobarlow: "2026-10-17",
  goalheroanton: "2026-10-17",
  goalheroarchivo: "2026-10-17",
  goalherodela: "2026-10-17",
  goalheroslab: "2026-10-17",
  goalherobodoni: "2026-10-17",
  goalherobebas: "2026-10-17",
  medallion: "2026-10-14",
  matchbar: "2026-10-14",
  ringlight: "2026-10-14",
  widescreen: "2026-10-14",
  underline: "2026-10-14",
  goalringlight: "2026-10-14",
  goalmedallion: "2026-10-14",
  goalunderline: "2026-10-14",
  goalwidescreen: "2026-10-14",
  goalcrestpair: "2026-10-14",
  sentence: "2026-10-15",
  signage: "2026-10-15",
  datestamp: "2026-10-15",
  hairslash: "2026-10-15",
  viewfinder: "2026-10-15",
  goalsentence: "2026-10-15",
  goalcamera: "2026-10-15",
  goalslash: "2026-10-15",
  goalviewfinder: "2026-10-15",
  goalframe: "2026-10-15",
  notify: "2026-10-15",
  marker: "2026-10-15",
  chapter: "2026-10-15",
  subtitle: "2026-10-15",
  parens: "2026-10-15",
  goalnotify: "2026-10-15",
  goalmarker: "2026-10-15",
  goalparens: "2026-10-15",
  goalsubtitle: "2026-10-15",
  goalpunct: "2026-10-15",
  search: "2026-10-15",
  chat: "2026-10-15",
  receipt: "2026-10-15",
  instant: "2026-10-15",
  measure: "2026-10-15",
  goalsearch: "2026-10-15",
  goalchat: "2026-10-15",
  goalreceipt: "2026-10-15",
  goalinstant: "2026-10-15",
  goalmeasure: "2026-10-15",
  totwgallery: "2026-10-15",
  totwcard: "2026-10-15",
  totwswiss: "2026-10-15",
  totwcallout: "2026-10-15",
  totwsplit: "2026-10-15",
  totwstack: "2026-10-15",
  totwmicro: "2026-10-15",
  totwtonal: "2026-10-15",
  nowplaying: "2026-10-15",
  locator: "2026-10-15",
  invite: "2026-10-15",
  toggle: "2026-10-15",
  emboss: "2026-10-15",
  goalnowplaying: "2026-10-15",
  goalemboss: "2026-10-15",
  goaltoggle: "2026-10-15",
  goalpulse: "2026-10-15",
  goalunlock: "2026-10-15",
  cropmarks: "2026-10-15",
  folder: "2026-10-15",
  keycaps: "2026-10-15",
  postit: "2026-10-15",
  specimen: "2026-10-15",
  goalcropmarks: "2026-10-15",
  goalkeycaps: "2026-10-15",
  goalpostit: "2026-10-15",
  goalspecimen: "2026-10-15",
  goaltally: "2026-10-15",
  halffill: "2026-10-15",
  circletext: "2026-10-15",
  strike: "2026-10-15",
  superscript: "2026-10-15",
  quotes: "2026-10-15",
  goalhalffill: "2026-10-15",
  goalcircletext: "2026-10-15",
  goalstrike: "2026-10-15",
  goalsuperscript: "2026-10-15",
  goalquotes: "2026-10-15",
  bordertext: "2026-10-15",
  weights: "2026-10-15",
  bounce: "2026-10-15",
  fadeword: "2026-10-15",
  tracking: "2026-10-15",
  goalbordertext: "2026-10-15",
  goalweights: "2026-10-15",
  goalbounce: "2026-10-15",
  goalfade: "2026-10-15",
  goaltracking: "2026-10-15",
  dropcap: "2026-10-15",
  crossword: "2026-10-15",
  hyphen: "2026-10-15",
  ellipsis: "2026-10-15",
  arrow: "2026-10-15",
  goaldropcap: "2026-10-15",
  goalcrossword: "2026-10-15",
  goalellipsis: "2026-10-15",
  goalarrow: "2026-10-15",
  goalcolon: "2026-10-15",
  bleedword: "2026-10-15",
  textsquare: "2026-10-15",
  circled: "2026-10-15",
  redacted: "2026-10-15",
  oneline: "2026-10-15",
  goalbleed: "2026-10-15",
  goaltextsquare: "2026-10-15",
  goalcircled: "2026-10-15",
  goalredacted: "2026-10-15",
  goaloneline: "2026-10-15",
  castshadow: "2026-10-15",
  mirrorecho: "2026-10-15",
  overlap: "2026-10-15",
  fillprogress: "2026-10-15",
  twotone: "2026-10-15",
  goalcastshadow: "2026-10-15",
  goalmirrorecho: "2026-10-15",
  goaloverlap: "2026-10-15",
  goalfillprogress: "2026-10-15",
  goaltwotone: "2026-10-15",
  typesilhouette: "2026-10-15",
  giantsilhouette: "2026-10-15",
  linesilhouette: "2026-10-15",
  rippleecho: "2026-10-15",
  rimlight: "2026-10-15",
  goaltypesilhouette: "2026-10-15",
  goalgiantsilhouette: "2026-10-15",
  goallinesilhouette: "2026-10-15",
  goalrippleecho: "2026-10-15",
  goalrimlight: "2026-10-15",
  dotsilhouette: "2026-10-15",
  crestsilhouette: "2026-10-15",
  splitsilhouette: "2026-10-15",
  doubleline: "2026-10-15",
  risingecho: "2026-10-15",
  goaldotsilhouette: "2026-10-15",
  goalcrestsilhouette: "2026-10-15",
  goalsplitsilhouette: "2026-10-15",
  goaldoubleline: "2026-10-15",
  goalrisingecho: "2026-10-15",
  paperecho: "2026-10-15",
  dashecho: "2026-10-15",
  gradientsilhouette: "2026-10-15",
  duosilhouette: "2026-10-15",
  stepsilhouette: "2026-10-15",
  goalpaperecho: "2026-10-15",
  goaldashecho: "2026-10-15",
  goalgradientsilhouette: "2026-10-15",
  goalduosilhouette: "2026-10-15",
  goalstepsilhouette: "2026-10-15",
  paperripple: "2026-10-15",
  papertype: "2026-10-15",
  paperdouble: "2026-10-15",
  paperstep: "2026-10-15",
  papergiant: "2026-10-15",
  goalpaperripple: "2026-10-15",
  goalpapertype: "2026-10-15",
  goalpaperdouble: "2026-10-15",
  goalpaperstep: "2026-10-15",
  goalpapergiant: "2026-10-15",
  echotitle: "2026-10-15",
  echodate: "2026-10-15",
  echotime: "2026-10-15",
  echoname: "2026-10-15",
  echocrest: "2026-10-15",
  goalechotitle: "2026-10-15",
  goalechoname: "2026-10-15",
  goalechocrest: "2026-10-15",
  goalechobar: "2026-10-15",
  goalechocorner: "2026-10-15",
  echoswiss: "2026-10-16",
  echoserif: "2026-10-16",
  echotable: "2026-10-16",
  echoorbit: "2026-10-16",
  echolockup: "2026-10-16",
  goalechoswiss: "2026-10-16",
  goalechoserif: "2026-10-16",
  goalechoorbit: "2026-10-16",
  goalechomono: "2026-10-16",
  goalechoflash: "2026-10-16",
  echoinset: "2026-10-16",
  echogallery: "2026-10-16",
  echosidecol: "2026-10-16",
  echohorizon: "2026-10-16",
  echowidetitle: "2026-10-16",
  goalechobug: "2026-10-16",
  goalechoserene: "2026-10-16",
  goalechohorizon: "2026-10-16",
  goalechowide: "2026-10-16",
  goalechotonal: "2026-10-16",
  echomicro: "2026-10-16",
  echoaura: "2026-10-16",
  echobackline: "2026-10-16",
  echonamefield: "2026-10-16",
  echozoom: "2026-10-16",
  goalechoaura: "2026-10-16",
  goalechobackline: "2026-10-16",
  goalechonamefield: "2026-10-16",
  goalechozoom: "2026-10-16",
  goalechovert: "2026-10-16",
  paperechodate: "2026-10-16",
  paperechotime: "2026-10-16",
  paperechoname: "2026-10-16",
  paperechoserif: "2026-10-16",
  paperechowide: "2026-10-16",
  goalpaperechoname: "2026-10-16",
  goalpaperechoserif: "2026-10-16",
  goalpaperechowide: "2026-10-16",
  goalpaperechovert: "2026-10-16",
  goalpaperechobar: "2026-10-16",
};
/**
 * The loud, maximal looks US college and high-school athletes post (the user, 2026-11-03: "os jogadores dos
 * Estados Unidos gostam mais deste tipo de estilo, mais exagerado" — showing Filip Arras's "Pilar"): huge
 * condensed type, big colour blocks, giant crests, texture. For a player at a US school they lead the grid.
 */
const BOLD_LOOKS = new Set<string>([
  "pillar", "gameday", "monumental", "stretch", "poster", "spotlight", "motion", "condensed", "tallname", "bignumber",
  "breakout", "jersey", "chrome", "emblemart", "blueprint", "splitnumber", "cheer", "broadcast", "scoreline",
  "curvepanel", "sideband", "band", "halftone", "speed", "headline",
]);
export const isBold = (id: string) => BOLD_LOOKS.has(id) || !!TEMPLATES.find((t) => t.id === id)?.bold;

export const NEW_DAYS = 10;
const isNew = (id: TemplateId) => {
  const d = ADDED[id];
  return !!d && Date.now() - new Date(`${d}T00:00:00`).getTime() < NEW_DAYS * 86400000;
};

export function generateVariants(
  base: TemplateParams,
  postType: PostType,
  prefs?: PlayerPrefs,
  count = 12,
  penalties: Record<string, number> = {},
  /** Looks used in the player's latest posts (newest first): pushed down so the feed keeps varying. */
  recent: string[] = [],
  /** Whether any selected photo shows the feet; looks that stand the player on the ground need one. */
  hasFeet = true,
  seed = 1,
  /** Poses of the selected photos: looks made for one of them come up more often. */
  poses: Pose[] = [],
  /** Exports per look across every player of the agency: the house taste, weaker than the player's own. */
  agency: Record<string, number> = {},
  /** A player at a US school: the loud gameday looks (isBold) fill half the grid. */
  bold = false,
): TemplateParams[] {
  const r = rng(seed);
  const pickOne = <T,>(xs: T[]): T => xs[Math.floor(r() * xs.length)];
  // Looks reported with errors 3+ times for this kind of post are dropped until fixed.
  const fitting = templatesFor(postType)
    .filter((t) => hasFeet || !t.feet)
    .map((t) => t.id)
    // Coach looks have their own section on coach profiles (Criar); never in these grids.
    .filter((id) => !COACH_LOOKS.has(id))
    .filter((id) => (penalties[id] ?? 0) < 3);
  const priority = PRIORITY[postType] ?? fitting;
  const picks = prefs?.picks ?? {};
  // Favourites help, but capped: a look picked 8 times must not lead every grid forever.
  const liked = (id: TemplateId) =>
    Math.min(
      2,
      Object.entries(picks)
        .filter(([k]) => k.startsWith(`${id}|`))
        .reduce((a, [, n]) => a + n, 0) * 0.5,
    );
  const rank = (id: TemplateId) => (priority.includes(id) ? priority.indexOf(id) / priority.length : 1);
  const score = (id: TemplateId) =>
    liked(id) +
    (1 - rank(id)) * 1.2 -
    2 * (penalties[id] ?? 0) -
    recent.slice(0, 6).reduce((a, x, i) => a + (x === id ? 3 - i * 0.4 : 0), 0) +
    (poses.some((p) => POSE_FIT[id]?.includes(p)) ? 1.2 : 0) +
    // Looks made for the poses of the reference edits the user sent for this player.
    ((prefs?.referencePoses ?? []).some((p) => POSE_FIT[id]?.includes(p)) ? 1.2 : 0) +
    r() * 4.5 +
    (bold && isBold(id) ? 3 : 0);
  const scored = fitting.map((id) => ({ id, s: score(id) })).sort((a, b) => b.s - a.s);
  const order = scored.map((x) => x.id);

  const side = prefs?.side && prefs.side !== "auto" ? prefs.side : base.side;
  const dark = prefs?.tone === "dark";
  const root: TemplateParams = { ...base, side, primary: dark ? "#10131c" : base.primary };

  /**
   * The grid is not just "the best twelve": with 60+ looks that would show the same handful for ever.
   * One look comes from what suits this player and this post; the rest are taken from a ring over
   * every fitting look, starting at a point that moves with the seed — so each visit (and each
   * "Baralhar") shows a different slice and, over a few grids, every look gets its turn.
   */
  // Learned taste: exports of this player count fully, the agency's (all players) at 40%.
  const exported = (id: TemplateId) =>
    Object.entries(picks)
      .filter(([k]) => k.startsWith(`${id}|`))
      .reduce((a, [, n]) => a + n, 0) + (agency[id] ?? 0) * 0.4;
  // Up to three favourites per grid, drawn at random by weight (square root: a look exported 14 times is
  // likelier, not certain) and never one just posted. The other nine are discovery.
  const favPool = fitting.filter((id) => exported(id) > 0 && !recent.slice(0, 2).includes(id));
  const leading: TemplateId[] = [];
  const favCount = Math.min(3, favPool.length);
  while (leading.length < favCount) {
    const left = favPool.filter((id) => !leading.includes(id));
    const total = left.reduce((a, id) => a + Math.sqrt(exported(id)), 0);
    let x = r() * total;
    const hit = left.find((id) => (x -= Math.sqrt(exported(id))) <= 0) ?? left[left.length - 1];
    leading.push(hit);
  }
  // Unexported new looks only ever appear in the last slots (below), never at the front or mid-grid.
  const unseenNew = (id: TemplateId) => isNew(id) && exported(id) === 0;
  if (!leading.length) leading.push(...order.filter((id) => !unseenNew(id)).slice(0, 1));
  // Up to four new looks the user hasn't exported yet, so new rounds are actually seen — always the
  // last cards of the grid (the user asked for them at the end), oldest first, newest last.
  const fresh = fitting.filter((id) => isNew(id) && exported(id) === 0 && !leading.includes(id) && !recent.slice(0, 2).includes(id));
  const newcomers: TemplateId[] = [];
  for (let n = Math.min(4, fresh.length); n > 0; n--) {
    const left = fresh.filter((id) => !newcomers.includes(id));
    newcomers.push(left[Math.floor(r() * left.length)]);
  }
  newcomers.sort((a, b) => (ADDED[a] ?? "").localeCompare(ADDED[b] ?? ""));
  const ring = order.filter((id) => !leading.includes(id) && !unseenNew(id));
  const start = ring.length ? Math.floor(r() * ring.length) : 0;
  const looks = [...leading];
  // US school: half the grid from the loud gameday looks (best-scored first), the rest discovery as usual.
  if (bold) for (const id of ring.filter(isBold)) if (looks.length < count / 2 && !looks.includes(id)) looks.push(id);
  for (let i = 0; looks.length < count - newcomers.length && i < ring.length; i++) {
    const id = ring[(start + i) % ring.length];
    if (!looks.includes(id)) looks.push(id);
  }
  looks.push(...newcomers);
  // Very few fitting looks: fill with a second take of the best ones.
  while (looks.length < count && order.length) looks.push(order[looks.length % order.length]);

  const framings: Framing[] = ["waist", "full", "chest", "knees"];
  const finishes: Finish[] = ["duo", "noir", "film", "vivid"];
  // Framings and finishes the user exports come up more often (weighted), the rest still appear.
  const taste = prefs?.taste ?? {};
  const weighted = <T extends string>(xs: T[], prefix: string): T => {
    const w = xs.map((x) => 1 + Math.sqrt(taste[`${prefix}:${x}`] ?? 0));
    let x = r() * w.reduce((a, b) => a + b, 0);
    return xs.find((_, i) => (x -= w[i]) <= 0) ?? xs[xs.length - 1];
  };
  const finishRate = Math.min(0.6, Math.max(0.2, ((Object.entries(taste).filter(([k]) => k.startsWith("finish:") && k !== "finish:none").reduce((a, [, n]) => a + n, 0) + 1) / (Object.entries(taste).filter(([k]) => k.startsWith("finish:")).reduce((a, [, n]) => a + n, 0) + 3))));
  let lastFraming: Framing | undefined;
  const taken = new Set<string>();
  return looks.map((templateId, i) => {
    const def = TEMPLATES.find((t) => t.id === templateId);
    const again = looks.indexOf(templateId) !== i;
    const flip = def?.flips && (again || r() < 0.4);
    const p: TemplateParams = {
      ...root,
      templateId,
      side: flip ? (side === "left" ? "right" : "left") : side,
      bgStyle: again ? pickOne((["rays", "pitch", "photo"] as const).filter((b) => b !== root.bgStyle)) : root.bgStyle,
      // About a third get a colour finish, so the grid never reads as one palette.
      finish: r() < finishRate || again ? weighted(finishes, "finish") : undefined,
      seed: Math.floor(r() * 1e9),
    };
    if (!def?.fixedFrame) {
      // Framings where the automatic check (scripts/check/looks.mjs) saw text cut or covered are skipped.
      const unsafe: string[] = (unsafeFramings as Record<string, string[]>)[templateId] ?? [];
      const safe = framings.filter((f) => !unsafe.includes(f));
      const options = safe.filter((f) => f !== lastFraming);
      p.framing = lastFraming = options.length ? weighted(options, "framing") : safe[0] ?? "full";
    }
    const key = `${p.templateId}|${p.side}|${p.finish}|${p.framing}`;
    if (taken.has(key)) p.finish = p.finish ? undefined : pickOne(finishes);
    taken.add(key);
    return p;
  });
}

export { pickKey };
