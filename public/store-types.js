// Subtypes inside "More stores", shared by Overture, OpenStreetMap, and Google listings.
// Terms include Overture taxonomy names, OSM shop values, and Google place types.
export const STORE_TYPES=[
 {id:'electronics',name:'Electronics & phones',terms:['electronics_store','electronics','mobile_phone','computer','computer_store','cell_phone_store','mobile_phone_store','video_game_store']},
 {id:'gifts',name:'Flowers & gifts',terms:['flowers_and_gifts_store','florist','flower_shop','gift','gift_shop','cards_and_stationery_store','party_supply_store','souvenir_store','candle_store']},
 {id:'books_hobby',name:'Books, music & hobbies',terms:['books_music_and_video_store','book_store','books','music','music_store','arts_crafts_and_hobby_store','craft','art','art_supply_store','hobby_store','toys_and_games_store','toys','games','musical_instrument_and_pro_audio_store','musical_instrument']},
 {id:'beauty_supply',name:'Beauty supply',terms:['personal_care_and_beauty_store','cosmetics','cosmetics_store','beauty_supply_store','perfumery']},
 {id:'sporting',name:'Sporting & outdoor',terms:['sporting_goods_store','sports','outdoor','bicycle','bicycle_store','bike_shop','outdoor_store','gun_and_ammo_store','fishing_store']},
 {id:'liquor',name:'Liquor & wine',terms:['liquor_store','beer_wine_spirits_store','alcohol','wine','wine_store','beverages']},
 {id:'thrift',name:'Thrift, pawn & antiques',terms:['second_hand_store','second_hand','second_hand_clothing_store','antique_store','antiques','charity','pawn_shop','pawnbroker','flea_market','consignment_store','thrift_store']},
 {id:'auto_parts',name:'Auto parts & dealers',terms:['vehicle_parts_store','auto_parts_store','car_parts','vehicle_dealer','auto_dealer','car','car_dealer','motorcycle_dealer','tire_store']},
 {id:'pets',name:'Pets',terms:['animal_and_pet_store','pet_store','pet','pet_supplies']},
 {id:'tobacco',name:'Tobacco & vape',terms:['tobacco_shop','smoke_and_vape_store','tobacco','e-cigarette','vape_shop']},
 {id:'office',name:'Office & shipping',terms:['office_supply_store','stationery','office_supplies','copy_shop']}
];
const byTerm=new Map(STORE_TYPES.flatMap(type=>type.terms.map(term=>[term,type.id])));
export function storeTypeFromTerms(terms=[]){for(const term of terms){const id=byTerm.get(String(term||'').toLowerCase());if(id)return id;}return 'other';}
export function storeTypeName(id){return STORE_TYPES.find(type=>type.id===id)?.name||'Everything else';}
