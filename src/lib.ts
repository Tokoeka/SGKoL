import { Item, toInt, visitUrl } from "kolmafia";
import { $item } from "libram";

const noHazards = {"toxic atmosphere": false, "high gravity": false, "irradiated": false, "magnetic storms": false, "high winds": false, "hot solar flares": false, "frigid zones": false, "spooky noises": false, "nasty gasses": false, "lewd rocks": false}

class Spacestate {
	dialed: boolean;
	planetCoordinates: string;
	planetName: string;
	
	energyRemaining: number;
	plantLife: string;
	animalLife: string;
	intelligentLife: string;
	environmentalHazards: {[hazard: string]: boolean};
	alerts?: {[alert: string]: boolean};
	
	//Consequences:
	equipmentNeeded: Item | Item[];
	probableEnergyRemaining?: number;

	constructor(
		dialed?: boolean,
		planetCoordinates?: string,
		planetName?: string,
		energyRemaining?: number,
		plantLife?: string,
		animalLife?: string,
		intelligentLife?: string,
		enviromentalHazards?: {[hazard: string]: boolean},
		alerts?: {[alert: string]: boolean},
		equipmentNeeded?: Item | Item[],
		probableEnergyRemaining?: number,
	) {
		this.dialed = dialed ?? false;
		this.planetCoordinates = planetCoordinates ?? "";
		this.planetName = planetName ?? "";
		this.energyRemaining = energyRemaining ?? 20;
		this.plantLife = plantLife ?? "";
		this.animalLife = animalLife ?? "";
		this.intelligentLife = intelligentLife ?? "";
		this.environmentalHazards = enviromentalHazards ?? noHazards;
		this.alerts = alerts;
		this.equipmentNeeded = equipmentNeeded ?? $item`none`;
		this.probableEnergyRemaining = probableEnergyRemaining;
	}
};

export function determineState(): Spacestate { //TODO - This still needs finishing porting from ash
	let state = new Spacestate();
	const page = visitUrl("place.php?whichplace=spacegate&action=sg_Terminal");
	if (page.includes("It looks like you can either set seven dials individually, type in a seven letter coordinate set, or press a big red button to open the gate up to a random planet."))
	{
		return state;
	}
	state.dialed = true;
	
	const firstLevelMatch = page.match(`<center><table><tr><td>Current planet: Planet Name: (.*?)<br>Coordinates: (.*?)<br><p>Environmental Hazards:<Br>(.*?)<br>Plant Life: (.*?)<br>Animal Life: (.*?)<br>Intelligent Life: (.*?)<br><p>Spacegate Energy remaining: <b><font size=.2>([0-9]*) </font></b>Adventure`)?.slice(1);
	if (Array.isArray(firstLevelMatch)){
		state.planetName = firstLevelMatch[0];
		state.planetCoordinates = firstLevelMatch[1];
		state.plantLife = firstLevelMatch[3];
		state.animalLife = firstLevelMatch[4];
		state.energyRemaining = toInt(firstLevelMatch[6]);
		state.probableEnergyRemaining = state.energyRemaining;
		
		let environmentalHazardsString = firstLevelMatch[2].replace("&nbsp;", "");
		while(environmentalHazardsString.match("&nbsp;")){
			environmentalHazardsString = environmentalHazardsString.replace("&nbsp;", "");
		}
		const el_hazard = environmentalHazardsString.split("<br>");
		el_hazard.forEach((hazard) => {
			state.environmentalHazards[hazard] = true;
		});
		
		const secondLevelMatch = firstLevelMatch[5].split("<br>");
		state.intelligentLife = secondLevelMatch[0];
		secondLevelMatch.slice(1).forEach((entry) =>	{
			state.alerts[entry] = true;
		});
		calculateEquipmentNeeded(state);
	}
	return state;
}