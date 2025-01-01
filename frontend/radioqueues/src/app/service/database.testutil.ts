import { Injectable } from "@angular/core";
import { Queue } from "../model/queue";
import { FileMetaData } from "../model/file-meta-data";
import { QueueType } from "../model/queue-type";

@Injectable({
	providedIn: 'root'
})
export class DatabaseTestUtil {

	public static readonly queues: Record<string, Queue> = {
		"00000000-a78095b4-0c65-44a7-9555-bdcbd93d00a6": {
			"uuid": "00000000-a78095b4-0c65-44a7-9555-bdcbd93d00a6",
			"name": "History",
			"type": "History",
			"visible": false,
			"entries": []
		},
		"00000001-8deb427b-ec8e-40de-a4ba-b30dbbcd5e0b": {
			"uuid": "00000001-8deb427b-ec8e-40de-a4ba-b30dbbcd5e0b",
			"name": "Main Queue",
			"type": "Main Queue",
			"offset": new Date("3025-01-01T00:00:00.383Z"),
			"visible": true,
			"entries": [
				{
					"color": "#0A0",
					"name": "News 01:00",
					"offset": new Date("3025-01-01T00:00:00.383Z"),
					"duration": 27216,
					"queueRef": "m5cxtb0g-b3709016-1dce-4bc7-b279-7edb79049bb6",
					"scheduled": new Date("3025-01-01T00:00:00.383Z"),
				},
				{
					"color": "#AAA",
					"name": "Music",
					"offset": new Date("3025-01-01T00:00:27.599Z"),
					"duration": 873105,
					"queueRef": "m5cxvnbb-bd0e4c8d-5671-4592-a85c-db98601762c1"
				},
				{
					"color": "#A0A",
					"name": "Advertisment 01:15",
					"offset": new Date("3025-01-01T00:15:00.704Z"),
					"duration": 50424,
					"queueRef": "m5cxuta7-31826185-d2f0-4265-849a-3d4f94236db8",
					"scheduled": new Date("3025-01-01T00:15:00.704Z"),
				},
				{
					"color": "#AAA",
					"name": "Music",
					"offset": new Date("3025-01-01T00:15:51.128Z"),
					"duration": 1749009,
					"queueRef": "m5cxw994-655e2e19-e4d8-466b-8405-b91de13ec101"
				},
				{
					"color": "#00A",
					"name": "Music Request (unscheduled)",
					"offset": new Date("3025-01-01T00:45:00.137Z"),
					"duration": 47376,
					"queueRef": "m5cy179m-1626bdff-20aa-4342-a7d1-b146ab5b170f"
				},
				{
					"color": "#A0A",
					"name": "Advertisment 01:45",
					"offset": new Date("3025-01-01T00:45:47.513Z"),
					"duration": 16992,
					"queueRef": "m5cxvzm0-f126e02e-514b-45af-8e1b-c34801ac8b6a",
					"scheduled": new Date("3025-01-01T00:45:00.137Z"),
				},
				{
					"color": "#AAA",
					"name": "Music",
					"offset": new Date("3025-01-01T00:46:04.505Z"),
					"duration": 836450,
					"queueRef": "m5cy07uz-2ad4d177-7f4e-40c0-907e-904ca0d0ca7d"
				},
				{
					"color": "#0A0",
					"name": "News 02:00",
					"offset": new Date("3025-01-01T01:00:00.955Z"),
					"duration": 19608,
					"queueRef": "m5cy03n6-c6234a14-3fc1-42a0-ae6b-a003720772d1",
					"scheduled": new Date("3025-01-01T01:00:00.955Z"),
				}
			],
			"duration": 1735693220563
		},
		"m5cxtb0g-b3709016-1dce-4bc7-b279-7edb79049bb6": {
			"uuid": "m5cxtb0g-b3709016-1dce-4bc7-b279-7edb79049bb6",
			"name": "News 01:00",
			"color": "#0A0",
			"offset": new Date("3025-01-01T00:00:00.383Z"),
			"duration": 27216,
			"visible": false,
			"type": "News",
			"entries": [
				{
					"color": "#0A0",
					"name": "jingles/News Intro.mp3",
					"offset": new Date("3025-01-01T00:00:00.383Z"),
					"duration": 3360
				},
				{
					"color": "#0A0",
					"name": "news/Heat! Our count.mp3",
					"offset": new Date("3025-01-01T00:00:03.743Z"),
					"duration": 13560
				},
				{
					"color": "#0A0",
					"name": "news/It will be sunn.mp3",
					"offset": new Date("3025-01-01T00:00:17.303Z"),
					"duration": 8328
				},
				{
					"color": "#0A0",
					"name": "jingles/News Outro.mp3",
					"offset": new Date("3025-01-01T00:00:25.631Z"),
					"duration": 1968
				}
			]
		},
		"m5cxu9oo-9b65cb29-a67f-4fa0-80f6-8f2ffdb587ba": {
			"uuid": "m5cxu9oo-9b65cb29-a67f-4fa0-80f6-8f2ffdb587ba",
			"name": "Music",
			"color": "#AAA",
			"offset": new Date("1970-01-01T00:00:00.000Z"),
			"duration": 1735689600383,
			"visible": false,
			"type": "Music",
			"entries": []
		},
		"m5cxuta7-31826185-d2f0-4265-849a-3d4f94236db8": {
			"uuid": "m5cxuta7-31826185-d2f0-4265-849a-3d4f94236db8",
			"name": "Advertisment 01:15",
			"color": "#A0A",
			"offset": new Date("3025-01-01T00:15:00.704Z"),
			"duration": 50424,
			"visible": false,
			"type": "Advertisment",
			"entries": [
				{
					"color": "#A0A",
					"name": "jingles/Advertisment Into.mp3",
					"offset": new Date("3025-01-01T00:15:00.704Z"),
					"duration": 3120
				},
				{
					"color": "#A0A",
					"name": "advertisment/Long Ad.mp3",
					"offset": new Date("3025-01-01T00:15:03.824Z"),
					"duration": 44208
				},
				{
					"color": "#A0A",
					"name": "jingles/Advertisment Outro.mp3",
					"offset": new Date("3025-01-01T00:15:48.032Z"),
					"duration": 3096
				}
			]
		},
		"m5cxvnbb-bd0e4c8d-5671-4592-a85c-db98601762c1": {
			"uuid": "m5cxvnbb-bd0e4c8d-5671-4592-a85c-db98601762c1",
			"name": "Music",
			"color": "#AAA",
			"offset": new Date("3025-01-01T00:00:27.599Z"),
			"duration": 873105,
			"visible": false,
			"type": "Music",
			"entries": []
		},
		"m5cxvzm0-f126e02e-514b-45af-8e1b-c34801ac8b6a": {
			"uuid": "m5cxvzm0-f126e02e-514b-45af-8e1b-c34801ac8b6a",
			"name": "Advertisment 01:45",
			"color": "#A0A",
			"offset": new Date("3025-01-01T00:45:00.137Z"),
			"duration": 16992,
			"visible": false,
			"type": "Advertisment",
			"entries": [
				{
					"color": "#A0A",
					"name": "jingles/Advertisment Into.mp3",
					"offset": new Date("3025-01-01T00:45:00.137Z"),
					"duration": 3120
				},
				{
					"color": "#A0A",
					"name": "advertisment/Fictual Fish.mp3",
					"offset": new Date("3025-01-01T00:45:03.257Z"),
					"duration": 4896
				},
				{
					"color": "#A0A",
					"name": "advertisment/Magic Wings.mp3",
					"offset": new Date("3025-01-01T00:45:08.153Z"),
					"duration": 5880
				},
				{
					"color": "#A0A",
					"name": "jingles/Advertisment Outro.mp3",
					"offset": new Date("3025-01-01T00:45:14.033Z"),
					"duration": 3096
				}
			]
		},
		"m5cxw994-655e2e19-e4d8-466b-8405-b91de13ec101": {
			"uuid": "m5cxw994-655e2e19-e4d8-466b-8405-b91de13ec101",
			"name": "Music",
			"color": "#AAA",
			"offset": new Date("3025-01-01T00:15:17.696Z"),
			"duration": 1749009,
			"visible": false,
			"type": "Music",
			"entries": []
		},
		"m5cy03n6-c6234a14-3fc1-42a0-ae6b-a003720772d1": {
			"uuid": "m5cy03n6-c6234a14-3fc1-42a0-ae6b-a003720772d1",
			"name": "News 02:00",
			"color": "#0A0",
			"offset": new Date("3025-01-01T01:00:00.955Z"),
			"duration": 19608,
			"visible": false,
			"type": "News",
			"entries": [
				{
					"color": "#0A0",
					"name": "jingles/News Intro.mp3",
					"offset": new Date("3025-01-01T01:00:00.955Z"),
					"duration": 3360
				},
				{
					"color": "#0A0",
					"name": "news/It will be sunn.mp3",
					"offset": new Date("3025-01-01T01:00:04.315Z"),
					"duration": 8328
				},
				{
					"color": "#0A0",
					"name": "news/The  fictual ra.mp3",
					"offset": new Date("3025-01-01T01:00:12.643Z"),
					"duration": 5952
				},
				{
					"color": "#0A0",
					"name": "jingles/News Outro.mp3",
					"offset": new Date("3025-01-01T01:00:18.595Z"),
					"duration": 1968
				}
			]
		},
		"m5cy07uz-2ad4d177-7f4e-40c0-907e-904ca0d0ca7d": {
			"uuid": "m5cy07uz-2ad4d177-7f4e-40c0-907e-904ca0d0ca7d",
			"name": "Music",
			"color": "#AAA",
			"offset": new Date("3025-01-01T00:45:17.129Z"),
			"duration": 836450,
			"visible": false,
			"type": "Music",
			"entries": []
		},
		"m5cy179m-1626bdff-20aa-4342-a7d1-b146ab5b170f": {
			"uuid": "m5cy179m-1626bdff-20aa-4342-a7d1-b146ab5b170f",
			"name": "Music Request (unscheduled)",
			"color": "#00A",
			"offset": new Date("+099999-12-31T23:00:00.000Z"),
			"duration": 47376,
			"visible": true,
			"type": "Music Request",
			"entries": [
				{
					"color": "#00A",
					"name": "jingles/General Jingle.mp3",
					"offset": new Date("+099999-12-31T23:00:00.000Z"),
					"duration": 3168
				},
				{
					"color": "#00A",
					"name": "advertisment/Long Ad.mp3",
					"offset": new Date("+099999-12-31T23:00:03.168Z"),
					"duration": 44208
				}
			]
		}
	};

	public static readonly files: Record<string, FileMetaData> = {
		"README.md": {
			"size": 107,
			"lastModified": 1732971361646
		},
		"jingles/News Outro.mp3": {
			"size": 23616,
			"lastModified": 1731882848577,
			"duration": 1968
		},
		"jingles/Breaking news.mp3": {
			"size": 23328,
			"lastModified": 1731883019207,
			"duration": 1944
		},
		"jingles/Advertisment Outro.mp3": {
			"size": 37152,
			"lastModified": 1731882822373,
			"duration": 3096
		},
		"jingles/General Jingle.mp3": {
			"size": 38016,
			"lastModified": 1731882764813,
			"duration": 3168
		},
		"jingles/Advertisment Into.mp3": {
			"size": 37440,
			"lastModified": 1731882807249,
			"duration": 3120
		},
		"jingles/News Intro.mp3": {
			"size": 40320,
			"lastModified": 1731882790961,
			"duration": 3360
		},
		"advertisment/Magic Wings.mp3": {
			"size": 70560,
			"lastModified": 1731883123216,
			"duration": 5880
		},
		"advertisment/Fictual Fish.mp3": {
			"size": 58752,
			"lastModified": 1731883174353,
			"duration": 4896
		},
		"advertisment/Long Ad.mp3": {
			"size": 530496,
			"lastModified": 1731883242902,
			"duration": 44208
		},
		"news/Theft! A magic .mp3": {
			"size": 102528,
			"lastModified": 1732969084312,
			"duration": 8544
		},
		"news/It will be sunn.mp3": {
			"size": 99936,
			"lastModified": 1732968984259,
			"duration": 8328
		},
		"news/The  fictual ra.mp3": {
			"size": 71424,
			"lastModified": 1732968887533,
			"duration": 5952
		},
		"news/Heat! Our count.mp3": {
			"size": 162720,
			"lastModified": 1732969192233,
			"duration": 13560
		}
	};

	public static readonly queueTypes: Record<string, QueueType> = {
		"History": {
			"name": "History",
			"scheduleStrategy": "internal"
		},
		"Main Queue": {
			"name": "Main Queue",
			"scheduleStrategy": "internal"
		},
		"News": {
			"name": "News",
			"color": "#0A0",
			"scheduleTime": "xx:00:00",
			"scheduleStrategy": "clone"
			},
		"Music Request": {
			"name": "Music Request",
			"color": "#00A",
			"scheduleStrategy": "manual"
		},
		"Advertisment": {
			"name": "Advertisment",
			"color": "#A0A",
			"scheduleTime": "xx:15:00, xx:45:00",
			"scheduleStrategy": "manual",
		},
		"Music": {
			"name": "Music",
			"color": "#AAA",
			"scheduleStrategy": "subset-sum",
			"folder": "Musik"
		}
		
	};
}

