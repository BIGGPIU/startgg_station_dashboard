import { useQuery } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react'
// import './App.css'
import {TwitchLive} from "react-twitch-live-embed"

interface StreamAndStation {
	stream_name:String
	station_number:Number
}

function App() {
	// const [count, setCount] = useState(0)

	const [tournamentToCheck,updateTournamentToCheck] = useState("");
	// const [tournamentToCheck,updateTournamentToCheck] = useState("tournament/dave-tournament-organizer-tournament/event/ssbu-sinles");
	const [apiKey, updateApiKey] = useState("")
	// const [apiKey, updateApiKey] = useState("30fb2d6f7669dede421960e4dbe072a8")

	let show_login_panel;
	let thing_to_show = <></>
	if (tournamentToCheck.length != 0 && apiKey.length != 0) {
		show_login_panel = "hidden"
		thing_to_show = <div className='ml-4'>watching {tournamentToCheck} | Do not reload page or else you'll have to input everything again. | Created by BIGG (the guy in the BITE shirt) just for you! </div>
	}
	else {
		show_login_panel = ""
	}




	let y = get_tournament_sets_and_stations(tournamentToCheck,apiKey);

	return (
		<div className='w-full h-full overflow-x-hidden'>
			{thing_to_show}
			<div className={`w-full h-1/12 ml-2 ${show_login_panel} `}>
				<div>Please paste (and I mean paste) your event slug</div>
				<input type="text" className='bg-gray-900 w-3xl' onChange={
					(e) => {
						updateTournamentToCheck(e.target.value);
					}
				}  />
				<div>Paste your API key</div>
				<input type="password" className='bg-gray-900 w-3xl'  onChange={
					(e) => {
						updateApiKey(e.target.value)
					}
				}/>
			</div>
			<div className='w-full h-11/12 mt-3 overflow-auto'>
				{y}
			</div>
		</div>
	)
}



type TwitchStreamMulticastType = {
	info:StreamAndStation
}

function TwitchStreamMulticast(props:TwitchStreamMulticastType) {



	return (
		<div className={`w-128  h-72 mr-4 ml-4 float-left bg-gray-900 border-2 rounded-sm border-gray-400 p-2`}>
			<div className='w-full h-2/12 text-2xl'>Station {props.info.station_number.toString()} Stream</div>
			<div className='w-full h-10/12'>
				<TwitchLive
					width="100%"
					height="100%"
					channel={props.info.stream_name.toString()}
					key={props.info.stream_name.toString()}
					autoplay={true}
					muted={true}
				></TwitchLive>
			</div>
		</div>
	)
}

function get_tournament_sets_and_stations(event_slug:String, auth_key:String,) {
	let y:ReactNode[] = [];
	let a:ReactNode[] = [];
	
	const {isPending,isError,data} = useQuery({queryKey: ["get_station_numbers"], queryFn: async() => {
		const url = "https://api.start.gg/gql/alpha";
		
		const body = JSON.stringify({
			"query": "query GetTournamentEventsAndSets($eventSlug: String ) { event(slug: $eventSlug) { stations(query: { page:1 perPage:512 }) { nodes { enabled number stream { streamName } } } } }"
			,"variables": {
				"eventSlug":event_slug
			}
		})

		console.log(body);

		const x = (await fetch(url,
			{
				method:"POST",
				body:body,
				headers: {
					"Authorization": ("Bearer " + auth_key)
				}
			}
		).then()).json().then((z) => {return z;})
	
		return x;
	},refetchInterval:5000,refetchIntervalInBackground:true})
	if (isError) {
		return <></>
	} 
	else if (isPending) {
		return <></>
	}
	else {
		let list:ReactNode[] = [];

		try {
			for (let index = 0; index < data["data"]["event"]["stations"]["nodes"].length; index++) {
				const element = data["data"]["event"]["stations"]["nodes"][index];
				let station_stream = "";
				if (element["stream"] != null) {
					station_stream = element["stream"]["streamName"];
					// REDACTED
					// does that count as racist
					// probably
					// 11/18/25 sorry asian people :(
					a.push(<TwitchStreamMulticast info={{station_number:element["number"],stream_name:station_stream}}></TwitchStreamMulticast>)
				}
				// list.push(TournamenStationBox(element["number"],station_stream,event_slug,auth_key))
				list.push(<TournamenStationBox 
					station_number={element["number"]}
					station_stream={station_stream}
					event_slug={event_slug}
					auth_key={auth_key}
					></TournamenStationBox>)
			}
	
	
			y = list
		} catch (error) {
			return <></>
		}
	}

	return (
		<div className='w-full h-full'>
			<div className='w-full h-3/4 relative float-left'>{y}</div>
			<div className='w-full h-1/4 relative mt-2 float-left'>{a}</div>
		</div>
	)
}


function TournamenStationBox(props:any){
// function TournamenStationBox(station_number:String,station_stream:String,event_slug:String,auth_key:String) {
	console.log(props.station_stream)
	const {isPending, isError, data} = useQuery({queryKey: [{"get_station_information":props.station_number}],queryFn: async() => {
		const url = "https://api.start.gg/gql/alpha";

		const body = JSON.stringify({
			"query": "query GetUsersInStationsSet($eventSlug: String,$stationNumber: Int) { event(slug: $eventSlug) { sets( filters:{ stationNumbers:[ $stationNumber ] } ) { nodes { fullRoundText state slots(includeByes:false) { entrant { name } } } } } }"
			,"variables": {
				"eventSlug":props.event_slug,
				"stationNumber":props.station_number
			}
		})


		const x = (await fetch(url,
			{
				method:"POST",
				body:body,
				headers: {
					"Authorization": ("Bearer " + props.auth_key)
				}
			}
		).then()).json().then((z) => {return z;})
		return x
	},refetchInterval:5000})
	if (isPending) {
		return <></>
	}
	else if (isError) {
		return <></>
	}
	else {


		if (data["data"]["event"]["sets"]["nodes"][0]["state"] == 3) {
			return <></>
		}

		let round_name = data["data"]["event"]["sets"]["nodes"][0]["fullRoundText"]
		let player_1_user_name;
		let player_2_user_name;
		try {
			player_1_user_name = data["data"]["event"]["sets"]["nodes"][0]["slots"][0]["entrant"]["name"];
		} catch (e) {
			player_1_user_name = "?"
		}

		try {
			player_2_user_name = data["data"]["event"]["sets"]["nodes"][0]["slots"][1]["entrant"]["name"];
		} catch (e) {
			player_2_user_name = "?"
		}
	
		const colors = ["border-blue-500","border-red-500","border-red-400","border-green-500","border-violet-500","border-emerald-400","border-violet-600","border-orange-500"]
		let randint = Math.floor(Math.random() * colors.length)
		let color = colors[randint]

		return (
			<div className={`w-128  h-64 mr-4 ml-4 float-left bg-gray-900 border-2 rounded-sm mt-2 ${color}`}>
				<div className='w-full h-full p-3'>
					<div className='w-full h-2/12 text-2xl'>{round_name}</div>
					<div className='w-full h-2/12 text-2xl'> {player_1_user_name} vs {player_2_user_name} </div>
					<div className='w-full h-4/12 text-5xl text-center pt-1'>Station</div>
					<div className='w-full h-4/12 text-5xl text-center'>{props.station_number}</div>
				</div> 
			</div>
		)
	}
}
export default App
