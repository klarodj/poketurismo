// Display aliases only. Canonical family names remain untouched in saved data and quotes.
const families={Aero:'Aerodinamica','Aspiration System':'Aspirazione',Bars:'Barre e rinforzi',Brake:'Impianto frenante','Clutch and Flywheel':'Frizione e volano',Differential:'Differenziale',ECU:'Centralina ECU','Engine Internal':'Preparazione interna motore','Exhaust System':'Scarico','Fuel System':'Alimentazione',Gearbox:'Cambio',Suspension:'Sospensioni',Turbo:'Turbo',Tyres:'Pneumatici',Weight:'Alleggerimento',Wheels:'Cerchi'};
const descriptions=Object.fromEntries([
 ['Basic oem aero','Appendici aerodinamiche di serie'],['Racing lip and wing','Splitter e alettone sportivi'],['Complete racing aero system','Kit aerodinamico da competizione'],
 ['Basic sport filter','Filtro aria sportivo'],['Cold air intake system','Aspirazione diretta con presa d’aria fredda'],['Individual throttle body','Corpi farfallati singoli'],
 ['Strut Bars','Barre duomi'],['Racing antiroll bar','Barre antirollio da competizione'],['Complete roll bar cage','Gabbia roll-bar completa'],
 ['Sport pads. line and discks','Pastiglie, tubi freno e dischi sportivi'],['Racing pads and disks','Pastiglie e dischi da competizione'],['Complete racing brake system','Impianto frenante da competizione completo'],
 ['Sport clutch','Frizione sportiva'],['Reinforced clutch and lighter flywheel','Frizione rinforzata e volano alleggerito'],['Racing clutch and lighter flywheel','Frizione da competizione e volano alleggerito'],
 ['Torsen','Autobloccante Torsen'],['Mechanical LSD','Differenziale autobloccante meccanico'],['Racing 2way LSD','Autobloccante a due vie da competizione'],
 ['Basic remap','Rimappatura della centralina'],['New tuning ECU','Centralina programmabile'],['Racing eletric system','Elettronica motore da competizione'],
 ['Sport cam and basic head tuning','Alberi a camme sportivi e lavorazione della testata'],['Complete internal tuning','Preparazione completa degli organi interni'],['Billet block and racing component','Monoblocco ricavato dal pieno e componenti da competizione'],
 ['Basic sport exhaust','Scarico sportivo'],['Headers and de-cat','Collettori e tubo sostitutivo del catalizzatore'],['Complete racing system','Linea di scarico da competizione completa'],
 ['Augmented fuel pressure','Pressione carburante maggiorata'],['Racing fuel pump and injector','Pompa benzina e iniettori maggiorati'],['Complete racing fuel system','Impianto di alimentazione da competizione completo'],
 ['Short shifter and lower final gear','Leva a corsa corta e rapporto finale più corto'],['Dogbox system','Cambio a innesti frontali'],['Sequantial gearbox','Cambio sequenziale'],
 ['Sport suspension and lower springs','Ammortizzatori sportivi e molle ribassate'],['Coilover system','Assetto a ghiera regolabile'],['Racing coilover','Assetto a ghiera da competizione'],
 ['Small turbo and intercooler','Turbina compatta e intercooler'],['Mid range turbo and intercooler','Turbina maggiorata e intercooler'],['High performance turbo and intercooler','Turbina ad alte prestazioni e intercooler'],
 ['Sport tyres','Pneumatici sportivi'],['Semislick tyres','Pneumatici semislick'],['Slick tyres','Pneumatici slick'],
 ['Basic wheight reduction','Alleggerimento di base'],['Advanced wheigt reduction','Alleggerimento avanzato'],['Racing wheigth treatment','Alleggerimento da competizione'],
 ['Sport wheels','Cerchi sportivi'],['Bigger sport wheels','Cerchi sportivi maggiorati'],['Racing wheels','Cerchi da competizione']
]);
export const partName=name=>families[name]||name||'';
export const partDescription=part=>descriptions[part?.description?.trim()]||part?.description||'';
