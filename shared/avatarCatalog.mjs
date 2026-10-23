// Cosmetic identities only; avatar choice never affects money, stats or matchmaking.
const rows=[
 ['rally-man','Il rallista','uomo','Tuta da rally e passione per i tornanti.'],
 ['rally-woman','La rallista','donna','Casco pronto e piede sicuro sui passi.'],
 ['mechanic-man','Il meccanico','uomo','Tuta da lavoro, baffi e mani da officina.'],
 ['mechanic-woman','La meccanica','donna','Tra ponti e chiavi inglesi, sa dove mettere le mani.'],
 ['rich-man','Il figlio di papà','uomo','Polo impeccabile e le chiavi dell’auto di famiglia.'],
 ['rich-woman','La figlia di papà','donna','Stile curato e un debole per le gran turismo.'],
 ['tuner-man','Il tamarro','uomo','Capelli col gel, tuta e serate al parcheggio.'],
 ['tuner-woman','La tamarra','donna','Tuta colorata e presenza fissa ai raduni.'],
 ['navigator-man','Il navigatore','uomo','Note del percorso, interfono e sangue freddo.'],
 ['navigator-woman','La navigatrice','donna','Roadbook in mano: ogni curva al momento giusto.'],
 ['bodyshop-man','Il carrozziere','uomo','Polvere di carrozzeria e occhiali da lavoro.'],
 ['bodyshop-woman','La carrozziera','donna','Vernice, lamiera e attenzione ai dettagli.'],
 ['track-man','Il pistaiolo','uomo','Tuta da pista e domeniche al club.'],
 ['track-woman','La pistaiola','donna','Tra cordoli, staccate e tempi sul giro.'],
 ['tyres-man','Il gommista','uomo','Tra pneumatici e assetti, sempre al lavoro.'],
 ['tyres-woman','La gommista','donna','Pressioni, equilibratura e gomme giuste.'],
 ['audio-man','Il mago dell’hi-fi','uomo','Autoradio, cassette e impianti fatti in garage.'],
 ['audio-woman','La maga dell’hi-fi','donna','Cavi, amplificatori e musica al raduno.'],
 ['veteran-man','Il veterano del club','uomo','Giubbotto vissuto e mille storie del passo.'],
 ['veteran-woman','La veterana del club','donna','Esperienza, carattere e amicizie di paddock.'],
];
export const AVATARS=rows.map(([id,name,gender,description])=>({id,name,gender,description,image:`/images/avatars/${id}.png`}));
export const DEFAULT_AVATAR=AVATARS[0].id;
export const LEGACY_AVATARS=['blue','red','green','yellow'];
export function avatarInfo(id){return AVATARS.find(avatar=>avatar.id===id)||null;}
export function isAvatarId(id){return typeof id==='string'&&!!avatarInfo(id);}
export function isCreationAvatarId(id){return isAvatarId(id)||LEGACY_AVATARS.includes(id);}
